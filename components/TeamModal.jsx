"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UserPlus, Users, Loader2, Crown, Mail } from "lucide-react";

export default function TeamModal({ boardId, isOpen, onClose, isOwner }) {
    const [members, setMembers] = useState([]);
    const [inviteeEmail, setInviteeEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/boards/${boardId}/members`);
            const data = await res.json();
            if (data.success) {
                setMembers(data.members);
            }
        } catch (e) {
            console.error("Error loading members:", e);
        } finally {
            setLoading(false);
        }
    };

    const sendInvitation = async (e) => {
        e.preventDefault();
        setSending(true);
        setError("");

        try {
            const res = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId,
                    inviteeEmail: inviteeEmail.trim(),
                }),
            });

            const data = await res.json();

            if (data.success) {
                setInviteeEmail("");
                setError("");
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError("Erreur lors de l'envoi de l'invitation");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <CardTitle>Équipe du Board</CardTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <CardDescription>
                        Gérez les membres de votre board
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Invite Section - Only for Owners */}
                    {isOwner && (
                        <form onSubmit={sendInvitation} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Inviter un membre</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={inviteeEmail}
                                        onChange={(e) => setInviteeEmail(e.target.value)}
                                        disabled={sending}
                                    />
                                    <Button type="submit" disabled={sending || !inviteeEmail.trim()}>
                                        {sending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Inviter
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {error && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Members List */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                            Membres ({members.length})
                        </h3>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full">
                                                <Mail className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                        {member.role === "owner" && (
                                            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-md text-xs font-medium">
                                                <Crown className="h-3 w-3" />
                                                Propriétaire
                                            </div>
                                        )}
                                        {member.role === "member" && (
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Membre
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                                        Aucun membre pour le moment
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
