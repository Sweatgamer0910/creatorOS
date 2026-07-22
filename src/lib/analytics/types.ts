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
  // Most recent 30 days, unchanged shape health-score/growth-coach's trend
  // math already relies on (first-week vs last-week comparison).
  last30Days: DailyDataPoint[];
  // Up to a year of history, oldest first — for the analytics charts'
  // date-range picker. Superset of last30Days.
  history: DailyDataPoint[];
}
