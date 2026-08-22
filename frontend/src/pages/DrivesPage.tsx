import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { driveService } from '@/services/drives';
import { companyService } from '@/services/companies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function DrivesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    company_id: '',
    job_role: '',
    job_location: '',
    drive_type: '',
    overall_status: '',
    notes: ''
  });

  const { data: drivesData, isLoading } = useQuery({
    queryKey: ['drives'],
    queryFn: () => driveService.list(),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (newDrive: any) => driveService.create(newDrive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
      toast.success('Drive created successfully');
      setIsDialogOpen(false);
      setFormData({
        company_id: '',
        job_role: '',
        job_location: '',
        drive_type: '',
        overall_status: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to create drive');
      console.error(error);
    }
  });

  const drives = drivesData || [];
  const companies = companiesData || [];

  const filteredDrives = drives.filter((d: any) => 
    (d.job_role && d.job_role.toLowerCase().includes(search.toLowerCase())) ||
    (d.company_name && d.company_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_id || !formData.job_role) {
      toast.error('Company and Job Role are required');
      return;
    }
    
    createMutation.mutate({
      ...formData,
      company_id: Number(formData.company_id)
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placement Drives</h1>
          <p className="text-muted-foreground mt-1">Manage and track campus and off-campus placement opportunities.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search role or company..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline"><Filter className="h-4 w-4 mr-2"/> Filter</Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Drive</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Placement Drive</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="company_id">Company <span className="text-red-500">*</span></Label>
                  <Select value={formData.company_id} onValueChange={(val) => handleInputChange('company_id', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job_role">Job Role <span className="text-red-500">*</span></Label>
                  <Input 
                    id="job_role" 
                    placeholder="e.g. Software Development Engineer"
                    value={formData.job_role}
                    onChange={(e) => handleInputChange('job_role', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_location">Job Location</Label>
                  <Input 
                    id="job_location" 
                    placeholder="e.g. Bangalore"
                    value={formData.job_location}
                    onChange={(e) => handleInputChange('job_location', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Drive Type</Label>
                    <Select value={formData.drive_type} onValueChange={(val) => handleInputChange('drive_type', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="campus">Campus</SelectItem>
                        <SelectItem value="off_campus">Off Campus</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="internship_ppo">Internship + PPO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.overall_status} onValueChange={(val) => handleInputChange('overall_status', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="ppt_scheduled">PPT Scheduled</SelectItem>
                        <SelectItem value="assessment_scheduled">Assessment Scheduled</SelectItem>
                        <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Add any additional details here..."
                    className="resize-none"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Drive
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Company & Role</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">App Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
                ) : filteredDrives.length > 0 ? (
                  filteredDrives.map((drive: any) => (
                    <tr key={drive.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{drive.company_name || 'Unknown Company'}</div>
                        <div className="text-muted-foreground">{drive.job_role} {drive.job_location && `• ${drive.job_location}`}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="capitalize">
                          {drive.drive_type ? drive.drive_type.replace('_', ' ') : 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{drive.application_date ? format(new Date(drive.application_date), 'MMM dd, yyyy') : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {drive.overall_status ? drive.overall_status.replace(/_/g, ' ') : 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {search ? 'No placement drives found matching your search.' : 'No placement drives added yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
