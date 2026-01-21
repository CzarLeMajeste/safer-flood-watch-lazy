import { useState, useEffect } from "react";
import { Mail, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface EmailMessage {
  id: number;
  email_body: string;
  status: string | null;
  created_at: string;
  sent_at: string | null;
}

const EmailQueueHistory = () => {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchMessages = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from("email_queue")
      .select("id, email_body, status, created_at, sent_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setMessages(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Sent</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status ?? "Unknown"}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Email Queue History</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>View all queued email alerts and their delivery status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[180px]">Queued At</TableHead>
                <TableHead className="w-[180px]">Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No messages found.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>{getStatusBadge(msg.status)}</TableCell>
                    <TableCell className="max-w-[300px] truncate font-mono text-sm">
                      {msg.email_body}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(msg.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(msg.sent_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailQueueHistory;
