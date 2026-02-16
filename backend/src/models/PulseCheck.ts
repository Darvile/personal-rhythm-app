import mongoose, { Schema } from 'mongoose';
import { IPulseCheckDocument } from '../interfaces/pulseCheck.interface';

const pulseCheckSchema = new Schema<IPulseCheckDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    moodLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on userId + date (normalized to midnight UTC) for upsert pattern
pulseCheckSchema.index({ userId: 1, date: 1 }, { unique: true });

export const PulseCheck = mongoose.model<IPulseCheckDocument>('PulseCheck', pulseCheckSchema);
