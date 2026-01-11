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
import { Shield, Download, FileText, Archive, Calendar, Check, AlertTriangle, Loader2, Scale, Users } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { generatePoliceReportPDF, generateDetailedPDF, generateExcelCSV } from '@/lib/pdfExport';

interface GuestRecord {
  bookingId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  phone: string;
  idType: string;
  idNumber: string;
  address?: string;
  idFrontImage?: string;
  idBackImage?: string;
  hasIdFront: boolean;
  hasIdBack: boolean;
  additionalGuests: number;
}

export default function PoliceExport() {
  const { data: bookings } = useBookings();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeIdImages, setIncludeIdImages] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Filter bookings by date range
  const filteredBookings = bookings?.filter(booking => {
    const checkIn = parseISO(booking.check_in);
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    return isWithinInterval(checkIn, { start, end });
  }) || [];

  // Get all primary guests from filtered bookings
  const guestRecords: GuestRecord[] = filteredBookings.flatMap(booking => {
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
      address: primaryGuest.address || undefined,
      idFrontImage: primaryGuest.id_front_image || undefined,
      idBackImage: primaryGuest.id_back_image || undefined,
      hasIdFront: !!primaryGuest.id_front_image,
      hasIdBack: !!primaryGuest.id_back_image,
      additionalGuests: (booking.guests?.length || 1) - 1,
    }];
  });

  const selectedRecords = guestRecords.filter(r => selectedBookings.includes(r.bookingId));
  const completeRecords = guestRecords.filter(r => r.hasIdFront && r.hasIdBack).length;

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

  const handleExportPDF = async () => {
    if (selectedBookings.length === 0) {
      toast.error('No Records Selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    setIsExporting('pdf');
    try {
      await generatePoliceReportPDF(selectedRecords, startDate, endDate);
      toast.success('Report Generated Successfully', {
        description: `Exported ${selectedRecords.length} guest record${selectedRecords.length !== 1 ? 's' : ''} for police verification.`,
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Unable to generate PDF report',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportDetailedPDF = async () => {
    if (selectedBookings.length === 0) {
      toast.error('No Records Selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    setIsExporting('detailed');
    try {
      await generateDetailedPDF(selectedRecords, startDate, endDate, includeIdImages);
      toast.success('Detailed Report Generated', {
        description: `Exported ${selectedRecords.length} comprehensive guest record${selectedRecords.length !== 1 ? 's' : ''}.`,
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Unable to generate detailed report',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = () => {
    if (selectedBookings.length === 0) {
      toast.error('No Records Selected', {
        description: 'Please select at least one guest record to export.',
      });
      return;
    }

    setIsExporting('excel');
    try {
      generateExcelCSV(selectedRecords);
      toast.success('Spreadsheet Generated', {
        description: `Exported ${selectedRecords.length} guest record${selectedRecords.length !== 1 ? 's' : ''} to Excel format.`,
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Unable to generate spreadsheet',
      });
    } finally {
      setIsExporting(null);
    }
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
            <p className="text-muted-foreground mt-1">
              Statutory compliance documentation for law enforcement
            </p>
          </div>
        </div>

        {/* Legal Compliance Notice */}
        <Alert className="border-l-4 border-l-warning bg-warning/5">
          <Scale className="h-5 w-5 text-warning" />
          <AlertTitle className="font-semibold">Statutory Compliance Notice</AlertTitle>
          <AlertDescription className="mt-2">
            As per the <strong>Registration of Foreigners Act, 1939</strong> and state police regulations, 
            all lodging establishments must maintain and submit guest records including government-issued 
            ID proof for verification. Non-compliance may result in penalties.
          </AlertDescription>
        </Alert>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{guestRecords.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete ID Records</p>
                <p className="text-2xl font-bold text-success">{completeRecords}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-info">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
                <Download className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected for Export</p>
                <p className="text-2xl font-bold text-info">{selectedBookings.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Report Period Selection
            </CardTitle>
            <CardDescription>
              Specify the date range for guest records to include in the report
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-medium">From Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-medium">To Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Checkbox
                  id="includeIdImages"
                  checked={includeIdImages}
                  onCheckedChange={(checked) => setIncludeIdImages(checked as boolean)}
                />
                <Label htmlFor="includeIdImages" className="cursor-pointer text-sm">
                  Include ID proof images in detailed report
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Records */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Guest Records for Export
                </CardTitle>
                <CardDescription>
                  {guestRecords.length} guest{guestRecords.length !== 1 ? 's' : ''} found for the selected period
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedBookings.length === guestRecords.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {guestRecords.length === 0 ? (
              <div className="py-16 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">No Guest Records Found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  No check-ins recorded for the selected date range
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBookings.length === guestRecords.length && guestRecords.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Room</TableHead>
                      <TableHead className="font-semibold">Guest Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">ID Type</TableHead>
                      <TableHead className="font-semibold">ID Number</TableHead>
                      <TableHead className="font-semibold">Check-in</TableHead>
                      <TableHead className="font-semibold">Check-out</TableHead>
                      <TableHead className="font-semibold">ID Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guestRecords.map((record) => (
                      <TableRow key={record.bookingId} className="hover:bg-muted/30">
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.includes(record.bookingId)}
                            onCheckedChange={() => handleToggleBooking(record.bookingId)}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-primary">{record.roomNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.guestName}</p>
                            {record.additionalGuests > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{record.additionalGuests} accompanying guest{record.additionalGuests !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{record.phone}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">{record.idType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.idNumber}</TableCell>
                        <TableCell>
                          <span className="text-sm">{format(parseISO(record.checkIn), 'dd MMM, h:mm a')}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{format(parseISO(record.checkOut), 'dd MMM, h:mm a')}</span>
                        </TableCell>
                        <TableCell>
                          {record.hasIdFront && record.hasIdBack ? (
                            <Badge className="bg-success hover:bg-success/90 font-medium">
                              <Check className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="font-medium">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Incomplete
                            </Badge>
                          )}
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
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Options
            </CardTitle>
            <CardDescription>
              {selectedBookings.length} record{selectedBookings.length !== 1 ? 's' : ''} selected for export
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                size="lg"
                className="h-auto flex-col gap-3 py-8"
                onClick={handleExportPDF}
                disabled={selectedBookings.length === 0 || isExporting !== null}
              >
                {isExporting === 'pdf' ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <FileText className="h-8 w-8" />
                )}
                <div className="text-center">
                  <p className="font-semibold">Standard Report (PDF)</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    Summary guest list for police station
                  </p>
                </div>
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-auto flex-col gap-3 py-8"
                onClick={handleExportExcel}
                disabled={selectedBookings.length === 0 || isExporting !== null}
              >
                {isExporting === 'excel' ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <FileText className="h-8 w-8" />
                )}
                <div className="text-center">
                  <p className="font-semibold">Excel Spreadsheet</p>
                  <p className="text-xs text-secondary-foreground/70 mt-1">
                    CSV format for digital records
                  </p>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-auto flex-col gap-3 py-8"
                onClick={handleExportDetailedPDF}
                disabled={selectedBookings.length === 0 || isExporting !== null}
              >
                {isExporting === 'detailed' ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Archive className="h-8 w-8" />
                )}
                <div className="text-center">
                  <p className="font-semibold">Detailed Report</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete records with ID images
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
