// components/board/BoardHeader.js
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Settings } from 'lucide-react';

export default function BoardHeader({ board, membersCount, onSettingsClick }) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and board name */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="text-gray-600 dark:text-gray-400" size={20} />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {board?.name}
              </h1>
              {board?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {board.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Members and Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {membersCount}
              </span>
            </div>

            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Board settings"
            >
              <Settings className="text-gray-600 dark:text-gray-400" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}