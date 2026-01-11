import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  IndianRupee,
  Bell,
  Shield,
  Database,
  Clock,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = (section: string) => {
    toast.success('Settings Updated', {
      description: `${section} settings have been saved successfully.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            System Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage property settings, pricing, and security preferences
          </p>
        </div>

        <Tabs defaultValue="property" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full max-w-2xl grid grid-cols-4">
            <TabsTrigger value="property" className="data-[state=active]:bg-background">Property</TabsTrigger>
            <TabsTrigger value="tariff" className="data-[state=active]:bg-background">Tariff</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-background">Alerts</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-background">Security</TabsTrigger>
          </TabsList>

          {/* Property Settings */}
          <TabsContent value="property">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Property Information
                </CardTitle>
                <CardDescription>
                  Configure your establishment's basic details and operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lodgeName" className="font-medium">Establishment Name</Label>
                    <Input id="lodgeName" defaultValue="Sai Grand Lodge" className="font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Reception Contact
                    </Label>
                    <Input id="phone" type="tel" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Property Address
                  </Label>
                  <Input
                    id="address"
                    defaultValue="Surendrapuri, Yadagirigutta, Telangana 508115"
                  />
                </div>
                <Separator />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkoutTime" className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Standard Check-out Time
                    </Label>
                    <Input id="checkoutTime" type="time" defaultValue="11:00" />
                    <p className="text-xs text-muted-foreground">Guests must vacate by this time</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkinTime" className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Standard Check-in Time
                    </Label>
                    <Input id="checkinTime" type="time" defaultValue="12:00" />
                    <p className="text-xs text-muted-foreground">Earliest time for new arrivals</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Property')} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Property Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tariff Settings */}
          <TabsContent value="tariff">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  Room Tariff Configuration
                </CardTitle>
                <CardDescription>
                  Set base rates and additional charges for each room category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="rounded-xl border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Standard Rooms</h4>
                    <Badge variant="secondary">1st & 2nd Floor</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Base Tariff (₹/night)</Label>
                      <Input type="number" defaultValue="800" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">AC Supplement (₹)</Label>
                      <Input type="number" defaultValue="300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Luxury Rooms</h4>
                    <Badge variant="secondary">4th Floor</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Base Tariff (₹/night)</Label>
                      <Input type="number" defaultValue="1500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">AC Supplement (₹)</Label>
                      <Input type="number" defaultValue="400" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="150" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-5 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Penthouse Suites</h4>
                    <Badge>Premium</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Base Tariff (₹/night)</Label>
                      <Input type="number" defaultValue="3000" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">AC Supplement (₹)</Label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="200" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Tariff')} className="gap-2">
                    <Save className="h-4 w-4" />
                    Update Tariff
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alert Settings */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Alert & Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure system alerts for check-outs, overstays, and high-demand periods
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="space-y-1">
                    <p className="font-medium">Departure Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Display alerts for upcoming guest departures
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="space-y-1">
                    <p className="font-medium">Overstay Warnings</p>
                    <p className="text-sm text-muted-foreground">
                      Highlight rooms past scheduled check-out time
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-warning/50 bg-warning/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">High-Demand Mode</p>
                      <Badge variant="secondary" className="text-xs">Weekend Rush</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable quick booking mode during peak periods
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label className="font-medium">Departure Alert Lead Time</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" defaultValue="2" className="w-24" />
                    <span className="text-sm text-muted-foreground">hours before check-out</span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Alert')} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Alert Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security & Access Control
                  </CardTitle>
                  <CardDescription>
                    Manage authentication, session security, and compliance settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="space-y-1">
                      <p className="font-medium">Automatic Session Timeout</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after period of inactivity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="font-medium">Session Timeout Duration</Label>
                    <div className="flex items-center gap-3">
                      <Input type="number" defaultValue="30" className="w-24" />
                      <span className="text-sm text-muted-foreground">minutes of inactivity</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Mandatory ID Verification</p>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Block reservations without valid government ID proof
                      </p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="space-y-1">
                      <p className="font-medium">Activity Audit Trail</p>
                      <p className="text-sm text-muted-foreground">
                        Log all user actions for security audit
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('Security')} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Data Backup & Recovery
                  </CardTitle>
                  <CardDescription>
                    Manage automated backups and data restoration
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-success/5 border-success/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Automatic Daily Backup</p>
                        <Badge className="bg-success hover:bg-success/90 text-xs">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last backup: Today at 03:00 AM
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Backup
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Restore from Backup
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Important Notice</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Restoring from a backup will replace all current data. 
                        Please ensure you have a recent backup before proceeding.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
