import type { Component } from '../../types';

interface WeeklyGoalsViewProps {
  components: Component[];
  onLogActivity: (component: Component) => void;
}

export function WeeklyGoalsView({ components, onLogActivity }: WeeklyGoalsViewProps) {
  if (components.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goals</h2>
        <p className="text-gray-500 text-center py-8">
          No components yet. Create one to start tracking your goals!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goals</h2>

      <div className="space-y-4">
        {components.map((component) => {
          const progress = component.currentWeekLogs;
          const goal = component.minWeeklyFreq;
          const percentage = Math.min((progress / goal) * 100, 100);
          const isComplete = progress >= goal;

          return (
            <div key={component._id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: component.color }}
                  />
                  <span className="font-medium text-gray-900 text-sm">
                    {component.name}
                  </span>
                </div>
                <button
                  onClick={() => onLogActivity(component)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-indigo-600"
                  title="Log activity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isComplete ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {isComplete ? (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Done
                    </span>
                  ) : (
                    `${progress}/${goal}`
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
