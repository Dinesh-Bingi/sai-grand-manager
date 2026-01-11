import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings } from '@/hooks/useBookings';
import { useRooms } from '@/hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { FileDown, FileSpreadsheet, Printer, Calendar, TrendingUp, IndianRupee, Building2, AirVent } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

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
  const averageBookingValue = monthlyBookings.length > 0 ? totalRevenue / monthlyBookings.length : 0;

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
    floor: floor === 5 ? 'Penthouse Level' : `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`,
    revenue: monthlyBookings.filter(b => 
      rooms?.find(r => r.id === b.room_id)?.floor === floor
    ).reduce((acc, b) => acc + Number(b.total_amount), 0),
  }));

  // AC vs Non-AC breakdown
  const acBreakdown = [
    { name: 'Air-Conditioned', value: monthlyBookings.filter(b => b.has_ac).length, color: 'hsl(200, 80%, 50%)' },
    { name: 'Non Air-Conditioned', value: monthlyBookings.filter(b => !b.has_ac).length, color: 'hsl(220, 10%, 50%)' },
  ].filter(item => item.value > 0);

  const handleExportPDF = () => {
    toast.info('Generating Report', {
      description: 'Your PDF report is being prepared...',
    });
  };

  const handleExportExcel = () => {
    toast.info('Generating Spreadsheet', {
      description: 'Your Excel report is being prepared...',
    });
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
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Revenue Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive financial insights and performance metrics
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
            <Button variant="outline" size="icon" onClick={handleExportPDF} title="Export PDF">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportExcel} title="Export Excel">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint} title="Print Report">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="md:col-span-2 border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              </div>
              <p className="text-4xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {monthlyBookings.length} reservation{monthlyBookings.length !== 1 ? 's' : ''} • ₹{Math.round(averageBookingValue).toLocaleString('en-IN')} avg
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Room Charges</p>
              <p className="text-2xl font-bold mt-1">₹{baseRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">Base tariff collection</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">AC Charges</p>
              <p className="text-2xl font-bold mt-1">₹{acRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">Air conditioning fees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Geyser Charges</p>
              <p className="text-2xl font-bold mt-1">₹{geyserRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">Hot water facility fees</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="daily" className="data-[state=active]:bg-background">Daily Trend</TabsTrigger>
            <TabsTrigger value="roomtype" className="data-[state=active]:bg-background">By Category</TabsTrigger>
            <TabsTrigger value="floor" className="data-[state=active]:bg-background">By Floor</TabsTrigger>
            <TabsTrigger value="ac" className="data-[state=active]:bg-background">AC Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Daily Revenue Performance
                </CardTitle>
                <CardDescription>
                  Day-by-day revenue collection for {format(monthStart, 'MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
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
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Revenue by Room Category
                </CardTitle>
                <CardDescription>
                  Revenue distribution across different accommodation types
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
                      formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="floor">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Revenue by Floor Level
                </CardTitle>
                <CardDescription>
                  Comparative performance across different floors
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={floorRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="floor"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
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
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <AirVent className="h-5 w-5 text-primary" />
                  Air-Conditioning Analysis
                </CardTitle>
                <CardDescription>
                  Distribution of AC versus non-AC room bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
