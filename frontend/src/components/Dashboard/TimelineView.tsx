import type { Record as RecordType, Component } from '../../types';
import { Button } from '../ui/Button';

interface TimelineViewProps {
  records: RecordType[];
  components: Component[];
  onEditRecord: (record: RecordType) => void;
  onDeleteRecord: (id: string) => void;
}

export function TimelineView({ records, components, onEditRecord, onDeleteRecord }: TimelineViewProps) {
  const componentMap = new Map(components.map((c) => [c._id, c]));

  const getEffortBadge = (effort: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return styles[effort as keyof typeof styles] || styles.medium;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-center py-8">No activity logged yet. Start by logging an activity!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>

      <div className="space-y-3">
        {records.slice(0, 10).map((record) => {
          const componentId = typeof record.componentId === 'string'
            ? record.componentId
            : record.componentId._id;
          const component = componentMap.get(componentId);
          const componentData = typeof record.componentId === 'object' ? record.componentId : null;

          return (
            <div
              key={record._id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: component?.color || componentData?.color || '#gray' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">
                    {component?.name || componentData?.name || 'Unknown'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEffortBadge(record.effortLevel)}`}>
                    {record.effortLevel} effort
                  </span>
                </div>
                {record.note && (
                  <p className="text-sm text-gray-600 mt-1 truncate">{record.note}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDate(record.date)}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEditRecord(record)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeleteRecord(record._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
