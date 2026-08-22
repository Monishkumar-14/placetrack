import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isValid,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { eventService } from '@/services/events';
import { placementService } from '@/services/placements';

// Types
type UnifiedEvent = {
  id: string;
  date: Date;
  label: string;
  type: 'ppt' | 'test' | 'interview' | 'event';
  details: string;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.list(),
  });

  const { data: placements = [] } = useQuery({
    queryKey: ['placements'],
    queryFn: () => placementService.list(),
  });

  const unifiedEvents = useMemo(() => {
    const allEvents: UnifiedEvent[] = [];

    // Parse normal events
    events.forEach(event => {
      let d = new Date(event.date);
      if (!isValid(d)) d = parseISO(event.date);
      
      if (isValid(d)) {
        allEvents.push({
          id: `event-${event.id}`,
          date: d,
          label: event.company_name ? `${event.company_name} - ${event.title}` : event.title,
          type: 'event',
          details: `Type: ${event.event_type}${event.start_time ? `, Start Time: ${event.start_time}` : ''}`
        });
      }
    });

    // Parse placement events
    placements.forEach(placement => {
      const { company_name, ppt_date, test_date, interview_date } = placement;

      if (ppt_date) {
        let d = new Date(ppt_date);
        if (!isValid(d)) d = parseISO(ppt_date);
        if (isValid(d)) {
          allEvents.push({
            id: `ppt-${placement.id}`,
            date: d,
            label: `${company_name} - PPT`,
            type: 'ppt',
            details: `Job Role: ${placement.job_role}`
          });
        }
      }

      if (test_date) {
        let d = new Date(test_date);
        if (!isValid(d)) d = parseISO(test_date);
        if (isValid(d)) {
          allEvents.push({
            id: `test-${placement.id}`,
            date: d,
            label: `${company_name} - Test/OA`,
            type: 'test',
            details: `Job Role: ${placement.job_role}`
          });
        }
      }

      if (interview_date) {
        let d = new Date(interview_date);
        if (!isValid(d)) d = parseISO(interview_date);
        if (isValid(d)) {
          allEvents.push({
            id: `interview-${placement.id}`,
            date: d,
            label: `${company_name} - Interview`,
            type: 'interview',
            details: `Job Role: ${placement.job_role}`
          });
        }
      }
    });

    return allEvents;
  }, [events, placements]);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Calculate padding days to start on Sunday
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);
  
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'ppt':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'test':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'interview':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getEventsForDay = (day: Date) => {
    return unifiedEvents.filter(e => isSameDay(e.date, day));
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  
  const today = new Date();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Schedule Calendar</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-background py-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {paddingDays.map((pad) => (
              <div key={`pad-${pad}`} className="bg-muted/50 min-h-[100px] p-2" />
            ))}

            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    bg-background min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-muted/50 border-t border-l
                    ${!isCurrentMonth ? 'opacity-50' : ''}
                    ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`
                      text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate ${getBadgeColor(event.type)}`}
                        title={event.label}
                      >
                        {event.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Events for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length === 0 ? (
              <p className="text-muted-foreground">No events scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{event.label}</h4>
                        <Badge variant="outline" className={getBadgeColor(event.type)}>
                          {event.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
