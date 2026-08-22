import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Building2, Briefcase, IndianRupee, GraduationCap, CalendarDays } from 'lucide-react';
import { placementService, type PlacementCreate, type RoundInfo } from '@/services/placements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const EMPTY_ROUND: RoundInfo = { round_type: 'test', date: '', time: '', venue_mode: '', venue_name: '', platform: '' };

export default function AddPlacementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    company_name: '',
    company_description: '',
    job_role: '',
    job_location: '',
    employment_type: '',
    annual_ctc: '',
    monthly_stipend: '',
    ppo_available: false,
    ppo_ctc: '',
    eligible_branches: '',
    min_cgpa: '',
    min_10th_pct: '',
    min_12th_pct: '',
    max_backlogs: '',
    academic_year: '',
    reg_start_date: '',
    reg_deadline: '',
    current_status: 'registered',
    notes: '',
    priority: 'medium',
  });

  const [rounds, setRounds] = useState<RoundInfo[]>([
    { round_type: 'ppt', date: '', time: '', venue_mode: '', venue_name: '', platform: '' },
    { round_type: 'test', date: '', time: '', venue_mode: '', venue_name: '', platform: '' },
    { round_type: 'interview', date: '', time: '', venue_mode: '', venue_name: '', platform: '' },
  ]);

  const createMutation = useMutation({
    mutationFn: (data: PlacementCreate) => placementService.create(data),
    onSuccess: () => {
      toast.success('Placement added successfully!');
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      navigate('/placements');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to add placement');
    },
  });

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateRound = (index: number, field: string, value: string) => {
    setRounds((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRound = () => {
    setRounds((prev) => [...prev, { ...EMPTY_ROUND }]);
  };

  const removeRound = (index: number) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company_name.trim() || !form.job_role.trim() || !form.employment_type) {
      toast.error('Please fill Company Name, Role, and Employment Type');
      return;
    }

    // Filter out empty rounds
    const validRounds = rounds.filter((r) => r.date);

    const payload: PlacementCreate = {
      company_name: form.company_name.trim(),
      company_description: form.company_description || undefined,
      job_role: form.job_role.trim(),
      job_location: form.job_location || undefined,
      employment_type: form.employment_type,
      annual_ctc: form.annual_ctc ? Number(form.annual_ctc) : undefined,
      monthly_stipend: form.monthly_stipend ? Number(form.monthly_stipend) : undefined,
      ppo_available: form.ppo_available,
      ppo_ctc: form.ppo_ctc ? Number(form.ppo_ctc) : undefined,
      eligible_branches: form.eligible_branches || undefined,
      min_cgpa: form.min_cgpa ? Number(form.min_cgpa) : undefined,
      min_10th_pct: form.min_10th_pct ? Number(form.min_10th_pct) : undefined,
      min_12th_pct: form.min_12th_pct ? Number(form.min_12th_pct) : undefined,
      max_backlogs: form.max_backlogs !== '' ? Number(form.max_backlogs) : undefined,
      academic_year: form.academic_year || undefined,
      reg_start_date: form.reg_start_date || undefined,
      reg_deadline: form.reg_deadline || undefined,
      rounds: validRounds,
      current_status: form.current_status,
      notes: form.notes || undefined,
      priority: form.priority,
    };

    createMutation.mutate(payload);
  };

  const roundTypeLabel = (type: string) => {
    switch (type) {
      case 'ppt': return 'Pre-Placement Talk (PPT)';
      case 'test': return 'Online Assessment / Test';
      case 'interview': return 'Interview';
      default: return type;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Placement</h1>
          <p className="text-muted-foreground mt-1">
            Enter all details from your college placement portal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company & Role */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Company & Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="e.g. Q2 Software, TCS, Infosys"
                  value={form.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_role">Role / Position *</Label>
                <Input
                  id="job_role"
                  placeholder="e.g. Software Engineer"
                  value={form.job_role}
                  onChange={(e) => updateField('job_role', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_location">Job Location</Label>
                <Input
                  id="job_location"
                  placeholder="e.g. Bengaluru, Hyderabad"
                  value={form.job_location}
                  onChange={(e) => updateField('job_location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select value={form.employment_type} onValueChange={(v) => updateField('employment_type', v)}>
                  <SelectTrigger id="employment_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="fte">Full Time (FTE)</SelectItem>
                    <SelectItem value="intern_fte">Internship + FTE</SelectItem>
                    <SelectItem value="intern_ppo">Internship + PPO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => updateField('priority', v)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="none">⚪ None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_status">Current Status</Label>
                <Select value={form.current_status} onValueChange={(v) => updateField('current_status', v)}>
                  <SelectTrigger id="current_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="oa_scheduled">OA Scheduled</SelectItem>
                    <SelectItem value="oa_done">OA Done</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted (for Interview)</SelectItem>
                    <SelectItem value="interview_done">Interview Done</SelectItem>
                    <SelectItem value="selected">Selected 🎉</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_description">Description (optional)</Label>
              <Textarea
                id="company_description"
                placeholder="Paste the company description from the portal..."
                rows={3}
                value={form.company_description}
                onChange={(e) => updateField('company_description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Compensation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annual_ctc">Annual CTC (₹)</Label>
                <Input
                  id="annual_ctc"
                  type="number"
                  placeholder="e.g. 1500000"
                  value={form.annual_ctc}
                  onChange={(e) => updateField('annual_ctc', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {form.annual_ctc ? `₹${(Number(form.annual_ctc) / 100000).toFixed(1)} LPA` : 'Enter in rupees'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_stipend">Monthly Stipend (₹)</Label>
                <Input
                  id="monthly_stipend"
                  type="number"
                  placeholder="e.g. 50000"
                  value={form.monthly_stipend}
                  onChange={(e) => updateField('monthly_stipend', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {form.monthly_stipend ? `₹${Number(form.monthly_stipend).toLocaleString()} /month` : 'For internships'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>PPO Available?</Label>
                <p className="text-xs text-muted-foreground">Pre-Placement Offer after internship</p>
              </div>
              <Switch
                checked={form.ppo_available}
                onCheckedChange={(v) => updateField('ppo_available', v)}
              />
            </div>
            {form.ppo_available && (
              <div className="space-y-2">
                <Label htmlFor="ppo_ctc">PPO CTC (₹)</Label>
                <Input
                  id="ppo_ctc"
                  type="number"
                  placeholder="e.g. 1500000"
                  value={form.ppo_ctc}
                  onChange={(e) => updateField('ppo_ctc', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Rounds */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-primary" />
                Rounds & Schedule
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addRound}>
                <Plus className="h-4 w-4 mr-1" /> Add Round
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rounds.map((round, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {roundTypeLabel(round.round_type)}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRound(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={round.round_type} onValueChange={(v) => updateRound(idx, 'round_type', v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ppt">PPT</SelectItem>
                        <SelectItem value="test">Test / OA</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      className="h-9"
                      value={round.date || ''}
                      onChange={(e) => updateRound(idx, 'date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      className="h-9"
                      value={round.time || ''}
                      onChange={(e) => updateRound(idx, 'time', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mode</Label>
                    <Select value={round.venue_mode || ''} onValueChange={(v) => updateRound(idx, 'venue_mode', v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Mode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Venue / Hall</Label>
                    <Input
                      className="h-9"
                      placeholder="e.g. Seminar Hall, Lab 3"
                      value={round.venue_name || ''}
                      onChange={(e) => updateRound(idx, 'venue_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Platform</Label>
                    <Input
                      className="h-9"
                      placeholder="e.g. HackerRank, Zoom, MS Teams"
                      value={round.platform || ''}
                      onChange={(e) => updateRound(idx, 'platform', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {rounds.length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No rounds added. Click "Add Round" to add PPT, Test, or Interview schedules.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Notes */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Bond details, training info, or any other details from the portal..."
              rows={4}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Save Placement'}
          </Button>
        </div>
      </form>
    </div>
  );
}
