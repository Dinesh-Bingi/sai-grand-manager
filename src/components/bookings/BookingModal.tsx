import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Camera, AirVent, Droplets, Loader2, Shield, CheckCircle2, AlertTriangle, UserCheck, Info } from 'lucide-react';
import { useCreateBooking } from '@/hooks/useBookings';
import { useGuestLookup } from '@/hooks/useGuestLookup';
import { toast } from 'sonner';
import { uploadIdProofImage, dataUrlToFile } from '@/lib/storage';
import type { Room, IdProofType } from '@/types/hotel';
import { format } from 'date-fns';

const guestSchema = z.object({
  full_name: z.string().min(2, 'Guest name is required').max(100, 'Name is too long'),
  phone: z.string().optional(),
  phone_number: z.string().optional(), // For database storage
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().optional(),
  is_primary: z.boolean(),
  id_proof_type: z.enum(['aadhaar', 'passport', 'driving_license', 'voter_id']).nullable(),
  id_proof_number: z.string().optional(),
  id_front_image: z.string().nullable(),
  id_back_image: z.string().nullable(),
  is_returning_guest: z.boolean().optional().default(false),
  id_verified: z.boolean().optional().default(false),
});

const bookingSchema = z.object({
  expected_checkout: z.string().min(1, 'Departure date is required'),
  has_ac: z.boolean(),
  has_geyser: z.boolean(),
  advance_paid: z.number().min(0, 'Advance amount cannot be negative'),
  notes: z.string().optional(),
  guests: z.array(guestSchema).min(1, 'Primary guest details are required'),
}).refine((data) => {
  const primaryGuest = data.guests.find(g => g.is_primary);
  if (!primaryGuest) return false;
  
  // If returning guest with verified ID, skip ID upload requirement
  if (primaryGuest.is_returning_guest && primaryGuest.id_verified) {
    return true;
  }
  
  // For new guests or unverified returning guests, ID is mandatory
  return !!(primaryGuest.id_front_image && primaryGuest.id_back_image && primaryGuest.id_proof_type);
}, {
  message: 'Government-issued identification (front and back) is required for guest registration',
  path: ['guests'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ room, open, onClose }: BookingModalProps) {
  const createBooking = useCreateBooking();
  const [totalAmount, setTotalAmount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [primaryPhoneNumber, setPrimaryPhoneNumber] = useState<string>('');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      expected_checkout: '',
      has_ac: false,
      has_geyser: false,
      advance_paid: 0,
      notes: '',
      guests: [
        {
          full_name: '',
          phone: '',
          phone_number: '',
          email: '',
          address: '',
          is_primary: true,
          id_proof_type: null,
          id_proof_number: '',
          id_front_image: null,
          id_back_image: null,
          is_returning_guest: false,
          id_verified: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'guests',
  });

  // Guest lookup hook
  const guestLookup = useGuestLookup(primaryPhoneNumber);

  const hasAc = form.watch('has_ac');
  const hasGeyser = form.watch('has_geyser');
  const primaryGuest = form.watch('guests.0');

  // Handle guest lookup result
  useEffect(() => {
    if (guestLookup.data && guestLookup.data.guest_exists) {
      const lookupData = guestLookup.data;
      
      // Auto-fill guest information
      form.setValue('guests.0.full_name', lookupData.full_name || '');
      form.setValue('guests.0.phone_number', lookupData.phone_number || '');
      form.setValue('guests.0.is_returning_guest', true);
      form.setValue('guests.0.id_verified', lookupData.id_verified || false);
      
      // If ID is verified, we don't need to upload again
      if (lookupData.id_verified) {
        form.setValue('guests.0.id_proof_type', lookupData.id_proof_type);
        // Note: We don't set the images, but mark as verified
      } else {
        // Returning guest but ID not verified - require upload
        form.setValue('guests.0.id_proof_type', null);
        form.setValue('guests.0.id_front_image', null);
        form.setValue('guests.0.id_back_image', null);
      }
    } else if (guestLookup.data && !guestLookup.data.guest_exists && primaryPhoneNumber.trim().length > 0) {
      // New guest - reset returning guest flags
      form.setValue('guests.0.is_returning_guest', false);
      form.setValue('guests.0.id_verified', false);
    }
  }, [guestLookup.data, primaryPhoneNumber, form]);

  // Calculate progress
  const getProgress = () => {
    let completed = 0;
    if (primaryGuest?.full_name) completed += 20;
    if (primaryGuest?.phone || primaryGuest?.phone_number) completed += 10;
    
    // ID requirements depend on returning guest status
    if (primaryGuest?.is_returning_guest && primaryGuest?.id_verified) {
      // Returning guest with verified ID - skip ID upload
      completed += 35; // ID type + images not needed
    } else {
      // New guest or unverified returning guest - require ID
      if (primaryGuest?.id_proof_type) completed += 15;
      if (primaryGuest?.id_front_image) completed += 10;
      if (primaryGuest?.id_back_image) completed += 10;
    }
    
    if (form.watch('expected_checkout')) completed += 15;
    return completed;
  };

  useEffect(() => {
    if (room) {
      const base = Number(room.base_price);
      const ac = hasAc ? Number(room.ac_charge) : 0;
      const geyser = hasGeyser ? Number(room.geyser_charge) : 0;
      setTotalAmount(base + ac + geyser);
    }
  }, [room, hasAc, hasGeyser]);

  const handleImageUpload = (guestIndex: number, field: 'id_front_image' | 'id_back_image') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File Size Exceeded', {
            description: 'Please upload an image smaller than 5MB',
          });
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          form.setValue(`guests.${guestIndex}.${field}`, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!room) return;

    setIsUploading(true);
    
    try {
      const tempBookingId = crypto.randomUUID();
      
      const processedGuests = await Promise.all(
        data.guests.map(async (guest, index) => {
          const guestId = crypto.randomUUID();
          let frontImagePath: string | null = null;
          let backImagePath: string | null = null;
          
          // For returning guests with verified ID, reuse existing images
          if (guest.is_returning_guest && guest.id_verified && guestLookup.data?.id_front_image) {
            frontImagePath = guestLookup.data.id_front_image;
            backImagePath = guestLookup.data.id_back_image;
          } else {
            // Upload new images for new guests or unverified returning guests
            if (guest.id_front_image && guest.id_front_image.startsWith('data:')) {
              try {
                const file = dataUrlToFile(guest.id_front_image, `id_front_${index}.jpg`);
                frontImagePath = await uploadIdProofImage(file, tempBookingId, guestId, 'front');
              } catch (error) {
                console.error('Error uploading front image:', error);
                frontImagePath = guest.id_front_image;
              }
            }
            
            if (guest.id_back_image && guest.id_back_image.startsWith('data:')) {
              try {
                const file = dataUrlToFile(guest.id_back_image, `id_back_${index}.jpg`);
                backImagePath = await uploadIdProofImage(file, tempBookingId, guestId, 'back');
              } catch (error) {
                console.error('Error uploading back image:', error);
                backImagePath = guest.id_back_image;
              }
            }
          }
          
          return {
            full_name: guest.full_name,
            phone: guest.phone || null,
            phone_number: guest.phone_number || guest.phone || null, // Use phone_number for database
            email: guest.email || null,
            address: guest.address || null,
            is_primary: guest.is_primary,
            id_proof_type: guest.id_proof_type as IdProofType | null,
            id_proof_number: guest.id_proof_number || null,
            id_front_image: frontImagePath,
            id_back_image: backImagePath,
          };
        })
      );

      await createBooking.mutateAsync({
        room_id: room.id,
        check_in: new Date().toISOString(),
        expected_checkout: new Date(data.expected_checkout).toISOString(),
        has_ac: data.has_ac,
        has_geyser: data.has_geyser,
        base_price: Number(room.base_price),
        ac_charge: data.has_ac ? Number(room.ac_charge) : 0,
        geyser_charge: data.has_geyser ? Number(room.geyser_charge) : 0,
        total_amount: totalAmount,
        advance_paid: data.advance_paid,
        notes: data.notes,
        guests: processedGuests,
      });

      toast.success('Booking Confirmed Successfully', {
        description: `Room ${room.room_number} has been assigned. Guest check-in complete.`,
      });
      
      form.reset();
      setCurrentStep(1);
      onClose();
    } catch (error) {
      toast.error('Booking Failed', {
        description: error instanceof Error ? error.message : 'Unable to complete booking. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!room) return null;

  const progress = getProgress();
  const canSubmit = progress >= 85;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif text-2xl">
                New Guest Registration
              </DialogTitle>
              <DialogDescription>
                Room {room.room_number} • {room.room_type.replace('_', ' ')} • Floor {room.floor}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              ₹{totalAmount}/night
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Registration Progress</span>
            <span className="font-medium">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Guest Registration Notice */}
            <Alert className="border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Guest Registration Requirement:</strong> As per statutory requirements, 
                valid government-issued identification (front and back) is required for all primary guests 
                to complete the registration process.
              </AlertDescription>
            </Alert>

            {/* Returning Guest Notice */}
            {primaryGuest?.is_returning_guest && primaryGuest?.id_verified && (
              <Alert className="border-success/20 bg-success/5">
                <UserCheck className="h-4 w-4 text-success" />
                <AlertDescription className="text-xs">
                  <strong>Returning Guest Detected:</strong> Government ID verified on previous stay. 
                  ID proof images will be reused from previous booking records.
                </AlertDescription>
              </Alert>
            )}

            {primaryGuest?.is_returning_guest && !primaryGuest?.id_verified && (
              <Alert className="border-warning/20 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-xs">
                  <strong>Returning Guest - ID Verification Required:</strong> This guest has stayed before, 
                  but ID proof needs to be uploaded for this booking.
                </AlertDescription>
              </Alert>
            )}

            {/* Pricing Summary */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Room Tariff</span>
                <span className="font-medium">₹{room.base_price}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <FormField
                  control={form.control}
                  name="has_ac"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 flex items-center gap-1 cursor-pointer">
                        <AirVent className="h-4 w-4" />
                        Air Conditioning (+₹{room.ac_charge})
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="has_geyser"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 flex items-center gap-1 cursor-pointer">
                        <Droplets className="h-4 w-4" />
                        Hot Water (+₹{room.geyser_charge})
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Per Night</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            {/* Expected Checkout */}
            <FormField
              control={form.control}
              name="expected_checkout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expected Departure Date & Time <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Advance Payment */}
            <FormField
              control={form.control}
              name="advance_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Advance Payment Received (₹) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter advance amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Guests Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Guest Registration</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      full_name: '',
                      phone: '',
                      email: '',
                      address: '',
                      is_primary: false,
                      id_proof_type: null,
                      id_proof_number: '',
                      id_front_image: null,
                      id_back_image: null,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Accompanying Guest
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {index === 0 ? 'Primary Guest' : `Accompanying Guest ${index}`}
                      </span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          IDENTIFICATION REQUIRED
                        </Badge>
                      )}
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`guests.${index}.full_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Full Name (as per ID) <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full legal name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`guests.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Mobile Number {index === 0 && <span className="text-destructive">*</span>}
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                placeholder="+91 XXXXX XXXXX" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (index === 0) {
                                    setPrimaryPhoneNumber(e.target.value);
                                    form.setValue('guests.0.phone_number', e.target.value);
                                  }
                                }}
                                onBlur={() => {
                                  if (index === 0 && field.value) {
                                    setPrimaryPhoneNumber(field.value);
                                  }
                                }}
                              />
                              {index === 0 && guestLookup.isLoading && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Checking guest records...
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {index === 0 && !(primaryGuest?.is_returning_guest && primaryGuest?.id_verified) && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`guests.${index}.id_proof_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Government ID Type <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                                disabled={primaryGuest?.is_returning_guest && primaryGuest?.id_verified}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ID document" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                  <SelectItem value="passport">Passport</SelectItem>
                                  <SelectItem value="driving_license">Driving License</SelectItem>
                                  <SelectItem value="voter_id">Voter ID Card</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`guests.${index}.id_proof_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID Document Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter ID number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {!(primaryGuest?.is_returning_guest && primaryGuest?.id_verified) && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <FormLabel>
                              ID Front Side <span className="text-destructive">*</span>
                            </FormLabel>
                            <div
                              className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50"
                              onClick={() => handleImageUpload(index, 'id_front_image')}
                            >
                            {form.watch(`guests.${index}.id_front_image`) ? (
                              <div className="relative h-full w-full">
                                <img
                                  src={form.watch(`guests.${index}.id_front_image`)!}
                                  alt="ID Front"
                                  className="h-full w-full rounded-lg object-cover"
                                />
                                <div className="absolute bottom-2 right-2">
                                  <Badge className="bg-success">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Captured
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-4">
                                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 block text-sm text-muted-foreground">
                                  Tap to Capture Front
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>
                            ID Back Side <span className="text-destructive">*</span>
                          </FormLabel>
                          <div
                            className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50"
                            onClick={() => handleImageUpload(index, 'id_back_image')}
                          >
                            {form.watch(`guests.${index}.id_back_image`) ? (
                              <div className="relative h-full w-full">
                                <img
                                  src={form.watch(`guests.${index}.id_back_image`)!}
                                  alt="ID Back"
                                  className="h-full w-full rounded-lg object-cover"
                                />
                                <div className="absolute bottom-2 right-2">
                                  <Badge className="bg-success">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Captured
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-4">
                                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 block text-sm text-muted-foreground">
                                  Tap to Capture Back
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      )}
                    </>
                  )}

                  {index === 0 && primaryGuest?.is_returning_guest && primaryGuest?.id_verified && (
                    <Alert className="border-success/20 bg-success/5">
                      <Info className="h-4 w-4 text-success" />
                      <AlertDescription className="text-xs">
                        ID proof verified from previous stay. No upload required.
                        {guestLookup.data?.last_stay_at && (
                          <span className="block mt-1">
                            Last stay: {format(new Date(guestLookup.data.last_stay_at), 'MMM d, yyyy')}
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name={`guests.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter complete residential address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {form.formState.errors.guests?.root && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {form.formState.errors.guests.root.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests, preferences, or notes for this booking..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel Registration
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createBooking.isPending || isUploading || !canSubmit}
              >
                {(createBooking.isPending || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploading ? 'Uploading Documents...' : 'Confirm Booking & Check-In'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
