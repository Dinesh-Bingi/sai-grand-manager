import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Camera, AirVent, Droplets, Loader2 } from 'lucide-react';
import { useCreateBooking } from '@/hooks/useBookings';
import { toast } from 'sonner';
import { uploadIdProofImage, dataUrlToFile } from '@/lib/storage';
import type { Room, IdProofType } from '@/types/hotel';

const guestSchema = z.object({
  full_name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  is_primary: z.boolean(),
  id_proof_type: z.enum(['aadhaar', 'passport', 'driving_license', 'voter_id']).nullable(),
  id_proof_number: z.string().optional(),
  id_front_image: z.string().nullable(),
  id_back_image: z.string().nullable(),
});

const bookingSchema = z.object({
  expected_checkout: z.string().min(1, 'Checkout date is required'),
  has_ac: z.boolean(),
  has_geyser: z.boolean(),
  advance_paid: z.number().min(0),
  notes: z.string().optional(),
  guests: z.array(guestSchema).min(1, 'At least one guest is required'),
}).refine((data) => {
  const primaryGuest = data.guests.find(g => g.is_primary);
  if (!primaryGuest) return false;
  return primaryGuest.id_front_image && primaryGuest.id_back_image;
}, {
  message: 'Primary guest must have both front and back ID proof images',
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
          email: '',
          address: '',
          is_primary: true,
          id_proof_type: null,
          id_proof_number: '',
          id_front_image: null,
          id_back_image: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'guests',
  });

  const hasAc = form.watch('has_ac');
  const hasGeyser = form.watch('has_geyser');

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
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File too large', {
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
      // Generate a temporary booking ID for file uploads
      const tempBookingId = crypto.randomUUID();
      
      // Process guests and upload images to storage
      const processedGuests = await Promise.all(
        data.guests.map(async (guest, index) => {
          const guestId = crypto.randomUUID();
          let frontImagePath: string | null = null;
          let backImagePath: string | null = null;
          
          // Upload front image if exists (only for primary guest)
          if (guest.id_front_image && guest.id_front_image.startsWith('data:')) {
            try {
              const file = dataUrlToFile(guest.id_front_image, `id_front_${index}.jpg`);
              frontImagePath = await uploadIdProofImage(file, tempBookingId, guestId, 'front');
            } catch (error) {
              console.error('Error uploading front image:', error);
              // Fall back to data URL if storage upload fails
              frontImagePath = guest.id_front_image;
            }
          }
          
          // Upload back image if exists (only for primary guest)
          if (guest.id_back_image && guest.id_back_image.startsWith('data:')) {
            try {
              const file = dataUrlToFile(guest.id_back_image, `id_back_${index}.jpg`);
              backImagePath = await uploadIdProofImage(file, tempBookingId, guestId, 'back');
            } catch (error) {
              console.error('Error uploading back image:', error);
              // Fall back to data URL if storage upload fails
              backImagePath = guest.id_back_image;
            }
          }
          
          return {
            full_name: guest.full_name,
            phone: guest.phone || null,
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

      toast.success('Booking created successfully!', {
        description: `Room ${room.room_number} has been booked.`,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast.error('Failed to create booking', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Book Room {room.room_number}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pricing Summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Price</span>
                <span className="font-medium">₹{room.base_price}</span>
              </div>
              <div className="mt-4 flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="has_ac"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 flex items-center gap-1">
                        <AirVent className="h-4 w-4" />
                        AC (+₹{room.ac_charge})
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
                      <FormLabel className="!mt-0 flex items-center gap-1">
                        <Droplets className="h-4 w-4" />
                        Geyser (+₹{room.geyser_charge})
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>

            {/* Expected Checkout */}
            <FormField
              control={form.control}
              name="expected_checkout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Checkout Date & Time</FormLabel>
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
                  <FormLabel>Advance Payment (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
                <h3 className="font-semibold">Guest Information</h3>
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
                  Add Guest
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {index === 0 ? 'Primary Guest' : `Guest ${index + 1}`}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-destructive">
                          (ID Proof Required)
                        </span>
                      )}
                    </span>
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
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
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
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {index === 0 && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`guests.${index}.id_proof_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID Proof Type *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ID type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                  <SelectItem value="passport">Passport</SelectItem>
                                  <SelectItem value="driving_license">Driving License</SelectItem>
                                  <SelectItem value="voter_id">Voter ID</SelectItem>
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
                              <FormLabel>ID Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter ID number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FormLabel>ID Front Image *</FormLabel>
                          <div
                            className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50"
                            onClick={() => handleImageUpload(index, 'id_front_image')}
                          >
                            {form.watch(`guests.${index}.id_front_image`) ? (
                              <img
                                src={form.watch(`guests.${index}.id_front_image`)!}
                                alt="ID Front"
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 block text-sm text-muted-foreground">
                                  Capture/Upload Front
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>ID Back Image *</FormLabel>
                          <div
                            className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50"
                            onClick={() => handleImageUpload(index, 'id_back_image')}
                          >
                            {form.watch(`guests.${index}.id_back_image`) ? (
                              <img
                                src={form.watch(`guests.${index}.id_back_image`)!}
                                alt="ID Back"
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                <span className="mt-2 block text-sm text-muted-foreground">
                                  Capture/Upload Back
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name={`guests.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {form.formState.errors.guests?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.guests.root.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any special requests or notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createBooking.isPending || isUploading}
              >
                {(createBooking.isPending || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUploading ? 'Uploading Images...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
