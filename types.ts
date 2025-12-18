
export interface CryptoTrendData {
  symbol: string;
  name: string;
  price: string;
  marketCap: string;
  volume24h: string;
  volMcapRatio: number;
  volChange1d: number;
  newsSummary: string;
  isLeader: boolean;
  leaderReason: string;
  correlationWithBTC: 'independent' | 'correlated';
  trendAnalysis: string;
  vitalityScore: number;
  category: 'hotspot' | 'mature';
}

export interface ScanRecord {
  timestamp: number;
  symbols: string[];
}

export interface CoinStat {
  symbol: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  vitalityAvg: number;
}

export type ViewType = 'radar' | 'stats';

export interface AppState {
  data: CryptoTrendData[];
  loading: boolean;
  error: string | null;
  sources: { title: string; uri: string }[];
  lastUpdated: string | null;
  currentView: ViewType;
}
