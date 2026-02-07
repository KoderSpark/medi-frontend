
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, UserCog, CheckCircle2, XCircle, FileEdit, Activity } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Log {
    _id: string;
    action: string;
    description: string;
    createdAt: string;
    actorModel: string;
}

interface ActivityLogCardProps {
    logs: Log[];
    title?: string;
    maxHeight?: string;
}

const getIcon = (action: string) => {
    if (action.includes('APPROVE')) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (action.includes('REJECT')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.includes('UPDATE')) return <FileEdit className="h-4 w-4 text-blue-600" />;
    if (action.includes('VISIT')) return <UserCog className="h-4 w-4 text-purple-600" />;
    return <Activity className="h-4 w-4 text-slate-500" />;
};

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ logs, title = "Recent Activity", maxHeight = "h-[300px]" }) => {
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className={maxHeight}>
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No recent activity found.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <div key={log._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-3">
                                    <div className="mt-0.5 bg-slate-100 p-1.5 rounded-full shrink-0">
                                        {getIcon(log.action)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-slate-800 leading-none">{log.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                            {log.actorModel === 'Admin' && (
                                                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium border border-red-100">Admin</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ActivityLogCard;
