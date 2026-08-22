import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Building2, Globe, ArrowLeft, Plus } from 'lucide-react';
import { companyService } from '@/services/companies';
import { driveService } from '@/services/drives';
import { eventService } from '@/services/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'drives' | 'timeline'>('overview');

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.get(id as string),
    enabled: !!id,
  });

  const { data: drivesData, isLoading: isDrivesLoading } = useQuery({
    queryKey: ['drives', { company_id: id }],
    queryFn: () => driveService.list({ company_id: id }),
    enabled: !!id,
  });

  const company = companyData;
  const drives = drivesData || [];

  if (isCompanyLoading) {
    return <div className="space-y-4"><Skeleton className="h-40 w-full" /></div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/companies')} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
      </Button>

      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {company.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" />
                <span>{company.industry}</span>
                {company.website && (
                  <>
                    <span>•</span>
                    <Globe className="h-4 w-4" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{company.priority} Priority</Badge>
            <Badge>{company.status}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex border-b">
        {['overview', 'drives', 'timeline'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 border-b-2 font-medium capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{company.description || 'No description provided.'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Industry</span><span>{company.industry}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-medium">Status</span><span>{company.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'drives' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Placement Drives</CardTitle>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Drive</Button>
          </CardHeader>
          <CardContent>
            {isDrivesLoading ? <Skeleton className="h-32 w-full" /> : drives.length > 0 ? (
              <div className="space-y-4">
                {drives.map((drive: any) => (
                  <div key={drive.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{drive.job_role}</h4>
                      <p className="text-sm text-muted-foreground">{drive.drive_type} • App Date: {format(new Date(drive.application_date), 'PP')}</p>
                    </div>
                    <Badge>{drive.overall_status}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-muted-foreground py-4">No drives found for this company.</p>}
          </CardContent>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <CardHeader><CardTitle>Event Timeline</CardTitle></CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">Timeline data will go here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
