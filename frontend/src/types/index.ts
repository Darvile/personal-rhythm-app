export type Weight = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';
export type StageStatus = 'active' | 'completed' | 'archived';

export interface Component {
  _id: string;
  name: string;
  weight: Weight;
  minWeeklyFreq: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  currentWeekLogs: number;
  successRate: number;
}

export interface ComponentFormData {
  name: string;
  weight: Weight;
  minWeeklyFreq: number;
  color: string;
}

export interface Record {
  _id: string;
  componentId: string | { _id: string; name: string; color: string };
  date: string;
  effortLevel: EffortLevel;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordFormData {
  componentId: string;
  date: string;
  effortLevel: EffortLevel;
  note?: string;
}

export interface PulseCheck {
  _id: string;
  date: string;
  energyLevel: number;  // 1-5
  moodLevel: number;    // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface PulseCheckFormData {
  date: string;
  energyLevel: number;
  moodLevel: number;
}

export interface Insight {
  type: 'same_day' | 'next_day' | 'weekly_pattern';
  insight: string;
  confidence: 'low' | 'medium' | 'high';
  dataPoints: number;
  details: {
    correlation: number;
    direction: string;
    activityType?: string;
  };
}

export interface WeeklyPatternEntry {
  dayOfWeek: number;
  avgEnergy: number;
  avgMood: number;
  count: number;
}

export interface InsightsData {
  correlations: Insight[];
  summary: {
    averageEnergy: number;
    averageMood: number;
    bestDayOfWeek: string | null;
    worstDayOfWeek: string | null;
  };
  weeklyPattern: WeeklyPatternEntry[];
}

export interface Stage {
  _id: string;
  componentId: string;
  name: string;
  description?: string;
  effortLevel: EffortLevel;
  status: StageStatus;
  order: number;
  color?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageFormData {
  componentId: string;
  name: string;
  description?: string;
  effortLevel: EffortLevel;
  color?: string;
}
