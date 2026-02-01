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
  component: Component | null;
  record?: Record | null;
  isLoading?: boolean;
}

const effortOptions = [
  { value: 'low', label: 'Low Effort' },
  { value: 'medium', label: 'Medium Effort' },
  { value: 'high', label: 'High Effort' },
];

export function RecordModal({ isOpen, onClose, onSubmit, onUpdate, component, record, isLoading }: RecordModalProps) {
  const isEditing = !!record;

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
      // Creating mode: set defaults
      setFormData({
        componentId: component._id,
        date: new Date().toISOString().split('T')[0],
        effortLevel: 'medium',
        note: '',
      });
    }
  }, [component, record, isOpen]);

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

  if (!displayComponent && !record) return null;

  const componentName = displayComponent?.name || 'Unknown';
  const componentColor = displayComponent?.color || '#9ca3af';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Activity` : `Log Activity: ${componentName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: componentColor }}
          />
          <span className="font-medium">{componentName}</span>
        </div>

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
