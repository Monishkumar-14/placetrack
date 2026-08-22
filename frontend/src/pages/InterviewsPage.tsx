import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { interviewService } from '@/services/interviews';
import { driveService } from '@/services/drives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const INTERVIEW_TYPES = ['technical', 'hr', 'managerial', 'system_design', 'behavioral', 'group_discussion', 'panel', 'other'];

export default function InterviewsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    drive_id: '',
    interview_type: '',
    round_number: '',
    date: '',
    venue_mode: '',
    interviewer: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewService.list(),
  });

  const { data: drivesData } = useQuery({
    queryKey: ['drives'],
    queryFn: () => driveService.list(),
  });

  const interviews = interviewsData || [];
  const drives = drivesData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => interviewService.create(data),
    onSuccess: () => {
      toast.success('Interview added successfully');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setDialogOpen(false);
      setForm({ drive_id: '', interview_type: '', round_number: '', date: '', venue_mode: '', interviewer: '', notes: '' });
    },
    onError: () => toast.error('Failed to add interview'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => interviewService.delete(id),
    onSuccess: () => {
      toast.success('Interview deleted');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: () => toast.error('Failed to delete interview'),
  });

  const handleSubmit = () => {
    if (!form.drive_id || !form.interview_type) {
      toast.error('Please select a drive and interview type');
      return;
    }
    createMutation.mutate({
      drive_id: Number(form.drive_id),
      interview_type: form.interview_type,
      round_number: form.round_number ? Number(form.round_number) : undefined,
      date: form.date || undefined,
      venue_mode: form.venue_mode || undefined,
      interviewer: form.interviewer || undefined,
      notes: form.notes || undefined,
    });
  };

  const statusColor = (result: string) => {
    switch (result) {
      case 'selected': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Interview
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Round</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Mode</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
                  ))
                ) : interviews.length > 0 ? (
                  interviews.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">Round {item.round_number || '—'}</td>
                      <td className="px-6 py-4 capitalize">{item.interview_type?.replace('_', ' ')}</td>
                      <td className="px-6 py-4">{item.date ? format(new Date(item.date), 'MMM dd, yyyy') : 'TBD'}</td>
                      <td className="px-6 py-4 capitalize">{item.venue_mode || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusColor(item.result)}>
                          {item.result || item.status || 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (window.confirm('Delete this interview?')) deleteMutation.mutate(item.id);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No interviews yet. Add one to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Interview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="int-drive">Placement Drive *</Label>
              <Select value={form.drive_id} onValueChange={(v) => setForm({ ...form, drive_id: v })}>
                <SelectTrigger id="int-drive"><SelectValue placeholder="Select drive" /></SelectTrigger>
                <SelectContent>
                  {drives.map((d: any) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.company_name || 'Company'} — {d.job_role || 'Role'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="int-type">Interview Type *</Label>
              <Select value={form.interview_type} onValueChange={(v) => setForm({ ...form, interview_type: v })}>
                <SelectTrigger id="int-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="int-round">Round Number</Label>
                <Input id="int-round" type="number" min={1} placeholder="1" value={form.round_number} onChange={(e) => setForm({ ...form, round_number: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="int-date">Date</Label>
                <Input id="int-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="int-mode">Mode</Label>
                <Select value={form.venue_mode} onValueChange={(v) => setForm({ ...form, venue_mode: v })}>
                  <SelectTrigger id="int-mode"><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="int-interviewer">Interviewer</Label>
                <Input id="int-interviewer" placeholder="Name" value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="int-notes">Notes</Label>
              <Textarea id="int-notes" placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
