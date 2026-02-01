import { Request, Response, NextFunction } from 'express';
import { Component } from '../models/Component';
import { Record } from '../models/Record';
import { createError } from '../middleware/errorHandler';
import { getWeekBounds, calculateSuccessRate } from '../utils/statsCalculator';
import { CreateComponentInput, UpdateComponentInput } from '../schemas/component.schema';
import { IComponentWithStats } from '../interfaces/component.interface';

export async function getAllComponents(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    const { start, end } = getWeekBounds();

    const recordCounts = await Record.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$componentId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      recordCounts.map((r) => [r._id.toString(), r.count])
    );

    const componentsWithStats: IComponentWithStats[] = components.map((c) => {
      const currentWeekLogs = countMap.get(c._id.toString()) || 0;
      return {
        _id: c._id,
        name: c.name,
        weight: c.weight,
        minWeeklyFreq: c.minWeeklyFreq,
        color: c.color,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        currentWeekLogs,
        successRate: calculateSuccessRate(currentWeekLogs, c.minWeeklyFreq),
      };
    });

    res.json(componentsWithStats);
  } catch (error) {
    next(error);
  }
}

export async function getComponentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      throw createError('Component not found', 404);
    }

    const { start, end } = getWeekBounds();
    const currentWeekLogs = await Record.countDocuments({
      componentId: component._id,
      date: { $gte: start, $lte: end },
    });

    const componentWithStats: IComponentWithStats = {
      _id: component._id,
      name: component.name,
      weight: component.weight,
      minWeeklyFreq: component.minWeeklyFreq,
      color: component.color,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      currentWeekLogs,
      successRate: calculateSuccessRate(currentWeekLogs, component.minWeeklyFreq),
    };

    res.json(componentWithStats);
  } catch (error) {
    next(error);
  }
}

export async function createComponent(
  req: Request<object, object, CreateComponentInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const component = new Component(req.body);
    await component.save();

    const componentWithStats: IComponentWithStats = {
      _id: component._id,
      name: component.name,
      weight: component.weight,
      minWeeklyFreq: component.minWeeklyFreq,
      color: component.color,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      currentWeekLogs: 0,
      successRate: 0,
    };

    res.status(201).json(componentWithStats);
  } catch (error) {
    next(error);
  }
}

export async function updateComponent(
  req: Request<{ id: string }, object, UpdateComponentInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const component = await Component.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!component) {
      throw createError('Component not found', 404);
    }

    const { start, end } = getWeekBounds();
    const currentWeekLogs = await Record.countDocuments({
      componentId: component._id,
      date: { $gte: start, $lte: end },
    });

    const componentWithStats: IComponentWithStats = {
      _id: component._id,
      name: component.name,
      weight: component.weight,
      minWeeklyFreq: component.minWeeklyFreq,
      color: component.color,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt,
      currentWeekLogs,
      successRate: calculateSuccessRate(currentWeekLogs, component.minWeeklyFreq),
    };

    res.json(componentWithStats);
  } catch (error) {
    next(error);
  }
}

export async function deleteComponent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    if (!component) {
      throw createError('Component not found', 404);
    }

    await Record.deleteMany({ componentId: component._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
