import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Phone, Plus } from 'lucide-react';

export default function WaitingList() {
  // Mock waiting list data - in production this would come from the database
  const waitingList: any[] = [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Waiting List
            </h1>
            <p className="text-muted-foreground">
              Manage guests waiting for room availability
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add to Waiting List
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold">{waitingList.filter(w => w.status === 'waiting').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Phone className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contacted</p>
                <p className="text-2xl font-bold">{waitingList.filter(w => w.status === 'contacted').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accommodated</p>
                <p className="text-2xl font-bold">{waitingList.filter(w => w.status === 'accommodated').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waiting List Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Waiting List</CardTitle>
            <CardDescription>
              Guests waiting for room availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            {waitingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No guests on waiting list</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Guests will appear here when all rooms are occupied
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Preferred Room</TableHead>
                    <TableHead>AC Required</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingList.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.guest_name}</TableCell>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {entry.preferred_room_type?.replace('_', ' ') || 'Any'}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.has_ac ? 'Yes' : 'No'}</TableCell>
                      <TableCell>2 hours</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entry.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
