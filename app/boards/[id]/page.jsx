"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id;

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      const data = await res.json();

      if (data.success) {
        setBoard(data.board);
      } else {
        setError(data.message);
        if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (e) {
      setError("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (columnId, cardData) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_id: columnId,
          title: cardData.title,
          description: cardData.description,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update board state
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === columnId
              ? { ...col, cards: [...col.cards, data.card] }
              : col
          ),
        }));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to add card");
    }
  };

  const handleUpdateCard = async (cardId, updates) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (data.success) {
        // Update board state
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId ? data.card : card
            ),
          })),
        }));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to update card");
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        // Update board state
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          })),
        }));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to delete card");
    }
  };

  const handleCardDrop = async (cardId, targetColumnId) => {
    try {
      // Optimistically update UI
      const sourceColumn = board.columns.find((col) =>
        col.cards.some((card) => card.id === cardId)
      );
      const card = sourceColumn.cards.find((c) => c.id === cardId);
      const targetColumn = board.columns.find((col) => col.id === targetColumnId);

      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
            };
          }
          if (col.id === targetColumnId) {
            return {
              ...col,
              cards: [...col.cards, { ...card, column_id: targetColumnId }],
            };
          }
          return col;
        }),
      }));

      const res = await fetch(`/api/cards/${cardId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_id: targetColumnId,
          position: targetColumn.cards.length,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert on error
        loadBoard();
        setError(data.message);
      }
    } catch (e) {
      // Revert on error
      loadBoard();
      setError("Failed to move card");
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    try {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board_id: boardId,
          name: newColumnName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBoard((prev) => ({
          ...prev,
          columns: [...prev.columns, data.column],
        }));
        setNewColumnName("");
        setIsAddingColumn(false);
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to add column");
    }
  };

  const handleUpdateColumn = async (columnId, name) => {
    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.success) {
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === columnId ? { ...col, name: data.column.name } : col
          ),
        }));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to update column");
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.filter((col) => col.id !== columnId),
        }));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to delete column");
    }
  };

  const handleColumnDragStart = (e, columnId) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "column", columnId }));
  };

  const handleColumnDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    // Use state to check if we're dragging a column (getData doesn't work in dragover)
    if (draggedColumnId !== null) {
      setDropTargetIndex(index);
    }
  };

  const handleColumnDrop = async (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    // Use state instead of getData which can be unreliable
    if (draggedColumnId === null) return;

    const columnId = draggedColumnId;

    const sourceIndex = board.columns.findIndex((col) => col.id === columnId);

    if (sourceIndex === targetIndex) {
      setDraggedColumnId(null);
      setDropTargetIndex(null);
      return;
    }

    // Optimistically update UI
    const newColumns = [...board.columns];
    const [movedColumn] = newColumns.splice(sourceIndex, 1);
    newColumns.splice(targetIndex, 0, movedColumn);

    setBoard((prev) => ({
      ...prev,
      columns: newColumns,
    }));

    setDraggedColumnId(null);
    setDropTargetIndex(null);

    try {
      const res = await fetch(`/api/columns/${columnId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: targetIndex,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        // Revert on error
        loadBoard();
        setError(data.message);
      }
    } catch (e) {
      // Revert on error
      loadBoard();
      setError("Failed to move column");
    }
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
    setDropTargetIndex(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error && !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 dark:bg-zinc-100 p-2 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {board?.name}
                </h1>
                {board?.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {board.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-3 border-b border-red-200 dark:border-red-800">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-4 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full px-6 py-6">
          <div className="flex gap-4 h-full">
            {/* Columns */}
            {board?.columns.map((column, index) => (
              <div
                key={column.id}
                onDragOver={(e) => handleColumnDragOver(e, index)}
                onDrop={(e) => handleColumnDrop(e, index)}
                className={`${dropTargetIndex === index && draggedColumnId !== column.id
                  ? "relative"
                  : ""
                  }`}
              >
                {dropTargetIndex === index && draggedColumnId !== column.id && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-full z-10" />
                )}
                <div
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, column.id)}
                  onDragEnd={handleColumnDragEnd}
                  className={`${draggedColumnId === column.id ? "opacity-50" : ""
                    }`}
                >
                  <KanbanColumn
                    column={column}
                    onAddCard={handleAddCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                    onUpdateColumn={handleUpdateColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onCardDrop={handleCardDrop}
                  />
                </div>
              </div>
            ))}

            {/* Add Column */}
            <div
              className="w-80 flex-shrink-0"
              onDragOver={(e) => handleColumnDragOver(e, board?.columns.length || 0)}
              onDrop={(e) => handleColumnDrop(e, board?.columns.length || 0)}
            >
              {dropTargetIndex === (board?.columns.length || 0) && (
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-500 rounded-full z-10" />
              )}
              {isAddingColumn ? (
                <form
                  onSubmit={handleAddColumn}
                  className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3"
                >
                  <Input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Enter column name..."
                    className="mb-2"
                    autoFocus
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      Add column
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full px-4 py-3 text-left text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg flex items-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700"
                >
                  <Plus className="h-5 w-5" />
                  Add another column
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

