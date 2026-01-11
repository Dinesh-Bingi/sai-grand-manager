import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Download, FileText, Archive, Calendar, Check, AlertTriangle } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export default function PoliceExport() {
  const { data: bookings } = useBookings();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeIdImages, setIncludeIdImages] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Filter bookings by date range
  const filteredBookings = bookings?.filter(booking => {
    const checkIn = parseISO(booking.check_in);
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    return isWithinInterval(checkIn, { start, end });
  }) || [];

  // Get all primary guests from filtered bookings
  const guestRecords = filteredBookings.flatMap(booking => {
    const primaryGuest = booking.guests?.find(g => g.is_primary);
    if (!primaryGuest) return [];
    return [{
      bookingId: booking.id,
      roomNumber: booking.room?.room_number || 'N/A',
      checkIn: booking.check_in,
      checkOut: booking.check_out || booking.expected_checkout,
      guestName: primaryGuest.full_name,
      phone: primaryGuest.phone || 'N/A',
      idType: primaryGuest.id_proof_type?.replace('_', ' ').toUpperCase() || 'N/A',
      idNumber: primaryGuest.id_proof_number || 'N/A',
      hasIdFront: !!primaryGuest.id_front_image,
      hasIdBack: !!primaryGuest.id_back_image,
      additionalGuests: (booking.guests?.length || 1) - 1,
    }];
  });

  const handleSelectAll = () => {
    if (selectedBookings.length === guestRecords.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(guestRecords.map(g => g.bookingId));
    }
  };

  const handleToggleBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleExportPDF = () => {
    if (selectedBookings.length === 0) {
      toast.error('No records selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    // TODO: Implement actual PDF generation
    toast.success('PDF Export Started', {
      description: `Exporting ${selectedBookings.length} guest records...`,
    });
  };

  const handleExportExcel = () => {
    if (selectedBookings.length === 0) {
      toast.error('No records selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    // TODO: Implement actual Excel generation
    toast.success('Excel Export Started', {
      description: `Exporting ${selectedBookings.length} guest records...`,
    });
  };

  const handleExportIdImages = () => {
    if (selectedBookings.length === 0) {
      toast.error('No records selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    // TODO: Implement actual ZIP creation with ID images
    toast.success('ID Images Export Started', {
      description: `Creating encrypted ZIP with ${selectedBookings.length * 2} images...`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Police Verification Export
            </h1>
            <p className="text-muted-foreground">
              One-click export for police verification compliance
            </p>
          </div>
        </div>

        {/* Legal Compliance Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Legal Compliance</AlertTitle>
          <AlertDescription>
            As per government regulations, all guest information including ID proof must be 
            submitted to local police for verification. This tool helps you generate the 
            required documentation quickly and securely.
          </AlertDescription>
        </Alert>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date Range
            </CardTitle>
            <CardDescription>
              Choose the date range for guest records to export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeIdImages"
                  checked={includeIdImages}
                  onCheckedChange={(checked) => setIncludeIdImages(checked as boolean)}
                />
                <Label htmlFor="includeIdImages" className="cursor-pointer">
                  Include ID proof images
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Guest Records</CardTitle>
                <CardDescription>
                  {guestRecords.length} guests found in selected date range
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedBookings.length === guestRecords.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {guestRecords.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p>No guest records found for the selected date range</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBookings.length === guestRecords.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>ID Proof</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guestRecords.map((record) => (
                      <TableRow key={record.bookingId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.includes(record.bookingId)}
                            onCheckedChange={() => handleToggleBooking(record.bookingId)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{record.roomNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.guestName}</p>
                            {record.additionalGuests > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{record.additionalGuests} additional
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{record.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{record.idType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.idNumber}</TableCell>
                        <TableCell>{format(parseISO(record.checkIn), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>{format(parseISO(record.checkOut), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {record.hasIdFront && record.hasIdBack ? (
                              <Badge variant="default" className="bg-success">
                                <Check className="mr-1 h-3 w-3" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Missing
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Options
            </CardTitle>
            <CardDescription>
              {selectedBookings.length} records selected for export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                size="lg"
                className="h-auto flex-col gap-2 py-6"
                onClick={handleExportPDF}
                disabled={selectedBookings.length === 0}
              >
                <FileText className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-semibold">Export as PDF</p>
                  <p className="text-xs text-primary-foreground/70">
                    Guest list with all details
                  </p>
                </div>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-auto flex-col gap-2 py-6"
                onClick={handleExportExcel}
                disabled={selectedBookings.length === 0}
              >
                <FileText className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-semibold">Export as Excel</p>
                  <p className="text-xs text-secondary-foreground/70">
                    Spreadsheet format
                  </p>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-2 py-6"
                onClick={handleExportIdImages}
                disabled={selectedBookings.length === 0 || !includeIdImages}
              >
                <Archive className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-semibold">Export ID Images</p>
                  <p className="text-xs text-muted-foreground">
                    Encrypted ZIP archive
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
