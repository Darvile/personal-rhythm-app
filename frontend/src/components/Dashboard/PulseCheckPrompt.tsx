import type { PulseCheck } from '../../types';
import { getEnergyEmoji, getMoodEmoji } from '../PulseCheckModal';

interface PulseCheckPromptProps {
  todayCheck: PulseCheck | null | undefined;
  onClick: () => void;
  isLoading?: boolean;
}

export function PulseCheckPrompt({ todayCheck, onClick, isLoading }: PulseCheckPromptProps) {
  if (isLoading) {
    return (
      <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  if (todayCheck) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        title="Update today's pulse check"
      >
        <span className="text-lg">{getEnergyEmoji(todayCheck.energyLevel)}</span>
        <span className="text-lg">{getMoodEmoji(todayCheck.moodLevel)}</span>
        <span className="text-xs text-gray-500">Tap to update</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-sm hover:shadow"
    >
      <span className="text-lg">💫</span>
      <span className="text-sm font-medium">Log your pulse</span>
    </button>
  );
}
