import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus, Search, Trash2, MapPin, IndianRupee,
  Calendar, FileCheck, Users, Briefcase, ChevronDown
} from 'lucide-react';
import { placementService, type Placement } from '@/services/placements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatLPA(amount: number | null | undefined): string {
  if (!amount) return '';
  return `₹${(amount / 100000).toFixed(1)}L`;
}

// Real placement flow:
// Registered → OA Scheduled → OA Done (PPT+OA complete) → Shortlisted (for interview)
// → Interview Done (waiting results) → Selected 🎉 / Rejected ❌
const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', color: 'bg-gray-100 text-gray-700' },
  { value: 'applied', label: 'Registered', color: 'bg-blue-100 text-blue-700' },
  { value: 'oa_scheduled', label: 'OA Scheduled', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'oa_done', label: 'OA Done', color: 'bg-orange-100 text-orange-700' },
  { value: 'shortlisted', label: 'Shortlisted 🎯', color: 'bg-purple-100 text-purple-700' },
  { value: 'interview_done', label: 'Interview Done', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'selected', label: 'Selected 🎉', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected ❌', color: 'bg-red-100 text-red-700' },
];

// Map backend enum values to our local status keys
const BACKEND_TO_LOCAL: Record<string, string> = {
  interested: 'interested',
  applied: 'applied',
  ppt_scheduled: 'applied',
  assessment_scheduled: 'oa_scheduled',
  assessment_completed: 'oa_done',
  shortlisted: 'shortlisted',
  interview_scheduled: 'shortlisted',
  interview_completed: 'interview_done',
  offer_received: 'selected',
  offer_accepted: 'selected',
  rejected: 'rejected',
  withdrawn: 'rejected',
  completed: 'selected',
};

function getStatusInfo(backendStatus: string | undefined) {
  const localKey = BACKEND_TO_LOCAL[backendStatus || ''] || 'applied';
  return STATUS_OPTIONS.find((s) => s.value === localKey) || STATUS_OPTIONS[1];
}

function priorityDot(priority: string | undefined) {
  const colors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
    none: 'bg-gray-300',
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[priority || 'none']}`} />;
}

function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.split(' ')[0]);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PlacementsPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: placements, isLoading } = useQuery({
    queryKey: ['placements'],
    queryFn: () => placementService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => placementService.delete(id),
    onSuccess: () => {
      toast.success('Placement deleted');
      queryClient.invalidateQueries({ queryKey: ['placements'] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      placementService.updateStatus(id, { status }),
    onSuccess: (_, vars) => {
      const label = STATUS_OPTIONS.find((s) => s.value === vars.status)?.label || vars.status;
      toast.success(`Status updated to: ${label}`);
      queryClient.invalidateQueries({ queryKey: ['placements'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const items = (placements || []).filter((p) =>
    p.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.job_role && p.job_role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Placements</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search company or role..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/placements/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Placement
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((p) => {
            const currentStatus = getStatusInfo(p.overall_status);
            return (
              <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left — Company & Role */}
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {p.company_name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {priorityDot(p.priority)}
                              <h3 className="font-semibold text-lg leading-tight">{p.company_name}</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">{p.job_role}</p>
                          </div>
                        </div>
                        {/* Status Dropdown */}
                        <div className="shrink-0">
                          <Select
                            value={BACKEND_TO_LOCAL[p.overall_status || ''] || 'applied'}
                            onValueChange={(newStatus) => {
                              statusMutation.mutate({ id: p.id, status: newStatus });
                            }}
                          >
                            <SelectTrigger className={`h-8 text-xs font-medium border-0 gap-1 px-3 rounded-full ${currentStatus.color}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Quick info pills */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {p.job_location && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {p.job_location}
                          </span>
                        )}
                        {p.employment_type && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            <Briefcase className="h-3 w-3" /> {p.employment_type.replace('_', ' + ').toUpperCase()}
                          </span>
                        )}
                        {p.annual_ctc && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            <IndianRupee className="h-3 w-3" /> {formatLPA(p.annual_ctc)} CTC
                          </span>
                        )}
                        {p.monthly_stipend && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            ₹{p.monthly_stipend.toLocaleString()}/mo
                          </span>
                        )}
                        {p.ppo_available && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-600 font-medium">
                            PPO ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right — Round dates + actions */}
                    <div className="md:w-64 border-t md:border-t-0 md:border-l p-5 bg-muted/30 flex flex-col justify-between gap-3">
                      <div className="space-y-2 text-sm">
                        {p.ppt_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">PPT:</span>
                            <span className="font-medium">{formatDateShort(p.ppt_date)}</span>
                          </div>
                        )}
                        {p.test_date && (
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Test:</span>
                            <span className="font-medium">{formatDateShort(p.test_date)}</span>
                          </div>
                        )}
                        {p.interview_date && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Interview:</span>
                            <span className="font-medium">{formatDateShort(p.interview_date)}</span>
                          </div>
                        )}
                        {!p.ppt_date && !p.test_date && !p.interview_date && (
                          <p className="text-xs text-muted-foreground italic">No rounds scheduled</p>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${p.company_name} placement?`)) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-1">No placements yet</h3>
          <p className="text-muted-foreground mb-6">Add your first placement from the college portal</p>
          <Button onClick={() => navigate('/placements/add')}>
            <Plus className="mr-2 h-4 w-4" /> Add Placement
          </Button>
        </div>
      )}
    </motion.div>
  );
}
