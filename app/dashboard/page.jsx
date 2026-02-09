"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutDashboard, Trash2, Loader2, LogOut, Users } from "lucide-react";
import InvitationCard from "@/components/InvitationCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: "",
    description: "",
    color: "zinc"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      if (!userData.success) {
        router.push("/login");
        return;
      }

      setUser(userData.user);

      // Load boards
      const boardsRes = await fetch("/api/boards");
      const boardsData = await boardsRes.json();

      if (boardsData.success) {
        setBoards(boardsData.boards);
      }

      // Load invitations
      const invitationsRes = await fetch("/api/invitations");
      const invitationsData = await invitationsRes.json();

      if (invitationsData.success) {
        setInvitations(invitationsData.invitations);
      }
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    setCreatingBoard(true);
    setError("");

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBoard),
      });

      const data = await res.json();

      if (data.success) {
        setBoards([data.board, ...boards]);
        setShowCreateModal(false);
        setNewBoard({ name: "", description: "", color: "zinc" });
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Failed to create board");
    } finally {
      setCreatingBoard(false);
    }
  };

  const deleteBoard = async (boardId) => {
    if (!confirm("Are you sure you want to delete this board?")) return;

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setBoards(boards.filter(b => b.id !== boardId));
      }
    } catch (e) {
      setError("Failed to delete board");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (e) {
      // ignore
    }
  };

  const acceptInvitation = async (invitationId) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        // Remove invitation from list and reload boards
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        loadData();
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Erreur lors de l'acceptation");
    }
  };

  const rejectInvitation = async (invitationId) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        // Remove invitation from list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Erreur lors du refus");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-2 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                My Boards
              </h1>
              {user && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.name}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Invitations en attente ({invitations.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={acceptInvitation}
                  onReject={rejectInvitation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create Board Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="min-h-[200px] border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex flex-col items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400"
          >
            <Plus className="h-8 w-8" />
            <span className="font-medium">Create New Board</span>
          </button>

          {/* Board Cards */}
          {boards.map((board) => (
            <Card
              key={board.id}
              className="min-h-[200px] hover:shadow-lg transition-shadow cursor-pointer group relative"
              onClick={() => router.push(`/boards/${board.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                  {board.role && (
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${board.role === 'owner'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      }`}>
                      {board.role === 'owner' ? 'Propriétaire' : 'Membre'}
                    </span>
                  )}
                </div>
                {board.description && (
                  <CardDescription className="line-clamp-2">
                    {board.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-xs text-zinc-500 dark:text-zinc-600">
                  {board.role === 'owner' ? (
                    `Créé le ${new Date(board.created_at).toLocaleDateString()}`
                  ) : (
                    `Par ${board.owner_name}`
                  )}
                </div>
              </CardContent>
              {board.role === 'owner' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBoard(board.id);
                  }}
                  className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              )}
            </Card>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <LayoutDashboard className="h-16 w-16 mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No boards yet
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Create your first board to get started with organizing your tasks
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Board
            </Button>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Board</CardTitle>
              <CardDescription>
                Give your board a name and description
              </CardDescription>
            </CardHeader>
            <form onSubmit={createBoard}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Board Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Project"
                    value={newBoard.name}
                    onChange={(e) =>
                      setNewBoard({ ...newBoard, name: e.target.value })
                    }
                    required
                    disabled={creatingBoard}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="What is this board for?"
                    value={newBoard.description}
                    onChange={(e) =>
                      setNewBoard({ ...newBoard, description: e.target.value })
                    }
                    disabled={creatingBoard}
                  />
                </div>
              </CardContent>
              <div className="flex gap-3 px-6 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingBoard}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingBoard}
                  className="flex-1"
                >
                  {creatingBoard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Board"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}