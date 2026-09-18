import React, { useState, useRef } from 'react';
import { Student, ExamResult, SchoolAccount } from '../types';
import { 
  Settings, 
  User, 
  Award, 
  BookOpen, 
  Sliders, 
  Database, 
  Search, 
  Save, 
  Plus, 
  Trash2, 
  FileJson,
  AlertTriangle,
  Cloud,
  CloudCheck,
  RefreshCw,
  Building2,
  Phone,
  CreditCard,
  Edit3,
  X,
  Copy,
  Check
} from 'lucide-react';
import { saveSchoolDataToCloud, fetchSchoolDataFromCloud } from '../firebase';
import { DEFAULT_ACCOUNTS } from '../accountsData';

interface SettingsPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  exams: ExamResult[];
  setExams: (exams: ExamResult[]) => void;
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
  passThreshold: number;
  setPassThreshold: (threshold: number) => void;
  schoolName: string;
  setSchoolName: (name: string) => void;
  saveAllData: (
    updatedStudents?: Student[], 
    updatedExams?: ExamResult[], 
    updatedSubjects?: string[],
    updatedThreshold?: number,
    updatedSchoolName?: string,
    updatedUsers?: any[],
    updatedMessages?: any[],
    updatedTransactions?: any[],
    updatedAccounts?: SchoolAccount[],
    updatedPaymentSubmissions?: any[]
  ) => void;
  clearAllData: () => void;
  accounts?: SchoolAccount[];
  setAccounts?: (accs: SchoolAccount[]) => void;
  saveAccounts?: (accs: SchoolAccount[]) => void;
}

export default function SettingsPage({
  students,
  setStudents,
  exams,
  setExams,
  subjects,
  setSubjects,
  passThreshold,
  setPassThreshold,
  schoolName,
  setSchoolName,
  saveAllData,
  clearAllData,
  accounts = DEFAULT_ACCOUNTS,
  setAccounts,
  saveAccounts
}: SettingsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'edit-accounts' | 'edit-student' | 'edit-exam' | 'edit-subject' | 'edit-system' | 'data-mgt'>('edit-accounts');

  // --- ACCOUNTS SETTINGS (Bank, Acc 411840, Tel +252906305090) ---
  const [editingAccount, setEditingAccount] = useState<SchoolAccount | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    bankName: '',
    accountNumber: '411840',
    phoneNumber: '+252906305090',
    initialBalance: 0,
    description: ''
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      name: '',
      bankName: '',
      accountNumber: '411840',
      phoneNumber: '+252906305090',
      initialBalance: 0,
      description: ''
    });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: SchoolAccount) => {
    setEditingAccount(acc);
    setAccountFormData({
      name: acc.name,
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      phoneNumber: acc.phoneNumber,
      initialBalance: acc.initialBalance || 0,
      description: acc.description || ''
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.name.trim() || !accountFormData.accountNumber.trim()) {
      alert("Fadlan geli magaca iyo lambarka account-ka!");
      return;
    }

    let updated: SchoolAccount[];
    if (editingAccount) {
      updated = accounts.map(a => {
        if (a.id === editingAccount.id) {
          return {
            ...a,
            name: accountFormData.name.trim(),
            bankName: accountFormData.bankName.trim() || accountFormData.name.trim(),
            accountNumber: accountFormData.accountNumber.trim(),
            phoneNumber: accountFormData.phoneNumber.trim(),
            initialBalance: Number(accountFormData.initialBalance) || 0,
            description: accountFormData.description.trim()
          };
        }
        return a;
      });
      alert("Account-ka si guul leh ayaa loo cusboonaysiiyey!");
    } else {
      const newAcc: SchoolAccount = {
        id: `acc_${Date.now()}`,
        name: accountFormData.name.trim(),
        bankName: accountFormData.bankName.trim() || accountFormData.name.trim(),
        accountNumber: accountFormData.accountNumber.trim(),
        phoneNumber: accountFormData.phoneNumber.trim(),
        initialBalance: Number(accountFormData.initialBalance) || 0,
        description: accountFormData.description.trim(),
        createdAt: new Date().toISOString()
      };
      updated = [...accounts, newAcc];
      alert("Account cusub ayaa lagu daray!");
    }

    if (setAccounts) setAccounts(updated);
    if (saveAccounts) {
      saveAccounts(updated);
    } else {
      saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updated);
    }

    setShowAccountModal(false);
  };

  const handleDeleteAccount = (accId: string) => {
    if (accounts.length <= 1) {
      alert("Ugu yaraan hal account waa inuu nidaamka ku jiraa!");
      return;
    }
    if (confirm("Ma hubtaa inaad tirtirto account-kan?")) {
      const updated = accounts.filter(a => a.id !== accId);
      if (setAccounts) setAccounts(updated);
      if (saveAccounts) {
        saveAccounts(updated);
      } else {
        saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updated);
      }
    }
  };

  // --- 1. Edit Student State & Functions ---
  const [editStudentSearchId, setEditStudentSearchId] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleFindStudentToEdit = () => {
    if (!editStudentSearchId.trim()) return;
    const found = students.find(s => s.id.toLowerCase() === editStudentSearchId.trim().toLowerCase());
    if (found) {
      setEditingStudent({ ...found });
    } else {
      alert("Lama helin ardaygan!");
      setEditingStudent(null);
    }
  };

  const handleUpdateStudentField = (field: keyof Student, value: any) => {
    if (!editingStudent) return;
    setEditingStudent(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveStudentEdit = () => {
    if (!editingStudent) return;
    const updatedStudents = students.map(s => s.id === editingStudent.id ? editingStudent : s);
    setStudents(updatedStudents);
    saveAllData(updatedStudents);
    alert("Xogta ardayga waa la cusboonaysiiyey!");
    setEditingStudent(null);
    setEditStudentSearchId('');
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Ma hubtaa inaad tirtirto ardaygan?")) {
      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      saveAllData(updatedStudents);
      setEditingStudent(null);
      setEditStudentSearchId('');
    }
  };

  // --- 2. Edit Exam State & Functions ---
  const [editExamSearchId, setEditExamSearchId] = useState('');
  const [editExamType, setEditExamType] = useState('Month 1');
  const [editingExam, setEditingExam] = useState<ExamResult | null>(null);

  const handleFindExamToEdit = () => {
    if (!editExamSearchId.trim()) return;
    const found = exams.find(e => e.studentId.toLowerCase() === editExamSearchId.trim().toLowerCase() && e.type === editExamType);
    if (found) {
      setEditingExam(JSON.parse(JSON.stringify(found)));
    } else {
      alert(`Lama helin natiijo imtixaan oo ku saabsan ${editExamType} ee ardaygan!`);
      setEditingExam(null);
    }
  };

  const handleUpdateExamMark = (subj: string, markVal: number) => {
    if (!editingExam) return;
    const marks = { ...editingExam.marks, [subj]: markVal };
    const values = Object.values(marks) as number[];
    const sum = values.reduce((a: number, b: number) => a + Number(b || 0), 0);
    const avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(1)) : 0;
    const status = avg >= passThreshold ? 'Pass' : 'Fail';

    setEditingExam({
      ...editingExam,
      marks,
      average: avg,
      status
    });
  };

  const handleSaveExamEdit = () => {
    if (!editingExam) return;
    const updatedExams = exams.map(e => (e.studentId === editingExam.studentId && e.type === editingExam.type) ? editingExam : e);
    setExams(updatedExams);
    saveAllData(undefined, updatedExams);
    alert("Natiijada imtixaanka waa la cusboonaysiiyey!");
    setEditingExam(null);
    setEditExamSearchId('');
  };

  const handleDeleteExam = () => {
    if (!editingExam) return;
    if (confirm("Ma hubtaa inaad tirtirto natiijadan imtixaanka?")) {
      const updatedExams = exams.filter(e => !(e.studentId === editingExam.studentId && e.type === editingExam.type));
      setExams(updatedExams);
      saveAllData(undefined, updatedExams);
      setEditingExam(null);
      setEditExamSearchId('');
    }
  };

  // --- 3. Subjects State & Functions ---
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    if (subjects.includes(newSubjectInput.trim())) {
      alert("Maadadan hore ayey u jirtay!");
      return;
    }
    const updated = [...subjects, newSubjectInput.trim()];
    setSubjects(updated);
    saveAllData(undefined, undefined, updated);
    setNewSubjectInput('');
    alert("Maaddada waa lagu daray!");
  };

  const handleDeleteSubject = (subToDelete: string) => {
    if (confirm(`Ma hubtaa inaad tirtirto maadada: ${subToDelete}?`)) {
      const updated = subjects.filter(s => s !== subToDelete);
      setSubjects(updated);
      saveAllData(undefined, undefined, updated);
    }
  };

  // --- 4. System Settings State & Functions ---
  const [tempThreshold, setTempThreshold] = useState<number>(passThreshold);
  const [tempSchoolName, setTempSchoolName] = useState<string>(schoolName);

  const handleUpdateSystem = () => {
    setPassThreshold(tempThreshold);
    setSchoolName(tempSchoolName);
    saveAllData(undefined, undefined, undefined, tempThreshold, tempSchoolName);
    alert("Habaynta nidaamka waa la cusboonaysiiyey!");
  };

  // --- 5. Backup & Restore Data Functions ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backupKey = 'XaajiSalaad_SchoolData';
    const localData = localStorage.getItem(backupKey) || localStorage.getItem('Akkhor_SchoolData');
    if (!localData) {
      alert("Wax xog ah ma kaydsana!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localData);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "XaajiSalaad_SchoolBackup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        JSON.parse(fileContent);
        localStorage.setItem('XaajiSalaad_SchoolData', fileContent);
        localStorage.setItem('Akkhor_SchoolData', fileContent);
        alert("Backup-ka waa la soo dhoofiyey! Bogga ayaa dib u cusboonaanaya.");
        window.location.reload();
      } catch (err) {
        alert("Fadlan geli file JSON oo sax ah!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">Qaybta Habaynta & Maamulka (Settings)</h2>
            <p className="text-xs text-slate-500">Maamul xisaabaadka EVC/Zaad (+252906305090, 411840), xogta ardayda, imtixaanaadka, iyo backup-ka</p>
          </div>
        </div>

        {/* Horizontal scrollable subtabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-2 mb-6">
          {[
            { id: 'edit-accounts', label: 'Xisaabaadka & Bangiyada', icon: Building2 },
            { id: 'edit-student', label: 'Wax ka bedel Arday', icon: User },
            { id: 'edit-exam', label: 'Wax ka bedel Imtixaan', icon: Award },
            { id: 'edit-subject', label: 'Maaddooyinka', icon: BookOpen },
            { id: 'edit-system', label: 'Nidaamka Guud', icon: Sliders },
            { id: 'data-mgt', label: 'Backup & Cloud', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setEditingStudent(null);
                  setEditingExam(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-[#042954] text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- 0. EDIT ACCOUNTS PANEL (BANK, EVC, ZAAD) --- */}
        {activeSubTab === 'edit-accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
              <div className="text-xs text-amber-950">
                <span className="font-bold block text-sm text-amber-900">Habaynta Xisaabaadka Iskuulka (EVC & Bank Accounts)</span>
                Halkan waxaad toos uga bedeli kartaa Numberka (+252906305090), Account Number-ka (411840), iyo magacyada bangiyada.
              </div>
              <button
                onClick={handleOpenAddAccount}
                className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ku Dar Account Cusub</span>
              </button>
            </div>

            {/* Accounts List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                          <span className="text-[11px] text-slate-500">{acc.bankName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditAccount(acc)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                          title="Edit Account"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Account Number:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <span>{acc.accountNumber}</span>
                          <button onClick={() => handleCopy(acc.accountNumber)} className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer">
                            {copiedText === acc.accountNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Taleefanka (Phone):</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <span>{acc.phoneNumber}</span>
                          <button onClick={() => handleCopy(acc.phoneNumber)} className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer">
                            {copiedText === acc.phoneNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {acc.description && (
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          {acc.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Bedel Macluumaadka Account-kan &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 1. EDIT STUDENT PANEL --- */}
        {activeSubTab === 'edit-student' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input 
                type="text" 
                value={editStudentSearchId}
                onChange={(e) => setEditStudentSearchId(e.target.value)}
                placeholder="Gali ID-ga Ardayga..." 
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-blue-500"
              />
              <button
                onClick={handleFindStudentToEdit}
                className="bg-[#042954] hover:bg-[#031d3d] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#ffae01]" />
                <span>Raadi</span>
              </button>
            </div>

            {editingStudent && (
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-4 max-w-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-bold text-sm text-slate-800">Wax ka bedelka Ardayga: {editingStudent.id}</h4>
                  <button
                    onClick={() => handleDeleteStudent(editingStudent.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Tirtir Ardaygan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Magaca Buuxa</label>
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => handleUpdateStudentField('name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Fasalka (Form/Class)</label>
                    <input
                      type="text"
                      value={editingStudent.form}
                      onChange={(e) => handleUpdateStudentField('form', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Section</label>
                    <input
                      type="text"
                      value={editingStudent.section}
                      onChange={(e) => handleUpdateStudentField('section', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Qadarka Fiiga ($)</label>
                    <input
                      type="number"
                      value={editingStudent.feeAmount || 15}
                      onChange={(e) => handleUpdateStudentField('feeAmount', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Waalidka (Guardian)</label>
                    <input
                      type="text"
                      value={editingStudent.guardian || ''}
                      onChange={(e) => handleUpdateStudentField('guardian', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Taleefanka Waalidka</label>
                    <input
                      type="text"
                      value={editingStudent.parentPhone || ''}
                      onChange={(e) => handleUpdateStudentField('parentPhone', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Ka Noqo
                  </button>
                  <button
                    onClick={handleSaveStudentEdit}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Kaydi Isbedelka</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 2. EDIT EXAM PANEL --- */}
        {activeSubTab === 'edit-exam' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <input 
                type="text" 
                value={editExamSearchId}
                onChange={(e) => setEditExamSearchId(e.target.value)}
                placeholder="Gali ID-ga Ardayga..." 
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
              />
              <select
                value={editExamType}
                onChange={(e) => setEditExamType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
              >
                {['Month 1', 'Month 2', 'Midterm', 'Final'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={handleFindExamToEdit}
                className="bg-[#042954] hover:bg-[#031d3d] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#ffae01]" />
                <span>Raadi</span>
              </button>
            </div>

            {editingExam && (
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-4 max-w-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Wax ka bedelka Imtixaanka: {editingExam.type}</h4>
                    <span className="text-xs text-slate-500 font-mono">Ardayga: {editingExam.studentId}</span>
                  </div>
                  <button
                    onClick={handleDeleteExam}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Tirtir Imtixaankan</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjects.map(sub => (
                    <div key={sub} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1 truncate">{sub}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingExam.marks[sub] !== undefined ? editingExam.marks[sub] : ''}
                        onChange={(e) => handleUpdateExamMark(sub, Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-bold">
                  <span>Celceliska Cusub: <strong className="text-[#042954] text-sm">{editingExam.average}%</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingExam(null)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                    >
                      Ka Noqo
                    </button>
                    <button
                      onClick={handleSaveExamEdit}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Kaydi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 3. EDIT SUBJECTS PANEL --- */}
        {activeSubTab === 'edit-subject' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="Magaca maaddada cusub..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white"
              />
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 bg-[#042954] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#ffae01]" />
                <span>Ku Dar</span>
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map(subj => (
                <div key={subj} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="font-bold text-slate-800">{subj}</span>
                  <button
                    onClick={() => handleDeleteSubject(subj)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Tirtir Maaddada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. SYSTEM SETTINGS PANEL --- */}
        {activeSubTab === 'edit-system' && (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Magaca Iskuulka (School Name)</label>
              <input
                type="text"
                value={tempSchoolName}
                onChange={(e) => setTempSchoolName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Dhibcaha Baasista Imtixaanka (%) (Pass Threshold)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white"
              />
            </div>

            <button
              onClick={handleUpdateSystem}
              className="px-5 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4 text-[#ffae01]" />
              <span>Cusboonaysii Nidaamka</span>
            </button>
          </div>
        )}

        {/* --- 5. DATA MANAGEMENT & CLOUD BACKUP --- */}
        {activeSubTab === 'data-mgt' && (
          <div className="space-y-6 max-w-xl">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span>Cloud Synchronization (Firebase Firestore 100% Online)</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Dhammaan xogta ardayda, macallimiinta, kharashaadka, fiiga, iyo accounts-ka waxay si toos ah ugu kaydsan yihiin daruuriga Firebase.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>Soo Dejiso Backup (Export JSON)</span>
              </button>

              <label className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer text-center">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Soo Geli Backup (Import JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT ACCOUNT */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingAccount ? 'Wax ka bedel Account-ka' : 'Ku Dar Account Cusub'}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Magaca Account-ka (Name) *</label>
                <input
                  type="text"
                  placeholder="Tusaale: Salaam Bank / Hormuud EVC"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Bangiga ama Shirkadda (Provider)</label>
                <input
                  type="text"
                  placeholder="Salaam Bank, Hormuud, Zaad, Sahal..."
                  value={accountFormData.bankName}
                  onChange={(e) => setAccountFormData({ ...accountFormData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Account Number *</label>
                  <input
                    type="text"
                    value={accountFormData.accountNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Taleefanka (Phone) *</label>
                  <input
                    type="text"
                    value={accountFormData.phoneNumber}
                    onChange={(e) => setAccountFormData({ ...accountFormData, phoneNumber: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Faahfaahin</label>
                <input
                  type="text"
                  placeholder="Xisaabta fiiga..."
                  value={accountFormData.description}
                  onChange={(e) => setAccountFormData({ ...accountFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingAccount ? 'Kaydi Isbedelka' : 'Abuur Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
