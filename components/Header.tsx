
import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string | null;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, loading, lastUpdated }) => {
  return (
    <header className="border-b border-gray-800 bg-[#161a1e] py-4 px-6 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">加密趋势 <span className="text-yellow-500">雷达</span></h1>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Top 10 高活力币种监控</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && !loading && (
            <span className="text-xs text-gray-500 hidden sm:block">
              最后更新: {lastUpdated}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-95 shadow-md'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {loading ? '正在扫描全网...' : '刷新动态'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
