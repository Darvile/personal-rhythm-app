import { useMemo } from 'react';
import type { Record, Component } from '../../types';

interface MetricsPanelProps {
  records: Record[];
  components: Component[];
}

function parseRecordDate(dateValue: string): string {
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  return dateValue;
}

export function MetricsPanel({ records, components }: MetricsPanelProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    const dayOfWeek = currentWeekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentWeekStart.setDate(currentWeekStart.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // Effort distribution
    const effortCounts = { low: 0, medium: 0, high: 0 };

    // Weekly records
    let currentWeekRecords = 0;
    let lastWeekRecords = 0;

    // Records in last 30 days for trends
    const last30DaysRecords: Record[] = [];

    records.forEach((record) => {
      const dateStr = parseRecordDate(record.date);
      const recordDate = new Date(dateStr + 'T00:00:00');

      // Count effort levels (all time)
      effortCounts[record.effortLevel]++;

      // Current week
      if (recordDate >= currentWeekStart) {
        currentWeekRecords++;
      }

      // Last week
      if (recordDate >= lastWeekStart && recordDate < currentWeekStart) {
        lastWeekRecords++;
      }

      // Last 30 days
      if (recordDate >= last30Days) {
        last30DaysRecords.push(record);
      }
    });

    // Calculate weekly change
    const weeklyChange = lastWeekRecords > 0
      ? Math.round(((currentWeekRecords - lastWeekRecords) / lastWeekRecords) * 100)
      : currentWeekRecords > 0 ? 100 : 0;

    // Calculate average success rate across components
    const totalSuccessRate = components.length > 0
      ? Math.round(components.reduce((sum, c) => sum + c.successRate, 0) / components.length)
      : 0;

    // Calculate streak (consecutive days with at least one record)
    const sortedDates = [...new Set(records.map(r => parseRecordDate(r.date)))].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = checkDate.toISOString().split('T')[0];

      if (sortedDates.includes(checkDateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Component performance (last 4 weeks trend)
    const componentTrends = components.map((component) => {
      const componentRecords = records.filter((r) => {
        const compId = typeof r.componentId === 'string' ? r.componentId : r.componentId._id;
        return compId === component._id;
      });

      // Get records per week for last 4 weeks
      const weeklyData: { week: string; count: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const count = componentRecords.filter((r) => {
          const dateStr = parseRecordDate(r.date);
          const recordDate = new Date(dateStr + 'T00:00:00');
          return recordDate >= weekStart && recordDate < weekEnd;
        }).length;

        weeklyData.push({
          week: `W${4 - i}`,
          count,
        });
      }

      return {
        id: component._id,
        name: component.name,
        color: component.color,
        target: component.minWeeklyFreq,
        weeklyData,
        currentWeek: weeklyData[3].count,
        trend: weeklyData[3].count - weeklyData[2].count,
      };
    });

    return {
      effortCounts,
      totalRecords: records.length,
      currentWeekRecords,
      lastWeekRecords,
      weeklyChange,
      totalSuccessRate,
      streak,
      componentTrends,
      averagePerDay: last30DaysRecords.length > 0
        ? (last30DaysRecords.length / 30).toFixed(1)
        : '0',
    };
  }, [records, components]);

  const totalEffort = stats.effortCounts.low + stats.effortCounts.medium + stats.effortCounts.high;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.currentWeekRecords}</div>
            <div className="text-xs text-gray-500">This Week</div>
            {stats.weeklyChange !== 0 && (
              <div className={`text-xs mt-1 ${stats.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange}% vs last week
              </div>
            )}
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalSuccessRate}%</div>
            <div className="text-xs text-gray-500">Avg Success Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.streak}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.averagePerDay}</div>
            <div className="text-xs text-gray-500">Avg/Day (30d)</div>
          </div>
        </div>
      </div>

      {/* Effort Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Effort Distribution</h2>
        {totalEffort === 0 ? (
          <p className="text-gray-500 text-center py-4">No activities logged yet</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">Low</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.effortCounts.low / totalEffort) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {stats.effortCounts.low} ({Math.round((stats.effortCounts.low / totalEffort) * 100)}%)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">Medium</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.effortCounts.medium / totalEffort) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {stats.effortCounts.medium} ({Math.round((stats.effortCounts.medium / totalEffort) * 100)}%)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">High</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.effortCounts.high / totalEffort) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {stats.effortCounts.high} ({Math.round((stats.effortCounts.high / totalEffort) * 100)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Trends (Last 4 Weeks)</h2>
        {stats.componentTrends.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No components yet</p>
        ) : (
          <div className="space-y-4">
            {stats.componentTrends.map((comp) => (
              <div key={comp.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: comp.color }}
                    />
                    <span className="font-medium text-gray-900">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {comp.currentWeek}/{comp.target} this week
                    </span>
                    {comp.trend !== 0 && (
                      <span className={`text-xs ${comp.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comp.trend > 0 ? '+' : ''}{comp.trend}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {comp.weeklyData.map((week, idx) => {
                    const maxCount = Math.max(...comp.weeklyData.map(w => w.count), comp.target);
                    const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
                    const isCurrentWeek = idx === comp.weeklyData.length - 1;
                    const metTarget = week.count >= comp.target;

                    return (
                      <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center h-6">
                          <div
                            className={`w-full max-w-[30px] rounded-t transition-all duration-300 ${
                              metTarget ? 'bg-green-500' : isCurrentWeek ? 'bg-indigo-500' : 'bg-gray-300'
                            }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`${week.count} activities`}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{week.week}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
