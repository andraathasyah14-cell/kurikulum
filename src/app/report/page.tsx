
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
  Sparkles 
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

export default function ReportPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'Saran',
    subject: '',
    message: ''
  });

  const handleSendWhatsApp = () => {
    if (!formData.subject || !formData.message) {
      toast({ variant: "destructive", title: "Input Kurang", description: "Mohon isi subjek dan pesan Anda." });
      return;
    }
    const phone = "6281234567890"; // Ganti dengan nomor WA Anda jika perlu
    const text = `*STUDYPRO - ${formData.type.toUpperCase()}*%0A%0A*Subjek:* ${formData.subject}%0A*Pesan:* ${formData.message}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    toast({ title: "WhatsApp Terbuka", description: "Silakan kirim pesan di aplikasi WhatsApp Anda." });
  };

  const handleSendEmail = () => {
    if (!formData.subject || !formData.message) {
      toast({ variant: "destructive", title: "Input Kurang", description: "Mohon isi subjek dan pesan Anda." });
      return;
    }
    const email = "andraathasyah14@gmail.com";
    const subject = `[StudyPro ${formData.type}] ${formData.subject}`;
    const body = formData.message;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast({ title: "Email Terbuka", description: "Silakan kirim melalui aplikasi email Anda." });
  };

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl pb-32">
      <div className="mb-12 text-center">
        <div className="inline-flex p-4 rounded-[28px] bg-primary/10 mb-6">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-headline text-5xl font-black tracking-tight mb-2">Pusat Bantuan</h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">
          Punya kendala, saran fitur, atau kritik? Kami sangat menghargai masukan Anda untuk StudyPro yang lebih baik.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        <div className="md:col-span-7">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" /> Formulir Masukan
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Sampaikan pikiranmu langsung ke tim kami</CardDescription>
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

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleSendWhatsApp}
                  className="rounded-full h-14 bg-green-600 hover:bg-green-700 font-black uppercase text-xs tracking-widest shadow-lg gap-2"
                >
                  <Phone className="h-4 w-4" /> WhatsApp
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  variant="outline"
                  className="rounded-full h-14 font-black uppercase text-xs tracking-widest shadow-sm gap-2 border-primary/20 text-primary"
                >
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5 space-y-6">
          <Card className="border-none shadow-xl rounded-[32px] bg-primary text-primary-foreground p-8">
            <Info className="h-10 w-10 mb-4 opacity-40" />
            <h3 className="font-black text-2xl tracking-tight mb-2">Mengapa Masukan Anda Penting?</h3>
            <p className="text-sm font-medium leading-relaxed opacity-80">
              StudyPro dibangun untuk para pembelajar. Masukan Anda membantu kami memprioritaskan fitur yang benar-benar Anda butuhkan.
            </p>
          </Card>

          <div className="p-8 border-4 border-dashed rounded-[40px] bg-muted/20">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" /> FAQ Singkat
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase text-primary">Kapan dibalas?</p>
                <p className="text-[11px] font-medium text-muted-foreground">Kami biasanya merespons dalam 1-2 hari kerja ke email {formData.type === 'Saran' ? 'Anda' : 'pengirim'}.</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-primary">Laporan Bug?</p>
                <p className="text-[11px] font-medium text-muted-foreground">Mohon lampirkan langkah untuk memicu bug agar kami mudah memperbaikinya.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
