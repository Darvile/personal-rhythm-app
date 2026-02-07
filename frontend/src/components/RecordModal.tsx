import { useState, useEffect } from 'react';
import type { Component, Record, RecordFormData, EffortLevel } from '../types';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordFormData) => void;
  onUpdate?: (data: Partial<Omit<RecordFormData, 'componentId'>>) => void;
  onDelete?: (id: string) => void;
  component: Component | null;
  components?: Component[];
  record?: Record | null;
  defaultDate?: string;
  isLoading?: boolean;
}

const effortOptions = [
  { value: 'low', label: 'Low Effort' },
  { value: 'medium', label: 'Medium Effort' },
  { value: 'high', label: 'High Effort' },
];

export function RecordModal({ isOpen, onClose, onSubmit, onUpdate, onDelete, component, components, record, defaultDate, isLoading }: RecordModalProps) {
  const isEditing = !!record;
  const showComponentSelector = !component && !record && components && components.length > 0;

  const [formData, setFormData] = useState<RecordFormData>({
    componentId: '',
    date: new Date().toISOString().split('T')[0],
    effortLevel: 'medium',
    note: '',
  });

  useEffect(() => {
    if (record) {
      // Editing mode: populate from existing record
      const recordDate = record.date.includes('T')
        ? record.date.split('T')[0]
        : record.date;
      const componentId = typeof record.componentId === 'string'
        ? record.componentId
        : record.componentId._id;

      setFormData({
        componentId,
        date: recordDate,
        effortLevel: record.effortLevel,
        note: record.note || '',
      });
    } else if (component) {
      // Creating mode with pre-selected component
      setFormData({
        componentId: component._id,
        date: defaultDate || new Date().toISOString().split('T')[0],
        effortLevel: 'medium',
        note: '',
      });
    } else if (showComponentSelector) {
      // Creating mode with component selector
      setFormData({
        componentId: components[0]._id,
        date: defaultDate || new Date().toISOString().split('T')[0],
        effortLevel: 'medium',
        note: '',
      });
    }
  }, [component, components, record, defaultDate, isOpen, showComponentSelector]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && onUpdate) {
      onUpdate({
        date: formData.date,
        effortLevel: formData.effortLevel,
        note: formData.note,
      });
    } else {
      onSubmit(formData);
    }
  };

  // Get component info for display
  const displayComponent = component || (record && typeof record.componentId === 'object' ? {
    _id: record.componentId._id,
    name: record.componentId.name,
    color: record.componentId.color,
  } : null);

  // Get selected component when using component selector
  const selectedComponent = showComponentSelector
    ? components.find(c => c._id === formData.componentId)
    : null;

  if (!displayComponent && !record && !showComponentSelector) return null;

  const componentName = displayComponent?.name || selectedComponent?.name || 'Unknown';
  const componentColor = displayComponent?.color || selectedComponent?.color || '#9ca3af';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Activity` : showComponentSelector ? 'Log Activity' : `Log Activity: ${componentName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {showComponentSelector ? (
          <Select
            label="Component"
            value={formData.componentId}
            onChange={(e) => setFormData({ ...formData, componentId: e.target.value })}
            options={components.map((c) => ({ value: c._id, label: c.name }))}
          />
        ) : (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: componentColor }}
            />
            <span className="font-medium">{componentName}</span>
          </div>
        )}

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Select
          label="Effort Level"
          value={formData.effortLevel}
          onChange={(e) => setFormData({ ...formData, effortLevel: e.target.value as EffortLevel })}
          options={effortOptions}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Add a note about this activity..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          {isEditing && onDelete && record && (
            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(record._id)}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Log Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
