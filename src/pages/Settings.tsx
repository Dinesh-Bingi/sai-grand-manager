import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, IndianRupee, Bell, Shield, Database, Save, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = (section: string) => {
    toast.success(`${section} settings saved`);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">System configuration</p>
        </div>

        <Tabs defaultValue="property" className="space-y-4">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="tariff">Tariff</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="property">
            <Card>
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lodge Name</Label>
                    <Input defaultValue="Sai Grand Lodge" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input type="tel" placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="Surendrapuri, Yadagirigutta, Telangana" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Checkout Time</Label>
                    <Input type="time" defaultValue="11:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-in Time</Label>
                    <Input type="time" defaultValue="12:00" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Property')} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tariff">
            <Card>
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Tariff Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {[
                  { name: 'Standard Rooms', floor: '1st & 2nd Floor', base: 800, ac: 300, geyser: 100 },
                  { name: 'Luxury Rooms', floor: '4th Floor', base: 1500, ac: 400, geyser: 150 },
                  { name: 'Penthouse', floor: '5th Floor', base: 3000, ac: 500, geyser: 200 },
                ].map((room) => (
                  <div key={room.name} className="rounded-md border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">{room.name}</span>
                      <span className="text-xs text-muted-foreground">{room.floor}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Base (₹)</Label>
                        <Input type="number" defaultValue={room.base} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">AC (₹)</Label>
                        <Input type="number" defaultValue={room.ac} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Geyser (₹)</Label>
                        <Input type="number" defaultValue={room.geyser} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Tariff')} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Alert Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Checkout Alerts</p>
                    <p className="text-xs text-muted-foreground">Show alerts for upcoming checkouts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Overdue Warnings</p>
                    <p className="text-xs text-muted-foreground">Highlight rooms past checkout time</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weekend Rush Mode</p>
                    <p className="text-xs text-muted-foreground">Quick booking mode on weekends</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm">Alert Lead Time (hours)</Label>
                  <Input type="number" defaultValue="2" className="max-w-[100px]" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave('Alert')} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <Card>
                <CardHeader className="py-4 border-b">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto Logout</p>
                      <p className="text-xs text-muted-foreground">Logout after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Timeout (minutes)</Label>
                    <Input type="number" defaultValue="30" className="max-w-[100px]" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Require ID Proof</p>
                      <p className="text-xs text-muted-foreground">Block bookings without ID</p>
                    </div>
                    <Switch defaultChecked disabled />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Activity Logging</p>
                      <p className="text-xs text-muted-foreground">Track all user actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('Security')} size="sm" className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4 border-b">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Backup & Restore
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <p className="text-sm font-medium">Automatic Daily Backup</p>
                      <p className="text-xs text-muted-foreground">Last: Today 3:00 AM</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Backup
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Restore
                    </Button>
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
