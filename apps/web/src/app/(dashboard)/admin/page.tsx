'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import api from '@/lib/api-client';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Lock, 
  Mail, 
  Phone, 
  Trash2, 
  Settings2,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', employeeNo: '', roleId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch { /* graceful */ }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/users', form);
      setShowAddUser(false);
      loadData();
    } catch { /* error */ }
    setLoading(false);
  };

  const toggleUserStatus = async (id: string, current: boolean) => {
    try {
      await api.put(`/auth/users/${id}/status`, { isActive: !current });
      loadData();
    } catch { /* error */ }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      loadData();
    } catch { /* error */ }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">User Management</h1>
          <p className="text-muted-foreground font-medium mt-1">Super User control center for staff roles, access, and permissions.</p>
        </div>
        <Button variant="primary" className="gap-2 h-12 px-6" onClick={() => setShowAddUser(true)}>
          <UserPlus className="w-5 h-5" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Users className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 font-bold">Total Staff</Badge>
            </div>
            <h2 className="text-3xl font-black text-foreground mt-1">{users.length}</h2>
          </CardContent>
        </Card>
        
        <Card className="bg-success/5 border-success/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/20 rounded-lg text-success">
                <Shield className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-success border-success/20 bg-success/10 font-bold">Administrators</Badge>
            </div>
            <h2 className="text-3xl font-black text-foreground mt-1">{users.filter(u => u.role?.name === 'Admin').length}</h2>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                <Lock className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/20 bg-secondary/10 font-bold">Active Sessions</Badge>
            </div>
            <h2 className="text-3xl font-black text-foreground mt-1">{users.filter(u => u.isActive).length}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Staff Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-white/5">
                  <th className="pb-4">Staff Member</th>
                  <th className="pb-4">Contact & Email</th>
                  <th className="pb-4 text-center">Assigned Role</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{u.firstName} {u.lastName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Emp: {u.employeeNo || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Phone className="w-3 h-3" /> {u.phone || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary">
                        {u.role?.name || 'Staff'}
                      </Badge>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                        className="group/status"
                      >
                        {u.isActive ? (
                          <Badge variant="success" className="gap-1.5 cursor-pointer group-hover/status:bg-success/80">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1.5 cursor-pointer text-muted-foreground group-hover/status:bg-white/5">
                            <XCircle className="w-3 h-3" /> Deactivated
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteUser(u.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Provision New Staff Account" className="max-w-2xl">
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" required placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" required placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Staff Email" type="email" required placeholder="john.doe@clinic.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Initial Password" type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
            <Select 
              label="Assigned Role" 
              required 
              value={form.roleId} 
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              options={roles.map((r: any) => ({ value: r.id, label: r.name }))} 
            />
            <Input label="Employee Number" placeholder="EMP-001" value={form.employeeNo} onChange={(e) => setForm({ ...form, employeeNo: e.target.value })} />
          </div>

          <Input label="Phone Contact" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <Button variant="ghost" type="button" onClick={() => setShowAddUser(false)} className="font-bold">Cancel</Button>
            <Button type="submit" loading={loading} className="gap-2 px-12">
              <UserPlus className="w-4 h-4" /> Finalize Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
