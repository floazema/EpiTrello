"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Check, X, Loader2, LayoutDashboard } from "lucide-react";

export default function InvitationsCard({ onInvitationHandled }) {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        try {
            const res = await fetch("/api/invitations");
            const data = await res.json();

            if (data.success) {
                setInvitations(data.invitations);
            }
        } catch (e) {
            console.error("Failed to load invitations:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (invitationId) => {
        setProcessingId(invitationId);
        try {
            const res = await fetch(`/api/invitations/${invitationId}/accept`, {
                method: "POST",
            });

            const data = await res.json();
            if (data.success) {
                setInvitations(invitations.filter((i) => i.id !== invitationId));
                if (onInvitationHandled) onInvitationHandled();
            }
        } catch (e) {
            console.error("Failed to accept invitation:", e);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (invitationId) => {
        setProcessingId(invitationId);
        try {
            const res = await fetch(`/api/invitations/${invitationId}/reject`, {
                method: "POST",
            });

            const data = await res.json();
            if (data.success) {
                setInvitations(invitations.filter((i) => i.id !== invitationId));
            }
        } catch (e) {
            console.error("Failed to reject invitation:", e);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return null;
    }

    if (invitations.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    <Mail className="h-5 w-5" />
                    Invitations en attente ({invitations.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {invitations.map((invitation) => (
                    <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                                <LayoutDashboard className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {invitation.board_name}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Invité par {invitation.inviter_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(invitation.id)}
                                disabled={processingId === invitation.id}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                            >
                                {processingId === invitation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAccept(invitation.id)}
                                disabled={processingId === invitation.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processingId === invitation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Accepter
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
