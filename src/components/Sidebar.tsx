import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Calendar, 
  TrendingDown, 
  FileEdit, 
  Search, 
  UserRound, 
  FileSpreadsheet, 
  Settings,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  UserCheck,
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  KeyRound,
  Trophy,
  MessageCircle,
  Sparkles,
  DollarSign,
  X
} from 'lucide-react';
import { AppUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schoolName: string;
  isOnline?: boolean;
  isSyncing?: boolean;
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchUser: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  pendingReceiptsCount?: number;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  schoolName, 
  isOnline = true, 
  isSyncing = false,
  currentUser,
  onLogout,
  onSwitchUser,
  isMobileOpen = false,
  setIsMobileOpen,
  pendingReceiptsCount = 0
}: SidebarProps) {
  
  // All possible menu items with role matrix
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'ranking', label: 'Class Ranking', icon: Trophy, roles: ['admin', 'vice_principal_1', 'vice_principal_2', 'teacher', 'student', 'parent'] },
    { id: 'ai-assistant', label: 'School AI Assistant', icon: Sparkles, roles: ['admin', 'vice_principal_1', 'vice_principal_2', 'teacher', 'student', 'parent'] },
    { id: 'chat', label: 'Wada-xiriirka (Chat)', icon: MessageCircle, roles: ['admin', 'vice_principal_1', 'vice_principal_2', 'teacher', 'student', 'parent'] },
    { id: 'student', label: 'Students', icon: GraduationCap, roles: ['admin'] },
    { id: 'teacher', label: 'Teachers', icon: Users, roles: ['admin'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'vice_principal_1'] },
    { id: 'fees', label: 'Fee Collection', icon: CreditCard, roles: ['admin', 'vice_principal_2'] },
    { id: 'accounting', label: 'Accounting & Treasury', icon: DollarSign, roles: ['admin', 'vice_principal_2'] },
    { id: 'schedule', label: 'Class Routine', icon: Calendar, roles: ['admin'] },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, roles: ['admin'] },
    { id: 'exam-input', label: 'Exam Entry', icon: FileEdit, roles: ['admin', 'teacher'] },
    { id: 'exam-portal', label: 'Exam Result', icon: Search, roles: ['admin', 'student'] },
    { id: 'parent', label: 'Parent Portal', icon: HeartHandshake, roles: ['admin', 'parent'] },
    { id: 'tracker', label: 'Academic Tracker', icon: UserRound, roles: ['admin'] },
    { id: 'report', label: 'Reports', icon: FileSpreadsheet, roles: ['admin'] },
    { id: 'users', label: 'Users & Passwords', icon: KeyRound, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const userRole = currentUser?.role || 'admin';
  const visibleMenuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-[#ffae01]" />;
      case 'vice_principal_1':
        return <CalendarCheck className="w-4 h-4 text-cyan-300" />;
      case 'vice_principal_2':
        return <CreditCard className="w-4 h-4 text-amber-300" />;
      case 'teacher':
        return <BookOpen className="w-4 h-4 text-blue-300" />;
      case 'parent':
        return <HeartHandshake className="w-4 h-4 text-emerald-300" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-purple-300" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Maamule (Admin)';
      case 'vice_principal_1':
        return 'Maamule Ku-xigeenka 1aad';
      case 'vice_principal_2':
        return 'Maamule Ku-xigeenka 2aad';
      case 'teacher':
        return `Macallin (${currentUser?.assignedSubject || 'Teacher'})`;
      case 'parent':
        return 'Waalid (Parent)';
      case 'student':
        return 'Arday (Student)';
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`w-64 bg-[#042954] text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-[#031a36] shadow-xl no-print z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="bg-[#ffae01] text-slate-900 py-3.5 px-4 font-bold text-base text-center font-display tracking-wide shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <GraduationCap className="w-6 h-6 text-slate-900 shrink-0" />
            <span className="truncate">{schoolName || "Xaaji Salaad School"}</span>
          </div>
          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-slate-900 hover:bg-black/10 rounded-lg"
              title="Xir Menu-ga"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current Logged-in User Profile Card */}
        {currentUser && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-[#031d3d] border border-[#063870] flex flex-col gap-2 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#0a417d] border border-blue-400/30 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.fullName || currentUser.username}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1">
                    {getRoleIcon()}
                    <span className="truncate">{getRoleLabel()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 pt-2 border-t border-[#063870]/80">
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    onSwitchUser();
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className="flex-1 py-1.5 px-2 bg-[#063870] hover:bg-[#084b96] text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Bedel User-ka"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#ffae01]" />
                  <span>Switch</span>
                </button>
              )}
              <button
                onClick={() => {
                  onLogout();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  userRole === 'admin' ? '' : 'flex-1 py-2 text-xs font-bold bg-rose-900/40 hover:bg-rose-900/70 text-rose-200'
                }`}
                title="Ka bax (Log Out)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Cloud Sync Status Badge */}
        <div className="mx-3 mt-2 px-3 py-1.5 rounded-lg bg-[#031e3f] border border-[#063870] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isOnline && (
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              )}
            </div>
            <span className="text-slate-300 font-medium text-[10px]">
              {isSyncing ? 'Syncing...' : isOnline ? 'Firebase Live Sync' : 'Offline Mode'}
            </span>
          </div>
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
          ) : (
            <CloudCheck className="w-3 h-3 text-emerald-400" />
          )}
        </div>

        {/* Menu items navigation */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-[#031a36] text-[#ffae01] border-l-4 border-[#ffae01] pl-3 shadow-inner font-bold' 
                    : 'text-slate-300 hover:bg-[#032044] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#ffae01]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.id === 'fees' && pendingReceiptsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {pendingReceiptsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#031a36] text-[11px] text-slate-400 text-center flex flex-col gap-1">
          <div className="text-emerald-400 font-semibold flex items-center justify-center gap-1 text-[10px]">
            <Cloud className="w-3 h-3" /> Online Real-Time Cloud
          </div>
          <div>&copy; {new Date().getFullYear()} School Management</div>
        </div>
      </aside>
    </>
  );
}
