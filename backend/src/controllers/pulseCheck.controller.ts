import { Request, Response, NextFunction } from 'express';
import { PulseCheck } from '../models/PulseCheck';
import { createError } from '../middleware/errorHandler';
import { CreatePulseCheckInput, UpdatePulseCheckInput } from '../schemas/pulseCheck.schema';

// Normalize date to midnight UTC
function normalizeDate(dateInput: string | Date): Date {
  const date = new Date(dateInput);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// Get today's date normalized to midnight UTC
function getTodayNormalized(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export async function getAllPulseChecks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const filter: Record<string, unknown> = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, Date>).$gte = normalizeDate(startDate as string);
      }
      if (endDate) {
        (filter.date as Record<string, Date>).$lte = normalizeDate(endDate as string);
      }
    }

    const pulseChecks = await PulseCheck.find(filter).sort({ date: -1 });
    res.json(pulseChecks);
  } catch (error) {
    next(error);
  }
}

export async function getTodayPulseCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const today = getTodayNormalized();
    const pulseCheck = await PulseCheck.findOne({ userId, date: today });
    res.json(pulseCheck);
  } catch (error) {
    next(error);
  }
}

export async function getPulseCheckById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const pulseCheck = await PulseCheck.findOne({ _id: req.params.id, userId });
    if (!pulseCheck) {
      throw createError('Pulse check not found', 404);
    }
    res.json(pulseCheck);
  } catch (error) {
    next(error);
  }
}

export async function createPulseCheck(
  req: Request<object, object, CreatePulseCheckInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { date, energyLevel, moodLevel, note } = req.body;
    const normalizedDate = normalizeDate(date);

    // Upsert: update if exists for this user+date, create otherwise
    const pulseCheck = await PulseCheck.findOneAndUpdate(
      { userId, date: normalizedDate },
      {
        userId,
        date: normalizedDate,
        energyLevel,
        moodLevel,
        note,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(201).json(pulseCheck);
  } catch (error) {
    next(error);
  }
}

export async function updatePulseCheck(
  req: Request<{ id: string }, object, UpdatePulseCheckInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const pulseCheck = await PulseCheck.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!pulseCheck) {
      throw createError('Pulse check not found', 404);
    }

    res.json(pulseCheck);
  } catch (error) {
    next(error);
  }
}

export async function deletePulseCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const pulseCheck = await PulseCheck.findOneAndDelete({ _id: req.params.id, userId });
    if (!pulseCheck) {
      throw createError('Pulse check not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
