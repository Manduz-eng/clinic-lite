'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Wallet, 
  Calculator, 
  ShoppingCart, 
  Users, 
  ShieldCheck,
  Search,
  Printer,
  FileBarChart,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_SECTIONS = [
  {
    title: 'Clinical Reports',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    reports: [
      { id: 'registry', name: 'Patient Registry Report', description: 'Complete list of registered patients and their demographics' },
      { id: 'visits', name: 'Daily Visit Summary', description: 'Overview of all consultations and hospital visits' },
      { id: 'triage', name: 'Triage & Vitals Logs', description: 'Detailed records of patient vitals and triage status' },
      { id: 'diagnoses', name: 'Morbidity Report', description: 'Statistical breakdown of diagnoses and disease patterns' },
    ]
  },
  {
    title: 'Revenue & Billing',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    reports: [
      { id: 'cash_collection', name: 'Cash Collection Report', description: 'Daily summary of all cash, card, and mobile payments' },
      { id: 'insurance_claims', name: 'Insurance Claims Summary', description: 'Status and value of pending and settled claims' },
      { id: 'debtors', name: 'Debtors Ledger', description: 'Outstanding balances categorized by patient or insurer' },
    ]
  },
  {
    title: 'Accounting & Budgeting',
    icon: Calculator,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    reports: [
      { id: 'pnl', name: 'Profit & Loss Statement', description: 'Comprehensive financial health overview' },
      { id: 'expenses', name: 'Expense Breakdown', description: 'Categorized clinic expenditures and operational costs' },
      { id: 'budget', name: 'Budget vs Actual', description: 'Comparison of planned spending against actual costs' },
    ]
  },
  {
    title: 'Procurement & Inventory',
    icon: ShoppingCart,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    reports: [
      { id: 'stock_valuation', name: 'Inventory Valuation', description: 'Total value of all pharmaceutical and general stock' },
      { id: 'expiry', name: 'Stock Expiry Report', description: 'Alerts for drugs and items nearing their expiry date' },
      { id: 'purchases', name: 'Purchase Order History', description: 'Summary of all procurement activities and supplier logs' },
    ]
  },
  {
    title: 'Human Resources',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    reports: [
      { id: 'staff_performance', name: 'Staff Activity Log', description: 'Productivity metrics and patient load per staff member' },
      { id: 'payroll', name: 'Payroll Summary', description: 'Monthly salary, bonuses, and deduction breakdowns' },
    ]
  },
  {
    title: 'Security & Audit',
    icon: ShieldCheck,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    reports: [
      { id: 'func_audit', name: 'System Functionality Audit', description: 'Report on how each user uses system features' },
      { id: 'usage_audit', name: 'System Usage Audit', description: 'Logs of what every user has done or attempted to do' },
    ]
  },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const renderPrintableReport = () => {
    if (activeReport === 'registry') {
      return (
        <div className="bg-white text-black p-10 rounded-xl shadow-2xl animate-in zoom-in-95 duration-500 max-w-4xl mx-auto border border-gray-200">
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-black">CO</div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">ClinicOS HMIS v.1.00</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Central Medical Registry</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest">Report Date</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-black uppercase mb-4 text-center border-b border-gray-100 pb-2">Patient Registry Report</h2>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-4 py-3 font-black">OPD No</th>
                  <th className="px-4 py-3 font-black">Full Name</th>
                  <th className="px-4 py-3 font-black">Gender</th>
                  <th className="px-4 py-3 font-black">ID Number</th>
                  <th className="px-4 py-3 font-black">Telephone</th>
                  <th className="px-4 py-3 font-black">Town</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-bold">CO-PAT-001</td>
                  <td className="px-4 py-3 font-black uppercase">DOE JOHN</td>
                  <td className="px-4 py-3 font-bold">MALE</td>
                  <td className="px-4 py-3">12345678</td>
                  <td className="px-4 py-3 font-mono">0711223344</td>
                  <td className="px-4 py-3">NAIROBI</td>
                </tr>
                {/* Dynamic rows would go here */}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-900 mt-10">
            <p className="text-[10px] italic text-gray-500 font-medium">Generated by Admin SuperUser | Secure Audit: Func-099X</p>
            <button className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors no-print" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-20">
        <FileBarChart className="w-16 h-16 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest">Select a report to generate</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between bg-card/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-foreground font-display tracking-tight uppercase">System Reporting Hub</h1>
        </div>
        <div className="flex items-center gap-2">
           {activeReport && (
             <Button variant="ghost" className="h-9 text-[10px] font-black uppercase tracking-widest" onClick={() => setActiveReport(null)}>
               Back to Menu
             </Button>
           )}
           <Badge variant="primary" className="h-9 px-4 text-[10px] font-black tracking-widest uppercase bg-primary/20 text-primary border-primary/20">
             Audit-Ready Framework
           </Badge>
        </div>
      </div>

      {!activeReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_SECTIONS.map((section) => (
            <Card key={section.title} className="border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-500">
              <CardHeader className={cn("py-4 flex flex-row items-center gap-3", section.bg)}>
                <section.icon className={cn("w-5 h-5", section.color)} />
                <CardTitle className="text-sm font-black tracking-tight uppercase">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {section.reports.map((report) => (
                  <button 
                    key={report.id} 
                    onClick={() => setActiveReport(report.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all group/item border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-foreground group-hover/item:text-primary transition-colors uppercase tracking-tight">{report.name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-medium line-clamp-1">{report.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderPrintableReport()}
        </div>
      )}
    </div>
  );
}
