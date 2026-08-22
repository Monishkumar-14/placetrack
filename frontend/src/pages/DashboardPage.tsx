import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isAfter, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Building2, Briefcase, FileText, Users, 
  CheckCircle2, XCircle, Award, TrendingUp, TrendingDown, Layers
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { eventService } from '@/services/events';
import { placementService } from '@/services/placements';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, loading }: { title: string, value: string | number, icon: any, loading: boolean }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

const formatCTC = (val: number | string | undefined) => {
  if (!val) return '₹0.0L';
  const num = Number(val);
  if (isNaN(num)) return '₹0.0L';
  return `₹${(num / 100000).toFixed(1)}L`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsService.dashboard(),
  });

  const { data: upcomingEvents, isLoading: isEventsLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => eventService.upcoming(),
  });

  const { data: placements, isLoading: isPlacementsLoading } = useQuery({
    queryKey: ['placements-for-events'],
    queryFn: () => placementService.list(),
  });

  const { data: funnelData, isLoading: isFunnelLoading } = useQuery({
    queryKey: ['placement-funnel'],
    queryFn: () => analyticsService.funnel(),
  });

  const stats = dashboardData || {};
  const funnel = funnelData || {};

  const mergedEvents = React.useMemo(() => {
    const allEvents: any[] = [];
    const now = new Date();

    if (upcomingEvents) {
      upcomingEvents.forEach((ev: any) => {
        if (ev.date) {
          const d = new Date(ev.date);
          if (d.toString() !== 'Invalid Date' && isAfter(d, now)) {
            allEvents.push({
              title: ev.title || ev.event_type || 'Event',
              date: d,
              venue: ev.venue_name || ev.venue_mode || 'TBA',
            });
          }
        }
      });
    }

    if (placements) {
      placements.forEach((p: any) => {
        const cName = p.company_name || 'Company';
        
        const addIfFuture = (dateStr: string | null | undefined, type: string) => {
          if (!dateStr) return;
          let dStr = dateStr.trim();
          if (dStr.includes(' ')) {
            dStr = dStr.replace(' ', 'T');
          }
          const d = new Date(dStr);
          if (d.toString() !== 'Invalid Date' && isAfter(d, now)) {
            allEvents.push({
              title: `${cName} - ${type}`,
              date: d,
              venue: 'TBA',
            });
          }
        };

        addIfFuture(p.ppt_date, 'PPT');
        addIfFuture(p.test_date, 'Test');
        addIfFuture(p.interview_date, 'Interview');
      });
    }

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [upcomingEvents, placements]);

  const isAnyEventsLoading = isEventsLoading || isPlacementsLoading;

  const totalApplications = funnel.applications || 1; // Prevent division by zero

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's what's happening today, {format(today, 'EEEE, MMMM do yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/placements/add')}>Add Placement</Button>
          <Button variant="outline" onClick={() => navigate('/calendar')}>View Calendar</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Companies" value={stats.total_companies || 0} icon={Building2} loading={isDashboardLoading} />
        <StatCard title="Active Drives" value={stats.active_drives || 0} icon={Briefcase} loading={isDashboardLoading} />
        <StatCard title="Upcoming Tests" value={stats.upcoming_tests || 0} icon={FileText} loading={isDashboardLoading} />
        <StatCard title="Upcoming Interviews" value={stats.upcoming_interviews || 0} icon={Users} loading={isDashboardLoading} />
        <StatCard title="Total Applications" value={stats.total_applications || 0} icon={Layers} loading={isDashboardLoading} />
        <StatCard title="Shortlisted" value={stats.shortlisted || 0} icon={CheckCircle2} loading={isDashboardLoading} />
        <StatCard title="Rejected" value={stats.rejected || 0} icon={XCircle} loading={isDashboardLoading} />
        <StatCard title="Offers Received" value={stats.offers_received || 0} icon={Award} loading={isDashboardLoading} />
        <StatCard title="Highest CTC" value={formatCTC(stats.highest_ctc)} icon={TrendingUp} loading={isDashboardLoading} />
        <StatCard title="Average CTC" value={formatCTC(stats.average_ctc)} icon={TrendingDown} loading={isDashboardLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnyEventsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : mergedEvents.length > 0 ? (
              <div className="space-y-4">
                {mergedEvents.map((event: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{format(event.date, 'PP p')} • {event.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isFunnelLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Registered</span>
                    <span className="text-sm font-medium">{funnel.applications || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">PPT / OA Done</span>
                    <span className="text-sm font-medium">{funnel.ppt || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${((funnel.ppt || 0)/totalApplications)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Shortlisted</span>
                    <span className="text-sm font-medium">{funnel.assessment || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${((funnel.assessment || 0)/totalApplications)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Interview Done</span>
                    <span className="text-sm font-medium">{funnel.interview || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((funnel.interview || 0)/totalApplications)*100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Selected</span>
                    <span className="text-sm font-medium">{funnel.offer || 0}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((funnel.offer || 0)/totalApplications)*100}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
