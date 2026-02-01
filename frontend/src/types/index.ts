export type Weight = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';

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
