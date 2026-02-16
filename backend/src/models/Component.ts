import mongoose, { Schema } from 'mongoose';
import { IComponentDocument } from '../interfaces/component.interface';

const componentSchema = new Schema<IComponentDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    minWeeklyFreq: {
      type: Number,
      required: true,
      min: 1,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  {
    timestamps: true,
  }
);

export const Component = mongoose.model<IComponentDocument>('Component', componentSchema);
