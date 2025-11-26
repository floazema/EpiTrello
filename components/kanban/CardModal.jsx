"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, Tag, Calendar, AlertCircle } from "lucide-react";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "text-green-600 dark:text-green-400" },
  { value: "medium", label: "Medium", color: "text-yellow-600 dark:text-yellow-400" },
  { value: "high", label: "High", color: "text-orange-600 dark:text-orange-400" },
  { value: "urgent", label: "Urgent", color: "text-red-600 dark:text-red-400" },
];

export default function CardModal({ isOpen, onClose, onSubmit, card = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || "",
        description: card.description || "",
        priority: card.priority || "medium",
        due_date: card.due_date ? card.due_date.split('T')[0] : "",
        tags: card.tags ? card.tags.join(", ") : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        tags: "",
      });
    }
    setError("");
  }, [card, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        due_date: formData.due_date || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
      };

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save card");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={card ? "Edit Card" : "Create New Card"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-semibold">
            Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter card title..."
            required
            disabled={isLoading}
            className="text-base"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Add a more detailed description..."
            rows={4}
            disabled={isLoading}
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Priority
            </Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              disabled={isLoading}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            placeholder="bug, feature, design (comma separated)"
            disabled={isLoading}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Separate tags with commas
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {card ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{card ? "Update Card" : "Create Card"}</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

