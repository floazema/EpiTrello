// app/create-board/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Zap, Layers, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const BOARD_PRESETS = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Simple workflow: To Do, Doing, Done',
    icon: CheckCircle,
    columns: ['To Do', 'In Progress', 'Done'],
  },
  {
    id: 'agile',
    name: 'Agile',
    description: 'Sprint management: Backlog, Ready, In Progress, Review, Done',
    icon: Zap,
    columns: ['Backlog', 'Ready', 'In Progress', 'Review', 'Done'],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Detailed workflow with quality gates',
    icon: Layers,
    columns: ['Backlog', 'To Do', 'In Progress', 'Testing', 'Review', 'Done', 'Archived'],
  },
];

export default function CreateBoardPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState('basic');
  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('preset'); // 'preset' or 'details'

  const selectedPresetData = BOARD_PRESETS.find(p => p.id === selectedPreset);

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
  };

  const handleNextStep = () => {
    setStep('details');
    setError(null);
  };

  const handleBack = () => {
    setStep('preset');
    setError(null);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();

    if (!boardName.trim()) {
      setError('Board name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create board
      const boardRes = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: boardName.trim(),
          description: description.trim(),
        }),
      });

      if (!boardRes.ok) {
        const errorData = await boardRes.json();
        throw new Error(errorData.error || 'Failed to create board');
      }

      const board = await boardRes.json();

      // Create columns with preset
      const columnsPromises = selectedPresetData.columns.map((columnName, index) =>
        fetch(`/api/boards/${board.id}/columns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: columnName, position: index }),
        })
      );

      await Promise.all(columnsPromises);

      // Redirect to board
      router.push(`/boards/${board.id}`);
    } catch (err) {
      setError(err.message);
      console.error('Error creating board:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'preset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create a New Board
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose a template to get started quickly
            </p>
          </div>

          {/* Preset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {BOARD_PRESETS.map(preset => {
              const Icon = preset.icon;
              const isSelected = selectedPreset === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-6 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-gray-700 border-2 border-blue-600 shadow-lg'
                      : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-4 ${isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {preset.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {preset.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      Columns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preset.columns.map((col, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 flex items-center justify-end text-blue-600 font-semibold">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              Next <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Details Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Board Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Using <span className="font-semibold text-blue-600">{selectedPresetData.name}</span> template
          </p>
        </div>

        {/* Template Preview */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Columns will be created:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPresetData.columns.map((col, idx) => (
              <span
                key={idx}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-medium text-sm"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateBoard} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Board Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board Name *
            </label>
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. Marketing Campaign, Product Launch"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your board"
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <Plus size={20} />
                  Create Board
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}