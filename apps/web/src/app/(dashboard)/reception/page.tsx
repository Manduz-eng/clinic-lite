'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

export default function ReceptionPage() {
  const [patients, setPatients] = useState<any>({ data: [], pagination: { total: 0 } });
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'male',
    phone: '', nationalId: '', email: '', address: '',
    emergencyContactName: '', emergencyContactPhone: '',
    bloodGroup: '', allergies: '', insuranceProvider: '', insuranceNo: '',
  });
  const [visitForm, setVisitForm] = useState({
    visitType: 'new_visit', priority: 'normal', chiefComplaint: '',
  });

  useEffect(() => { loadPatients(); }, [search]);

  const loadPatients = async () => {
    try {
      const { data } = await api.get('/patients', { params: { search, limit: 20 } });
      setPatients(data);
    } catch { /* graceful */ }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== '')
      );
      await api.post('/patients', payload);
      setShowRegister(false);
      setForm({ firstName: '', lastName: '', dateOfBirth: '', gender: 'male', phone: '', nationalId: '', email: '', address: '', emergencyContactName: '', emergencyContactPhone: '', bloodGroup: '', allergies: '', insuranceProvider: '', insuranceNo: '' });
      loadPatients();
    } catch { /* error */ }
    setLoading(false);
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/visits', { patientId: selectedPatient.id, ...visitForm });
      setShowVisit(false);
      setSelectedPatient(null);
    } catch { /* error */ }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reception</h1>
        <Button onClick={() => setShowRegister(true)}>+ Register Patient</Button>
      </div>

      <Card title="Patient Registry">
        <div className="mb-4">
          <Input placeholder="Search by name, patient no, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Patient No</th>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Gender</th>
              <th className="pb-3 font-medium">DOB</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {(patients.data || []).map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{p.patientNo}</td>
                  <td className="py-3 font-medium">{p.firstName} {p.lastName}</td>
                  <td className="py-3 capitalize">{p.gender}</td>
                  <td className="py-3">{formatDate(p.dateOfBirth)}</td>
                  <td className="py-3">{p.phone || '—'}</td>
                  <td className="py-3">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p); setShowVisit(true); }}>
                      New Visit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.data?.length === 0 && <p className="text-gray-500 text-center py-8">No patients found.</p>}
        </div>
      </Card>

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Register Patient" size="lg">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <Input label="Date of Birth" type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <Select label="Gender" required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="National ID" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Blood Group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Emergency Contact" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
            <Input label="Emergency Phone" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
            <Input label="Insurance Provider" value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
            <Input label="Insurance No" value={form.insuranceNo} onChange={(e) => setForm({ ...form, insuranceNo: e.target.value })} />
          </div>
          <Input label="Allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Register</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showVisit} onClose={() => setShowVisit(false)} title={`New Visit — ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}>
        <form onSubmit={handleCreateVisit} className="space-y-4">
          <Select label="Visit Type" value={visitForm.visitType} onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })} options={[{ value: 'new_visit', label: 'New Visit' }, { value: 'follow_up', label: 'Follow-up' }, { value: 'emergency', label: 'Emergency' }]} />
          <Select label="Priority" value={visitForm.priority} onChange={(e) => setVisitForm({ ...visitForm, priority: e.target.value })} options={[{ value: 'normal', label: 'Normal' }, { value: 'urgent', label: 'Urgent' }, { value: 'emergency', label: 'Emergency' }]} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint</label>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} value={visitForm.chiefComplaint} onChange={(e) => setVisitForm({ ...visitForm, chiefComplaint: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowVisit(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Visit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
