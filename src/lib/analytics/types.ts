export interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  watchTimeMinutes: number;
}

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  views: number;
  subscribersGained: number;
  watchTimeMinutes: number;
}

export interface ChannelAnalytics {
  channelTitle: string;
  currentStats: ChannelStats;
  last30Days: DailyDataPoint[];
}
