import { useState, useMemo } from 'react';
import type { Component, Weight, EffortLevel, Stage } from '../../types';
import { useStages } from '../../hooks/useStages';
import { useTodayPulseCheck } from '../../hooks/usePulseChecks';
import { Button } from '../ui/Button';

interface FocusModeProps {
  components: Component[];
  onLogActivity: (component: Component) => void;
  onManageStages?: (component: Component) => void;
}

const weightValue: Record<Weight, number> = { high: 3, medium: 2, low: 1 };

// Determine suitable effort levels based on energy and mood
function getSuitableEffortLevels(energyLevel: number, moodLevel: number): EffortLevel[] {
  // High energy and good mood - can handle anything, prefer challenges
  if (energyLevel >= 4 && moodLevel >= 4) {
    return ['high', 'medium', 'low'];
  }

  // High energy but neutral mood - prefer medium, can do high or low
  if (energyLevel >= 4 && moodLevel === 3) {
    return ['medium', 'high', 'low'];
  }

  // High energy but low mood - prefer medium for engagement, avoid high stress
  if (energyLevel >= 4 && moodLevel <= 2) {
    return ['medium', 'low'];
  }

  // Medium energy and good mood - medium or low effort
  if (energyLevel === 3 && moodLevel >= 3) {
    return ['medium', 'low'];
  }

  // Medium energy and low mood - stick to low effort
  if (energyLevel === 3 && moodLevel <= 2) {
    return ['low'];
  }

  // Low energy - always stick to low effort for easy wins
  if (energyLevel <= 2) {
    return ['low'];
  }

  // Default fallback
  return ['medium', 'low'];
}

// Find the best matching stage based on suitable effort levels
function selectStageByEffort(stages: Stage[], suitableEfforts: EffortLevel[]): Stage | null {
  // Try each effort level in priority order
  for (const effort of suitableEfforts) {
    const matchingStage = stages.find(s => s.effortLevel === effort);
    if (matchingStage) {
      return matchingStage;
    }
  }

  // If no match found, return the first stage
  return stages[0] || null;
}

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

export function FocusMode({ components, onLogActivity, onManageStages }: FocusModeProps) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const recommended = useMemo(
    () => getRecommendedComponent(components, skippedIds),
    [components, skippedIds]
  );

  // Fetch today's pulse check to determine energy/mood
  const { data: todayPulseCheck } = useTodayPulseCheck();

  // Fetch stages for the recommended component
  const { data: stages = [] } = useStages(recommended?._id || '');

  // Get the recommended active stage based on energy and mood
  const activeStage = useMemo(() => {
    const activeStages = stages
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.order - b.order);

    if (activeStages.length === 0) return null;

    // If no pulse check today, return the first active stage by order
    if (!todayPulseCheck) {
      return activeStages[0];
    }

    // Use energy and mood to select appropriate stage
    const suitableEfforts = getSuitableEffortLevels(
      todayPulseCheck.energyLevel,
      todayPulseCheck.moodLevel
    );

    return selectStageByEffort(activeStages, suitableEfforts);
  }, [stages, todayPulseCheck]);

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

        {activeStage && (
          <div className="mb-4 mx-auto max-w-xs">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              {todayPulseCheck ? (
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center">
                  Recommended for your energy & mood
                </p>
              ) : (
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center">
                  Pick up where you left off
                </p>
              )}
              <div className="flex items-center justify-center gap-2 mb-2">
                {activeStage.color && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeStage.color }}
                  />
                )}
                <span className="font-medium text-gray-900">
                  {activeStage.name}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    activeStage.effortLevel === 'high'
                      ? 'bg-red-100 text-red-800'
                      : activeStage.effortLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {activeStage.effortLevel}
                </span>
              </div>
              {activeStage.description && (
                <p className="text-sm text-gray-500 text-center">
                  {activeStage.description}
                </p>
              )}
            </div>
            {onManageStages && (
              <button
                onClick={() => onManageStages(recommended)}
                className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
              >
                View all stages
              </button>
            )}
          </div>
        )}

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
