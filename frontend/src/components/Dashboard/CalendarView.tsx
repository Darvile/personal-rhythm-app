import { useState, useMemo } from 'react';
import type { Record, Component, EffortLevel } from '../../types';

interface EffortIconProps {
  effort: EffortLevel;
  color: string;
  componentName: string;
  record: Record;
  onRecordClick?: (record: Record) => void;
}

function EffortIcon({ effort, color, componentName, record, onRecordClick }: EffortIconProps) {
  const size = 12;

  const getShape = () => {
    switch (effort) {
      case 'low':
        return <circle cx="6" cy="6" r="5" fill={color} />;
      case 'medium':
        return <polygon points="6,1 11,11 1,11" fill={color} />;
      case 'high':
        return <rect x="1" y="1" width="10" height="10" fill={color} />;
      default:
        return <circle cx="6" cy="6" r="5" fill={color} />;
    }
  };

  return (
    <div
      className="group relative cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onRecordClick?.(record);
      }}
    >
      <svg width={size} height={size} viewBox="0 0 12 12">
        {getShape()}
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {componentName}
        <span className="text-gray-400 ml-1">({effort})</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

interface CalendarViewProps {
  records: Record[];
  components: Component[];
  onRecordClick?: (record: Record) => void;
  onDayClick?: (date: string) => void;
}

type ViewMode = 'week' | 'month';

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseRecordDate(dateValue: string): string {
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  const date = new Date(dateValue);
  return formatDateKey(date);
}

function getWeekDays(referenceDate: Date): Date[] {
  const date = new Date(referenceDate);
  const currentDay = date.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }
  return days;
}

function getMonthWeeks(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Find the Monday of the week containing the first day
  const startDay = firstDay.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() + mondayOffset);

  const weeks: Date[][] = [];
  const current = new Date(calendarStart);

  // Generate weeks until we've passed the last day of the month
  while (current <= lastDay || weeks.length < 5) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);

    // Stop if we've completed the month and have at least 4 weeks
    if (current > lastDay && weeks.length >= 4) break;
    if (weeks.length >= 6) break;
  }

  return weeks;
}

export function CalendarView({ records, components, onRecordClick, onDayClick }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedComponentId, setSelectedComponentId] = useState<string>('all');

  const today = formatDateKey(new Date());

  const { weeks, currentMonth } = useMemo(() => {
    if (viewMode === 'week') {
      return {
        weeks: [getWeekDays(currentDate)],
        currentMonth: currentDate.getMonth(),
      };
    } else {
      return {
        weeks: getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth()),
        currentMonth: currentDate.getMonth(),
      };
    }
  }, [viewMode, currentDate]);

  const filteredRecords = useMemo(() => {
    if (selectedComponentId === 'all') {
      return records;
    }
    return records.filter((record) => {
      const compId = typeof record.componentId === 'string'
        ? record.componentId
        : record.componentId._id;
      return compId === selectedComponentId;
    });
  }, [records, selectedComponentId]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, Record[]>();
    filteredRecords.forEach((record) => {
      const dateKey = parseRecordDate(record.date);
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, record]);
    });
    return map;
  }, [filteredRecords]);

  const componentMap = useMemo(() => {
    return new Map(components.map((c) => [c._id, c]));
  }, [components]);

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderText = () => {
    if (viewMode === 'week') {
      const weekDays = weeks[0];
      const start = weekDays[0];
      const end = weekDays[6];
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Activity Calendar</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" fill="#9ca3af" />
            </svg>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 12 12">
              <polygon points="6,1 11,11 1,11" fill="#9ca3af" />
            </svg>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 12 12">
              <rect x="1" y="1" width="10" height="10" fill="#9ca3af" />
            </svg>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* View mode toggle and navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrev}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[140px] sm:min-w-[180px] text-center">
              {getHeaderText()}
            </span>
            <button
              onClick={navigateNext}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Component Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="component-filter" className="text-xs text-gray-500">
              Filter:
            </label>
            <select
              id="component-filter"
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Components</option>
              {components.map((comp) => (
                <option key={comp._id} value={comp._id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((day) => {
            const dateStr = formatDateKey(day);
            const dayRecords = recordsByDate.get(dateStr) || [];
            const isToday = dateStr === today;
            const isCurrentMonth = day.getMonth() === currentMonth;

            return (
              <div
                key={dateStr}
                onClick={() => onDayClick?.(dateStr)}
                className={`min-h-[60px] p-1 rounded-lg border transition-colors cursor-pointer hover:border-indigo-300 ${
                  isToday
                    ? 'border-indigo-500 bg-indigo-50'
                    : isCurrentMonth
                    ? 'border-gray-200'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    isToday
                      ? 'font-bold text-indigo-600'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="flex flex-wrap gap-0.5 items-center">
                  {dayRecords.slice(0, 4).map((record) => {
                    const componentId =
                      typeof record.componentId === 'string'
                        ? record.componentId
                        : record.componentId._id;
                    const component = componentMap.get(componentId);
                    return (
                      <EffortIcon
                        key={record._id}
                        effort={record.effortLevel}
                        color={component?.color || '#9ca3af'}
                        componentName={component?.name || 'Unknown'}
                        record={record}
                        onRecordClick={onRecordClick}
                      />
                    );
                  })}
                  {dayRecords.length > 4 && (
                    <span className="text-xs text-gray-500">+{dayRecords.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
