import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Record } from '../models/Record';
import { Component } from '../models/Component';
import { createError } from '../middleware/errorHandler';
import { CreateRecordInput, UpdateRecordInput } from '../schemas/record.schema';

interface RecordQuery {
  startDate?: string;
  endDate?: string;
  componentId?: string;
}

export async function getRecords(
  req: Request<object, object, object, RecordQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate, componentId } = req.query;

    const filter: Record<string, unknown> = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        (filter.date as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.date as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    if (componentId) {
      filter.componentId = new Types.ObjectId(componentId);
    }

    const records = await Record.find(filter)
      .populate('componentId', 'name color')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    next(error);
  }
}

export async function createRecord(
  req: Request<object, object, CreateRecordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { componentId, date, effortLevel, note } = req.body;

    const componentExists = await Component.exists({ _id: componentId });
    if (!componentExists) {
      throw createError('Component not found', 404);
    }

    const record = new Record({
      componentId: new Types.ObjectId(componentId),
      date: new Date(date),
      effortLevel,
      note,
    });

    await record.save();
    await record.populate('componentId', 'name color');

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

export async function updateRecord(
  req: Request<{ id: string }, object, UpdateRecordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, effortLevel, note } = req.body;

    const updateData: Partial<{ date: Date; effortLevel: string; note: string }> = {};
    if (date) updateData.date = new Date(date);
    if (effortLevel) updateData.effortLevel = effortLevel;
    if (note !== undefined) updateData.note = note;

    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('componentId', 'name color');

    if (!record) {
      throw createError('Record not found', 404);
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
}

export async function deleteRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
      throw createError('Record not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
