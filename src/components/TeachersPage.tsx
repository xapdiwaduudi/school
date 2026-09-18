import React, { useState, useRef, useEffect } from 'react';
import { Teacher, AppUser } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Edit3,
  User, 
  Phone, 
  MessageCircle, 
  KeyRound, 
  BookOpen, 
  Camera, 
  CheckCircle,
  Search,
  X,
  Save,
  Upload
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface TeachersPageProps {
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  saveData: (updatedTeachers: Teacher[], updatedUsers?: AppUser[]) => void;
  users?: AppUser[];
  subjects?: string[];
}

export default function TeachersPage({ 
  teachers, 
  setTeachers, 
  saveData, 
  users = [],
  subjects = ["Somali", "English", "Arabic", "Maths", "Agriculture", "Physics", "Biology", "ICT"]
}: TeachersPageProps) {
  // Helper to generate next auto teacher ID
  const generateNextId = (currentList: Teacher[]) => {
    const count = currentList.length + 1;
    const numStr = count.toString().padStart(3, '0');
    return `TCH-${numStr}`;
  };

  const [name, setName] = useState('');
  const [id, setId] = useState(() => generateNextId(teachers));
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [subject, setSubject] = useState(subjects[0] || 'Somali');
  const [photo, setPhoto] = useState<string>('');

  // Login credentials for teacher
  const [teacherUser, setTeacherUser] = useState('');
  const [teacherPass, setTeacherPass] = useState('123');

  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editFormData, setEditFormData] = useState<Teacher | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || id.startsWith('TCH-')) {
      setId(generateNextId(teachers));
    }
  }, [teachers]);

  const handleNameChange = (val: string) => {
    setName(val);
    const cleanFirstName = val.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    if (cleanFirstName) {
      setTeacherUser(`ustaad_${cleanFirstName}`);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !id.trim()) {
      alert("Fadlan magaca iyo ID-ga geli!");
      return;
    }

    if (teachers.some(t => t.id.toLowerCase() === id.trim().toLowerCase())) {
      alert("ID-gan horey ayaa loo isticmaalay! Fadlan dooro ID kale.");
      return;
    }

    const cleanTeacherUsername = teacherUser.trim() || id.trim().toLowerCase();
    const cleanTeacherPassword = teacherPass.trim() || '123';

    const newTeacher: Teacher = {
      id: id.trim(),
      name: name.trim(),
      img: photo || '',
      gender,
      phone: phone.trim(),
      age: age || "0",
      subject: subject.trim() || (subjects[0] || "General"),
      username: cleanTeacherUsername,
      password: cleanTeacherPassword
    };

    const updatedTeachers = [...teachers, newTeacher];

    // Create / Update user account for Teacher
    let updatedUsers = [...users];
    const existingIndex = updatedUsers.findIndex(u => u.username.toLowerCase() === cleanTeacherUsername.toLowerCase());
    const teacherUserObj: AppUser = {
      id: `user_tch_${id.trim().replace(/[^a-zA-Z0-9]/g, '_')}`,
      username: cleanTeacherUsername,
      password: cleanTeacherPassword,
      role: 'teacher',
      fullName: name.trim(),
      assignedSubject: subject.trim() || (subjects[0] || "General"),
      phone: phone.trim(),
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedUsers[existingIndex] = teacherUserObj;
    } else {
      updatedUsers.push(teacherUserObj);
    }

    setTeachers(updatedTeachers);
    saveData(updatedTeachers, updatedUsers);

    setSuccessMsg(`Macallin ${name.trim()} (Maadada: ${newTeacher.subject}) iyo akoonka login-ka si guul leh ayaa loo diiwaangeliyey!`);
    setTimeout(() => setSuccessMsg(''), 5000);

    // Reset
    setName('');
    setId(generateNextId(updatedTeachers));
    setPhone('');
    setAge('');
    setPhoto('');
    setTeacherUser('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({ ...teacher });
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editFormData) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditFormData({
            ...editFormData,
            img: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editingTeacher) return;

    const updatedTeacherList = teachers.map(t => {
      if (t.id === editingTeacher.id) {
        return { ...editFormData };
      }
      return t;
    });

    // Update corresponding teacher user in users list
    let updatedUsers = [...users];
    const tchUsername = editFormData.username || editFormData.id.toLowerCase();
    const userIdx = updatedUsers.findIndex(u => (u.username === editingTeacher.username || u.fullName === editingTeacher.name) && u.role === 'teacher');
    
    if (userIdx >= 0) {
      updatedUsers[userIdx] = {
        ...updatedUsers[userIdx],
        username: tchUsername,
        password: editFormData.password || updatedUsers[userIdx].password,
        fullName: editFormData.name,
        assignedSubject: editFormData.subject,
        phone: editFormData.phone
      };
    }

    setTeachers(updatedTeacherList);
    saveData(updatedTeacherList, updatedUsers);

    setSuccessMsg(`Xogta macallin (${editFormData.name}) si guul leh ayaa loo cusboonaysiiyey!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    setEditingTeacher(null);
    setEditFormData(null);
  };

  const handleDelete = (teacherId: string) => {
    if (confirm("Ma hubtaa inaad tirtirto macalinkan?")) {
      const teacherToDelete = teachers.find(t => t.id === teacherId);
      const updated = teachers.filter(t => t.id !== teacherId);
      const updatedUsers = users.filter(u => !(u.role === 'teacher' && (u.username === teacherToDelete?.username || u.fullName === teacherToDelete?.name)));
      setTeachers(updated);
      saveData(updated, updatedUsers);
    }
  };

  const openWhatsApp = (phoneStr?: string, teacherName?: string) => {
    if (!phoneStr || !phoneStr.trim()) {
      alert("Macallinkan ma laha taleefan WhatsApp oo diiwaangashan!");
      return;
    }
    const cleanPhone = phoneStr.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Asc Ustaad ${teacherName || ''}, waxaan idiin kaga soo xiriiraynaa Iskuulka.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Registration Form Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                Diwaangelinta Macalinka & Akoonka
              </h2>
              <p className="text-xs text-slate-500">
                Geli xogta macalinka, maadada uu dhigo, iyo akoonka uu ku geli doono
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Magaca Macalinka (Full Name) *
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Geli magaca macalinka" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Teacher ID (Auto)</span>
                <span className="text-[10px] text-amber-600 font-semibold lowercase">is-bedeli kara</span>
              </label>
              <input 
                type="text" 
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="TCH-001" 
                className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold font-mono text-[#042954] outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Lab / Dheddig (Gender)</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="Male">Lab (Male)</option>
                <option value="Female">Dheddig (Female)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Maadada uu dhigo (Assigned Subject) *</span>
              </label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="px-4 py-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-sm font-bold text-blue-950 outline-none focus:bg-white focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Taleefan / WhatsApp Phone</span>
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="tusaale: +25261XXXXXXX" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Da'da (Age)</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="tusaale: 30" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Credentials & Photo */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#042954] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#ffae01]" />
                  <span>Akoonka Login-ka Macalinka & Sawirka</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Macallinku wuxuu nidaamka ku gelayaa akoonkan, kaliyana wuxuu gelin karaa dhibcaha maadadiisa.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-slate-300 overflow-hidden flex items-center justify-center bg-white shrink-0">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden" 
                    id="teacher-photo-upload"
                  />
                  <label 
                    htmlFor="teacher-photo-upload"
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>{photo ? 'Bedel Sawirka' : 'Soo Geli Sawir'}</span>
                  </label>
                  {photo && (
                    <button 
                      type="button" 
                      onClick={() => { setPhoto(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-[10px] text-rose-600 hover:underline mt-0.5 block"
                    >
                      Tirtir sawirka
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-blue-900 uppercase">Username Macalinka</label>
                <input 
                  type="text" 
                  value={teacherUser}
                  onChange={(e) => setTeacherUser(e.target.value)}
                  placeholder="tusaale: ustaad_axmed" 
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-950 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-blue-900 uppercase">Password Macalinka</label>
                <input 
                  type="text" 
                  value={teacherPass}
                  onChange={(e) => setTeacherPass(e.target.value)}
                  placeholder="123" 
                  className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-950 outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#042954] hover:bg-[#031d3d] text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#ffae01]" />
            <span>Diiwaangeli Macalinka</span>
          </button>
        </form>
      </div>

      {/* Teachers List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Liiska Macallimiinta ({filteredTeachers.length})
            </h2>
            <p className="text-xs text-slate-500">Dhammaan macallimiinta ka diiwaangashan iskuulka</p>
          </div>

          <div className="relative w-full sm:w-64 no-print">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi macallin ama maaddo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs sm:text-sm">
            Macallin lama helin. Fadlan buuxi foomka sare si aad macallin cusub ugu darto.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3">Sawir</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Magaca</th>
                    <th className="p-3">Maadada (Subject)</th>
                    <th className="p-3">Taleefan & WhatsApp</th>
                    <th className="p-3">Akoonka</th>
                    <th className="p-3 text-right no-print">Tallaabo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <UserAvatar name={t.name} photo={t.img} size="md" role="teacher" />
                      </td>
                      <td className="p-3 font-mono font-bold text-[#042954]">{t.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.gender} &bull; {t.age || '?'} jir</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold border border-blue-200 text-xs">
                          {t.subject}
                        </span>
                      </td>
                      <td className="p-3">
                        {t.phone ? (
                          <button
                            onClick={() => openWhatsApp(t.phone, t.name)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer"
                            title="Kala hadal WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.phone}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">Taleefan la'aan</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-slate-700 font-semibold">{t.username || t.id}</span>
                      </td>
                      <td className="p-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka bedel (Edit)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Tirtir (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {filteredTeachers.map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={t.name} photo={t.img} size="md" role="teacher" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                        <div className="text-[11px] text-blue-700 font-bold">{t.subject} &bull; ID: {t.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        title="Wax ka bedel"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Tirtir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {t.phone && (
                    <button
                      onClick={() => openWhatsApp(t.phone, t.name)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-emerald-200"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Kala Hadal WhatsApp ({t.phone})</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && editFormData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Wax ka bedel Macallinka: {editingTeacher.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {editingTeacher.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setEditFormData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Magaca Macalinka (Teacher Name)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Maadada uu dhigo (Subject)</label>
                  <select
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Jinsiga (Gender)</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Male">Lab (Male)</option>
                    <option value="Female">Dheddig (Female)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Taleefanka (WhatsApp Phone)</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+25261XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Da'da (Age)</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo Change */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={editFormData.name} photo={editFormData.img} size="md" role="teacher" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Sawirka Macallinka</span>
                    <span className="text-[11px] text-slate-500">Geli sawir cusub ama tirtir</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Upload New
                  </button>
                  {editFormData.img && (
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, img: '' })}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Login Credentials in Edit */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                <span className="text-xs font-bold text-[#042954] block">Akoonka Login-ka Macallinka</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-blue-950 block mb-1">Username</label>
                    <input
                      type="text"
                      value={editFormData.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-blue-950 block mb-1">Password</label>
                    <input
                      type="text"
                      value={editFormData.password || '123'}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeacher(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Ka noqo (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#042954] hover:bg-[#031d3d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4 text-[#ffae01]" />
                  <span>Keydi Isbedelka (Save Changes)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
