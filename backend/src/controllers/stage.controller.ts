import { Request, Response, NextFunction } from 'express';
import { Stage } from '../models/Stage';
import { Component } from '../models/Component';
import { createError } from '../middleware/errorHandler';
import { CreateStageInput, UpdateStageInput, ReorderStagesInput } from '../schemas/stage.schema';

export async function getStagesByComponent(
  req: Request<object, object, object, { componentId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { componentId } = req.query;

    // Verify component exists and belongs to user
    const component = await Component.findOne({ _id: componentId, userId });
    if (!component) {
      throw createError('Component not found', 404);
    }

    const stages = await Stage.find({ componentId, userId }).sort({ order: 1 });
    res.json(stages);
  } catch (error) {
    next(error);
  }
}

export async function createStage(
  req: Request<object, object, CreateStageInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { componentId, name, description, effortLevel, color } = req.body;

    // Verify component exists and belongs to user
    const component = await Component.findOne({ _id: componentId, userId });
    if (!component) {
      throw createError('Component not found', 404);
    }

    // Get the highest order value for this component
    const lastStage = await Stage.findOne({ componentId, userId }).sort({ order: -1 });
    const order = lastStage ? lastStage.order + 1 : 0;

    const stage = new Stage({
      userId,
      componentId,
      name,
      description,
      effortLevel,
      color,
      order,
      status: 'active',
    });

    await stage.save();
    res.status(201).json(stage);
  } catch (error) {
    next(error);
  }
}

export async function updateStage(
  req: Request<{ id: string }, object, UpdateStageInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updateData: UpdateStageInput & { completedAt?: Date | null } = { ...req.body };

    // Handle status change to completed
    if (updateData.status === 'completed') {
      const existingStage = await Stage.findOne({ _id: id, userId });
      if (existingStage && existingStage.status !== 'completed') {
        updateData.completedAt = new Date();
      }
    } else if (updateData.status === 'active') {
      // Clear completedAt when reverting to active
      updateData.completedAt = null;
    }

    const stage = await Stage.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!stage) {
      throw createError('Stage not found', 404);
    }

    res.json(stage);
  } catch (error) {
    next(error);
  }
}

export async function deleteStage(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const stage = await Stage.findOneAndDelete({ _id: req.params.id, userId });

    if (!stage) {
      throw createError('Stage not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function reorderStages(
  req: Request<{ componentId: string }, object, ReorderStagesInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { componentId } = req.params;
    const { stageIds } = req.body;

    // Verify component exists and belongs to user
    const component = await Component.findOne({ _id: componentId, userId });
    if (!component) {
      throw createError('Component not found', 404);
    }

    // Update order for each stage
    const updatePromises = stageIds.map((stageId, index) =>
      Stage.findOneAndUpdate(
        { _id: stageId, componentId, userId },
        { $set: { order: index } },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Return updated stages in order
    const stages = await Stage.find({ componentId, userId }).sort({ order: 1 });
    res.json(stages);
  } catch (error) {
    next(error);
  }
}
