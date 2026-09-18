import React, { useState } from 'react';
import { AppUser, UserRole, Student, Teacher } from '../types';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  HeartHandshake, 
  Search, 
  Check, 
  X, 
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  CalendarCheck,
  CreditCard
} from 'lucide-react';

interface UsersManagementPageProps {
  users: AppUser[];
  setUsers: (users: AppUser[]) => void;
  saveData: (updatedUsers: AppUser[]) => void;
  students: Student[];
  teachers: Teacher[];
  subjects: string[];
}

export default function UsersManagementPage({
  users,
  setUsers,
  saveData,
  students,
  teachers,
  subjects
}: UsersManagementPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    role: UserRole;
    fullName: string;
    assignedSubject: string;
    assignedStudentId: string;
  }>({
    username: '',
    password: '',
    role: 'teacher',
    fullName: '',
    assignedSubject: subjects[0] || 'Somali',
    assignedStudentId: ''
  });

  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      username: '',
      password: '',
      role: 'teacher',
      fullName: '',
      assignedSubject: subjects[0] || 'Somali',
      assignedStudentId: students[0]?.id || ''
    });
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
      fullName: user.fullName || '',
      assignedSubject: user.assignedSubject || subjects[0] || '',
      assignedStudentId: user.assignedStudentId || ''
    });
    setShowAddModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = formData.username.trim();
    const cleanPassword = formData.password.trim();

    if (!cleanUsername) {
      alert("Fadlan geli Username ama ID-ga!");
      return;
    }
    if (!cleanPassword) {
      alert("Fadlan geli Password-ka!");
      return;
    }

    // Check duplicate username if adding new
    if (!editingUser) {
      const exists = users.some(u => u.username.toLowerCase().replace(/\s+/g, '') === cleanUsername.toLowerCase().replace(/\s+/g, ''));
      if (exists) {
        alert("Username-kan horey ayaa loo isticmaalay! Fadlan dooro mid kale.");
        return;
      }

      const newUser: AppUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        password: cleanPassword,
        role: formData.role,
        fullName: formData.fullName.trim() || cleanUsername,
        assignedSubject: formData.role === 'teacher' ? formData.assignedSubject : undefined,
        assignedStudentId: (formData.role === 'parent' || formData.role === 'student') ? formData.assignedStudentId : undefined,
        createdAt: new Date().toISOString()
      };

      const updated = [...users, newUser];
      setUsers(updated);
      saveData(updated);
      alert(`User-ka cusub (${cleanUsername}) si guul leh ayaa loo keydiyay!`);
    } else {
      // Editing existing user
      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username: cleanUsername,
            password: cleanPassword,
            role: formData.role,
            fullName: formData.fullName.trim() || cleanUsername,
            assignedSubject: formData.role === 'teacher' ? formData.assignedSubject : undefined,
            assignedStudentId: (formData.role === 'parent' || formData.role === 'student') ? formData.assignedStudentId : undefined,
          };
        }
        return u;
      });

      setUsers(updated);
      saveData(updated);
      alert(`Xogta user-ka (${cleanUsername}) waa la cusboonaysiiyay!`);
    }

    setShowAddModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (users.length <= 1) {
      alert("Ma tirtiri kartid user-ka kaliya ee nidaamka ku jira!");
      return;
    }
    if (user.username === 'admin1' && user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      alert("Kuma tirtiri kartid Admin-ka ugu dambeeya!");
      return;
    }

    if (window.confirm(`Ma hubtaa inaad tirtirto User-ka: "${user.username}" (${user.fullName || user.role})?`)) {
      const updated = users.filter(u => u.id !== user.id);
      setUsers(updated);
      saveData(updated);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.assignedSubject && u.assignedSubject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Admin</span>
          </span>
        );
      case 'vice_principal_1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
            <CalendarCheck className="w-3.5 h-3.5 text-cyan-700" />
            <span>Ku-xigeen 1aad</span>
          </span>
        );
      case 'vice_principal_2':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" />
            <span>Ku-xigeen 2aad</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>Macallin</span>
          </span>
        );
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
            <span>Waalid</span>
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
            <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
            <span>Arday</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900">
              Maamulka Users-ka iyo Furayaasha (Accounts & Passwords)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Halkan waxaad uga samayn kartaa qof walba (Admin, Macallin, Waalid, Arday) Username iyo Password gaar ah.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#ffae01]" />
          <span>Samee User Cusub</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Raadi username, magac ama maaddo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role:</span>
          {[
            { id: 'all', label: 'Dhammaan' },
            { id: 'admin', label: 'Admin' },
            { id: 'vice_principal_1', label: 'Ku-xigeen 1aad' },
            { id: 'vice_principal_2', label: 'Ku-xigeen 2aad' },
            { id: 'teacher', label: 'Macallin' },
            { id: 'parent', label: 'Waalid' },
            { id: 'student', label: 'Arday' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                roleFilter === r.id
                  ? 'bg-[#042954] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Username / ID</th>
                <th className="py-3 px-4">Magaca Buuxa</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Faahfaahin / Xayiraad</th>
                <th className="py-3 px-4 text-right">Ficilada (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Wax user ah oo shuruudahan buuxiyey lama helin.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {user.fullName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 font-semibold text-[11px]">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Muuji/Qari Password-ka"
                        >
                          {showPasswords[user.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {user.role === 'teacher' && (
                        <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded font-medium">
                          Maadada: {user.assignedSubject || 'Dhammaan'}
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-[11px] text-amber-700 font-semibold">
                          Dhammaan qeybaha (Full Access)
                        </span>
                      )}
                      {user.role === 'vice_principal_1' && (
                        <span className="text-[11px] text-cyan-700 font-semibold bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                          Xaadiriska Kaliya (Attendance Only)
                        </span>
                      )}
                      {user.role === 'vice_principal_2' && (
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                          Kharashka / Lacag Qabashada (Fee Collection Only)
                        </span>
                      )}
                      {user.role === 'parent' && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Parent Portal Only
                        </span>
                      )}
                      {user.role === 'student' && (
                        <span className="text-[11px] text-purple-700 font-medium">
                          Exam Result Portal Only
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                          title="Bedel Password ama Xogta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Tirtir User-ka"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-lg">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingUser ? `Bedel User-ka (${editingUser.username})` : 'Samee User Cusub'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Dooro Nooca User-ka (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#042954] focus:bg-white"
                >
                  <option value="vice_principal_1">Maamule Ku-xigeen 1aad (Attendance only - Xaadiris)</option>
                  <option value="vice_principal_2">Maamule Ku-xigeen 2aad (Fee Collection only - Lacag qabasho)</option>
                  <option value="teacher">Macallin (Teacher - Exam Entry only)</option>
                  <option value="parent">Waalid (Parent - Parent Portal only)</option>
                  <option value="student">Arday (Student - Exam Result only)</option>
                  <option value="admin">Admin (Maamule Sare - All Tabs)</option>
                </select>
              </div>

              {/* Username / ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Username / ID
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="tusaale: ustaad2, waalid_ahmed, arday101"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#042954] focus:bg-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Qofku ku geli doono</span>
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Geli Password-ka (tusaale: 123 ama pass2026)"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#042954] focus:bg-white"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Magaca Qofka (Full Name)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="tusaale: Ustaad Cali Maxamed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#042954] focus:bg-white"
                />
              </div>

              {/* If Teacher: Assigned Subject */}
              {formData.role === 'teacher' && (
                <div className="space-y-1.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <label className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                    Maadada uu Macallinku Dhigo (Assigned Subject)
                  </label>
                  <p className="text-[10px] text-blue-700 mb-1">
                    Macallinkani wuxuu gelin karaa oo kaliya dhibcaha maadadan loo qoondeeyo.
                  </p>
                  <select
                    value={formData.assignedSubject}
                    onChange={(e) => setFormData({ ...formData, assignedSubject: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4 text-[#ffae01]" />
                  <span>{editingUser ? 'Cusboonaysii' : 'Kaydi User-ka'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
