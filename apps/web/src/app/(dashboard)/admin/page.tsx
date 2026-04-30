'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import api from '@/lib/api-client';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', employeeNo: '', roleId: '',
  });

  useEffect(() => {
    api.get('/auth/users').then(({ data }) => setUsers(data)).catch(() => {});
    api.get('/auth/roles').then(({ data }) => setRoles(data)).catch(() => {});
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/users', form);
      setShowAddUser(false);
      api.get('/auth/users').then(({ data }) => setUsers(data));
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <Button onClick={() => setShowAddUser(true)}>+ Add User</Button>
      </div>

      <Card title="Staff Members">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Employee #</th>
              <th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3"><Badge status={u.role?.name?.toLowerCase().replace(' ', '_') || ''} label={u.role?.name} /></td>
                  <td className="py-3 font-mono text-xs">{u.employeeNo || '—'}</td>
                  <td className="py-3">{u.isActive ? <Badge status="approved" label="Active" /> : <Badge status="cancelled" label="Inactive" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showAddUser} onClose={() => setShowAddUser(false)} title="Add Staff Member">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" required value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            options={roles.map((r: any) => ({ value: r.id, label: r.name }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Employee No" value={form.employeeNo} onChange={(e) => setForm({ ...form, employeeNo: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Add User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
