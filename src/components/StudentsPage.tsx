import React, { useState, useRef, useEffect } from 'react';
import { Student, AppUser } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Edit3,
  Printer, 
  Download, 
  User, 
  Phone, 
  MessageCircle, 
  Lock, 
  KeyRound, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Camera,
  Upload,
  UserCheck,
  X,
  Save
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface StudentsPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  saveData: (updatedStudents: Student[], updatedUsers?: AppUser[]) => void;
  users?: AppUser[];
}

export default function StudentsPage({ students, setStudents, saveData, users = [] }: StudentsPageProps) {
  // Helper to generate next auto student ID
  const generateNextId = (currentList: Student[]) => {
    const count = currentList.length + 1;
    const numStr = count.toString().padStart(3, '0');
    return `STD-${numStr}`;
  };

  // Form State
  const [name, setName] = useState('');
  const [id, setId] = useState(() => generateNextId(students));
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [form, setForm] = useState('Class 1');
  const [section, setSection] = useState('Section A');
  const [age, setAge] = useState('');
  const [fee, setFee] = useState('50');
  const [mother, setMother] = useState('');
  const [guardian, setGuardian] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [photo, setPhoto] = useState<string>('');

  // Login credentials for student and parent
  const [studentUser, setStudentUser] = useState('');
  const [studentPass, setStudentPass] = useState('123');
  const [parentUser, setParentUser] = useState('');
  const [parentPass, setParentPass] = useState('123');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterForm, setFilterForm] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Student | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto update generated ID & default usernames when name or students change
  useEffect(() => {
    if (!id || id.startsWith('STD-')) {
      setId(generateNextId(students));
    }
  }, [students]);

  const handleNameChange = (val: string) => {
    setName(val);
    const cleanFirstName = val.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    if (cleanFirstName) {
      setStudentUser(cleanFirstName);
      setParentUser(`w_${cleanFirstName}`);
    }
  };

  // Handle Photo Upload & Base64 conversion (No random default image!)
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

    // Check if ID already exists
    if (students.some(s => s.id.toLowerCase() === id.trim().toLowerCase())) {
      alert("ID-gan horey ayaa loo isticmaalay! Fadlan dooro ID kale.");
      return;
    }

    const cleanStudentUsername = studentUser.trim() || id.trim().toLowerCase();
    const cleanStudentPassword = studentPass.trim() || '123';
    const cleanParentUsername = parentUser.trim() || `p_${id.trim().toLowerCase()}`;
    const cleanParentPassword = parentPass.trim() || '123';

    // Only save photo if user uploaded one, otherwise empty string (handled by UserAvatar)
    const newStudent: Student = {
      id: id.trim(),
      name: name.trim(),
      img: photo || '',
      gender,
      form,
      section,
      age: age || "0",
      mother: mother.trim(),
      guardian: guardian.trim() || `${name.trim()} Parent`,
      parentPhone: parentPhone.trim(),
      feeAmount: Number(fee) || 0,
      feePaid: false,
      username: cleanStudentUsername,
      password: cleanStudentPassword,
      parentUsername: cleanParentUsername,
      parentPassword: cleanParentPassword
    };

    const updatedStudents = [...students, newStudent];

    // Create user accounts automatically for Student & Parent
    let updatedUsers = [...users];

    // 1. Student User Account
    const existingStudentUserIndex = updatedUsers.findIndex(u => u.username.toLowerCase() === cleanStudentUsername.toLowerCase());
    const studentUserObj: AppUser = {
      id: `user_std_${id.trim().replace(/[^a-zA-Z0-9]/g, '_')}`,
      username: cleanStudentUsername,
      password: cleanStudentPassword,
      role: 'student',
      fullName: name.trim(),
      assignedStudentId: id.trim(),
      createdAt: new Date().toISOString()
    };
    if (existingStudentUserIndex >= 0) {
      updatedUsers[existingStudentUserIndex] = studentUserObj;
    } else {
      updatedUsers.push(studentUserObj);
    }

    // 2. Parent User Account
    const existingParentUserIndex = updatedUsers.findIndex(u => u.username.toLowerCase() === cleanParentUsername.toLowerCase());
    const parentUserObj: AppUser = {
      id: `user_prt_${id.trim().replace(/[^a-zA-Z0-9]/g, '_')}`,
      username: cleanParentUsername,
      password: cleanParentPassword,
      role: 'parent',
      fullName: guardian.trim() ? `Waalidka (${guardian.trim()})` : `Waalidka (${name.trim()})`,
      assignedStudentId: id.trim(),
      phone: parentPhone.trim(),
      createdAt: new Date().toISOString()
    };
    if (existingParentUserIndex >= 0) {
      updatedUsers[existingParentUserIndex] = parentUserObj;
    } else {
      updatedUsers.push(parentUserObj);
    }

    setStudents(updatedStudents);
    saveData(updatedStudents, updatedUsers);

    setSuccessMsg(`Ardayga ${name.trim()} (ID: ${id.trim()}) iyo akoonada login-ka waalidka/ardayga si guul leh ayaa loo diwaangeliyey!`);
    setTimeout(() => setSuccessMsg(''), 5000);

    // Reset fields & generate next ID
    setName('');
    setId(generateNextId(updatedStudents));
    setAge('');
    setMother('');
    setGuardian('');
    setParentPhone('');
    setPhoto('');
    setStudentUser('');
    setParentUser('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({ ...student });
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
    if (!editFormData || !editingStudent) return;

    const updatedStudentList = students.map(s => {
      if (s.id === editingStudent.id) {
        return { ...editFormData };
      }
      return s;
    });

    // Also update student and parent user credentials if users array is provided
    let updatedUsers = [...users];
    const stdUsername = editFormData.username || editFormData.id.toLowerCase();
    const prtUsername = editFormData.parentUsername || `p_${editFormData.id.toLowerCase()}`;

    // Update or add student user
    const stdUserIdx = updatedUsers.findIndex(u => u.assignedStudentId === editingStudent.id && u.role === 'student');
    if (stdUserIdx >= 0) {
      updatedUsers[stdUserIdx] = {
        ...updatedUsers[stdUserIdx],
        username: stdUsername,
        password: editFormData.password || updatedUsers[stdUserIdx].password,
        fullName: editFormData.name
      };
    }

    // Update or add parent user
    const prtUserIdx = updatedUsers.findIndex(u => u.assignedStudentId === editingStudent.id && u.role === 'parent');
    if (prtUserIdx >= 0) {
      updatedUsers[prtUserIdx] = {
        ...updatedUsers[prtUserIdx],
        username: prtUsername,
        password: editFormData.parentPassword || updatedUsers[prtUserIdx].password,
        fullName: editFormData.guardian ? `Waalidka (${editFormData.guardian})` : `Waalidka (${editFormData.name})`,
        phone: editFormData.parentPhone
      };
    }

    setStudents(updatedStudentList);
    saveData(updatedStudentList, updatedUsers);

    setSuccessMsg(`Xogta ardayga (${editFormData.name}) si guul leh ayaa loo cusboonaysiiyey!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    setEditingStudent(null);
    setEditFormData(null);
  };

  const handleDelete = (studentId: string) => {
    if (confirm("Ma hubtaa inaad tirtirto ardaygan?")) {
      const updated = students.filter(s => s.id !== studentId);
      // Also clean up users
      const updatedUsers = users.filter(u => u.assignedStudentId !== studentId);
      setStudents(updated);
      saveData(updated, updatedUsers);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let table = document.getElementById('student-list-table');
    if (!table) return;
    let html = table.outerHTML;
    let url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
    let link = document.createElement('a');
    link.download = 'Student_List.xls';
    link.href = url;
    link.click();
  };

  const openWhatsApp = (phoneStr?: string, studentName?: string) => {
    if (!phoneStr || !phoneStr.trim()) {
      alert("Ardaygan ma laha taleefan WhatsApp oo diiwaangashan!");
      return;
    }
    // Clean phone number (remove spaces, plus, hyphens)
    const cleanPhone = phoneStr.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Asc Waalidka ${studentName || 'ardayga'}, waxaan idiin kaga soo xiriiraynaa Iskuulka.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.guardian && s.guardian.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesForm = filterForm === 'All' || s.form === filterForm;
    return matchesSearch && matchesForm;
  });

  return (
    <div className="space-y-6">
      {/* Registration Form Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                Diwaangelinta Ardayga & Akoonada
              </h2>
              <p className="text-xs text-slate-500">
                Geli xogta ardayga & waalidka (ID-ga waa auto, akoonada login-kana si toos ah ayaa loo samaynayaa)
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
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Magaca Buuxa (Full Name) *
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Geli magaca ardayga oo saddexan" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Student ID (Auto)</span>
                <span className="text-[10px] text-blue-600 font-semibold lowercase">is-bedeli kara</span>
              </label>
              <input 
                type="text" 
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="STD-001" 
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

          {/* Academic & Parent Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Fasalka (Class)</label>
              <select 
                value={form} 
                onChange={(e) => setForm(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Qeybta (Section)</label>
              <select 
                value={section} 
                onChange={(e) => setSection(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Da'da (Age)</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="tusaale: 12" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Lacagta Bisha ($ Fee)</label>
              <input 
                type="number" 
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="50" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Guardian / WhatsApp Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Magaca Waalidka / Mas'uulka (Guardian)
              </label>
              <input 
                type="text" 
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
                placeholder="Magaca Aabaha / Mas'uulka" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Waalidka (Parent Phone)</span>
              </label>
              <input 
                type="tel" 
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="tusaale: +25261XXXXXXX" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Magaca Hooyada (Mother)</label>
              <input 
                type="text" 
                value={mother}
                onChange={(e) => setMother(e.target.value)}
                placeholder="Magaca Hooyada" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Photo & Login Accounts */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#042954] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#ffae01]" />
                  <span>Akoonada Login-ka & Sawirka (Credentials & Photo)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sawirka haddii la galiyo oo kaliya ayaa la muujinayaa. Akoonaduna si toos ah ayaa loogu xiriirinayaa nidaamka.
                </p>
              </div>

              {/* Photo Upload Box */}
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
                    id="student-photo-upload"
                  />
                  <label 
                    htmlFor="student-photo-upload"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-purple-900 uppercase">Username Ardayga</label>
                <input 
                  type="text" 
                  value={studentUser}
                  onChange={(e) => setStudentUser(e.target.value)}
                  placeholder="tusaale: axmed" 
                  className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-purple-950 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-purple-900 uppercase">Password Ardayga</label>
                <input 
                  type="text" 
                  value={studentPass}
                  onChange={(e) => setStudentPass(e.target.value)}
                  placeholder="123" 
                  className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-purple-950 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-emerald-900 uppercase">Username Waalidka</label>
                <input 
                  type="text" 
                  value={parentUser}
                  onChange={(e) => setParentUser(e.target.value)}
                  placeholder="tusaale: w_axmed" 
                  className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-950 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-emerald-900 uppercase">Password Waalidka</label>
                <input 
                  type="text" 
                  value={parentPass}
                  onChange={(e) => setParentPass(e.target.value)}
                  placeholder="123" 
                  className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-950 outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#042954] hover:bg-[#031d3d] text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#ffae01]" />
            <span>Diiwaangeli Ardayga & Akoonada</span>
          </button>
        </form>
      </div>

      {/* Student List View with Search & Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Liiska Ardayda ({filteredStudents.length})
            </h2>
            <p className="text-xs text-slate-500">Dhammaan ardayda ka diiwaangashan iskuulka</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 no-print">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi arday (Magac, ID, Waalid)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={filterForm} 
              onChange={(e) => setFilterForm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="All">Dhammaan Fasalada (All Classes)</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Form 1">Form 1</option>
              <option value="Form 2">Form 2</option>
              <option value="Form 3">Form 3</option>
              <option value="Form 4">Form 4</option>
            </select>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs sm:text-sm">
            Arday lama helin. Fadlan buuxi foomka sare si aad arday cusub ugu darto.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table id="student-list-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3">Sawir</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Magaca</th>
                    <th className="p-3">Fasalka</th>
                    <th className="p-3">Waalidka & WhatsApp</th>
                    <th className="p-3">Akoonada</th>
                    <th className="p-3 text-right no-print">Tallaabo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <UserAvatar name={s.name} photo={s.img} size="md" role="student" />
                      </td>
                      <td className="p-3 font-mono font-bold text-[#042954]">{s.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.gender} &bull; {s.age || '?'} jir</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                          {s.form}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.section}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{s.guardian || '-'}</div>
                        {s.parentPhone ? (
                          <button
                            onClick={() => openWhatsApp(s.parentPhone, s.name)}
                            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                            title="Kala hadal WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>{s.parentPhone}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Taleefan la'aan</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-[10px] text-slate-600">
                          <span className="text-purple-700 font-semibold">Arday:</span> {s.username || s.id}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          <span className="text-emerald-700 font-semibold">Waalid:</span> {s.parentUsername || `p_${s.id}`}
                        </div>
                      </td>
                      <td className="p-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Wax ka bedel (Edit)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
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
              {filteredStudents.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={s.name} photo={s.img} size="md" role="student" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">ID: {s.id} &bull; {s.form}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                        title="Wax ka bedel"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Tirtir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Waalidka</span>
                      <span className="font-semibold text-slate-800 truncate block">{s.guardian || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Section</span>
                      <span className="font-semibold text-slate-800">{s.section}</span>
                    </div>
                  </div>

                  {s.parentPhone && (
                    <button
                      onClick={() => openWhatsApp(s.parentPhone, s.name)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 border border-emerald-200"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Kala Hadal WhatsApp ({s.parentPhone})</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && editFormData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Wax ka bedel Ardayga: {editingStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {editingStudent.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setEditFormData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Magaca Ardayga (Full Name)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fasalka (Class / Form)</label>
                  <select
                    value={editFormData.form}
                    onChange={(e) => setEditFormData({ ...editFormData, form: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Section</label>
                  <select
                    value={editFormData.section}
                    onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
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
                  <label className="text-xs font-bold text-slate-700">Da'da (Age)</label>
                  <input
                    type="number"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lacagta Bishii ($ Fee)</label>
                  <input
                    type="number"
                    value={editFormData.feeAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, feeAmount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Magaca Hooyada</label>
                  <input
                    type="text"
                    value={editFormData.mother}
                    onChange={(e) => setEditFormData({ ...editFormData, mother: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Waalidka / Masuulka (Guardian)</label>
                  <input
                    type="text"
                    value={editFormData.guardian}
                    onChange={(e) => setEditFormData({ ...editFormData, guardian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Taleefanka Waalidka (WhatsApp Phone)</label>
                  <input
                    type="tel"
                    value={editFormData.parentPhone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    placeholder="Tusaale: +25261XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Photo Change in Edit */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={editFormData.name} photo={editFormData.img} size="md" role="student" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Sawirka Ardayga</span>
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
                <span className="text-xs font-bold text-[#042954] block">Akoonada Login-ka (Login Credentials)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Username Ardayga</label>
                    <input
                      type="text"
                      value={editFormData.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-purple-900 block mb-1">Password Ardayga</label>
                    <input
                      type="text"
                      value={editFormData.password || '123'}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">Username Waalidka</label>
                    <input
                      type="text"
                      value={editFormData.parentUsername || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, parentUsername: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">Password Waalidka</label>
                    <input
                      type="text"
                      value={editFormData.parentPassword || '123'}
                      onChange={(e) => setEditFormData({ ...editFormData, parentPassword: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(null);
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
