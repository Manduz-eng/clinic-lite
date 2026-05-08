'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  UserSquare2, 
  FlaskConical, 
  Pill, 
  Receipt, 
  ShoppingCart, 
  Wallet, 
  Settings,
  Banknote,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: [] },
  { label: 'Reception', href: '/reception', icon: Users, roles: ['Admin', 'Receptionist', 'Doctor', 'Nurse'] },
  { label: 'Triage', href: '/triage', icon: ClipboardList, roles: ['Admin', 'Nurse'] },
  { label: 'OPD (Doctors)', href: '/opd', icon: Stethoscope, roles: ['Admin', 'Doctor'] },
  { label: 'Laboratory', href: '/laboratory', icon: FlaskConical, roles: ['Admin', 'Lab Technician', 'Doctor'] },
  { label: 'Pharmacy', href: '/pharmacy', icon: Pill, roles: ['Admin', 'Pharmacist'] },
  { label: 'Billing', href: '/billing', icon: Receipt, roles: ['Admin', 'Receptionist', 'Accountant', 'Pharmacist'] },
  { label: 'Inventory', href: '/inventory', icon: ShoppingCart, roles: ['Admin', 'Pharmacist', 'Procurement Officer'] },
  { label: 'Procurement', href: '/procurement', icon: Wallet, roles: ['Admin', 'Procurement Officer', 'Accountant'] },
  { label: 'Accounts', href: '/accounts', icon: Banknote, roles: ['Admin', 'Accountant'] },
  { label: 'Reports', href: '/reports', icon: ClipboardList, roles: ['Admin', 'Accountant', 'Doctor'] },
  { 
    label: 'System Settings', 
    href: '/admin/settings', 
    icon: Settings, 
    roles: ['Admin'],
    children: [
      { label: 'Configuration', href: '/admin/settings/configuration' }
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || (user?.role && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-72 bg-card/40 backdrop-blur-2xl border-r border-white/5 flex flex-col print:hidden">
      <div className="flex items-center h-20 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-black text-lg tracking-tighter">CO</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground font-display">ClinicOS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/80 leading-none">HMIS v.1.00</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const hasChildren = item.children && item.children.length > 0;
            
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    'nav-item group',
                    isActive && 'active'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                  {isActive && !hasChildren && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                  )}
                  {hasChildren && <ChevronDown className="ml-auto w-4 h-4 text-muted-foreground" />}
                </Link>
                
                {hasChildren && (isActive || pathname.startsWith(item.href)) && (
                  <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                          pathname === child.href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        )}
                      >
                        <div className={cn('w-1.5 h-1.5 rounded-full', pathname === child.href ? 'bg-primary' : 'bg-white/10')} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center overflow-hidden">
              <UserSquare2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate text-foreground">{user?.firstName || 'User'}</span>
              <span className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-widest">{user?.role || 'Staff'}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
