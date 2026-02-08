import { useState, useEffect } from 'react';
import type { PulseCheck, PulseCheckFormData } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface PulseCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PulseCheckFormData) => void;
  existingCheck?: PulseCheck | null;
  isLoading?: boolean;
}

const ENERGY_EMOJIS = ['😴', '🥱', '😐', '😊', '⚡'];
const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'];

export function PulseCheckModal({ isOpen, onClose, onSubmit, existingCheck, isLoading }: PulseCheckModalProps) {
  const [formData, setFormData] = useState<PulseCheckFormData>({
    date: new Date().toISOString().split('T')[0],
    energyLevel: 3,
    moodLevel: 3,
    note: '',
  });

  useEffect(() => {
    if (existingCheck) {
      setFormData({
        date: existingCheck.date.split('T')[0],
        energyLevel: existingCheck.energyLevel,
        moodLevel: existingCheck.moodLevel,
        note: existingCheck.note || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        energyLevel: 3,
        moodLevel: 3,
        note: '',
      });
    }
  }, [existingCheck, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleEmojiSelect = (type: 'energy' | 'mood', level: number) => {
    if (type === 'energy') {
      setFormData({ ...formData, energyLevel: level });
    } else {
      setFormData({ ...formData, moodLevel: level });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingCheck ? 'Update Pulse Check' : 'Daily Pulse Check'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Energy Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Energy Level
          </label>
          <div className="flex justify-between gap-2">
            {ENERGY_EMOJIS.map((emoji, index) => {
              const level = index + 1;
              const isSelected = formData.energyLevel === level;
              return (
                <button
                  key={`energy-${level}`}
                  type="button"
                  onClick={() => handleEmojiSelect('energy', level)}
                  className={`flex-1 py-3 text-2xl rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                      : 'bg-gray-50 hover:bg-indigo-50'
                  }`}
                  aria-label={`Energy level ${level}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-400">Low</span>
            <span className="text-xs text-gray-400">High</span>
          </div>
        </div>

        {/* Mood Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mood Level
          </label>
          <div className="flex justify-between gap-2">
            {MOOD_EMOJIS.map((emoji, index) => {
              const level = index + 1;
              const isSelected = formData.moodLevel === level;
              return (
                <button
                  key={`mood-${level}`}
                  type="button"
                  onClick={() => handleEmojiSelect('mood', level)}
                  className={`flex-1 py-3 text-2xl rounded-xl transition-all ${
                    isSelected
                      ? 'bg-amber-100 ring-2 ring-amber-500 scale-110'
                      : 'bg-gray-50 hover:bg-amber-50'
                  }`}
                  aria-label={`Mood level ${level}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-400">Low</span>
            <span className="text-xs text-gray-400">High</span>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={2}
            maxLength={500}
            placeholder="How are you feeling today?"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : existingCheck ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Helper to get emoji for a level
export function getEnergyEmoji(level: number): string {
  return ENERGY_EMOJIS[Math.min(Math.max(level - 1, 0), 4)];
}

export function getMoodEmoji(level: number): string {
  return MOOD_EMOJIS[Math.min(Math.max(level - 1, 0), 4)];
}
