import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { assessmentService } from '@/services/assessments';
import { driveService } from '@/services/drives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

interface AssessmentCreate {
  drive_id: number;
  assessment_name: string;
  assessment_type: string;
  date?: string;
  difficulty?: string;
  notes?: string;
}

export default function AssessmentsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AssessmentCreate>>({});

  const { data: assessmentsData, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.list(),
  });

  const { data: drivesData, isLoading: isLoadingDrives } = useQuery({
    queryKey: ['drives'],
    queryFn: () => driveService.list(),
  });

  const assessments = assessmentsData || [];
  const drives = drivesData || [];

  const createMutation = useMutation({
    mutationFn: (data: AssessmentCreate) => assessmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment created successfully');
      setIsAddOpen(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create assessment');
    },
  });

  const handleCreate = () => {
    if (!formData.drive_id || !formData.assessment_name || !formData.assessment_type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createMutation.mutate(formData as AssessmentCreate);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getResultColor = (result?: string) => {
    if (!result) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('pass') || lowerResult.includes('select')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    if (lowerResult.includes('fail') || lowerResult.includes('reject')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Assessments
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your technical rounds and tests.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      {isLoadingAssessments ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
          <p className="text-muted-foreground mb-4">You haven't added any assessments yet.</p>
          <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add your first assessment</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment: any) => (
            <Card key={assessment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg line-clamp-1" title={assessment.assessment_name}>
                      {assessment.assessment_name}
                    </h3>
                    {assessment.assessment_type && (
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {assessment.assessment_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {assessment.date && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Date:</span> 
                        {format(new Date(assessment.date), 'PP')}
                      </div>
                    )}
                    
                    {assessment.shortlisted !== undefined && assessment.shortlisted !== null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Shortlisted:</span> 
                        <Badge variant={assessment.shortlisted ? "default" : "secondary"} className={assessment.shortlisted ? "bg-green-500 hover:bg-green-600" : ""}>
                          {assessment.shortlisted ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}

                    {assessment.result && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium text-foreground">Result:</span> 
                        <Badge variant="secondary" className={getResultColor(assessment.result)}>
                          {assessment.result}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Assessment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="drive" className="text-right">Drive *</Label>
              <Select 
                value={formData.drive_id?.toString() || ""} 
                onValueChange={(val) => setFormData({...formData, drive_id: parseInt(val)})}
              >
                <SelectTrigger className="col-span-3" id="drive">
                  <SelectValue placeholder={isLoadingDrives ? "Loading drives..." : "Select a drive"} />
                </SelectTrigger>
                <SelectContent>
                  {drives.map((drive: any) => (
                    <SelectItem key={drive.id} value={drive.id.toString()}>
                      {drive.company_name} - {drive.job_role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name *</Label>
              <Input 
                id="name" 
                className="col-span-3" 
                placeholder="e.g. Technical Round 1"
                value={formData.assessment_name || ''}
                onChange={(e) => setFormData({...formData, assessment_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type *</Label>
              <Select 
                value={formData.assessment_type || ""} 
                onValueChange={(val) => setFormData({...formData, assessment_type: val})}
              >
                <SelectTrigger className="col-span-3" id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aptitude">Aptitude</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="technical_aptitude">Technical Aptitude</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="coding_mcq">Coding + MCQ</SelectItem>
                  <SelectItem value="group_discussion">Group Discussion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input 
                id="date" 
                type="date"
                className="col-span-3" 
                value={formData.date || ''}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty" className="text-right">Difficulty</Label>
              <Select 
                value={formData.difficulty || ""} 
                onValueChange={(val) => setFormData({...formData, difficulty: val})}
              >
                <SelectTrigger className="col-span-3" id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input 
                id="notes" 
                className="col-span-3" 
                placeholder="Any additional details..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
