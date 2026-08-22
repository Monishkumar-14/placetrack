import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export default function NotesPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Preparation Notes</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Note</Button>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        <Card className="w-1/3 h-full overflow-y-auto">
          <CardContent className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <h4 className="font-semibold text-sm">Amazon SDE Prep</h4>
                <p className="text-xs text-muted-foreground mt-1">Data structures, System Design</p>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="w-2/3 h-full overflow-y-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <FileText className="h-12 w-12 text-muted" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Select a note</h2>
                <p>Choose a note from the sidebar or create a new one.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
