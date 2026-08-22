import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CheckCircle, Trophy, IndianRupee, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const formatLakhs = (value: number | null) => {
  if (value === null || value === undefined) return 'N/A';
  return `₹${(value / 100000).toFixed(2)}L`;
};

export default function AnalyticsPage() {
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.dashboard(),
  });

  const { data: funnel, isLoading: isFunnelLoading } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: () => analyticsService.funnel(),
  });

  const { data: compensation, isLoading: isCompensationLoading } = useQuery({
    queryKey: ['analytics', 'compensation'],
    queryFn: () => analyticsService.compensation(),
  });

  if (isDashboardLoading || isFunnelLoading || isCompensationLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const funnelSteps = funnel
    ? [
        { label: 'Registered', value: funnel.applications, pct: 100 },
        { label: 'OA Done', value: funnel.ppt, pct: funnel.ppt_pct },
        { label: 'Shortlisted', value: funnel.assessment, pct: funnel.assessment_pct },
        { label: 'Interview Done', value: funnel.interview, pct: funnel.interview_pct },
        { label: 'Selected', value: funnel.offer, pct: funnel.offer_pct },
      ]
    : [];

  const maxFunnelValue = funnel?.applications || 1;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

      {/* Section 1: Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.total_applications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
            <CheckCircle className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.shortlisted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selected</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.offers_received || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest CTC</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLakhs(dashboard?.highest_ctc || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average CTC</CardTitle>
            <IndianRupee className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLakhs(dashboard?.average_ctc || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Placement Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Placement Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 mt-4">
            {funnelSteps.map((step, index) => {
              const widthPct = (step.value / maxFunnelValue) * 100;
              return (
                <div key={index} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{step.label}</span>
                    <span className="text-muted-foreground">
                      {step.value} ({step.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-8 bg-muted rounded-md overflow-hidden flex items-center relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                      className="h-full bg-primary/80 absolute left-0 top-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Compensation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compensation Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Highest CTC</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatLakhs(compensation?.highest_ctc || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average CTC</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {formatLakhs(compensation?.average_ctc || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Stipend</p>
                <p className="text-xl font-medium">
                  {compensation?.average_stipend ? `₹${compensation.average_stipend.toLocaleString()}/mo` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company-wise CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-md">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-md">Company</th>
                    <th className="px-4 py-3 font-medium text-right">CTC</th>
                    <th className="px-4 py-3 font-medium text-right rounded-r-md">Stipend</th>
                  </tr>
                </thead>
                <tbody>
                  {compensation?.company_ctc_list
                    ?.sort((a, b) => (b.ctc || 0) - (a.ctc || 0))
                    .map((comp, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{comp.company_name}</td>
                        <td className="px-4 py-3 text-right">{formatLakhs(comp.ctc)}</td>
                        <td className="px-4 py-3 text-right">
                          {comp.stipend ? (
                            <Badge variant="outline">₹{comp.stipend.toLocaleString()}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {(!compensation?.company_ctc_list || compensation.company_ctc_list.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        No compensation data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
