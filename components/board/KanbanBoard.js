// components/board/KanbanBoard.js
'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import TaskCard from '@/components/tasks/TaskCard';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

export default function KanbanBoard({
  boardId,
  columns,
  tasks,
  members,
  onAddTask,
  onEditTask,
  onMoveTask,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
}) {
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const { draggedItem, handleDragStart, handleDragOver, handleDrop } = 
    useDragAndDrop(onMoveTask);

  const handleAddColumnClick = () => {
    setIsAddingColumn(true);
    setNewColumnName('');
  };

  const handleAddColumnSubmit = async () => {
    if (newColumnName.trim()) {
      await onAddColumn(newColumnName);
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleStartEditColumn = (columnId, columnName) => {
    setEditingColumnId(columnId);
    setEditingColumnName(columnName);
    setActiveMenu(null);
  };

  const handleRenameColumnSubmit = async () => {
    if (editingColumnName.trim()) {
      await onRenameColumn(editingColumnId, editingColumnName);
      setEditingColumnId(null);
      setEditingColumnName('');
    }
  };

  const handleDeleteColumnClick = async (columnId) => {
    if (window.confirm('Are you sure you want to delete this column and all its tasks?')) {
      await onDeleteColumn(columnId);
      setActiveMenu(null);
    }
  };

  if (!columns || columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
            No columns yet. Create one to get started!
          </p>
          <button
            onClick={handleAddColumnClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create First Column
          </button>
        </div>

        {isAddingColumn && (
          <div className="w-full max-w-sm mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddColumnSubmit();
                }}
                placeholder="Enter column name"
                autoFocus
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddColumnSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingColumn(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {columns.map(column => {
          const columnTasks = tasks
            .filter(t => t.columnId === column.id)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          const isEditing = editingColumnId === column.id;

          return (
            <div
              key={column.id}
              className="flex flex-col w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex-shrink-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                {isEditing ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editingColumnName}
                      onChange={(e) => setEditingColumnName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleRenameColumnSubmit();
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleRenameColumnSubmit}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingColumnId(null)}
                      className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {column.name}
                      </h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === column.id ? null : column.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Column menu"
                      >
                        <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === column.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleStartEditColumn(column.id, column.name)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                          >
                            <Edit2 size={16} />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDeleteColumnClick(column.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Tasks Drop Zone */}
              <div
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id, columnTasks.length)}
                className={`flex-1 space-y-3 p-2 rounded-lg transition-colors min-h-[200px] ${
                  draggedItem?.targetColumnId === column.id
                    ? 'bg-blue-200 dark:bg-blue-900 border-2 border-blue-400'
                    : 'bg-transparent'
                }`}
              >
                {columnTasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      members={members}
                      onEdit={() => onEditTask(task)}
                      isDragging={draggedItem?.taskId === task.id}
                    />
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">No tasks yet</p>
                  </div>
                )}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => onAddTask(column.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium"
              >
                <Plus size={18} />
                <span className="text-sm">Add task</span>
              </button>
            </div>
          );
        })}

        {/* Add Column Button */}
        <div className="flex flex-col justify-start w-80 flex-shrink-0">
          {isAddingColumn ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddColumnSubmit();
                }}
                placeholder="Enter column name"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumnSubmit}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingColumn(false)}
                  className="flex-1 py-2 px-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddColumnClick}
              className="h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus size={32} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-gray-500 group-hover:text-blue-600 font-medium">
                  Add Column
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}