
'use client';

import { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Send, 
  ChevronRight, 
  Phone, 
  Info, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function ReportPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Saran',
    subject: '',
    message: ''
  });

  const handleSendAutomatic = () => {
    if (!formData.subject || !formData.message) {
      toast({ variant: "destructive", title: "Input Kurang", description: "Mohon isi subjek dan pesan Anda." });
      return;
    }
    
    if (!user || !db) {
      toast({ variant: "destructive", title: "Login Diperlukan", description: "Silakan login untuk mengirim laporan secara otomatis." });
      return;
    }

    setIsSubmitting(true);
    
    addDocumentNonBlocking(collection(db, 'reports'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'User',
      type: formData.type,
      subject: formData.subject,
      message: formData.message,
      targetEmail: "andraathasyah14@gmail.com",
      timestamp: serverTimestamp(),
    });

    // Reset form
    setFormData({ ...formData, subject: '', message: '' });
    setIsSubmitting(false);
    
    toast({ 
      title: "Laporan Terkirim! 🚀", 
      description: "Laporan Anda telah dikirim secara otomatis ke sistem kami (andraathasyah14@gmail.com)." 
    });
  };

  const handleSendWhatsApp = () => {
    if (!formData.subject || !formData.message) {
      toast({ variant: "destructive", title: "Input Kurang", description: "Mohon isi subjek dan pesan Anda." });
      return;
    }
    const phone = "6281234567890"; 
    const text = `*STUDYPRO - ${formData.type.toUpperCase()}*%0A%0A*Pengirim:* ${user?.displayName || 'User'} (${user?.email || 'N/A'})%0A*Subjek:* ${formData.subject}%0A*Pesan:* ${formData.message}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    toast({ title: "WhatsApp Terbuka", description: "Silakan kirim pesan di aplikasi WhatsApp Anda." });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-12 text-center">
        <div className="inline-flex p-4 rounded-[28px] bg-primary/10 mb-6">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Pusat Bantuan</h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">
          Punya kendala, saran fitur, atau kritik? Laporan Anda akan dikirim menggunakan akun **{user?.email || 'anda'}**.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        <div className="md:col-span-7">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" /> Formulir Masukan
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Pesan terkirim otomatis ke tim andraathasyah14@gmail.com</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Kategori</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saran">Saran Fitur</SelectItem>
                    <SelectItem value="Error">Laporan Error / Bug</SelectItem>
                    <SelectItem value="Kritik">Kritik & Keluhan</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Subjek Singkat</Label>
                <Input 
                  placeholder="Contoh: Bug di halaman stats, Saran fitur timer" 
                  className="rounded-xl h-12"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Detail Pesan</Label>
                <Textarea 
                  placeholder="Ceritakan lebih detail mengenai masukan Anda..." 
                  className="rounded-2xl min-h-[150px] p-4 bg-muted/20 border-none focus-visible:ring-primary"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={handleSendAutomatic}
                  disabled={isSubmitting}
                  className="rounded-full h-14 bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest shadow-lg gap-3"
                >
                  <Send className="h-5 w-5" /> Kirim Laporan Otomatis
                </Button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-card px-4 text-muted-foreground">Atau respon cepat via</span></div>
                </div>

                <Button 
                  onClick={handleSendWhatsApp}
                  variant="outline"
                  className="rounded-full h-14 font-black uppercase text-xs tracking-widest shadow-sm gap-2 border-green-500/20 text-green-600 hover:bg-green-50"
                >
                  <Phone className="h-4 w-4" /> Hubungi WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5 space-y-6">
          <Card className="border-none shadow-xl rounded-[32px] bg-indigo-600 text-white p-8">
            <Zap className="h-10 w-10 mb-4 text-yellow-300 fill-current" />
            <h3 className="font-black text-2xl tracking-tight mb-2">Sistem Laporan Langsung</h3>
            <p className="text-sm font-medium leading-relaxed opacity-80">
              Sekarang Anda tinggal klik "Kirim", dan sistem akan otomatis melampirkan email Anda (**{user?.email}**) ke dalam laporan. Tim kami akan melihatnya langsung di dashboard admin.
            </p>
          </Card>

          <div className="p-8 border-4 border-dashed rounded-[40px] bg-muted/20">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" /> Informasi Akun
            </h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase text-primary mb-1">Email Anda (Otomatis)</p>
                <p className="text-xs font-bold text-foreground">{user?.email || 'Belum Login'}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase text-primary mb-1">Nama Profil</p>
                <p className="text-xs font-bold text-foreground">{user?.displayName || 'Belum Login'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
