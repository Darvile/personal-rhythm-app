import type { Stage } from '../types';

interface StageItemProps {
  stage: Stage;
  isFirst: boolean;
  isLast: boolean;
  onToggleStatus: (stage: Stage) => void;
  onMoveUp: (stage: Stage) => void;
  onMoveDown: (stage: Stage) => void;
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
}

export function StageItem({
  stage,
  isFirst,
  isLast,
  onToggleStatus,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: StageItemProps) {
  const isCompleted = stage.status === 'completed';
  const isArchived = stage.status === 'archived';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isArchived
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <button
        onClick={() => onToggleStatus(stage)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        title={isCompleted ? 'Mark as active' : 'Mark as completed'}
      >
        {isCompleted && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {stage.color && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: stage.color }}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`block truncate ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {stage.name}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
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
        {stage.description && (
          <span className="block text-sm text-gray-500 truncate">
            {stage.description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onMoveUp(stage)}
          disabled={isFirst}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => onMoveDown(stage)}
          disabled={isLast}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          onClick={() => onEdit(stage)}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(stage)}
          className="p-1 text-gray-400 hover:text-red-600"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
