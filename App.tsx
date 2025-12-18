
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import CryptoCard from './components/CryptoCard';
import StatsView from './components/StatsView';
import { fetchTrendingCrypto } from './services/geminiService';
import { AppState, ScanRecord, ViewType } from './types';

const STORAGE_KEY = 'crypto_radar_history';
const SCAN_INTERVAL = 5 * 60 * 1000; // 5分钟

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    data: [],
    loading: true,
    error: null,
    sources: [],
    lastUpdated: null,
    currentView: 'radar',
  });

  const [history, setHistory] = useState<ScanRecord[]>([]);
  const timerRef = useRef<number | null>(null);

  // 初始化历史记录并清理过期数据
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: ScanRecord[] = JSON.parse(saved);
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const cleaned = parsed.filter(r => r.timestamp > oneWeekAgo);
        setHistory(cleaned);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const loadData = useCallback(async (isAuto = false) => {
    if (!isAuto) setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchTrendingCrypto();
      const now = Date.now();
      
      // 更新当前展示数据
      setState(prev => ({
        ...prev,
        data: result.data || [],
        loading: false,
        error: null,
        sources: result.sources || [],
        lastUpdated: new Date().toLocaleTimeString('zh-CN'),
      }));

      // 记录到历史
      if (result.data && result.data.length > 0) {
        const newRecord: ScanRecord = {
          timestamp: now,
          symbols: result.data.map(d => d.symbol)
        };
        
        setHistory(prev => {
          const updated = [newRecord, ...prev].slice(0, 5000); // 防止极端情况内存溢出
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err: any) {
      if (!isAuto) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || "分析引擎繁忙，请稍后刷新。",
        }));
      }
    }
  }, []);

  // 设置自动扫描定时器
  useEffect(() => {
    loadData();
    timerRef.current = window.setInterval(() => {
      loadData(true);
    }, SCAN_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadData]);

  const hotspots = state.data.filter(d => d.category === 'hotspot');
  const matures = state.data.filter(d => d.category === 'mature');

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11] text-gray-200 selection:bg-cyan-500/30">
      <Header onRefresh={() => loadData()} loading={state.loading} lastUpdated={state.lastUpdated} />

      {/* View Switcher Navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 mt-12">
        <div className="flex gap-1 border-b border-gray-800">
          <button 
            onClick={() => setState(s => ({ ...s, currentView: 'radar' }))}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${state.currentView === 'radar' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            实时雷达
            {state.currentView === 'radar' && <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500" />}
          </button>
          <button 
            onClick={() => setState(s => ({ ...s, currentView: 'stats' }))}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${state.currentView === 'stats' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
          >
            热力统计
            {state.currentView === 'stats' && <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500" />}
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        {state.currentView === 'radar' ? (
          <>
            <div className="mb-20">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8 shadow-xl shadow-cyan-500/5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
                <span className="text-[11px] text-cyan-400 font-black uppercase tracking-[0.25em]">Alpha 独立性 15-Bar 持续监控中</span>
              </div>
              
              <h2 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                自动扫描 <br />
                <span className="text-cyan-500 italic">每 5 分钟捕捉</span>
              </h2>
              
              <p className="text-gray-500 text-xl leading-relaxed font-bold max-w-4xl">
                系统正在 24/7 自动扫描全网合约交易对。发现符合脱钩逻辑的 Alpha 品种将自动存入历史库。
                <br />
                <span className="text-gray-700 text-sm italic font-medium uppercase mt-2 block">数据仅保留最近 7 天活跃记录</span>
              </p>
            </div>

            {state.loading && state.data.length === 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="h-[700px] bg-[#161a1e] rounded-[4rem] animate-pulse border border-gray-800/50"></div>
                 <div className="h-[700px] bg-[#161a1e] rounded-[4rem] animate-pulse border border-gray-800/50"></div>
              </div>
            ) : (
              <div className="space-y-32">
                <section>
                  <div className="flex items-center gap-6 mb-12">
                    <div className="px-8 py-3 bg-cyan-500 text-black font-black rounded-full text-xs uppercase tracking-[0.3em] shadow-2xl shadow-cyan-500/30">
                      实时 Alpha (潜力脱钩)
                    </div>
                    <div className="h-[2px] flex-grow bg-gradient-to-r from-cyan-500/40 to-transparent"></div>
                  </div>
                  {hotspots.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      {hotspots.map(item => <CryptoCard key={item.symbol} data={item} />)}
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-[#161a1e]/20 rounded-[4rem] border-2 border-dashed border-gray-800 flex flex-col items-center">
                       <p className="text-gray-500 font-black text-xl mb-2 tracking-tight">当前扫描窗口暂未发现极端脱钩品种</p>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex items-center gap-6 mb-12">
                    <div className="px-8 py-3 bg-yellow-500 text-black font-black rounded-full text-xs uppercase tracking-[0.3em] shadow-2xl shadow-yellow-500/30">
                      权重机会 (蓝筹背离)
                    </div>
                    <div className="h-[2px] flex-grow bg-gradient-to-r from-yellow-500/40 to-transparent"></div>
                  </div>
                  {matures.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      {matures.map(item => <CryptoCard key={item.symbol} data={item} />)}
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-[#161a1e]/20 rounded-[4rem] border-2 border-dashed border-gray-800 flex flex-col items-center">
                       <p className="text-gray-500 font-black text-xl mb-2 tracking-tight">蓝筹品种目前均与大盘高度同步</p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        ) : (
          <StatsView records={history} />
        )}
      </main>

      <footer className="py-32 border-t border-gray-800/30 text-center bg-black/20">
        <div className="flex flex-col items-center gap-6">
           <div className="flex gap-10 text-[11px] font-black text-gray-800 uppercase tracking-[0.6em]">
              <span>自动监测中</span>
              <span>•</span>
              <span>5M 扫描频率</span>
              <span>•</span>
              <span>7D 数据留存</span>
           </div>
           <p className="text-xs text-gray-700 mt-4 max-w-2xl mx-auto font-black leading-loose opacity-40 px-10 uppercase tracking-widest">
            深度 Alpha 自动化追踪系统 · 历史库共记录 {history.length} 次有效捕捉
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
