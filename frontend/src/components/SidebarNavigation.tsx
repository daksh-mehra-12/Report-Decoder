import React, { useState } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  GitCompare,
  BookOpen,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Lock,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Shield,
  ChevronRight,
  Activity
} from 'lucide-react';
import { User as UserType } from '../types';
import logoImg from '../assets/lablens_logo.png';

interface SidebarNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload Report', icon: UploadCloud },
        { id: 'reports', label: 'My Reports', icon: FileText },
      ]
    },
    {
      label: 'Analysis',
      items: [
        { id: 'comparison', label: 'Compare Reports', icon: GitCompare },
        { id: 'visitready', label: 'VisitReady™', icon: CalendarCheck },
        { id: 'trusttrace', label: 'TrustTrace™', icon: ShieldCheck },
      ]
    },
    {
      label: 'Learning',
      items: [
        { id: 'knowledge', label: 'Medical Resources', icon: BookOpen },
        { id: 'chat', label: 'Ask LabLens', icon: Sparkles },
      ]
    },
    {
      label: 'Account',
      items: [
        { id: 'privacy', label: 'Profile & Privacy', icon: Lock },
        { id: 'help', label: 'Help & Limitations', icon: HelpCircle },
      ]
    },
  ];

  // Role-specific shortcuts
  const roleItems: Array<{ id: string; label: string; icon: any }> = [];
  if (currentUser?.role === 'doctor') {
    roleItems.push({ id: 'doctor', label: 'Doctor Portal', icon: Stethoscope });
  } else if (currentUser?.role === 'admin') {
    roleItems.push({ id: 'admin', label: 'Admin Portal', icon: Shield });
  }

  const handleSelectTab = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => {
    const isActive = currentTab === id;
    return (
      <button
        onClick={() => handleSelectTab(id)}
        className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
          isActive
            ? 'bg-[#204D3B] text-white shadow-md border border-[#A5BEB0]/30'
            : 'text-[#E5EEE6]/80 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#A5BEB0]" />
        )}

        <div className="flex items-center gap-3 pl-1">
          <Icon
            className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
              isActive ? 'text-[#A5BEB0]' : 'text-[#A5BEB0]/70 group-hover:text-white'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>

        {isActive && (
          <ChevronRight className="w-3.5 h-3.5 text-[#A5BEB0] flex-shrink-0" />
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#25292B] text-white">
      {/* ─── Branding with Circular Logo ─── */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Circular logo part extracted cleanly without white background */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border border-[#A5BEB0]/40 flex items-center justify-center bg-[#25292B]">
              <img
                src={logoImg}
                alt="LabLens Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">LabLens</span>
              <span className="text-[9px] text-[#A5BEB0] font-mono tracking-widest uppercase font-bold">AI</span>
            </div>
            <span className="text-[10px] text-[#A5BEB0]/80 font-mono tracking-wide block">REPORT, DECODED</span>
          </div>
        </div>

        {/* Animated operational status */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#A5BEB0] font-mono">
          <div className="relative w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-[#A5BEB0] animate-ping opacity-75" />
            <span className="relative block w-1.5 h-1.5 rounded-full bg-[#A5BEB0]" />
          </div>
          <span>Systems active & secure</span>
        </div>
      </div>

      {/* ─── Role Shortcut ─── */}
      {roleItems.length > 0 && (
        <div className="px-3 pt-3">
          {roleItems.map(item => (
            <NavItem key={item.id} {...item} />
          ))}
          <div className="mt-2 border-t border-white/10" />
        </div>
      )}

      {/* ─── Navigation Groups ─── */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5">
              <span className="text-[9px] font-bold text-[#A5BEB0]/60 uppercase tracking-[0.14em] font-mono">
                {group.label}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.id} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── User Profile & Logout ─── */}
      <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
        {currentUser && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#204D3B] border border-[#A5BEB0]/40 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{currentUser.full_name}</div>
              <div className="flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-[#A5BEB0]" />
                <span className="text-[10px] text-[#A5BEB0] font-mono capitalize">{currentUser.role}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {/* Build tag */}
        <div className="text-center text-[9px] text-[#A5BEB0]/50 font-mono pt-1">
          LabLens Platform • TriLogix
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile Header Bar ─── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#25292B] border-b border-white/10 z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#A5BEB0]/40">
            <img src={logoImg} alt="LabLens" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-base text-white font-mono">LabLens</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#E5EEE6] hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Mobile Backdrop ─── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ─── Sidebar Container ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#25292B] border-r border-[#204D3B]/40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 text-[#E5EEE6] hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <SidebarContent />
      </aside>
    </>
  );
};
