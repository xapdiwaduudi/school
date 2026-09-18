import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, ExamResult, AppUser, SchoolAccount, PaymentSubmission } from '../types';
import { 
  UserRound, 
  Search, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  Award, 
  Receipt, 
  Upload, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Building2, 
  Smartphone, 
  Copy, 
  Check, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import { DEFAULT_ACCOUNTS } from '../accountsData';

interface ParentPortalProps {
  students: Student[];
  attendance: AttendanceRecord[];
  exams: ExamResult[];
  passThreshold: number;
  currentUser?: AppUser | null;
  accounts?: SchoolAccount[];
  paymentSubmissions?: PaymentSubmission[];
  setPaymentSubmissions?: (subs: PaymentSubmission[]) => void;
  savePaymentSubmissions?: (subs: PaymentSubmission[]) => void;
}

export default function ParentPortal({ 
  students, 
  attendance, 
  exams, 
  passThreshold,
  currentUser,
  accounts = DEFAULT_ACCOUNTS,
  paymentSubmissions = [],
  setPaymentSubmissions,
  savePaymentSubmissions
}: ParentPortalProps) {
  const [searchId, setSearchId] = useState('');
  const [trackedStudent, setTrackedStudent] = useState<Student | null>(null);

  // Receipt submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(15);
  const [payMonth, setPayMonth] = useState<string>(() => {
    return new Date().toLocaleString('so-SO', { month: 'long', year: 'numeric' }) || 'Bishan';
  });
  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [trxRef, setTrxRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [submitNote, setSubmitNote] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Edit submission state
  const [editingSub, setEditingSub] = useState<PaymentSubmission | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Auto-detect student if parent has assignedStudentId
  useEffect(() => {
    if (currentUser?.assignedStudentId) {
      const s = students.find(item => item.id.toLowerCase() === currentUser.assignedStudentId?.toLowerCase());
      if (s) {
        setTrackedStudent(s);
        setSearchId(s.id);
      }
    } else if (students.length > 0 && !trackedStudent) {
      setTrackedStudent(students[0]);
      setSearchId(students[0].id);
    }
  }, [currentUser, students]);

  useEffect(() => {
    if (trackedStudent) {
      setPayAmount(trackedStudent.feeAmount || 15);
      setSubmitterName(currentUser?.fullName || trackedStudent.guardian || trackedStudent.name);
      setSubmitterPhone(trackedStudent.parentPhone || '');
    }
  }, [trackedStudent, currentUser]);

  const handleSearch = () => {
    if (!searchId.trim()) {
      alert("Fadlan geli ID-ga ardayga!");
      return;
    }
    const student = students.find(s => s.id.toLowerCase() === searchId.trim().toLowerCase());
    if (!student) {
      alert("ID lama helin! Fadlan hubi ID-ga.");
      setTrackedStudent(null);
      return;
    }
    setTrackedStudent(student);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Image Upload handler (Base64)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Sawirka rasiidku waa inuu ka yaraadaa 3MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackedStudent) return;

    const chosenAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
    const accLabel = chosenAccount ? `${chosenAccount.name} (${chosenAccount.accountNumber})` : 'Salaam Bank / Hormuud EVC (411840)';

    const newSub: PaymentSubmission = {
      id: `SUB-${Date.now()}`,
      studentId: trackedStudent.id,
      studentName: trackedStudent.name,
      studentClass: trackedStudent.form,
      amount: Number(payAmount) || 15,
      month: payMonth,
      accountId: chosenAccount?.id || 'acc_default',
      accountName: accLabel,
      transactionRef: trxRef.trim(),
      receiptUrl: receiptImage || undefined,
      note: submitNote.trim(),
      submittedBy: submitterName.trim() || 'Waalid',
      submitterRole: currentUser?.role === 'student' ? 'student' : 'parent',
      submitterPhone: submitterPhone.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [newSub, ...paymentSubmissions];
    if (setPaymentSubmissions) setPaymentSubmissions(updated);
    if (savePaymentSubmissions) savePaymentSubmissions(updated);

    alert("Rasiidka si guul leh ayaa loo soo diray! Maamulaha ayaa ansixin doona marka uu xaqiijiyo xisaabta.");
    setShowSubmitModal(false);
    setTrxRef('');
    setReceiptImage('');
    setSubmitNote('');
  };

  const handleDeleteSub = (subId: string) => {
    if (confirm("Ma hubtaa inaad tirtirto diiwaankan?")) {
      const updated = paymentSubmissions.filter(s => s.id !== subId);
      if (setPaymentSubmissions) setPaymentSubmissions(updated);
      if (savePaymentSubmissions) savePaymentSubmissions(updated);
    }
  };

  const handleSaveEditSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    const updated = paymentSubmissions.map(s => {
      if (s.id === editingSub.id) return editingSub;
      return s;
    });

    if (setPaymentSubmissions) setPaymentSubmissions(updated);
    if (savePaymentSubmissions) savePaymentSubmissions(updated);
    setEditingSub(null);
  };

  // Student metrics
  const presentDays = trackedStudent 
    ? attendance.filter(a => a.id.toLowerCase() === trackedStudent.id.toLowerCase() && a.status === 'present').length 
    : 0;

  const absentDays = trackedStudent 
    ? attendance.filter(a => a.id.toLowerCase() === trackedStudent.id.toLowerCase() && a.status === 'absent').length 
    : 0;

  const studentExams = trackedStudent 
    ? exams.filter(e => e.studentId.toLowerCase() === trackedStudent.id.toLowerCase()) 
    : [];

  const latestResult = studentExams.length > 0 ? studentExams[studentExams.length - 1] : null;

  const studentSubmissions = trackedStudent 
    ? paymentSubmissions.filter(s => s.studentId === trackedStudent.id) 
    : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 text-center shadow-xs no-print">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <UserRound className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 mb-1">
          Portal-ka Waalidka & Ardayga (Parent & Student Portal)
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Gali ID-ga Ardayga si aad ula socoto xaaladda waxbarashada, xaadirinta, iyo bixinta fiiga & rasiidadaha.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Gali Student ID (tusaale: STD-001)" 
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-sm outline-none focus:bg-white focus:border-[#042954] transition-colors min-h-[44px]"
          />
          <button 
            onClick={handleSearch}
            className="bg-[#042954] hover:bg-[#031d3d] text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Search className="w-4 h-4 text-[#ffae01]" />
            <span>Eeg Warbixinta</span>
          </button>
        </div>
      </div>

      {/* Parent View Area */}
      {trackedStudent && (
        <div id="parent-print-area" className="space-y-4">
          {/* Student Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={trackedStudent.name} photo={trackedStudent.img} size="lg" role="student" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{trackedStudent.name}</h3>
                <div className="text-xs text-slate-500 font-mono">
                  ID: <strong className="text-[#042954]">{trackedStudent.id}</strong> &bull; {trackedStudent.form} ({trackedStudent.section})
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Waalidka: {trackedStudent.guardian || '-'} {trackedStudent.parentPhone ? `(${trackedStudent.parentPhone})` : ''}
                </div>
              </div>
            </div>

            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 no-print cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

          {/* Fee Paid Card & Payment Submission Trigger */}
          <div className={`p-5 rounded-2xl border transition-all ${
            trackedStudent.feePaid 
              ? 'bg-emerald-50/80 border-emerald-200' 
              : 'bg-amber-50/80 border-amber-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {trackedStudent.feePaid ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {trackedStudent.feePaid ? 'Fiiga Bishan Waa La Bixiyey ✅' : 'Fiiga Bishan Weli Lama Bixin'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {trackedStudent.feePaid 
                      ? 'Ardaygu wuxuu si buuxda u bixiyey fiiga bishan.' 
                      : `Qadarka fiiga ardayga waa $${trackedStudent.feeAmount || 15}. Waad bixin kartaa rasiidkana soo diri kartaa.`
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer no-print shrink-0"
              >
                <Receipt className="w-4 h-4 text-[#ffae01]" />
                <span>Bixi Fiiga & Soo Dir Rasiidka</span>
              </button>
            </div>
          </div>

          {/* Previous Payment Submissions List for this student */}
          {studentSubmissions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Rasiidadaha Aad Soo Dirtay ({studentSubmissions.length})</span>
                </h4>
              </div>

              <div className="space-y-2">
                {studentSubmissions.map(sub => (
                  <div 
                    key={sub.id} 
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">${sub.amount}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="font-medium text-slate-600">{sub.accountName}</span>
                        {sub.month && <span className="text-[11px] text-slate-500 font-mono">({sub.month})</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-mono">
                        <span>Ref: {sub.transactionRef || 'N/A'}</span>
                        <span>&bull;</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                      {sub.rejectionReason && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">
                          Sababta diidmada: {sub.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {sub.receiptUrl && (
                        <button
                          onClick={() => setViewingReceiptUrl(sub.receiptUrl || null)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Sawirka</span>
                        </button>
                      )}

                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Sugaya Ansixin</span>
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Waa La Ansixiyey</span>
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>La Diiday</span>
                        </span>
                      )}

                      <button
                        onClick={() => setEditingSub({ ...sub })}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                        title="Edit Submission"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider opacity-90 block">Maalmaha uu Joogay</span>
              <span className="text-2xl sm:text-3xl font-black block mt-1">{presentDays}</span>
              <span className="text-[10px] block opacity-85 mt-0.5">Maalmo guud (Present)</span>
            </div>

            <div className="bg-rose-600 text-white p-4 sm:p-5 rounded-2xl text-center shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider opacity-90 block">Maalmaha uu Maqnaa</span>
              <span className="text-2xl sm:text-3xl font-black block mt-1">{absentDays}</span>
              <span className="text-[10px] block opacity-85 mt-0.5">Maalmo guud (Absent)</span>
            </div>
          </div>

          {/* Latest Exam Result */}
          {latestResult ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#ffae01]" />
                  <h4 className="text-sm font-bold text-slate-800">Natiijada Imtixaankii Ugu Dambeeyay</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  latestResult.status === 'Pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {latestResult.status === 'Pass' ? 'Baasay (Passed)' : 'Dhacay (Failed)'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Imtixaanka: <strong>{latestResult.type}</strong></span>
                <span>Celceliska: <strong className="text-[#042954] text-sm">{latestResult.average}%</strong></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(latestResult.marks).map(([subject, mark]) => (
                  <div key={subject} className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-medium truncate">{subject}</span>
                    <span className="text-xs font-black text-[#042954]">{mark}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center text-slate-400 text-xs sm:text-sm">
              Weli wax imtixaan ah looma xereyn ardaygan.
            </div>
          )}
        </div>
      )}

      {/* MODAL: SUBMIT FEE PAYMENT & RECEIPT */}
      {showSubmitModal && trackedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Bixi Fiiga & Soo Dir Rasiidka</h3>
                  <p className="text-[11px] text-slate-500">U dir maamulka xisaabta rasiidka lacag-bixintaada</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* School Account Information Box */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/80 mb-4 space-y-2.5 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1 text-amber-900">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Macluumaadka Xisaabaadka Iskuulka (Ku shub lacagta):</span>
              </div>
              <div className="space-y-1.5">
                {accounts.map(acc => (
                  <div key={acc.id} className="bg-white/80 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{acc.name}</span>
                      <span className="text-[11px] text-slate-600 font-mono">
                        Acc: <strong>{acc.accountNumber}</strong> | Tel: <strong>{acc.phoneNumber}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAccount === acc.accountNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Koobi</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitPaymentReceipt} className="space-y-3.5">
              {/* Account Paid Into */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Accounts-kee ayaad lacagta ku shubtay? *</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Acc: {acc.accountNumber} ({acc.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Qadarka Lacagta ($) *</label>
                  <input
                    type="number"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Bisha aad bixisay *</label>
                  <input
                    type="text"
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    required
                    placeholder="Tusaale: May 2026"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Magacaaga (Waalid / Arday) *</label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Taleefankaaga *</label>
                  <input
                    type="text"
                    value={submitterPhone}
                    onChange={(e) => setSubmitterPhone(e.target.value)}
                    required
                    placeholder="252..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lambarka Rasiidka / Trx Ref ID (SMS EVC ama Zaad) *</label>
                <input
                  type="text"
                  placeholder="Tusaale: TR-9821389 ama lambarka SMS-ka"
                  value={trxRef}
                  onChange={(e) => setTrxRef(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              {/* Upload Receipt Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Sawirka Rasiidka (Receipt Screenshot)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ikhtiyaari (Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#042954] rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-50">
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 block">
                      {receiptImage ? 'Sawirka waa la doortay (Bedel)' : 'Dooro Sawirka Rasiidka'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG ilaa 3MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {receiptImage && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={receiptImage} alt="Receipt Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReceiptImage('')}
                        className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Fariin / Xusuusin</label>
                <input
                  type="text"
                  placeholder="Xog dheeraad ah oo aad rabto inaad u sheegto maamulka..."
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Soo Dir Rasiidka</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBMISSION MODAL */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">Wax ka bedel Rasiidka</h3>
              <button
                onClick={() => setEditingSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSub} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Qadarka ($)</label>
                <input
                  type="number"
                  value={editingSub.amount}
                  onChange={(e) => setEditingSub({ ...editingSub, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Lambarka Rasiidka / Trx Ref</label>
                <input
                  type="text"
                  value={editingSub.transactionRef}
                  onChange={(e) => setEditingSub({ ...editingSub, transactionRef: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Faahfaahin</label>
                <input
                  type="text"
                  value={editingSub.note || ''}
                  onChange={(e) => setEditingSub({ ...editingSub, note: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Kaydi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT IMAGE MODAL */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Sawirka Rasiidka</span>
              </h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center p-2 bg-slate-50 rounded-xl">
              <img src={viewingReceiptUrl} alt="Receipt" className="max-h-[60vh] object-contain rounded-lg shadow-xs" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
