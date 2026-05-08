'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password, form.tenantSlug);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-lg z-10 space-y-8 animate-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-[2rem] mb-6 shadow-2xl shadow-primary/20">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-foreground font-display tracking-tight">
            Clinic<span className="text-primary">OS</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-2 tracking-wide uppercase text-[10px]">
            Hospital Management Information System
          </p>
        </div>

        <Card className="border-white/10 p-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Clinic Identifier"
                placeholder="demo-clinic"
                icon={<Building2 className="w-4 h-4" />}
                value={form.tenantSlug}
                onChange={(e) => setForm({ ...form, tenantSlug: e.target.value })}
                required
              />
              <Input
                label="Staff Email"
                type="email"
                placeholder="doctor@democlinic.co.ke"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Access Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-xl flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-14 text-base gap-2" loading={loading}>
                Authorize Session <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                New to ClinicOS?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                  Provision New Instance
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Helper */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-4 backdrop-blur-sm">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-[11px] leading-relaxed">
            <p className="text-foreground font-bold mb-1">Demo Access Credentials</p>
            <div className="text-muted-foreground space-y-0.5">
              <p>Clinic ID: <code className="text-primary bg-primary/5 px-1 rounded">demo-clinic</code></p>
              <p>Admin Email: <code className="text-primary bg-primary/5 px-1 rounded">admin@democlinic.co.ke</code></p>
              <p>Password: <code className="text-primary bg-primary/5 px-1 rounded">admin123</code></p>
              <p className="mt-2 text-[10px] font-bold text-foreground/50">Contact: 0711744877/0703521062 or 0108125588/0762346204</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
