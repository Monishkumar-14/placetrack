import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Award, Trash2, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { offerService } from '@/services/offers';
import { driveService } from '@/services/drives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

function formatLPA(amount: number | null | undefined): string {
  if (!amount) return '—';
  return `₹${(amount / 100000).toFixed(1)}L`;
}

export default function OffersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    drive_id: '',
    offer_type: '',
    offer_status: '',
    annual_ctc: '',
    monthly_stipend: '',
    location: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  const { data: offersData, isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerService.list(),
  });

  const { data: drivesData } = useQuery({
    queryKey: ['drives'],
    queryFn: () => driveService.list(),
  });

  const offers = offersData || [];
  const drives = drivesData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => offerService.create(data),
    onSuccess: () => {
      toast.success('Offer added successfully');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      setDialogOpen(false);
      setForm({ drive_id: '', offer_type: '', offer_status: '', annual_ctc: '', monthly_stipend: '', location: '', notes: '' });
    },
    onError: () => toast.error('Failed to add offer'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => offerService.delete(id),
    onSuccess: () => {
      toast.success('Offer deleted');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: () => toast.error('Failed to delete offer'),
  });

  const handleSubmit = () => {
    if (!form.drive_id || !form.offer_type || !form.offer_status) {
      toast.error('Please fill all required fields');
      return;
    }
    createMutation.mutate({
      drive_id: Number(form.drive_id),
      offer_type: form.offer_type,
      offer_status: form.offer_status,
      annual_ctc: form.annual_ctc ? Number(form.annual_ctc) : undefined,
      monthly_stipend: form.monthly_stipend ? Number(form.monthly_stipend) : undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
    });
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Offer
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge>{offer.offer_type}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(offer.offer_status)}>{offer.offer_status}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (window.confirm('Delete this offer?')) deleteMutation.mutate(offer.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-2 text-lg">{offer.location || 'Location TBD'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {offer.annual_ctc && (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Annual CTC</span>
                      <span className="text-lg font-bold text-primary">{formatLPA(offer.annual_ctc)}</span>
                    </div>
                  )}
                  {offer.monthly_stipend && (
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <span className="text-sm text-muted-foreground">Monthly Stipend</span>
                      <span className="font-semibold">₹{offer.monthly_stipend.toLocaleString()}</span>
                    </div>
                  )}
                  {offer.ppo_available && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">PPO Available</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Award className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">No offers yet</h3>
          <p className="text-muted-foreground">Keep applying — your offer is just around the corner!</p>
        </div>
      )}

      {/* Add Offer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Placement Drive *</Label>
              <Select value={form.drive_id} onValueChange={(v) => setForm({ ...form, drive_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select drive" /></SelectTrigger>
                <SelectContent>
                  {drives.map((d: any) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.company_name || 'Company'} — {d.job_role || 'Role'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Offer Type *</Label>
                <Select value={form.offer_type} onValueChange={(v) => setForm({ ...form, offer_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="internship_ppo">Internship + PPO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status *</Label>
                <Select value={form.offer_status} onValueChange={(v) => setForm({ ...form, offer_status: v })}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Annual CTC (₹)</Label>
                <Input type="number" placeholder="e.g. 1200000" value={form.annual_ctc} onChange={(e) => setForm({ ...form, annual_ctc: e.target.value })} />
              </div>
              <div>
                <Label>Monthly Stipend (₹)</Label>
                <Input type="number" placeholder="e.g. 25000" value={form.monthly_stipend} onChange={(e) => setForm({ ...form, monthly_stipend: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="e.g. Bangalore, Hyderabad" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Any additional details..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
