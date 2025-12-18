
import React, { useMemo, useState } from 'react';
import { ScanRecord, CoinStat } from '../types';

interface StatsViewProps {
  records: ScanRecord[];
}

const StatsView: React.FC<StatsViewProps> = ({ records }) => {
  const [timeRange, setTimeRange] = useState<'4H' | '1D' | '3D' | '1W'>('1D');

  const filteredStats = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '3D': 3 * 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - ranges[timeRange];
    
    const statsMap: Record<string, CoinStat> = {};
    
    records.filter(r => r.timestamp > cutoff).forEach(record => {
      record.symbols.forEach(symbol => {
        if (!statsMap[symbol]) {
          statsMap[symbol] = {
            symbol,
            count: 0,
            firstSeen: record.timestamp,
            lastSeen: record.timestamp,
            vitalityAvg: 0
          };
        }
        statsMap[symbol].count += 1;
        statsMap[symbol].lastSeen = Math.max(statsMap[symbol].lastSeen, record.timestamp);
        statsMap[symbol].firstSeen = Math.min(statsMap[symbol].firstSeen, record.timestamp);
      });
    });

    return Object.values(statsMap).sort((a, b) => b.count - a.count);
  }, [records, timeRange]);

  const maxCount = useMemo(() => Math.max(...filteredStats.map(s => s.count), 1), [filteredStats]);

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2">热力统计</h2>
          <p className="text-gray-500 font-bold">基于 5 分钟周期的 Alpha 捕捉频率分析</p>
        </div>
        <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800">
          {(['4H', '1D', '3D', '1W'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${timeRange === range ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              {range === '4H' ? '4小时' : range === '1D' ? '24小时' : range === '3D' ? '3天' : '1周'}
            </button>
          ))}
        </div>
      </div>

      {/* Bubble Chart Placeholder/Visual */}
      <div className="bg-[#161a1e]/40 border border-gray-800 rounded-[3rem] p-12 min-h-[400px]">
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-12 text-center">Alpha 捕捉频率分布 (泡泡图)</h4>
        <div className="flex flex-wrap justify-center gap-10 items-center">
          {filteredStats.slice(0, 15).map(stat => {
            const size = Math.max(80, (stat.count / maxCount) * 220);
            return (
              <div 
                key={stat.symbol}
                className="flex flex-col items-center justify-center transition-transform hover:scale-110"
              >
                <div 
                  style={{ width: `${size}px`, height: `${size}px` }}
                  className="rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10 flex flex-col items-center justify-center relative group"
                >
                  <span className="text-white font-black text-xl uppercase tracking-tighter group-hover:text-yellow-400 transition-colors">{stat.symbol}</span>
                  <span className="text-[10px] text-yellow-500 font-black mt-1">{stat.count} 次</span>
                </div>
              </div>
            );
          })}
          {filteredStats.length === 0 && (
            <div className="py-20 text-gray-600 font-bold italic uppercase tracking-widest text-sm">该周期内暂无捕捉记录</div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-[#161a1e]/40 border border-gray-800 rounded-[3rem] overflow-hidden">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center">
          <h4 className="text-sm font-black text-white uppercase tracking-widest">活跃 Alpha 清单</h4>
          <span className="text-[10px] text-gray-500 font-bold uppercase">共检测到 {filteredStats.length} 个异类品种</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800/50 bg-black/20">
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">币种</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">捕捉频率</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">首次发现</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">最近活跃</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {filteredStats.map(stat => (
                <tr key={stat.symbol} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-white group-hover:text-yellow-500 transition-colors">{stat.symbol}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-grow h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${(stat.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-white">{stat.count}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-gray-500 font-bold">{new Date(stat.firstSeen).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-cyan-500 font-black">{new Date(stat.lastSeen).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
