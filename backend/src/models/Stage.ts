import mongoose, { Schema } from 'mongoose';
import { IStageDocument } from '../interfaces/stage.interface';

const stageSchema = new Schema<IStageDocument>(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    effortLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries by component and order
stageSchema.index({ componentId: 1, order: 1 });

export const Stage = mongoose.model<IStageDocument>('Stage', stageSchema);
