import { useState, useEffect } from 'react';
import type { Stage, StageFormData, EffortLevel } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface StageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StageFormData) => void;
  componentId: string;
  componentColor: string;
  stage?: Stage;
  isLoading?: boolean;
}

export function StageForm({
  isOpen,
  onClose,
  onSubmit,
  componentId,
  componentColor,
  stage,
  isLoading,
}: StageFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('medium');
  const [color, setColor] = useState('');

  const isEditing = !!stage;

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setDescription(stage.description || '');
      setEffortLevel(stage.effortLevel);
      setColor(stage.color || '');
    } else {
      setName('');
      setDescription('');
      setEffortLevel('medium');
      setColor('');
    }
  }, [stage, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      componentId,
      name: name.trim(),
      description: description.trim() || undefined,
      effortLevel,
      color: color || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Stage' : 'Add Stage'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Write Resume"
          required
          maxLength={200}
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this stage..."
            maxLength={1000}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effort Level <span className="text-red-500">*</span>
          </label>
          <select
            value={effortLevel}
            onChange={(e) => setEffortLevel(e.target.value as EffortLevel)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color (optional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color || componentColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-sm text-gray-500">
              {color ? 'Custom color' : 'Using component color'}
            </span>
            {color && (
              <button
                type="button"
                onClick={() => setColor('')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={!name.trim() || isLoading} className="flex-1">
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Stage'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
