import React, { useState } from 'react';
import { Student, SchoolAccount, PaymentSubmission, FinancialTransaction } from '../types';
import { 
  Receipt, 
  Save, 
  DollarSign, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Image as ImageIcon, 
  Smartphone, 
  Building2, 
  Check, 
  Search,
  Filter,
  Eye,
  AlertCircle
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface FeesPageProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  saveData: (updatedStudents: Student[]) => void;
  accounts?: SchoolAccount[];
  paymentSubmissions?: PaymentSubmission[];
  setPaymentSubmissions?: (subs: PaymentSubmission[]) => void;
  savePaymentSubmissions?: (subs: PaymentSubmission[]) => void;
  transactions?: FinancialTransaction[];
  setTransactions?: (txs: FinancialTransaction[]) => void;
  saveTransactions?: (txs: FinancialTransaction[]) => void;
  currentUser?: any;
}

export default function FeesPage({ 
  students, 
  setStudents, 
  saveData,
  accounts = [],
  paymentSubmissions = [],
  setPaymentSubmissions,
  savePaymentSubmissions,
  transactions = [],
  setTransactions,
  saveTransactions,
  currentUser
}: FeesPageProps) {
  const [activeMainTab, setActiveMainTab] = useState<'roster' | 'approvals'>('roster');
  const [selectedClass, setSelectedClass] = useState('');

  // Payment Collection Modal (Direct by Admin/Finance)
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const [payAmount, setPayAmount] = useState<number>(15);
  const [payAccountId, setPayAccountId] = useState<string>(accounts[0]?.id || '');
  const [payRef, setPayRef] = useState<string>('');
  const [payNote, setPayNote] = useState<string>('Bixinta Fiiga Waxbarashada');

  // Edit Fee Modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFeeAmount, setEditFeeAmount] = useState<number>(15);
  const [editFeePaid, setEditFeePaid] = useState<boolean>(false);

  // Approvals Tab State
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchSubmission, setSearchSubmission] = useState('');
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [rejectModalSubmission, setRejectModalSubmission] = useState<PaymentSubmission | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [editingSubmission, setEditingSubmission] = useState<PaymentSubmission | null>(null);

  const pendingCount = paymentSubmissions.filter(s => s.status === 'pending').length;

  const classStudents = students.filter(s => s.form === selectedClass);

  // Open Direct Payment Modal
  const handleOpenPaymentModal = (student: Student) => {
    setPayingStudent(student);
    setPayAmount(student.feeAmount || 15);
    setPayAccountId(accounts[0]?.id || '');
    setPayRef(`REC-${Date.now().toString().slice(-4)}`);
    setPayNote(`Bixinta Fiiga: ${student.name} (${student.form})`);
  };

  // Confirm Direct Payment & Deposit to Chosen Account
  const handleConfirmDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingStudent) return;

    // Xaqiiji lacag bixinta: Ma hubtaa in qofku uu lacagta bixiyay?
    if (!window.confirm("Ma hubtaa in qofku uu lacagta bixiyay?")) {
      return;
    }

    const chosenAccount = accounts.find(a => a.id === payAccountId) || accounts[0];
    const accountLabel = chosenAccount ? `${chosenAccount.name} (Acc: ${chosenAccount.accountNumber})` : 'Qasnadda Guud';

    // 1. Mark student fee as paid
    const updatedStudents = students.map(s => {
      if (s.id === payingStudent.id) {
        return { ...s, feePaid: true, feeAmount: payAmount };
      }
      return s;
    });
    setStudents(updatedStudents);
    saveData(updatedStudents);

    // 2. Generate Income Transaction into chosen Account
    const newTx: FinancialTransaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      account: chosenAccount ? chosenAccount.name : 'Cash Box',
      accountId: chosenAccount?.id,
      category: 'Student Fees',
      amount: Number(payAmount) || 0,
      reference: payRef.trim() || `REC-${Date.now().toString().slice(-4)}`,
      payerPayee: `${payingStudent.name} (${payingStudent.id})`,
      note: `${payNote} | Account-ka lagu shubay: ${accountLabel}`,
      status: 'completed',
      createdBy: currentUser?.fullName || 'Maamulka'
    };

    const updatedTxs = [newTx, ...transactions];
    if (setTransactions) setTransactions(updatedTxs);
    if (saveTransactions) saveTransactions(updatedTxs);

    alert(`Lacagta $${payAmount} waxaa si guul leh loogu shubay ${accountLabel}!`);
    setPayingStudent(null);
  };

  // Toggle quick status
  const handleStatusChange = (studentId: string, isPaid: boolean) => {
    if (isPaid) {
      if (!window.confirm("Ma hubtaa in qofku uu lacagta bixiyay?")) {
        return;
      }
    }
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, feePaid: isPaid };
      }
      return s;
    });
    setStudents(updated);
    saveData(updated);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFeeAmount(student.feeAmount);
    setEditFeePaid(student.feePaid);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (editFeePaid && !editingStudent.feePaid) {
      if (!window.confirm("Ma hubtaa in qofku uu lacagta bixiyay?")) {
        return;
      }
    }

    const updated = students.map(s => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          feeAmount: Number(editFeeAmount) || 0,
          feePaid: editFeePaid
        };
      }
      return s;
    });

    setStudents(updated);
    saveData(updated);
    setEditingStudent(null);
  };

  const handleResetFee = (studentId: string) => {
    if (confirm("Ma hubtaa inaad dib u dejiso xisaabta ardaygan (Reset/Delete Fee)?")) {
      const updated = students.map(s => {
        if (s.id === studentId) {
          return { ...s, feePaid: false };
        }
        return s;
      });
      setStudents(updated);
      saveData(updated);
    }
  };

  // --- APPROVAL WORKFLOW ---
  const handleApproveSubmission = (sub: PaymentSubmission) => {
    if (!window.confirm(`Ma hubtaa in qofku uu lacagta bixiyay? ($${sub.amount} - ${sub.studentName})`)) {
      return;
    }

    const targetAccount = accounts.find(a => a.id === sub.accountId) || accounts[0];
    const accLabel = targetAccount ? `${targetAccount.name} (${targetAccount.accountNumber})` : sub.accountName;

    // 1. Update Submission status
    const updatedSubmissions = paymentSubmissions.map(s => {
      if (s.id === sub.id) {
        return {
          ...s,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.fullName || 'Maamulka'
        };
      }
      return s;
    });

    if (setPaymentSubmissions) setPaymentSubmissions(updatedSubmissions);
    if (savePaymentSubmissions) savePaymentSubmissions(updatedSubmissions);

    // 2. Mark student as Paid
    const updatedStudents = students.map(st => {
      if (st.id === sub.studentId) {
        return { ...st, feePaid: true };
      }
      return st;
    });
    setStudents(updatedStudents);
    saveData(updatedStudents);

    // 3. Deposit into chosen Account as Income
    const newTx: FinancialTransaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      account: targetAccount ? targetAccount.name : sub.accountName,
      accountId: targetAccount?.id || sub.accountId,
      category: 'Student Fees',
      amount: sub.amount,
      reference: sub.transactionRef || `APP-${Date.now().toString().slice(-4)}`,
      payerPayee: `${sub.studentName} (Waalid: ${sub.submittedBy})`,
      note: `Rasiid la ansixiyey: ${sub.month} | Account-ka lagu shubay: ${accLabel}`,
      status: 'completed',
      createdBy: currentUser?.fullName || 'Maamulka'
    };

    const updatedTxs = [newTx, ...transactions];
    if (setTransactions) setTransactions(updatedTxs);
    if (saveTransactions) saveTransactions(updatedTxs);

    alert(`Rasiidka waa la ansixiyey! Lacagta $${sub.amount} waxay si toos ah ugu dhacday account-ka: ${accLabel}`);
  };

  const handleOpenRejectModal = (sub: PaymentSubmission) => {
    setRejectModalSubmission(sub);
    setRejectionReasonInput('Lambarka Rasiidka / SMS ma waafaqsana xisaabta');
  };

  const handleConfirmReject = () => {
    if (!rejectModalSubmission) return;

    const updatedSubmissions = paymentSubmissions.map(s => {
      if (s.id === rejectModalSubmission.id) {
        return {
          ...s,
          status: 'rejected' as const,
          rejectionReason: rejectionReasonInput.trim(),
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.fullName || 'Maamulka'
        };
      }
      return s;
    });

    if (setPaymentSubmissions) setPaymentSubmissions(updatedSubmissions);
    if (savePaymentSubmissions) savePaymentSubmissions(updatedSubmissions);

    setRejectModalSubmission(null);
    alert("Codsiga lacag-bixinta waa la diiday, waalidkana waa loo gudbiyey sababta.");
  };

  const handleDeleteSubmission = (subId: string) => {
    if (confirm("Ma hubtaa inaad tirtirto diiwaanka rasiidkan?")) {
      const updated = paymentSubmissions.filter(s => s.id !== subId);
      if (setPaymentSubmissions) setPaymentSubmissions(updated);
      if (savePaymentSubmissions) savePaymentSubmissions(updated);
    }
  };

  const handleSaveEditSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    const updated = paymentSubmissions.map(s => {
      if (s.id === editingSubmission.id) {
        return editingSubmission;
      }
      return s;
    });

    if (setPaymentSubmissions) setPaymentSubmissions(updated);
    if (savePaymentSubmissions) savePaymentSubmissions(updated);
    setEditingSubmission(null);
  };

  const filteredSubmissions = paymentSubmissions.filter(sub => {
    const matchesFilter = approvalFilter === 'all' || sub.status === approvalFilter;
    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchSubmission.toLowerCase()) ||
      sub.submittedBy.toLowerCase().includes(searchSubmission.toLowerCase()) ||
      sub.transactionRef.toLowerCase().includes(searchSubmission.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 border border-amber-200">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">Maamulka Lacagaha & Rasiidada Fiiga</h2>
              <p className="text-xs text-slate-500 font-medium">Qabashada fiiga, xisaabaadka bangiyada, iyo ansixinta rasiidadaha waalidiinta</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMainTab('roster')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMainTab === 'roster'
                  ? 'bg-white text-[#042954] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Diiwaanka Fiiga Ardayda</span>
            </button>

            <button
              onClick={() => setActiveMainTab('approvals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
                activeMainTab === 'approvals'
                  ? 'bg-white text-[#042954] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Ansixinta Rasiidada</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notice of Accounts Configuration */}
        {accounts.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Accounts-ka Iskuulka:</strong> {accounts.map(a => `${a.name} (Acc: ${a.accountNumber}, Tel: ${a.phoneNumber})`).join(' | ')}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              Waxaa lagu shubaa toos xisaabta la doorto
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: STUDENT FEE ROSTER */}
      {activeMainTab === 'roster' && (
        <div className="space-y-6">
          {/* Class Filter */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dooro Fasalka:</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-[#042954]"
              >
                <option value="">-- Xulo Class --</option>
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  Wadarta: {classStudents.length} Arday
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  Bixiyey: {classStudents.filter(s => s.feePaid).length}
                </span>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  Dhiman: {classStudents.filter(s => !s.feePaid).length}
                </span>
              </div>
            )}
          </div>

          {/* Student Roster Table */}
          {selectedClass && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold font-display text-slate-900">
                  Liiska Fiiga Ardayda: <span className="text-[#042954]">{selectedClass}</span>
                </h3>
              </div>

              {classStudents.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <DollarSign className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                  <p className="text-sm font-medium">Fasalkan wax arday ah kuma qorna.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Sawir & ID</th>
                        <th className="py-3.5 px-4">Magaca Ardayga</th>
                        <th className="py-3.5 px-4">Waalidka / Tel</th>
                        <th className="py-3.5 px-4">Qadarka Fiiga</th>
                        <th className="py-3.5 px-4">Xaaladda Bixinta</th>
                        <th className="py-3.5 px-4 text-center">Qaadista Lacagta</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                              <UserAvatar name={student.name} role="student" size="sm" photo={student.img} />
                              <span>{student.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {student.name}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{student.guardian || student.mother || 'Waalid'}</div>
                            {student.parentPhone && (
                              <span className="text-[11px] font-mono text-slate-500">{student.parentPhone}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            ${student.feeAmount || 15}
                          </td>
                          <td className="py-3 px-4">
                            {student.feePaid ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Waa La Bixiyey</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                <span>Lama Bixin</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {!student.feePaid ? (
                              <button
                                onClick={() => handleOpenPaymentModal(student)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Xeree Lacagta</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                                Waa Bixiyey ✓
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(student)}
                                className="p-1.5 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                                title="Edit Fee Details"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResetFee(student.id)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                title="Reset / Delete Fee Balance"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING PAYMENT & RECEIPT APPROVALS */}
      {activeMainTab === 'approvals' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Shaandhee:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setApprovalFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    approvalFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Dhammaan ({paymentSubmissions.length})
                </button>
                <button
                  onClick={() => setApprovalFilter('pending')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    approvalFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Sugaya ({paymentSubmissions.filter(s => s.status === 'pending').length})
                </button>
                <button
                  onClick={() => setApprovalFilter('approved')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    approvalFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  La Ansixiyey ({paymentSubmissions.filter(s => s.status === 'approved').length})
                </button>
                <button
                  onClick={() => setApprovalFilter('rejected')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    approvalFilter === 'rejected' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  La Diiday ({paymentSubmissions.filter(s => s.status === 'rejected').length})
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Raadi arday, waalid, ama ref..."
                value={searchSubmission}
                onChange={(e) => setSearchSubmission(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-[#042954] w-full sm:w-64"
              />
            </div>
          </div>

          {/* Approvals Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Clock className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Wax codsiyo rasiid ah lama helin.</p>
                <p className="text-xs text-slate-400 mt-1">Waalidiinta iyo ardaydu marka ay rasiid soo diraan halkan ayey kasoo muuqanayaan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Taariikh</th>
                      <th className="py-3.5 px-4">Ardayga & Fasalka</th>
                      <th className="py-3.5 px-4">Qofka Soo Diray</th>
                      <th className="py-3.5 px-4">Qadarka</th>
                      <th className="py-3.5 px-4">Account-ka Lagu Shubay</th>
                      <th className="py-3.5 px-4">Ref / Trx ID</th>
                      <th className="py-3.5 px-4 text-center">Sawirka Rasiidka</th>
                      <th className="py-3.5 px-4">Xaaladda</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <span className="text-[11px] text-slate-500">{sub.studentClass}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sub.submittedBy}</div>
                          <span className="text-[10px] text-slate-400 capitalize">{sub.submitterRole}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                          ${sub.amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>{sub.accountName}</span>
                          </div>
                          {sub.month && (
                            <span className="text-[10px] text-slate-500">Bisha: {sub.month}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {sub.transactionRef || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {sub.receiptUrl ? (
                            <button
                              onClick={() => setViewingReceiptUrl(sub.receiptUrl || null)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Eeg Sawirka</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Sawir ma leh</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {sub.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Sugaya Ansixin</span>
                            </span>
                          )}
                          {sub.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>La Ansixiyey</span>
                            </span>
                          )}
                          {sub.status === 'rejected' && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>La Diiday</span>
                              </span>
                              {sub.rejectionReason && (
                                <p className="text-[10px] text-rose-600 mt-0.5">{sub.rejectionReason}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveSubmission(sub)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Anxi Codsigan (Approve and Deposit)"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Anxi</span>
                                </button>
                                <button
                                  onClick={() => handleOpenRejectModal(sub)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Diid Codsigan (Reject)"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Diid</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setEditingSubmission({ ...sub })}
                              className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-md transition-colors cursor-pointer"
                              title="Edit Submission"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                              title="Delete Submission"
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
            )}
          </div>
        </div>
      )}

      {/* DIRECT PAYMENT MODAL (ADMIN / CASHIER) */}
      {payingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Xeree Lacagta Fiiga</h3>
                  <p className="text-xs text-slate-500 font-medium">Dooro account-ka lagu shubay si toos ah ayey u galaysaa</p>
                </div>
              </div>
              <button
                onClick={() => setPayingStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDirectPayment} className="space-y-4">
              {/* Su'aasha Xaqiijinta */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900">Ma hubtaa in qofku uu lacagta bixiyay?</div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Fadlan hubi xisaabta ka hor inta aadan lacagta xareynin.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ardayga:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{payingStudent.name}</div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">ID: {payingStudent.id} | Fasal: {payingStudent.form}</div>
              </div>

              {/* Account selection: Accounts-kee lacagta lagu shubay */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Accounts-kee lacagta lagu shubay? *</span>
                </label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#042954]"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Acc: {acc.accountNumber} ({acc.phoneNumber})
                    </option>
                  ))}
                  {accounts.length === 0 && (
                    <option value="default_cash">Qasnadda Guud (Cash Box)</option>
                  )}
                </select>
                <p className="text-[11px] text-slate-500">Lacagtu waxay toos ugu dhici doontaa account-ka aad doorato.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Qadarka Lacagta ($) *</label>
                  <input
                    type="number"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Lambarka Rasiidka / Trx Ref</label>
                  <input
                    type="text"
                    placeholder="Tusaale: REC-9011"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Xusuusin / Bisha</label>
                <input
                  type="text"
                  placeholder="Faahfaahin ku saabsan bixinta..."
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-[#042954]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Xaqiiji & Xeree Lacagta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FEE DETAILS MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">Bedel Xisaabta Fiiga</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500">Ardayga:</span>
                <p className="text-sm font-bold text-slate-900">{editingStudent.name} ({editingStudent.id})</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Qadarka Fiiga Bisha ($)</label>
                <input
                  type="number"
                  value={editFeeAmount}
                  onChange={(e) => setEditFeeAmount(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Xaaladda Bixinta</label>
                <select
                  value={editFeePaid ? 'paid' : 'unpaid'}
                  onChange={(e) => setEditFeePaid(e.target.value === 'paid')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="paid">Waa La Bixiyey (Paid)</option>
                  <option value="unpaid">Lama Bixin (Unpaid)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#042954] hover:bg-[#031d3d] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Kaydi Isbedelka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT SUBMISSION MODAL */}
      {rejectModalSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-rose-700 font-display flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Diid Codsiga Rasiidka</span>
              </h3>
              <button
                onClick={() => setRejectModalSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Fadlan qor sababta aad u diidayso rasiidka ardayga <strong>{rejectModalSubmission.studentName}</strong>:
              </p>

              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-rose-500"
                placeholder="Tusaale: Lacagtu xisaabta ma soo gelin, ama SMS Ref ma saxna..."
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalSubmission(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Xaqiiji Diidmada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW RECEIPT FULLSCREEN MODAL */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
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

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-50 rounded-xl">
              <img
                src={viewingReceiptUrl}
                alt="Receipt Full Preview"
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUBMISSION MODAL */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">Wax ka bedel Rasiidka</h3>
              <button
                onClick={() => setEditingSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmission} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Qadarka ($)</label>
                <input
                  type="number"
                  value={editingSubmission.amount}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Lambarka Rasiidka / Ref</label>
                <input
                  type="text"
                  value={editingSubmission.transactionRef}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, transactionRef: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Xaaladda</label>
                <select
                  value={editingSubmission.status}
                  onChange={(e) => setEditingSubmission({ ...editingSubmission, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="pending">Sugaya Ansixin (Pending)</option>
                  <option value="approved">La Ansixiyey (Approved)</option>
                  <option value="rejected">La Diiday (Rejected)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
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
    </div>
  );
}
