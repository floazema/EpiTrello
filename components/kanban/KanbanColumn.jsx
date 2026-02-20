"use client";

import { useState } from "react";
import KanbanCard from "./KanbanCard";
import CardModal from "./CardModal";
import { Plus, MoreVertical, Trash2, Edit2 } from "lucide-react";

export default function KanbanColumn({
  column,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateColumn,
  onDeleteColumn,
  onCardDrop,
  onDragStart,
  onDragEnd,
  isDragging,
  members,
}) {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editedColumnName, setEditedColumnName] = useState(column.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleCardSubmit = async (cardData) => {
    if (editingCard) {
      await onUpdateCard(editingCard.id, cardData);
    } else {
      await onAddCard(column.id, cardData);
    }
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleUpdateColumn = async (e) => {
    e.preventDefault();
    if (editedColumnName.trim()) {
      await onUpdateColumn(column.id, editedColumnName);
      setIsEditingColumn(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const rawData = e.dataTransfer.getData("text/plain");
      if (!rawData) return;

      const data = JSON.parse(rawData);

      if (data.type === "column") {
        // Dropping a column - let it bubble to parent, DON'T stop propagation
        return;
      }

      // Only stop propagation for card drops
      e.stopPropagation();

      if (data.type === "card") {
        // Dropping a card
        const { cardId, sourceColumnId } = data;
        if (cardId && sourceColumnId !== column.id) {
          await onCardDrop(cardId, column.id);
        }
      }
    } catch (err) {
      // Invalid JSON or other error, ignore
      console.error("Drop error:", err);
    }
  };

  return (
    <div
      className={`flex flex-col w-80 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 ${isDragOver ? "ring-2 ring-zinc-400 dark:ring-zinc-600" : ""
        } ${isDragging ? "opacity-50" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
        draggable={!isEditingColumn}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {isEditingColumn ? (
          <form onSubmit={handleUpdateColumn} className="flex-1 mr-2">
            <input
              type="text"
              value={editedColumnName}
              onChange={(e) => setEditedColumnName(e.target.value)}
              className="w-full px-2 py-1 text-sm font-semibold border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              onBlur={() => {
                if (editedColumnName.trim()) {
                  handleUpdateColumn({ preventDefault: () => { } });
                } else {
                  setEditedColumnName(column.name);
                  setIsEditingColumn(false);
                }
              }}
              autoFocus
            />
          </form>
        ) : (
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {column.name}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {column.cards?.length || 0}
            </span>
          </h3>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
          >
            <MoreVertical className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setIsEditingColumn(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 text-zinc-900 dark:text-zinc-100"
                >
                  <Edit2 className="h-4 w-4" />
                  Rename column
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Delete this column and all its cards? This cannot be undone."
                      )
                    ) {
                      onDeleteColumn(column.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete column
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[100px]">
        {column.cards?.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onEdit={handleEditCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      {/* Add Card Button */}
      <div className="mt-3">
        <button
          onClick={() => setIsCardModalOpen(true)}
          className="w-full px-3 py-2 text-sm text-left text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      </div>

      {/* Card Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCardSubmit}
        card={editingCard}
        members={members}
      />
    </div>
  );
}

