import { useState, useMemo } from 'react';
import type { Component, Stage, StageFormData } from '../types';
import { useStages, useCreateStage, useUpdateStage, useDeleteStage, useReorderStages } from '../hooks/useStages';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { StageItem } from './StageItem';
import { StageForm } from './StageForm';
import { PuzzleCanvas } from './PuzzleCanvas';

interface StagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  component: Component;
}

type ViewMode = 'puzzle' | 'list';

export function StagesPanel({ isOpen, onClose, component }: StagesPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('puzzle');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | undefined>();

  const { data: stages = [], isLoading } = useStages(component._id);
  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const reorderStages = useReorderStages();

  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      if (stage.status === 'archived' && !showArchived) return false;
      if (stage.status === 'completed' && hideCompleted) return false;
      return true;
    });
  }, [stages, hideCompleted, showArchived]);

  const stageStats = useMemo(() => {
    const active = stages.filter((s) => s.status === 'active').length;
    const completed = stages.filter((s) => s.status === 'completed').length;
    const archived = stages.filter((s) => s.status === 'archived').length;
    return { active, completed, archived, total: stages.length };
  }, [stages]);

  const handleAddStage = () => {
    setEditingStage(undefined);
    setIsFormOpen(true);
  };

  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: StageFormData) => {
    if (editingStage) {
      updateStage.mutate(
        {
          id: editingStage._id,
          componentId: component._id,
          data: {
            name: data.name,
            description: data.description,
            effortLevel: data.effortLevel,
            color: data.color,
          },
        },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createStage.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleToggleStatus = (stage: Stage) => {
    const newStatus = stage.status === 'completed' ? 'active' : 'completed';
    updateStage.mutate({
      id: stage._id,
      componentId: component._id,
      data: { status: newStatus },
    });
  };

  const handleDelete = (stage: Stage) => {
    if (confirm(`Delete "${stage.name}"? This cannot be undone.`)) {
      deleteStage.mutate({ id: stage._id, componentId: component._id });
    }
  };

  const handleMoveUp = (stage: Stage) => {
    const index = filteredStages.findIndex((s) => s._id === stage._id);
    if (index <= 0) return;

    const newOrder = [...filteredStages];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    reorderStages.mutate({
      componentId: component._id,
      stageIds: newOrder.map((s) => s._id),
    });
  };

  const handleMoveDown = (stage: Stage) => {
    const index = filteredStages.findIndex((s) => s._id === stage._id);
    if (index < 0 || index >= filteredStages.length - 1) return;

    const newOrder = [...filteredStages];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    reorderStages.mutate({
      componentId: component._id,
      stageIds: newOrder.map((s) => s._id),
    });
  };

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPercentage = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${component.name}`} size="large">
        <div className="space-y-4">
          {/* Header with stats and view toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: component.color }}
              />
              <span className="text-sm text-gray-600">
                {stageStats.completed}/{stageStats.active + stageStats.completed} completed
                {stageStats.archived > 0 && ` (${stageStats.archived} archived)`}
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('puzzle')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'puzzle'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🧩 Puzzle
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>

          {/* Content Area */}
          {viewMode === 'puzzle' ? (
            /* Puzzle View */
            <div className="space-y-4">
              {/* Progress Bar */}
              {stages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Progress</span>
                    <span className="text-gray-600">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: component.color,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Puzzle Canvas */}
              <PuzzleCanvas component={component} stages={stages} />

              {/* Legend */}
              {stages.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Stage Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {stages.map((stage, index) => (
                      <div
                        key={stage._id}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          stage.status === 'completed'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className="font-semibold text-gray-600 w-6">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{stage.name}</span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                stage.effortLevel === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : stage.effortLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {stage.effortLevel}
                            </span>
                          </div>
                        </div>
                        {stage.status === 'completed' && (
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-3 text-sm text-gray-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideCompleted}
                    onChange={(e) => setHideCompleted(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span>Hide completed</span>
                </label>
                {stageStats.archived > 0 && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Show archived</span>
                  </label>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredStages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {stages.length === 0
                      ? 'No stages yet. Add your first stage!'
                      : 'No stages match the current filters.'}
                  </div>
                ) : (
                  filteredStages.map((stage, index) => (
                    <StageItem
                      key={stage._id}
                      stage={stage}
                      isFirst={index === 0}
                      isLast={index === filteredStages.length - 1}
                      onToggleStatus={handleToggleStatus}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onEdit={handleEditStage}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2 border-t justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleAddStage}>
              Add Stage
            </Button>
          </div>
        </div>
      </Modal>

      <StageForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        componentId={component._id}
        componentColor={component.color}
        stage={editingStage}
        isLoading={createStage.isPending || updateStage.isPending}
      />
    </>
  );
}
