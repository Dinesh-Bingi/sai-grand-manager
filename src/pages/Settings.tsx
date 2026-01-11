import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  IndianRupee,
  Bell,
  Shield,
  Database,
  Smartphone,
} from 'lucide-react';

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>

        <Tabs defaultValue="lodge" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="lodge">Lodge</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Lodge Settings */}
          <TabsContent value="lodge">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Lodge Information
                </CardTitle>
                <CardDescription>
                  Basic information about your lodge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lodgeName">Lodge Name</Label>
                    <Input id="lodgeName" defaultValue="Sai Grand Lodge" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue="Surendrapuri, Yadagirigutta, Telangana"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkoutTime">Standard Checkout Time</Label>
                    <Input id="checkoutTime" type="time" defaultValue="11:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkinTime">Standard Check-in Time</Label>
                    <Input id="checkinTime" type="time" defaultValue="12:00" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Settings */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Pricing Configuration
                </CardTitle>
                <CardDescription>
                  Configure default pricing for different room types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-4">Standard Rooms (1st & 2nd Floor)</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Base Price (₹)</Label>
                      <Input type="number" defaultValue="800" />
                    </div>
                    <div className="space-y-2">
                      <Label>AC Charge (₹)</Label>
                      <Input type="number" defaultValue="300" />
                    </div>
                    <div className="space-y-2">
                      <Label>Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-4">Luxury Rooms (4th Floor)</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Base Price (₹)</Label>
                      <Input type="number" defaultValue="1500" />
                    </div>
                    <div className="space-y-2">
                      <Label>AC Charge (₹)</Label>
                      <Input type="number" defaultValue="400" />
                    </div>
                    <div className="space-y-2">
                      <Label>Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="150" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-4">Penthouse Suites</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Base Price (₹)</Label>
                      <Input type="number" defaultValue="3000" />
                    </div>
                    <div className="space-y-2">
                      <Label>AC Charge (₹)</Label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Geyser Charge (₹)</Label>
                      <Input type="number" defaultValue="200" />
                    </div>
                  </div>
                </div>

                <Button>Update Pricing</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Settings
                </CardTitle>
                <CardDescription>
                  Configure checkout alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Checkout Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Show alerts for upcoming checkouts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overdue Checkout Warnings</p>
                    <p className="text-sm text-muted-foreground">
                      Highlight rooms past checkout time
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekend Rush Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Enable quick booking mode on weekends
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Checkout Alert Time (hours before)</Label>
                  <Input type="number" defaultValue="2" className="max-w-[100px]" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage security and access control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Logout</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically logout after inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Auto Logout Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" className="max-w-[100px]" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require ID Proof</p>
                    <p className="text-sm text-muted-foreground">
                      Block bookings without primary guest ID
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Activity Logging</p>
                    <p className="text-sm text-muted-foreground">
                      Track all user actions for audit
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Restore
                </CardTitle>
                <CardDescription>
                  Manage data backups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Automatic Daily Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Last backup: Today at 3:00 AM
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Download Backup</Button>
                  <Button variant="outline">Restore from Backup</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
