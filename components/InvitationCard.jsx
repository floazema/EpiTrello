"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Mail, Loader2 } from "lucide-react";
import { useState } from "react";

export default function InvitationCard({ invitation, onAccept, onReject }) {
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState(null);

    const handleAccept = async () => {
        setLoading(true);
        setAction('accept');
        await onAccept(invitation.id);
        setLoading(false);
    };

    const handleReject = async () => {
        setLoading(true);
        setAction('reject');
        await onReject(invitation.id);
        setLoading(false);
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg">{invitation.board_name}</CardTitle>
                        <CardDescription>
                            Invitation de {invitation.inviter_name}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button
                        onClick={handleAccept}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        {loading && action === 'accept' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Acceptation...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Accepter
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        {loading && action === 'reject' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Refus...
                            </>
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Refuser
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
