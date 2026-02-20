import { Card } from "@/components/ui/card";
import { Trash2, GripVertical, Calendar, AlertCircle, Tag, MessageSquare, User, Paperclip } from "lucide-react";

const PRIORITY_COLORS = {
  low: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  high: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  urgent: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function KanbanCard({ card, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return { text: "Today", isOverdue: false, isNear: true };
    } else if (date.getTime() === tomorrow.getTime()) {
      return { text: "Tomorrow", isOverdue: false, isNear: true };
    } else if (date < today) {
      return { text: date.toLocaleDateString(), isOverdue: true, isNear: false };
    } else {
      const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      return {
        text: date.toLocaleDateString(),
        isOverdue: false,
        isNear: daysUntil <= 3
      };
    }
  };

  const dueDate = formatDate(card.due_date);
  const commentCount = parseInt(card.comment_count) || 0;
  const attachmentCount = parseInt(card.attachment_count) || 0;

  return (
    <Card
      className="p-3 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer group border-l-4"
      style={{
        borderLeftColor: card.priority === 'urgent' ? '#dc2626' :
          card.priority === 'high' ? '#ea580c' :
            card.priority === 'medium' ? '#ca8a04' : '#16a34a'
      }}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({
          type: "card",
          cardId: card.id,
          sourceColumnId: card.column_id
        }));
      }}
      onClick={(e) => {
        // Only open edit if not clicking on delete button
        if (!e.target.closest('[data-delete-button]')) {
          onEdit(card);
        }
      }}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
            {card.title}
          </h4>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 break-words">
              {card.description}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer with Priority, Due Date, Comments, Attachments */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.medium}`}>
              <AlertCircle className="h-2.5 w-2.5" />
              {card.priority?.charAt(0).toUpperCase() + card.priority?.slice(1)}
            </span>

            {/* Due Date */}
            {dueDate && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${dueDate.isOverdue
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                : dueDate.isNear
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
                }`}>
                <Calendar className="h-2.5 w-2.5" />
                {dueDate.text}
              </span>
            )}

            {/* Comments Badge */}
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                <MessageSquare className="h-2.5 w-2.5" />
                {commentCount}
              </span>
            )}

            {/* Attachments Badge */}
            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                <Paperclip className="h-2.5 w-2.5" />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Assignee + Delete */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Assignee Avatar */}
          {card.assigned_to_name && (
            <div
              className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-indigo-200 dark:border-indigo-800"
              title={card.assigned_to_name}
            >
              {getInitials(card.assigned_to_name)}
            </div>
          )}

          {/* Delete Button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              data-delete-button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this card?")) {
                  onDelete(card.id);
                }
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
              title="Delete card"
            >
              <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
