import mongoose, { Schema } from 'mongoose';
import { IRecordDocument } from '../interfaces/record.interface';

const recordSchema = new Schema<IRecordDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    componentId: {
      type: Schema.Types.ObjectId,
      ref: 'Component',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    effortLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

recordSchema.index({ componentId: 1, date: 1 });

export const Record = mongoose.model<IRecordDocument>('Record', recordSchema);
