import type { InsightsData, Insight } from '../../types';

interface InsightsPanelProps {
  insights: InsightsData | undefined;
  isLoading?: boolean;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ConfidenceBadge({ confidence }: { confidence: Insight['confidence'] }) {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[confidence]}`}>
      {confidence}
    </span>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const iconByType = {
    same_day: '📊',
    next_day: '📈',
    weekly_pattern: '📅',
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">{iconByType[insight.type]}</span>
          <div>
            <p className="text-sm text-gray-900">{insight.insight}</p>
            <p className="text-xs text-gray-500 mt-1">
              Based on {insight.dataPoints} data points
            </p>
          </div>
        </div>
        <ConfidenceBadge confidence={insight.confidence} />
      </div>
    </div>
  );
}

function WeeklyPatternChart({ weeklyPattern }: { weeklyPattern: InsightsData['weeklyPattern'] }) {
  if (!weeklyPattern || weeklyPattern.length === 0) return null;

  const maxMood = Math.max(...weeklyPattern.map((d) => d.avgMood), 5);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Weekly Pattern</h4>
      <div className="flex items-end justify-between gap-2 h-24">
        {weeklyPattern.map((day) => {
          const heightPercent = (day.avgMood / maxMood) * 100;
          return (
            <div key={day.dayOfWeek} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t"
                style={{ height: `${heightPercent}%` }}
                title={`Energy: ${day.avgEnergy.toFixed(1)}, Mood: ${day.avgMood.toFixed(1)}`}
              />
              <span className="text-xs text-gray-500">{DAY_NAMES[day.dayOfWeek]}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Mood</span>
        <span>1-5 scale</span>
      </div>
    </div>
  );
}

export function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded-lg" />
          <div className="h-20 bg-gray-100 rounded-lg" />
        </div>
      </section>
    );
  }

  if (!insights) {
    return null;
  }

  const hasEnoughData = insights.correlations.length > 0 || insights.weeklyPattern.length >= 3;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>

      {!hasEnoughData ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">📊</span>
          <p className="text-gray-600">Keep logging to unlock insights</p>
          <p className="text-sm text-gray-400 mt-1">
            We need at least 5 pulse checks to find patterns
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          {insights.summary && (insights.summary.averageEnergy > 0 || insights.summary.averageMood > 0) && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-semibold text-indigo-600">
                  {insights.summary.averageEnergy.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Avg Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-amber-600">
                  {insights.summary.averageMood.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Avg Mood</div>
              </div>
            </div>
          )}

          {/* Weekly Pattern */}
          {insights.weeklyPattern.length >= 3 && (
            <WeeklyPatternChart weeklyPattern={insights.weeklyPattern} />
          )}

          {/* Correlation Insights */}
          {insights.correlations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Patterns Found</h4>
              {insights.correlations.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          )}

          {/* Best/Worst Days */}
          {insights.summary.bestDayOfWeek && insights.summary.worstDayOfWeek && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Best day: </span>
                  <span className="font-medium text-green-600">{insights.summary.bestDayOfWeek}</span>
                </div>
                <div>
                  <span className="text-gray-500">Lowest: </span>
                  <span className="font-medium text-red-500">{insights.summary.worstDayOfWeek}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
