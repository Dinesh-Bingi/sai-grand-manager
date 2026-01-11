import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { FileDown, FileSpreadsheet, Printer, Calendar } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

export default function Reports() {
  const { data: bookings } = useBookings();
  const { data: rooms } = useRooms();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));

  // Filter bookings for selected month
  const monthlyBookings = bookings?.filter(booking => {
    const checkIn = parseISO(booking.check_in);
    return isWithinInterval(checkIn, { start: monthStart, end: monthEnd });
  }) || [];

  // Calculate totals
  const totalRevenue = monthlyBookings.reduce((acc, b) => acc + Number(b.total_amount), 0);
  const acRevenue = monthlyBookings.filter(b => b.has_ac).reduce((acc, b) => acc + Number(b.ac_charge), 0);
  const geyserRevenue = monthlyBookings.filter(b => b.has_geyser).reduce((acc, b) => acc + Number(b.geyser_charge), 0);
  const baseRevenue = monthlyBookings.reduce((acc, b) => acc + Number(b.base_price), 0);

  // Daily revenue data
  const dailyData = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(day => {
    const dayBookings = monthlyBookings.filter(b => 
      format(parseISO(b.check_in), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    return {
      date: format(day, 'MMM d'),
      revenue: dayBookings.reduce((acc, b) => acc + Number(b.total_amount), 0),
      bookings: dayBookings.length,
    };
  });

  // Room type revenue
  const roomTypeRevenue = [
    { 
      name: 'Standard', 
      value: monthlyBookings.filter(b => 
        rooms?.find(r => r.id === b.room_id)?.room_type === 'standard'
      ).reduce((acc, b) => acc + Number(b.total_amount), 0),
      color: 'hsl(220, 60%, 25%)',
    },
    { 
      name: 'Luxury', 
      value: monthlyBookings.filter(b => 
        rooms?.find(r => r.id === b.room_id)?.room_type === 'luxury'
      ).reduce((acc, b) => acc + Number(b.total_amount), 0),
      color: 'hsl(38, 70%, 55%)',
    },
    { 
      name: 'Penthouse', 
      value: monthlyBookings.filter(b => 
        rooms?.find(r => r.id === b.room_id)?.room_type === 'penthouse'
      ).reduce((acc, b) => acc + Number(b.total_amount), 0),
      color: 'hsl(142, 60%, 40%)',
    },
    { 
      name: 'Function Hall', 
      value: monthlyBookings.filter(b => 
        rooms?.find(r => r.id === b.room_id)?.room_type === 'function_hall'
      ).reduce((acc, b) => acc + Number(b.total_amount), 0),
      color: 'hsl(200, 80%, 50%)',
    },
  ].filter(item => item.value > 0);

  // Floor-wise revenue
  const floorRevenue = [1, 2, 3, 4, 5].map(floor => ({
    floor: floor === 5 ? 'Penthouse' : `Floor ${floor}`,
    revenue: monthlyBookings.filter(b => 
      rooms?.find(r => r.id === b.room_id)?.floor === floor
    ).reduce((acc, b) => acc + Number(b.total_amount), 0),
  }));

  // AC vs Non-AC breakdown
  const acBreakdown = [
    { name: 'AC Rooms', value: monthlyBookings.filter(b => b.has_ac).length, color: 'hsl(200, 80%, 50%)' },
    { name: 'Non-AC Rooms', value: monthlyBookings.filter(b => !b.has_ac).length, color: 'hsl(220, 10%, 50%)' },
  ].filter(item => item.value > 0);

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Financial analytics and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = format(date, 'yyyy-MM');
                  return (
                    <SelectItem key={value} value={value}>
                      {format(date, 'MMMM yyyy')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {monthlyBookings.length} bookings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Base Room Revenue</p>
              <p className="text-3xl font-bold">₹{baseRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">AC Charges</p>
              <p className="text-3xl font-bold">₹{acRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Geyser Charges</p>
              <p className="text-3xl font-bold">₹{geyserRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily Revenue</TabsTrigger>
            <TabsTrigger value="roomtype">By Room Type</TabsTrigger>
            <TabsTrigger value="floor">By Floor</TabsTrigger>
            <TabsTrigger value="ac">AC Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roomtype">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Room Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={roomTypeRevenue}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {roomTypeRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="floor">
            <Card>
              <CardHeader>
                <CardTitle>Floor-wise Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={floorRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="floor"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--secondary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ac">
            <Card>
              <CardHeader>
                <CardTitle>AC vs Non-AC Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={acBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={150}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {acBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
