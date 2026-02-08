import { Document, Types } from 'mongoose';

export interface IPulseCheck {
  date: Date;
  energyLevel: number;  // 1-5
  moodLevel: number;    // 1-5
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPulseCheckDocument extends IPulseCheck, Document {
  _id: Types.ObjectId;
}
