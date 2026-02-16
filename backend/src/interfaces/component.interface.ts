import { Document, Types } from 'mongoose';

export type Weight = 'low' | 'medium' | 'high';

export interface IComponent {
  userId: string;
  name: string;
  weight: Weight;
  minWeeklyFreq: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComponentDocument extends IComponent, Document {
  _id: Types.ObjectId;
}

export interface IComponentWithStats extends Omit<IComponent, 'userId'> {
  _id: Types.ObjectId;
  currentWeekLogs: number;
  successRate: number;
}
