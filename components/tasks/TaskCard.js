// components/tasks/TaskCard.js
'use client';

import { Calendar, AlertCircle, User } from 'lucide-react';
import { formatDate, isOverdue } from '@/lib/dateUtils';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function TaskCard({ task, members, onEdit, isDragging }) {
  const assignedMember = members.find(m => m.user_id === task.assigned_to);
  const overdue = isOverdue(task.deadline);

  return (
    <div
      onClick={onEdit}
      className={`p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Title */}
      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      {task.priority && (
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${priorityColors[task.priority] || priorityColors.low}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      )}

      {/* Footer: Deadline & Assignee */}
      <div className="flex items-center justify-between text-xs">
        {/* Deadline */}
        {task.deadline && (
          <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {overdue && <AlertCircle size={14} />}
            {!overdue && <Calendar size={14} />}
            <span>{formatDate(task.deadline)}</span>
          </div>
        )}

        {/* Assignee Avatar */}
        {assignedMember && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {assignedMember.name?.charAt(0) || '?'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}