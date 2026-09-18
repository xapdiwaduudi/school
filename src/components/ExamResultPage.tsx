import React, { useState } from 'react';
import { Student, ExamResult } from '../types';
import { Award, Search, Printer, FileText } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface ExamResultPageProps {
  students: Student[];
  exams: ExamResult[];
}

export default function ExamResultPage({ students, exams }: ExamResultPageProps) {
  const [searchKey, setSearchKey] = useState('');
  const [searchedResult, setSearchedResult] = useState<ExamResult | null>(null);
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);

  const handleSearch = () => {
    if (!searchKey.trim()) {
      alert("Fadlan geli ID-ga ardayga!");
      return;
    }

    const key = searchKey.trim().toLowerCase();
    const studentResults = exams.filter(r => r.studentId.toLowerCase() === key);
    const student = students.find(s => s.id.toLowerCase() === key);

    if (studentResults.length === 0 || !student) {
      alert("Natiijo lama helin! Fadlan hubi ID-ga.");
      setSearchedResult(null);
      setSearchedStudent(null);
      return;
    }

    setSearchedResult(studentResults[studentResults.length - 1]);
    setSearchedStudent(student);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Search Input Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs text-center no-print">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 mb-1">
          Raadinta Natiijada (Exam Result Viewer)
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Geli ID-ga ardayga si aad u hesho natiijadii ugu dambeysay ee uu ka keenay imtixaanadiisa.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Student ID (tusaale: STD-001)" 
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-center font-bold outline-none focus:bg-white focus:border-[#042954] transition-colors min-h-[44px]"
          />
          <button 
            onClick={handleSearch}
            className="bg-[#ffae01] text-slate-900 font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-[#e69d00] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Raadi Natiijada</span>
          </button>
        </div>
      </div>

      {/* Result Card */}
      {searchedResult && searchedStudent && (
        <div className="space-y-4">
          <div id="print-result-box" className="bg-white border-2 border-[#ffae01]/50 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <UserAvatar name={searchedStudent.name} photo={searchedStudent.img} size="lg" role="student" />
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{searchedStudent.name}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
                  ID: <strong className="text-[#042954]">{searchedStudent.id}</strong> &bull; {searchedStudent.form} ({searchedStudent.section})
                </p>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Imtixaanka: <strong className="text-slate-900">{searchedResult.type}</strong> &bull; Celceliska: <strong className="text-[#042954]">{searchedResult.average}%</strong>
                </div>
              </div>
            </div>

            {/* Marks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(searchedResult.marks).map(([subject, mark]) => (
                <div key={subject} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                  <label className="text-[10px] font-bold text-slate-400 block truncate uppercase">{subject}</label>
                  <div className="font-extrabold text-lg text-[#042954] mt-0.5">{mark}</div>
                </div>
              ))}
            </div>

            {/* Overall status centered */}
            <div className="text-center pt-3 border-t border-slate-100">
              <span className={`inline-block text-lg sm:text-xl font-black tracking-wider uppercase px-6 py-1.5 rounded-full ${
                searchedResult.status === 'Pass' 
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                  : 'text-rose-700 bg-rose-50 border border-rose-200'
              }`}>
                {searchedResult.status === 'Pass' ? 'PASSED (GUULEYSTAY)' : 'FAILED (DHACAY)'}
              </span>
            </div>
          </div>

          <button 
            onClick={handlePrint}
            className="w-full bg-[#042954] hover:bg-[#031d3d] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 no-print cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-[#ffae01]" />
            <span>Print Result Slip</span>
          </button>
        </div>
      )}
    </div>
  );
}
