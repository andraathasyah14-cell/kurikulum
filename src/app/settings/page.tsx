'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="container max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi aplikasi Anda.</p>
      </div>

      <div className="grid gap-6">
        {/* Profil Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profil Pengguna
            </CardTitle>
            <CardDescription>Informasi dasar akun Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Ganti Foto</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" defaultValue={user?.displayName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email || ''} disabled />
              </div>
            </div>
            <Button>Simpan Perubahan</Button>
          </CardContent>
        </Card>

        {/* Notifikasi & Tampilan */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders" className="flex flex-col gap-1">
                  <span>Pengingat Harian</span>
                  <span className="text-xs font-normal text-muted-foreground">Terima notifikasi untuk checklist Anda.</span>
                </Label>
                <Switch id="reminders" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="updates" className="flex flex-col gap-1">
                  <span>Update Mingguan</span>
                  <span className="text-xs font-normal text-muted-foreground">Laporan progres mingguan via email.</span>
                </Label>
                <Switch id="updates" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" /> Tampilan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                  <span>Mode Gelap</span>
                  <span className="text-xs font-normal text-muted-foreground">Gunakan tema gelap untuk aplikasi.</span>
                </Label>
                <Switch id="dark-mode" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="compact" className="flex flex-col gap-1">
                  <span>Mode Ringkas</span>
                  <span className="text-xs font-normal text-muted-foreground">Tampilkan lebih banyak item di layar.</span>
                </Label>
                <Switch id="compact" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keamanan & Logout */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" /> Keamanan & Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" className="justify-start gap-2">
              Ganti Password
            </Button>
            <Button variant="destructive" className="justify-start gap-2">
              <LogOut className="h-4 w-4" /> Keluar dari Aplikasi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
