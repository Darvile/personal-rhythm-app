import { useState, useMemo } from 'react';
import type { Component, Weight } from '../../types';
import { Button } from '../ui/Button';

interface FocusModeProps {
  components: Component[];
  onLogActivity: (component: Component) => void;
}

const weightValue: Record<Weight, number> = { high: 3, medium: 2, low: 1 };

function getRecommendedComponent(
  components: Component[],
  skippedIds: Set<string>
): Component | null {
  const incomplete = components.filter(
    (c) => c.currentWeekLogs < c.minWeeklyFreq && !skippedIds.has(c._id)
  );

  if (incomplete.length === 0) return null;

  return incomplete.sort((a, b) => {
    const urgencyA = (a.minWeeklyFreq - a.currentWeekLogs) * weightValue[a.weight];
    const urgencyB = (b.minWeeklyFreq - b.currentWeekLogs) * weightValue[b.weight];
    return urgencyB - urgencyA;
  })[0];
}

export function FocusMode({ components, onLogActivity }: FocusModeProps) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const recommended = useMemo(
    () => getRecommendedComponent(components, skippedIds),
    [components, skippedIds]
  );

  const allComplete = useMemo(
    () => components.every((c) => c.currentWeekLogs >= c.minWeeklyFreq),
    [components]
  );

  const handleSkip = () => {
    if (recommended) {
      setSkippedIds((prev) => new Set(prev).add(recommended._id));
    }
  };

  const handleLogActivity = () => {
    if (recommended) {
      onLogActivity(recommended);
      // Reset skipped list after logging
      setSkippedIds(new Set());
    }
  };

  const handleLogBonus = () => {
    // Log the first component if all goals are complete
    if (components.length > 0) {
      onLogActivity(components[0]);
    }
  };

  if (components.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Focus Mode</h2>
        <p className="text-gray-500">
          No components yet. Create one to get started!
        </p>
      </div>
    );
  }

  if (allComplete) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Focus: What to do now
        </h2>
        <div className="py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <p className="text-lg font-medium text-green-600 mb-2">
            All goals complete!
          </p>
          <p className="text-gray-500 mb-6">
            You've done everything this week
          </p>
          <Button onClick={handleLogBonus} variant="secondary">
            Log bonus activity
          </Button>
        </div>
      </div>
    );
  }

  if (!recommended) {
    // All incomplete components have been skipped, reset
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Focus: What to do now
        </h2>
        <p className="text-gray-500 mb-4">
          You've skipped all available recommendations.
        </p>
        <Button onClick={() => setSkippedIds(new Set())} variant="secondary">
          Reset suggestions
        </Button>
      </div>
    );
  }

  const remaining = recommended.minWeeklyFreq - recommended.currentWeekLogs;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Focus: What to do now
      </h2>

      <div className="py-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: recommended.color }}
          />
          <span className="text-2xl font-semibold text-gray-900">
            {recommended.name}
          </span>
        </div>

        <p className="text-gray-500 mb-8">
          {remaining} more this week to hit your goal
        </p>

        <Button onClick={handleLogActivity} size="lg" className="w-full mb-4">
          Log Activity
        </Button>

        <button
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip - show me another
        </button>
      </div>
    </div>
  );
}
