import { useState, useEffect } from 'react';
import type { Component, ComponentFormData, Weight } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Modal } from './ui/Modal';

interface ComponentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ComponentFormData) => void;
  component?: Component | null;
  isLoading?: boolean;
}

const weightOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const defaultColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

export function ComponentForm({ isOpen, onClose, onSubmit, component, isLoading }: ComponentFormProps) {
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    weight: 'medium',
    minWeeklyFreq: 1,
    color: defaultColors[0],
  });

  useEffect(() => {
    if (component) {
      setFormData({
        name: component.name,
        weight: component.weight,
        minWeeklyFreq: component.minWeeklyFreq,
        color: component.color,
      });
    } else {
      setFormData({
        name: '',
        weight: 'medium',
        minWeeklyFreq: 1,
        color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      });
    }
  }, [component, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={component ? 'Edit Component' : 'New Component'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Exercise, Reading, Meditation"
          required
        />

        <Select
          label="Weight (Priority)"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value as Weight })}
          options={weightOptions}
        />

        <Input
          label="Minimum Weekly Frequency"
          type="number"
          min={1}
          value={formData.minWeeklyFreq}
          onChange={(e) => setFormData({ ...formData, minWeeklyFreq: parseInt(e.target.value) || 1 })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full transition-transform ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : component ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
