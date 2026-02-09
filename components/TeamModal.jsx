"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, X, Crown, User, Mail, Trash2 } from "lucide-react";

export default function TeamModal({ isOpen, onClose, boardId, isOwner }) {
    const [members, setMembers] = useState([]);
    const [owner, setOwner] = useState(null);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (isOpen && boardId) {
            loadMembers();
        }
    }, [isOpen, boardId]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/boards/${boardId}/members`);
            const data = await res.json();

            if (data.success) {
                setOwner(data.owner);
                setMembers(data.members);
                setPendingInvitations(data.pendingInvitations);
            }
        } catch (e) {
            console.error("Failed to load members:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviting(true);
        setError("");
        setSuccessMessage("");

        try {
            const res = await fetch(`/api/boards/${boardId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage("Invitation envoyée !");
                setInviteEmail("");
                loadMembers();
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError("Erreur lors de l'envoi de l'invitation");
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm("Retirer ce membre du board ?")) return;

        try {
            const res = await fetch(`/api/boards/${boardId}/members?memberId=${memberId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                loadMembers();
            }
        } catch (e) {
            console.error("Failed to remove member:", e);
        }
    };

    const handleCancelInvitation = async (invitationId) => {
        try {
            const res = await fetch(`/api/boards/${boardId}/members?invitationId=${invitationId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (data.success) {
                loadMembers();
            }
        } catch (e) {
            console.error("Failed to cancel invitation:", e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gérer l'équipe" size="lg">
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Invite Form - Only for owner */}
                    {isOwner && (
                        <form onSubmit={handleInvite} className="space-y-3">
                            <Label className="text-base font-semibold">Inviter un membre</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="email@exemple.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    disabled={inviting}
                                />
                                <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                                    {inviting ? (
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
                            {successMessage && (
                                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                            )}
                        </form>
                    )}

                    {/* Owner */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Propriétaire</Label>
                        <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                                <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{owner?.name}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{owner?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">
                            Membres ({members.length})
                        </Label>
                        {members.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-2">
                                Aucun membre pour le moment
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg group"
                                    >
                                        <div className="bg-zinc-200 dark:bg-zinc-700 p-2 rounded-full">
                                            <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{member.name}</p>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</p>
                                        </div>
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Invitations */}
                    {isOwner && pendingInvitations.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Invitations en attente ({pendingInvitations.length})
                            </Label>
                            <div className="space-y-2">
                                {pendingInvitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                                    >
                                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                                            <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {invitation.invitee_email}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                En attente...
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCancelInvitation(invitation.id)}
                                            className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-all"
                                        >
                                            <X className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
