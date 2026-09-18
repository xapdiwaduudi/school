import React, { useState, useEffect } from 'react';
import { Student, ExamResult, AppUser } from '../types';
import { FileEdit, Save, Plus, BookOpen, AlertCircle, CheckCircle, Trash2, Edit3, Search, Award } from 'lucide-react';

interface ExamEntryPageProps {
  students: Student[];
  subjects: string[];
  exams: ExamResult[];
  setExams: (exams: ExamResult[]) => void;
  saveData: (updatedExams: ExamResult[]) => void;
  passThreshold: number;
  currentUser?: AppUser | null;
}

export default function ExamEntryPage({ 
  students, 
  subjects, 
  exams, 
  setExams, 
  saveData,
  passThreshold,
  currentUser 
}: ExamEntryPageProps) {
  const [studentId, setStudentId] = useState('');
  const [examType, setExamType] = useState('Month 1');
  const [marks, setMarks] = useState<{ [subject: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [examSearch, setExamSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const isTeacher = currentUser?.role === 'teacher';
  const teacherSubject = currentUser?.assignedSubject;

  // When studentId or examType changes, pre-load existing marks if available
  useEffect(() => {
    if (studentId.trim()) {
      const existing = exams.find(e => e.studentId.toLowerCase() === studentId.trim().toLowerCase() && e.type === examType);
      if (existing) {
        const loaded: { [sub: string]: string } = {};
        Object.entries(existing.marks).forEach(([sub, val]) => {
          loaded[sub] = val.toString();
        });
        setMarks(loaded);
      } else {
        setMarks({});
      }
    }
  }, [studentId, examType, exams]);

  const handleMarkChange = (subject: string, value: string) => {
    // If teacher, prevent editing other subjects
    if (isTeacher && teacherSubject && subject !== teacherSubject) {
      return;
    }
    setMarks(prev => ({
      ...prev,
      [subject]: value
    }));
  };

  const handleSaveResult = () => {
    if (!studentId.trim()) {
      alert("Fadlan ID-ga ardayga geli!");
      return;
    }

    const student = students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase());
    if (!student) {
      alert("ID-ga ardayga lama helin! Fadlan hubi ID-ga saxda ah.");
      return;
    }

    // Find if existing result exists to merge marks
    const existingExam = exams.find(
      ex => ex.studentId.toLowerCase() === studentId.trim().toLowerCase() && ex.type === examType
    );

    let numericMarks: { [sub: string]: number } = existingExam ? { ...existingExam.marks } : {};

    if (isTeacher && teacherSubject) {
      // Teacher only updates their assigned subject
      const markVal = Number(marks[teacherSubject]) || 0;
      numericMarks[teacherSubject] = markVal;
    } else {
      // Admin or unrestricted user updates all filled subjects
      subjects.forEach(sub => {
        if (marks[sub] !== undefined && marks[sub] !== '') {
          numericMarks[sub] = Number(marks[sub]) || 0;
        } else if (!numericMarks[sub]) {
          numericMarks[sub] = 0;
        }
      });
    }

    // Calculate total and average
    let total = 0;
    const allSubjectKeys = subjects.length > 0 ? subjects : Object.keys(numericMarks);
    allSubjectKeys.forEach(sub => {
      total += (numericMarks[sub] || 0);
    });

    const average = allSubjectKeys.length > 0 ? Number((total / allSubjectKeys.length).toFixed(1)) : 0;
    const status = average >= passThreshold ? 'Pass' : 'Fail';

    const newResult: ExamResult = {
      studentId: student.id,
      studentName: student.name,
      type: examType,
      marks: numericMarks,
      average,
      status
    };

    const filteredExams = exams.filter(
      ex => !(ex.studentId.toLowerCase() === student.id.toLowerCase() && ex.type === examType)
    );

    const updated = [...filteredExams, newResult];
    setExams(updated);
    saveData(updated);

    setSuccessMsg(`Dhibcaha ardayga (${student.name} - ID: ${student.id}) si guul leh ayaa loo xereeyey!`);
    setTimeout(() => setSuccessMsg(''), 4000);

    // If teacher, clear or keep ID
    setStudentId('');
    setMarks({});
  };

  const handleEditExam = (exam: ExamResult) => {
    setStudentId(exam.studentId);
    setExamType(exam.type);
    const loaded: { [sub: string]: string } = {};
    Object.entries(exam.marks).forEach(([sub, val]) => {
      loaded[sub] = val.toString();
    });
    setMarks(loaded);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteExam = (stdId: string, type: string) => {
    if (confirm(`Ma hubtaa inaad tirtirto dhibcaha imtixaanka (${type}) ee ardaygan?`)) {
      const updated = exams.filter(
        ex => !(ex.studentId.toLowerCase() === stdId.toLowerCase() && ex.type === type)
      );
      setExams(updated);
      saveData(updated);
    }
  };

  const filteredExamsList = exams.filter(ex => {
    if (filterType !== 'all' && ex.type !== filterType) return false;
    if (examSearch.trim()) {
      const q = examSearch.toLowerCase();
      const matchName = ex.studentName.toLowerCase().includes(q);
      const matchId = ex.studentId.toLowerCase().includes(q);
      return matchName || matchId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-lg">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Xereynta Natiijada Imtixaanka (Exam Marks Entry)
              </h2>
              <p className="text-xs text-slate-500">
                {isTeacher && teacherSubject 
                  ? `Waxaad tahay Macallinka Maadada: ${teacherSubject}. Waxaad gelin kartaa oo kaliya maadadaada.`
                  : 'Geli dhibcaha maadooyinka ardayda si loogu xisaabiyo natiijada guud.'}
              </p>
            </div>
          </div>

          {isTeacher && teacherSubject && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shrink-0">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Maadadaada: {teacherSubject}</span>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Student ID (Aqoonsiga Ardayga)
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Gali ID-ga Ardayga (tusaale: STD001)" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            {studentId.trim() && (
              <div className="text-[11px] font-medium text-slate-500">
                {students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase()) ? (
                  <span className="text-emerald-600 font-bold">
                    ✓ Ardayga: {students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase())?.name} ({students.find(s => s.id.toLowerCase() === studentId.trim().toLowerCase())?.form})
                  </span>
                ) : (
                  <span className="text-amber-600">ID-gan arday kuma jiro liiska</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nooca Imtixaanka</label>
            <select 
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="Month 1">Month 1</option>
              <option value="Month 2">Month 2</option>
              <option value="Month 3">Month 3</option>
              <option value="Term">Term (Imtixaanka Simistarka)</option>
              <option value="Month 4">Month 4</option>
              <option value="Month 5">Month 5</option>
              <option value="Final Exam">Final Exam (Imtixaanka Sanadka)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold text-[#042954] uppercase tracking-wide mb-4">
            Madooyinka iyo Dhibcaha (Subjects & Marks)
          </h3>
          {subjects.length === 0 ? (
            <p className="text-xs text-slate-400">Fadlan ku dar maadooyin qeybta Settings ka hor inta aadan buuxin dhibcaha.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map(sub => {
                const isAssignedToCurrentTeacher = !isTeacher || (teacherSubject && sub === teacherSubject);
                const isLocked = isTeacher && teacherSubject && sub !== teacherSubject;

                return (
                  <div 
                    key={sub} 
                    className={`flex flex-col gap-1 p-3 rounded-lg border transition-all ${
                      isAssignedToCurrentTeacher && isTeacher
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20' 
                        : isLocked 
                        ? 'bg-slate-100/60 border-slate-200 opacity-60' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{sub}</span>
                      {isTeacher && teacherSubject && sub === teacherSubject && (
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">Maadadaada</span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] text-slate-400">Macallin kale</span>
                      )}
                    </div>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      disabled={isLocked}
                      value={marks[sub] || ''}
                      onChange={(e) => handleMarkChange(sub, e.target.value)}
                      placeholder={isLocked ? 'Xiran' : '0-100'} 
                      className={`px-3 py-1.5 bg-white border rounded text-sm font-bold text-slate-800 outline-none ${
                        isLocked 
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                          : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button 
          onClick={handleSaveResult}
          disabled={subjects.length === 0 || !studentId.trim()}
          className="mt-8 w-full bg-[#042954] hover:bg-[#032044] text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 text-[#ffae01]" />
          <span>Save Exam Result</span>
        </button>
      </div>

      {/* Diiwaanka Natiijooyinka la xereeyey (Recorded Results Table with Edit/Delete) */}
      <div className="bg-white p-6 rounded-xl border border-slate-150 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Diiwaanka Dhibcaha la Xereeyey ({exams.length})
              </h3>
              <p className="text-xs text-slate-500">
                Wax ka bedel (Edit) dhibcaha ama tirtir (Delete) natiijo kasta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="all">Dhammaan Imtixaanada</option>
              <option value="Month 1">Month 1</option>
              <option value="Month 2">Month 2</option>
              <option value="Month 3">Month 3</option>
              <option value="Term">Term</option>
              <option value="Month 4">Month 4</option>
              <option value="Month 5">Month 5</option>
              <option value="Final Exam">Final Exam</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="Raadi arday ama ID..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {filteredExamsList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Wax dhibco imtixaan ah lama helin.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[#042954] font-bold uppercase border-b border-slate-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Magaca Ardayga</th>
                  <th className="p-3">Imtixaanka</th>
                  <th className="p-3">Celceliska</th>
                  <th className="p-3">Xaaladda</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700">
                {filteredExamsList.map((ex, idx) => (
                  <tr key={`${ex.studentId}-${ex.type}-${idx}`} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-[#042954]">{ex.studentId}</td>
                    <td className="p-3 font-bold text-slate-900">{ex.studentName}</td>
                    <td className="p-3 font-semibold">{ex.type}</td>
                    <td className="p-3 font-mono font-bold">{ex.average}%</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ex.status === 'Pass' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {ex.status === 'Pass' ? 'Gudbay (Pass)' : 'Dhacay (Fail)'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditExam(ex)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Wax ka bedel dhibcaha"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(ex.studentId, ex.type)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Tirtir natiijadan"
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
  );
}
