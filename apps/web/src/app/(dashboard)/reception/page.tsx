'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';
import { 
  Search, 
  UserPlus, 
  ChevronDown, 
  UserX, 
  Trash2, 
  History, 
  UserCheck, 
  Plus, 
  Calendar,
  Receipt,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

export default function ReceptionPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVisit, setShowVisit] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showFormActionMenu, setShowFormActionMenu] = useState(false);

  const [form, setForm] = useState({
    surname: '', otherNames: '', gender: '', idType: '', idNumber: '',
    dateOfBirth: '', phone: '', phone2: '', email: '',
    nextOfKin: '', relationship: '', nokPhone: '',
    residence: '', occupation: '', town: '', nationality: '',
    postalAddress: '', postalCode: '',
  });

  const [visitForm, setVisitForm] = useState({
    visitType: 'new_visit', priority: 'normal', chiefComplaint: '',
  });

  const [occupations, setOccupations] = useState(['Engineer', 'Teacher', 'Doctor', 'Businessman', 'Farmer']);
  const [towns, setTowns] = useState(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']);
  const [nationalities, setNationalities] = useState(['Kenyan', 'Ugandan', 'Tanzanian', 'Rwandan', 'Ethiopian']);

  useEffect(() => {
    if (search.length > 0) handleSearch();
    else setPatients([]);
  }, [search]);

  const handleSearch = async () => {
    try {
      const { data } = await api.get('/patients', { params: { search, limit: 100 } });
      setPatients(data.data || []);
    } catch { /* graceful */ }
  };

  const validateForm = () => {
    const mandatory = [
      'surname', 'otherNames', 'gender', 'idType', 'dateOfBirth', 
      'phone', 'nextOfKin', 'relationship', 'nokPhone', 
      'residence', 'occupation', 'town', 'nationality'
    ];
    for (const field of mandatory) {
      if (!form[field as keyof typeof form]) return false;
    }
    
    if (form.idType !== 'None' && !form.idNumber) return false;
    if (form.phone.length !== 10 || !/^\d+$/.test(form.phone)) return false;

    return true;
  };

  const handleSave = async (isUpdate = false) => {
    setError('');
    if (!validateForm()) {
      setError('please fill all the mandatory fields correctly (Phone must be 10 digits)');
      addToast('failed to save: validation error', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.otherNames,
        lastName: form.surname,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        idType: form.idType,
        idNumber: form.idNumber,
        phone: form.phone,
        phone2: form.phone2,
        email: form.email,
        address: form.residence,
        occupation: form.occupation,
        town: form.town,
        nationality: form.nationality,
        nextOfKin: form.nextOfKin,
        relationship: form.relationship,
        nokPhone: form.nokPhone,
        postalAddress: form.postalAddress,
        postalCode: form.postalCode,
      };

      if (isUpdate && selectedPatient?.id) {
        await api.put(`/patients/${selectedPatient.id}`, payload);
        addToast('Action successful: Patient updated', 'success');
      } else {
        await api.post('/patients', payload);
        addToast('Action successful: Patient registered', 'success');
      }
      resetForm();
      handleSearch();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Unknown error';
      const details = err.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        const detailStr = details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
        setError(`Validation Failed: ${detailStr}`);
        addToast(`failed to save: ${detailStr}`, 'error');
      } else {
        setError(errorMsg);
        addToast(`failed to save: ${errorMsg}`, 'error');
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      surname: '', otherNames: '', gender: '', idType: '', idNumber: '',
      dateOfBirth: '', phone: '', phone2: '', email: '',
      nextOfKin: '', relationship: '', nokPhone: '',
      residence: '', occupation: '', town: '', nationality: '',
      postalAddress: '', postalCode: '',
    });
    setSelectedPatient(null);
    setError('');
    setShowFormActionMenu(false);
  };

  const selectPatient = (p: any) => {
    setSelectedPatient(p);
    setForm({
      surname: p.lastName || '',
      otherNames: p.firstName || '',
      gender: p.gender || '',
      idType: p.nationalId ? 'National ID' : 'None',
      idNumber: p.nationalId || '',
      dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
      phone: p.phone || '',
      phone2: '',
      email: p.email || '',
      nextOfKin: p.emergencyContactName || '',
      relationship: '',
      nokPhone: p.emergencyContactPhone || '',
      residence: p.address || '',
      occupation: '',
      town: '',
      nationality: 'Kenyan',
      postalAddress: '',
      postalCode: '',
    });
  };

  const handleFormAction = (action: string) => {
    setShowFormActionMenu(false);
    
    if (action === 'save') {
      handleSave(false);
      return;
    }

    if (!selectedPatient) {
      addToast('Please select a patient first', 'error');
      return;
    }
    
    if (action === 'queue') setShowVisit(true);
    else if (action === 'delete') {
      if(confirm('Delete patient?')) {
        api.delete(`/patients/${selectedPatient.id}`).then(() => {
          addToast('Action successful: Deleted', 'success');
          resetForm();
          handleSearch();
        });
      }
    } else if (action === 'deactivate') {
      api.put(`/patients/${selectedPatient.id}/status`, { isActive: false }).then(() => {
        addToast('Action successful: Deactivated', 'success');
        handleSearch();
      });
    } else {
      addToast(`View ${action} (Module coming soon)`, 'success');
    }
  };

  return (
    <div className="space-y-4 animate-in overflow-hidden max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-card/20 p-3 rounded-2xl border border-white/5 backdrop-blur-md h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <UserPlus className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-black text-foreground font-display tracking-tight">Patient Registry</h1>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-4 h-8 flex items-center">
          ClinicOS HMIS v.1.00
        </Badge>
      </div>

      {/* Centered Search Bar */}
      <div className="flex justify-center w-full px-4">
        <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-1 gap-3 w-full max-w-2xl group focus-within:border-primary/50 transition-all shadow-xl shadow-black/20">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            placeholder="Search Registry: Name, ID, Phone, Membership, OPD..." 
            className="bg-transparent border-none outline-none text-[11px] w-full py-3 placeholder:text-muted-foreground/40 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-white"><Plus className="w-4 h-4 rotate-45" /></button>}
        </div>
      </div>

      {/* Full Width Patient Details */}
      <div className="space-y-4">
        <Card className="border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 py-3 flex flex-row items-center justify-between px-6">
            <CardTitle className="text-xs font-black flex items-center gap-2 text-primary">
              <RefreshCw className="w-3 h-3" /> REGISTER & UPDATE DETAILS
            </CardTitle>
            {error && <span className="text-[10px] font-black text-destructive uppercase animate-pulse tracking-widest">{error}</span>}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Field label="Surname *" value={form.surname} onChange={(v) => setForm({...form, surname: v})} />
              <Field label="Other Names *" value={form.otherNames} onChange={(v) => setForm({...form, otherNames: v})} />
              <SelectField label="Gender *" value={form.gender} onChange={(v) => setForm({...form, gender: v})} options={['male', 'female', 'other']} />
              <div className="space-y-1 relative">
                <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1">DOB *</label>
                <div className="relative">
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-primary pr-8" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} />
                  <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary pointer-events-none" />
                </div>
              </div>
              <SelectField label="ID Type *" value={form.idType} onChange={(v) => setForm({...form, idType: v})} options={['None', 'National ID', 'Passport', 'Military ID', 'Driving License', 'Student ID']} />
              <Field label={form.idType !== 'None' ? "ID Number *" : "ID Number"} value={form.idNumber} onChange={(v) => setForm({...form, idNumber: v})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Field label="Telephone *" value={form.phone} onChange={(v) => setForm({...form, phone: v})} placeholder="10 digits" />
              <Field label="Residence *" value={form.residence} onChange={(v) => setForm({...form, residence: v})} />
              <Field label="Next of Kin *" value={form.nextOfKin} onChange={(v) => setForm({...form, nextOfKin: v})} />
              <Field label="Relationship *" value={form.relationship} onChange={(v) => setForm({...form, relationship: v})} />
              <Field label="NOK Phone *" value={form.nokPhone} onChange={(v) => setForm({...form, nokPhone: v})} />
              <DynamicSelect label="Occupation *" value={form.occupation} onChange={(v) => setForm({...form, occupation: v})} options={occupations} onAdd={(v) => setOccupations([...occupations, v])} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <DynamicSelect label="Town *" value={form.town} onChange={(v) => setForm({...form, town: v})} options={towns} onAdd={(v) => setTowns([...towns, v])} />
              <DynamicSelect label="Nationality *" value={form.nationality} onChange={(v) => setForm({...form, nationality: v})} options={nationalities} onAdd={(v) => setNationalities([...nationalities, v])} />
              <Field label="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} />
              <Field label="Tel 2" value={form.phone2} onChange={(v) => setForm({...form, phone2: v})} />
              <Field label="P.O Box" value={form.postalAddress} onChange={(v) => setForm({...form, postalAddress: v})} />
              <Field label="P. Code" value={form.postalCode} onChange={(v) => setForm({...form, postalCode: v})} />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="relative">
                <Button variant="primary" className="h-9 px-8 text-[10px] font-black uppercase tracking-widest gap-2" onClick={() => setShowFormActionMenu(!showFormActionMenu)}>
                  Action <ChevronDown className="w-3 h-3" />
                </Button>
                {showFormActionMenu && (
                  <div className="absolute left-0 bottom-full mb-3 w-56 bg-[#1a1f2e] border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 p-2 animate-in slide-in-from-bottom-3 ring-1 ring-white/10">
                    {!selectedPatient ? (
                      <ActionItem icon={UserPlus} label="Save New Registration" onClick={() => handleFormAction('save')} highlight />
                    ) : (
                      <>
                        <ActionItem icon={UserCheck} label="Queue Patient" onClick={() => handleFormAction('queue')} highlight />
                        <ActionItem icon={UserX} label="Deactivate Patient" onClick={() => handleFormAction('deactivate')} />
                        <ActionItem icon={History} label="View Patient Visits" onClick={() => handleFormAction('visits')} />
                        <ActionItem icon={Receipt} label="Visits/Billing History" onClick={() => handleFormAction('billing')} />
                        <div className="h-px bg-white/10 my-2" />
                        <ActionItem icon={Trash2} label="Delete Patient" onClick={() => handleFormAction('delete')} danger />
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button variant="secondary" className="h-9 px-8 text-[10px] font-black uppercase tracking-widest" onClick={() => handleSave(true)}>Update</Button>
              <Button variant="outline" className="h-9 px-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5" onClick={resetForm}>New Registration</Button>
              
              {selectedPatient && (
                <div className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Editing: {selectedPatient.firstName} {selectedPatient.lastName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full Width Registry Results List */}
        <Card className="border-white/5 h-full">
          <CardHeader className="py-2 bg-white/5 px-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              <span>REGISTRY DATA RECALL</span>
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="h-4 px-2 text-[9px] font-black">{patients.length} RECORDS FOUND</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <th className="px-6 py-3">OPD No</th>
                    <th className="px-6 py-3">Full Name</th>
                    <th className="px-6 py-3">ID / Passport</th>
                    <th className="px-6 py-3">Telephone</th>
                    <th className="px-6 py-3 text-right">Recall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => selectPatient(p)}>
                      <td className="px-6 py-2.5">
                        <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-primary">{p.patientNo}</Badge>
                      </td>
                      <td className="px-6 py-2.5 font-black text-[11px] text-foreground">{p.firstName} {p.lastName}</td>
                      <td className="px-6 py-2.5 font-bold text-[10px] text-muted-foreground">{p.nationalId || 'None'}</td>
                      <td className="px-6 py-2.5 font-bold text-[10px] text-muted-foreground">{p.phone}</td>
                      <td className="px-6 py-2.5 text-right">
                         <div className="inline-flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                            Recall Record <RefreshCw className="w-3 h-3" />
                         </div>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-20">
                          <Search className="w-8 h-8" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Type to search registry...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Visit Modal */}
      <Modal isOpen={showVisit} onClose={() => setShowVisit(false)} title="QUEUE PATIENT FOR SERVICE">
         <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center font-black text-accent text-xl">
                {selectedPatient?.firstName?.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-sm text-foreground uppercase">{selectedPatient?.firstName} {selectedPatient?.lastName}</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{selectedPatient?.patientNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <SelectField label="Visit Classification" value={visitForm.visitType} onChange={(v) => setVisitForm({...visitForm, visitType: v})} options={['new_visit', 'follow_up', 'emergency']} />
               <SelectField label="Priority Level" value={visitForm.priority} onChange={(v) => setVisitForm({...visitForm, priority: v})} options={['normal', 'urgent', 'emergency']} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chief Complaint / Reason for Queue</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary min-h-[100px] font-medium" value={visitForm.chiefComplaint} onChange={(e) => setVisitForm({...visitForm, chiefComplaint: e.target.value})} placeholder="Describe patient condition..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
               <Button variant="ghost" onClick={() => setShowVisit(false)} className="text-[10px] font-black uppercase tracking-widest h-10 px-6">Cancel</Button>
               <Button variant="primary" className="bg-accent hover:bg-accent/90 border-none text-[10px] font-black uppercase tracking-widest px-10 h-10 shadow-lg shadow-accent/20" onClick={() => { addToast('Action successful: Patient Queued', 'success'); setShowVisit(false); }}>Confirm & Queue</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-0.5">
      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <input className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] outline-none focus:border-primary transition-all font-bold text-foreground" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-0.5">
      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] outline-none focus:border-primary transition-all appearance-none text-foreground font-bold" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-[#1a1f2e] text-white">Select...</option>
        {options.map((o: any) => <option key={o} value={o} className="bg-[#1a1f2e] text-white capitalize">{o.replace('_', ' ')}</option>)}
      </select>
    </div>
  );
}

function DynamicSelect({ label, value, onChange, options, onAdd }: any) {
  return (
    <div className="space-y-0.5">
      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex justify-between items-center">
        {label}
        <button className="p-0.5 bg-primary/20 text-primary rounded-md" onClick={() => { const v = prompt(`Add New ${label}`); if(v) onAdd(v); }}><Plus className="w-2 h-2" /></button>
      </label>
      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] outline-none focus:border-primary transition-all appearance-none text-foreground font-bold" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-[#1a1f2e] text-white">Select...</option>
        {options.map((o: any) => <option key={o} value={o} className="bg-[#1a1f2e] text-white">{o}</option>)}
      </select>
    </div>
  );
}

function ActionItem({ icon: Icon, label, onClick, highlight, danger }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all text-left",
        highlight ? "bg-accent text-white hover:bg-accent/90" : 
        danger ? "text-destructive hover:bg-destructive/10" :
        "text-white/80 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
