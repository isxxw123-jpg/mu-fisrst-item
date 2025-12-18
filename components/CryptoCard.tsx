
import React from 'react';
import { CryptoTrendData } from '../types';

interface CryptoCardProps {
  data: CryptoTrendData;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ data }) => {
  const isHotspot = data.category === 'hotspot';
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${data.symbol}&symbol=BINANCE:${data.symbol}USDT&interval=15&hidesidetoolbar=1&hidestoptoolbar=1&saveimage=0&toolbarbg=161a1e&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&locale=zh_CN`;

  return (
    <div className={`relative flex flex-col bg-[#161a1e]/90 border-2 ${isHotspot ? 'border-cyan-500/60 shadow-[0_0_50px_rgba(34,211,238,0.15)]' : 'border-yellow-500/60 shadow-[0_0_50px_rgba(234,179,8,0.15)]'} rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.01] group`}>
      <div className={`absolute top-0 right-10 py-2 px-6 rounded-b-2xl font-black text-[10px] uppercase tracking-widest ${isHotspot ? 'bg-cyan-500 text-black' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'}`}>
        {isHotspot ? '强势 Alpha 潜力' : '权重 蓝筹 脱钩'}
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{data.symbol}</h3>
              {data.isLeader && (
                <div className="flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  独立龙头
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 font-bold tracking-wide italic">{data.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white mono tracking-tighter mb-1">{data.price}</p>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${data.volChange1d > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
              24H 额 {data.volChange1d > 0 ? '↑' : '↓'} {Math.abs(data.volChange1d)}%
            </span>
          </div>
        </div>

        <div className="h-64 w-full bg-black rounded-[2rem] overflow-hidden border border-gray-800/50 relative mb-8">
          <iframe src={chartUrl} className="w-full h-full opacity-90" frameBorder="0"></iframe>
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-black/80 backdrop-blur-xl text-[10px] text-gray-400 px-3 py-1.5 rounded-xl border border-white/5 uppercase font-black tracking-widest">15M 独立趋势视图</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-3xl ${isHotspot ? 'bg-cyan-500/5 border border-cyan-500/10' : 'bg-yellow-500/5 border border-yellow-500/10'}`}>
            <h5 className={`text-xs font-black uppercase tracking-[0.2em] mb-3 ${isHotspot ? 'text-cyan-400' : 'text-yellow-400'}`}>独立脱钩逻辑</h5>
            <p className="text-sm text-gray-300 leading-relaxed font-bold">
              {data.leaderReason}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1e2329] p-4 rounded-2xl border border-gray-800">
              <span className="text-[9px] text-gray-600 font-black uppercase mb-1 block tracking-widest text-center">脱钩强度</span>
              <div className="text-center">
                <span className={`text-2xl font-black ${isHotspot ? 'text-cyan-400' : 'text-yellow-400'}`}>{data.vitalityScore}</span>
              </div>
            </div>
            <div className="bg-[#1e2329] p-4 rounded-2xl border border-gray-800 text-center">
              <span className="text-[9px] text-gray-600 font-black uppercase mb-1 block tracking-widest">24H 换手</span>
              <span className="text-2xl font-black text-white">{data.volMcapRatio}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;
