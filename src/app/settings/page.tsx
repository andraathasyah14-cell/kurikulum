
'use client';

import { useUser, useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LogOut, User, Bell, Shield, Palette } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is only toggled after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Silakan masuk terlebih dahulu.</h2>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div className="container max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi aplikasi Anda.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profil Pengguna
            </CardTitle>
            <CardDescription>Informasi dasar akun Google Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders" className="flex flex-col gap-1 cursor-pointer">
                  <span>Pengingat Harian</span>
                  <span className="text-xs font-normal text-muted-foreground">Terima notifikasi untuk checklist Anda.</span>
                </Label>
                <Switch id="reminders" defaultChecked />
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
                <Label htmlFor="dark-mode" className="flex flex-col gap-1 cursor-pointer">
                  <span>Mode Gelap</span>
                  <span className="text-xs font-normal text-muted-foreground">Ganti tema aplikasi menjadi gelap.</span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" /> Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              variant="destructive" 
              className="justify-start gap-2"
              onClick={() => signOut(auth)}
            >
              <LogOut className="h-4 w-4" /> Keluar dari Aplikasi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
