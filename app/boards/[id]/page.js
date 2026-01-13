// app/boards/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BoardHeader from '@/components/board/BoardHeader';
import KanbanBoard from '@/components/board/KanbanBoard';
import TaskModal from '@/components/tasks/TaskModal';
import BoardSettingsModal from '@/components/board/BoardSettingsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id;
  
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [showBoardSettings, setShowBoardSettings] = useState(false);

  // Fetch board data
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const boardRes = await fetch(`/api/boards/${boardId}`);
        if (!boardRes.ok) throw new Error('Failed to fetch board');
        const boardData = await boardRes.json();
        setBoard(boardData);

        const columnsRes = await fetch(`/api/boards/${boardId}/columns`);
        if (columnsRes.ok) {
          setColumns(await columnsRes.json());
        }

        const tasksRes = await fetch(`/api/boards/${boardId}/tasks`);
        if (tasksRes.ok) {
          setTasks(await tasksRes.json());
        }

        const membersRes = await fetch(`/api/boards/${boardId}/members`);
        if (membersRes.ok) {
          setMembers(await membersRes.json());
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching board:', err);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const handleAddTask = (columnId) => {
    setSelectedColumnId(columnId);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSaved = async () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    
    // Refresh tasks
    const tasksRes = await fetch(`/api/boards/${boardId}/tasks`);
    if (tasksRes.ok) {
      setTasks(await tasksRes.json());
    }
  };

  const handleTaskDeleted = async () => {
    setShowTaskModal(false);
    
    // Refresh tasks
    const tasksRes = await fetch(`/api/boards/${boardId}/tasks`);
    if (tasksRes.ok) {
      setTasks(await tasksRes.json());
    }
  };

  const handleMoveTask = async (taskId, targetColumnId, position) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: targetColumnId, position }),
      });

      if (!res.ok) throw new Error('Failed to move task');

      // Update local state optimistically
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, columnId: targetColumnId, position } : t
        )
      );
    } catch (err) {
      console.error('Error moving task:', err);
      // Refresh tasks on error
      const tasksRes = await fetch(`/api/boards/${boardId}/tasks`);
      if (tasksRes.ok) {
        setTasks(await tasksRes.json());
      }
    }
  };

  const handleAddColumn = async (columnName) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: columnName }),
      });

      if (!res.ok) throw new Error('Failed to create column');
      
      const newColumn = await res.json();
      setColumns([...columns, newColumn]);
    } catch (err) {
      console.error('Error adding column:', err);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete column');
      
      setColumns(columns.filter(c => c.id !== columnId));
      setTasks(tasks.filter(t => t.columnId !== columnId));
    } catch (err) {
      console.error('Error deleting column:', err);
    }
  };

  const handleRenameColumn = async (columnId, newName) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error('Failed to rename column');
      
      setColumns(columns.map(c => c.id === columnId ? { ...c, name: newName } : c));
    } catch (err) {
      console.error('Error renaming column:', err);
    }
  };

  const handleBoardSettingsOpen = () => {
    setShowBoardSettings(true);
  };

  const handleBoardUpdated = async () => {
    setShowBoardSettings(false);
    const boardRes = await fetch(`/api/boards/${boardId}`);
    if (boardRes.ok) {
      setBoard(await boardRes.json());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">Error loading board</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Board not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BoardHeader 
        board={board} 
        membersCount={members.length}
        onSettingsClick={handleBoardSettingsOpen}
      />
      
      <div className="p-6">
        <KanbanBoard
          boardId={boardId}
          columns={columns}
          tasks={tasks}
          members={members}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onMoveTask={handleMoveTask}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onRenameColumn={handleRenameColumn}
        />
      </div>

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          task={selectedTask}
          boardId={boardId}
          columnId={selectedColumnId}
          members={members}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskSaved}
          onDelete={handleTaskDeleted}
        />
      )}

      {showBoardSettings && (
        <BoardSettingsModal
          isOpen={showBoardSettings}
          board={board}
          boardId={boardId}
          onClose={() => setShowBoardSettings(false)}
          onUpdate={handleBoardUpdated}
        />
      )}
    </div>
  );
}