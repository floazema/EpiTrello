// hooks/useDragAndDrop.js
'use client';

import { useState } from 'react';

export function useDragAndDrop(onMoveTask) {
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, task, sourceColumnId) => {
    setDraggedItem({
      taskId: task.id,
      sourceColumnId,
      task,
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDraggedItem(prev => ({
      ...prev,
      targetColumnId,
    }));
  };

  const handleDrop = (e, targetColumnId, targetPosition) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const { taskId, sourceColumnId, task } = draggedItem;

    // Only move if column changed or position changed
    if (sourceColumnId !== targetColumnId || draggedItem.targetPosition !== targetPosition) {
      onMoveTask(taskId, targetColumnId, targetPosition);
    }

    setDraggedItem(null);
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}