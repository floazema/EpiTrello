// components/tasks/TaskModal.js
'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const priorityOptions = ['low', 'medium', 'high'];

export default function TaskModal({
  isOpen,
  task,
  boardId,
  columnId,
  members,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
      setAssignedTo(task.assigned_to || '');
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
      setAssignedTo('');
    }
    setError(null);
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        deadline: deadline || null,
        assignedTo: assignedTo || null,
      };

      const url = task ? `/api/tasks/${task.id}` : `/api/boards/${boardId}/tasks`;
      const method = task ? 'PUT' : 'POST';

      if (!task) {
        payload.columnId = columnId;
        payload.position = 0;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save task');
      }

      onSave();
    } catch (err) {
      setError(err.message);
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }

      onDelete();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              disabled={loading}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={loading}
            >
              {priorityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={loading}
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign to
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={loading}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name || 'Unknown'}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <>
                  <Save size={18} />
                  Save
                </>
              )}
            </button>

            {task && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 disabled:bg-gray-400 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                aria-label="Delete task"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}