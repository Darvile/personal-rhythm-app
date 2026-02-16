import { Document, Types } from 'mongoose';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface IRecord {
  userId: string;
  componentId: Types.ObjectId;
  date: Date;
  effortLevel: EffortLevel;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecordDocument extends IRecord, Document {
  _id: Types.ObjectId;
}
