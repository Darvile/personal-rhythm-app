import mongoose, { Schema } from 'mongoose';
import { IPulseCheckDocument } from '../interfaces/pulseCheck.interface';

const pulseCheckSchema = new Schema<IPulseCheckDocument>(
  {
    date: {
      type: Date,
      required: true,
      index: true,
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
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on date (normalized to midnight UTC) for upsert pattern
pulseCheckSchema.index({ date: 1 }, { unique: true });

export const PulseCheck = mongoose.model<IPulseCheckDocument>('PulseCheck', pulseCheckSchema);
