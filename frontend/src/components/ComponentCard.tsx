import type { Component } from '../types';
import { useStages } from '../hooks/useStages';
import { Button } from './ui/Button';

interface ComponentCardProps {
  component: Component;
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  onLogActivity: (component: Component) => void;
  onManageStages: (component: Component) => void;
}

export function ComponentCard({ component, onEdit, onDelete, onLogActivity, onManageStages }: ComponentCardProps) {
  const { data: stages = [] } = useStages(component._id);

  const completedStages = stages.filter((s) => s.status === 'completed').length;
  const activeAndCompletedStages = stages.filter((s) => s.status !== 'archived').length;

  const progressPercent = Math.min(
    (component.currentWeekLogs / component.minWeeklyFreq) * 100,
    100
  );

  const getWeightBadge = (weight: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[weight as keyof typeof styles] || styles.medium;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: component.color }}
          />
          <h3 className="font-semibold text-gray-900">{component.name}</h3>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWeightBadge(component.weight)}`}>
          {component.weight}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            {component.currentWeekLogs} / {component.minWeeklyFreq} this week
          </span>
          <span>{component.successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: component.color,
            }}
          />
        </div>
      </div>

      {activeAndCompletedStages > 0 && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {completedStages}/{activeAndCompletedStages} stages
            </span>
            <button
              onClick={() => onManageStages(component)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Manage
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onLogActivity(component)}
          className="flex-1"
        >
          Log Activity
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onManageStages(component)}
        >
          Stages
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(component)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(component._id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
