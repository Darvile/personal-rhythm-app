import { Document, Types } from 'mongoose';

export type StageStatus = 'active' | 'completed' | 'archived';
export type EffortLevel = 'low' | 'medium' | 'high';

export interface IStage {
  userId: string;
  componentId: Types.ObjectId;
  name: string;
  description?: string;
  effortLevel: EffortLevel;
  status: StageStatus;
  order: number;
  color?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStageDocument extends IStage, Document {
  _id: Types.ObjectId;
}
