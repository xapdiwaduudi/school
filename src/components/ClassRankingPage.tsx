import React, { useState, useMemo } from 'react';
import { Student, ExamResult } from '../types';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Award, 
  TrendingUp, 
  Filter, 
  Printer, 
  Download, 
  Users, 
  CheckCircle, 
  XCircle,
  Star,
  GraduationCap
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface ClassRankingPageProps {
  students: Student[];
  exams: ExamResult[];
  subjects: string[];
  passThreshold: number;
  schoolName: string;
}

export default function ClassRankingPage({
  students,
  exams,
  subjects,
  passThreshold = 50,
  schoolName
}: ClassRankingPageProps) {
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedExamType, setSelectedExamType] = useState<string>('All'); // 'All' or specific exam like 'Final Exam'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'nodata'>('all');

  // Extract distinct classes available in students list
  const availableClasses = useMemo(() => {
    const defaultClasses = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Form 1", "Form 2", "Form 3", "Form 4"];
    const foundClasses = Array.from(new Set(students.map(s => s.form))).filter(Boolean);
    const merged = Array.from(new Set([...defaultClasses, ...foundClasses]));
    return merged;
  }, [students]);

  // Compute ranks for the selected class
  const rankedStudents = useMemo(() => {
    const classStudents = students.filter(s => s.form === selectedClass);

    const list = classStudents.map(student => {
      // Find relevant exams for this student
      let relevantExams = exams.filter(e => e.studentId.toLowerCase() === student.id.toLowerCase());
      if (selectedExamType !== 'All') {
        relevantExams = relevantExams.filter(e => e.type === selectedExamType);
      }

      if (relevantExams.length === 0) {
        return {
          student,
          hasData: false,
          totalScore: 0,
          average: 0,
          subjectCount: 0,
          passedSubjects: 0,
          failedSubjects: 0,
          status: 'No Data'
        };
      }

      // Aggregate all marks across subjects
      const combinedMarks: { [sub: string]: number } = {};
      const subjectExamCounts: { [sub: string]: number } = {};

      relevantExams.forEach(ex => {
        Object.entries(ex.marks).forEach(([sub, score]) => {
          combinedMarks[sub] = (combinedMarks[sub] || 0) + score;
          subjectExamCounts[sub] = (subjectExamCounts[sub] || 0) + 1;
        });
      });

      let totalSubjectScore = 0;
      let totalSubjects = 0;
      let passedCount = 0;
      let failedCount = 0;

      Object.keys(combinedMarks).forEach(sub => {
        const avgForSub = combinedMarks[sub] / (subjectExamCounts[sub] || 1);
        totalSubjectScore += avgForSub;
        totalSubjects += 1;
        if (avgForSub >= passThreshold) {
          passedCount += 1;
        } else {
          failedCount += 1;
        }
      });

      const overallAverage = totalSubjects > 0 
        ? Number((totalSubjectScore / totalSubjects).toFixed(1)) 
        : 0;

      const status = overallAverage >= passThreshold ? 'Pass' : 'Fail';

      return {
        student,
        hasData: true,
        totalScore: Math.round(totalSubjectScore),
        average: overallAverage,
        subjectCount: totalSubjects,
        passedSubjects: passedCount,
        failedSubjects: failedCount,
        status
      };
    });

    // Sort by average descending
    list.sort((a, b) => {
      if (a.hasData && !b.hasData) return -1;
      if (!a.hasData && b.hasData) return 1;
      return b.average - a.average;
    });

    // Assign ranking position
    let currentRank = 1;
    return list.map((item, index) => {
      if (!item.hasData) {
        return { ...item, rank: null };
      }
      if (index > 0 && item.average === list[index - 1].average && list[index - 1].hasData) {
        // Tie
        return { ...item, rank: currentRank };
      }
      currentRank = index + 1;
      return { ...item, rank: currentRank };
    });
  }, [students, exams, selectedClass, selectedExamType, passThreshold]);

  // Summary statistics for class
  const classStats = useMemo(() => {
    const studentsWithData = rankedStudents.filter(r => r.hasData);
    const passCount = studentsWithData.filter(s => s.status === 'Pass').length;
    const failCount = studentsWithData.filter(s => s.status === 'Fail').length;
    const noDataCount = rankedStudents.length - studentsWithData.length;

    if (studentsWithData.length === 0) {
      return {
        total: rankedStudents.length,
        evaluated: 0,
        classAvg: 0,
        topScore: 0,
        passRate: 0,
        failRate: 0,
        passCount: 0,
        failCount: 0,
        noDataCount
      };
    }

    const totalAvg = studentsWithData.reduce((acc, curr) => acc + curr.average, 0);
    const classAvg = Number((totalAvg / studentsWithData.length).toFixed(1));
    const topScore = studentsWithData[0]?.average || 0;
    const passRate = Math.round((passCount / studentsWithData.length) * 100);
    const failRate = Math.round((failCount / studentsWithData.length) * 100);

    return {
      total: rankedStudents.length,
      evaluated: studentsWithData.length,
      classAvg,
      topScore,
      passRate,
      failRate,
      passCount,
      failCount,
      noDataCount
    };
  }, [rankedStudents]);

  // Filtered students according to status tab
  const displayedStudents = useMemo(() => {
    if (statusFilter === 'pass') {
      return rankedStudents.filter(s => s.hasData && s.status === 'Pass');
    }
    if (statusFilter === 'fail') {
      return rankedStudents.filter(s => s.hasData && s.status === 'Fail');
    }
    if (statusFilter === 'nodata') {
      return rankedStudents.filter(s => !s.hasData);
    }
    return rankedStudents;
  }, [rankedStudents, statusFilter]);

  const top1 = rankedStudents.find(r => r.rank === 1);
  const top2 = rankedStudents.find(r => r.rank === 2);
  const top3 = rankedStudents.find(r => r.rank === 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy className="w-6 h-6 text-[#ffae01]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                Kaalmaha & Kala-sarraynta Ardayda (Class Ranking)
              </h2>
              <p className="text-xs text-slate-500">
                Kala-sarraynta ardayda, kaalmaha ay kala galeen, iyo xisaabinta inta baastay ama dhacday
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#ffae01]" />
              <span>Print Kaalmaha</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#042954]" />
              <span>Dooro Fasalka (Select Class)</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#042954] outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#042954]" />
              <span>Xilliga Imtixaanka (Exam Period)</span>
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="All">Dhammaan Imtixaannada (Overall Average)</option>
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
      </div>

      {/* Prominent Pass / Fail Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-print">
        {/* Card 1: Baastay (Passed) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'pass' ? 'all' : 'pass')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pass' 
              ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md' 
              : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Ardayda Baastay</span>
            </span>
            <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full font-black text-xs">
              {classStats.evaluated > 0 ? `${classStats.passRate}%` : '0%'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-display">
              {classStats.passCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              / {classStats.evaluated} arday
            </span>
          </div>
          <div className="text-[11px] text-emerald-700/80 font-medium mt-1">
            Dhibco &ge; {passThreshold}%
          </div>
        </div>

        {/* Card 2: Dhacday (Failed) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'fail' ? 'all' : 'fail')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'fail' 
              ? 'bg-rose-100/70 border-rose-500 ring-2 ring-rose-500/30 shadow-md' 
              : 'bg-rose-50/60 hover:bg-rose-50 border-rose-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Ardayda Dhacday</span>
            </span>
            <span className="px-2 py-0.5 bg-rose-200/80 text-rose-900 rounded-full font-black text-xs">
              {classStats.evaluated > 0 ? `${classStats.failRate}%` : '0%'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 font-display">
              {classStats.failCount}
            </span>
            <span className="text-xs font-semibold text-rose-600">
              / {classStats.evaluated} arday
            </span>
          </div>
          <div className="text-[11px] text-rose-700/80 font-medium mt-1">
            Dhibco &lt; {passThreshold}%
          </div>
        </div>

        {/* Card 3: Wadarta & Imtixaanka */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Wadarta Ardayda</span>
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {selectedClass}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {classStats.total}
            </span>
            <span className="text-xs text-slate-500 font-medium">arday</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
            <span>U galay imtixaanka:</span>
            <strong className="text-slate-800">{classStats.evaluated}</strong>
          </div>
        </div>

        {/* Card 4: Celceliska & Ugu Sareeya */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Celceliska Fasalka</span>
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Trophy className="w-3 h-3 text-[#ffae01]" /> {classStats.topScore > 0 ? `${classStats.topScore}%` : '-'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#042954] font-display">
              {classStats.classAvg > 0 ? `${classStats.classAvg}%` : '-'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Celcelis</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
            <span>Heerka Guusha (Pass):</span>
            <strong className="text-emerald-700">{classStats.passRate}%</strong>
          </div>
        </div>
      </div>

      {/* Visual Pass vs Fail Breakdown Bar */}
      {classStats.evaluated > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs no-print space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#042954]" />
              <span>Saamiga Guusha & Dhicitaanka ({selectedClass})</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Baastay: <strong className="text-emerald-700 font-bold">{classStats.passCount} ({classStats.passRate}%)</strong> &bull; Dhacday: <strong className="text-rose-700 font-bold">{classStats.failCount} ({classStats.failRate}%)</strong>
            </span>
          </div>
          
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${classStats.passRate}%` }} 
              className="bg-emerald-500 h-full transition-all duration-500 hover:bg-emerald-600"
              title={`Baastay: ${classStats.passCount} arday (${classStats.passRate}%)`}
            />
            <div 
              style={{ width: `${classStats.failRate}%` }} 
              className="bg-rose-500 h-full transition-all duration-500 hover:bg-rose-600"
              title={`Dhacday: ${classStats.failCount} arday (${classStats.failRate}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Baastay: <strong>{classStats.passCount} arday</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Dhacday: <strong>{classStats.failCount} arday</strong></span>
              </span>
              {classStats.noDataCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                  <span>Imtixaan la'aan: <strong>{classStats.noDataCount} arday</strong></span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Heerka Baaska: &ge; {passThreshold}%
            </span>
          </div>
        </div>
      )}

      {/* Top 3 Visual Podium (Rank 1, 2, 3 Showcase) */}
      {top1 && top1.hasData && (
        <div className="bg-linear-to-b from-[#042954] to-[#031d3d] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden no-print">
          <div className="text-center mb-6">
            <span className="px-3 py-1 bg-[#ffae01]/20 border border-[#ffae01]/40 text-[#ffae01] text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Ardayda ugu Sarreysa {selectedClass}</span>
            </span>
            <h3 className="text-xl font-black mt-2 font-display">Podium-ka Kaalmaha Koowaad</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-2">
            {/* Rank 2 - Silver */}
            {top2 && top2.hasData ? (
              <div className="order-2 sm:order-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-slate-300/20 flex flex-col items-center">
                <div className="relative mb-2">
                  <UserAvatar name={top2.student.name} photo={top2.student.img} size="lg" role="student" />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border-2 border-[#042954] shadow-sm">
                    2
                  </div>
                </div>
                <div className="font-bold text-sm truncate w-full text-white">{top2.student.name}</div>
                <div className="text-xs text-slate-300 font-mono">ID: {top2.student.id}</div>
                <div className="mt-2 px-3 py-1 bg-slate-200/20 rounded-xl text-slate-200 font-bold text-xs">
                  {top2.average}% &bull; {top2.totalScore} pts
                </div>
              </div>
            ) : (
              <div className="order-2 sm:order-1 hidden sm:block"></div>
            )}

            {/* Rank 1 - Gold (Champion) */}
            <div className="order-1 sm:order-2 bg-linear-to-b from-[#ffae01]/30 to-[#ffae01]/10 backdrop-blur-md rounded-2xl p-5 text-center border-2 border-[#ffae01] flex flex-col items-center shadow-2xl relative -mt-4">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-[#ffae01] text-slate-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3" /> Kaalinta 1-aad
              </div>
              <div className="relative mb-2 mt-2">
                <UserAvatar name={top1.student.name} photo={top1.student.img} size="xl" role="student" />
                <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-[#ffae01] text-slate-950 font-black text-sm flex items-center justify-center border-2 border-[#042954] shadow-md">
                  🥇
                </div>
              </div>
              <div className="font-extrabold text-base truncate w-full text-white">{top1.student.name}</div>
              <div className="text-xs text-amber-200 font-mono">ID: {top1.student.id}</div>
              <div className="mt-2 px-4 py-1.5 bg-[#ffae01] text-slate-950 font-black text-sm rounded-xl shadow-md">
                {top1.average}% &bull; {top1.totalScore} dhibcood
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            {top3 && top3.hasData ? (
              <div className="order-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-amber-700/30 flex flex-col items-center">
                <div className="relative mb-2">
                  <UserAvatar name={top3.student.name} photo={top3.student.img} size="lg" role="student" />
                  <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-[#042954] shadow-sm">
                    3
                  </div>
                </div>
                <div className="font-bold text-sm truncate w-full text-white">{top3.student.name}</div>
                <div className="text-xs text-slate-300 font-mono">ID: {top3.student.id}</div>
                <div className="mt-2 px-3 py-1 bg-amber-900/30 rounded-xl text-amber-200 font-bold text-xs">
                  {top3.average}% &bull; {top3.totalScore} pts
                </div>
              </div>
            ) : (
              <div className="order-3 hidden sm:block"></div>
            )}
          </div>
        </div>
      )}

      {/* Printable Official Header (Visible on print) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-wider">{schoolName || 'Xaaji Salaad School'}</h1>
        <h2 className="text-lg font-bold mt-1 text-slate-800">
          Warqadda Kaalmaha & Kala-sarraynta (Official Class Ranking Sheet)
        </h2>
        <div className="grid grid-cols-3 text-xs font-semibold text-slate-600 mt-3 px-4">
          <span>Fasalka: <strong>{selectedClass}</strong></span>
          <span>Xilliga: <strong>{selectedExamType === 'All' ? 'Overall Average' : selectedExamType}</strong></span>
          <span>Taariikhda: <strong>{new Date().toLocaleDateString()}</strong></span>
        </div>
        <div className="mt-2 bg-slate-100 py-1.5 px-4 rounded text-xs font-bold text-slate-800 flex justify-between">
          <span>Wadarta Ardayda: <strong>{classStats.total}</strong></span>
          <span>Baastay (Pass): <strong className="text-emerald-700">{classStats.passCount} ({classStats.passRate}%)</strong></span>
          <span>Dhacday (Fail): <strong className="text-rose-700">{classStats.failCount} ({classStats.failRate}%)</strong></span>
          <span>Celceliska: <strong>{classStats.classAvg}%</strong></span>
        </div>
      </div>

      {/* Complete Ranked Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Kala-sarraynta Dhammaan Ardayda ({selectedClass})
            </h3>
            <p className="text-xs text-slate-500">
              Waxaa lagu habeeyay sida ay u kala dhibco iyo boqolkiiba badan yihiin
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap no-print">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#042954] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Dhammaan ({classStats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pass')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer ${
                statusFilter === 'pass'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Baasay ({classStats.passCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('fail')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer ${
                statusFilter === 'fail'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Dhacay ({classStats.failCount})</span>
            </button>
            {classStats.noDataCount > 0 && (
              <button
                onClick={() => setStatusFilter('nodata')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  statusFilter === 'nodata'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Imtixaan la'aan ({classStats.noDataCount})
              </button>
            )}
          </div>
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs sm:text-sm">
            {statusFilter === 'all' 
              ? `Fasalkan (${selectedClass}) kuma jiraan wax arday ah.`
              : `Ma jiraan arday buuxisay shuruudda (${statusFilter.toUpperCase()}) fasalka ${selectedClass}.`}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3.5 text-center">Kaalinta (Rank)</th>
                    <th className="p-3.5">Sawir</th>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Magaca Ardayga</th>
                    <th className="p-3.5 text-center">Maadooyinka</th>
                    <th className="p-3.5 text-center">Wadarta (Total)</th>
                    <th className="p-3.5 text-center">Boqolkiiba (Avg %)</th>
                    <th className="p-3.5 text-center">Xaaladda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayedStudents.map((item) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr 
                        key={item.student.id} 
                        className={`transition-colors ${
                          isTop1 ? 'bg-amber-50/50 hover:bg-amber-50 font-semibold' :
                          isTop2 ? 'bg-slate-50/70 hover:bg-slate-100' :
                          isTop3 ? 'bg-orange-50/30 hover:bg-orange-50/60' :
                          'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          {item.rank ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                              isTop1 ? 'bg-[#ffae01] text-slate-950 ring-2 ring-[#ffae01]/50 shadow-sm' :
                              isTop2 ? 'bg-slate-200 text-slate-800' :
                              isTop3 ? 'bg-amber-700 text-white' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {isTop1 ? '🥇 1' : isTop2 ? '🥈 2' : isTop3 ? '🥉 3' : `#${item.rank}`}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <UserAvatar name={item.student.name} photo={item.student.img} size="md" role="student" />
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#042954]">{item.student.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{item.student.name}</div>
                          <div className="text-[11px] text-slate-400">{item.student.guardian || item.student.section}</div>
                        </td>
                        <td className="p-3.5 text-center">
                          {item.hasData ? (
                            <span className="text-slate-600 font-medium">
                              {item.passedSubjects}/{item.subjectCount} baas
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-800">
                          {item.hasData ? item.totalScore : '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          {item.hasData ? (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              item.average >= passThreshold 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {item.average}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {item.hasData ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Pass' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.status === 'Pass' ? 'Gudbay (Pass)' : 'Haray (Fail)'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              Imtixaan la'aan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {displayedStudents.map((item) => {
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;

                return (
                  <div 
                    key={item.student.id} 
                    className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                      isTop1 ? 'bg-amber-50/80 border-[#ffae01] ring-1 ring-[#ffae01]/40' :
                      isTop2 ? 'bg-slate-50 border-slate-300' :
                      isTop3 ? 'bg-orange-50/50 border-amber-300' :
                      'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          isTop1 ? 'bg-[#ffae01] text-slate-950' :
                          isTop2 ? 'bg-slate-300 text-slate-800' :
                          isTop3 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.rank ? `#${item.rank}` : '-'}
                        </div>
                        <UserAvatar name={item.student.name} photo={item.student.img} size="md" role="student" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.student.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">ID: {item.student.id}</div>
                        </div>
                      </div>

                      {item.hasData && (
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block ${
                            item.average >= passThreshold 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.average}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs bg-white p-2 rounded-lg border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Wadarta</span>
                        <span className="font-bold text-slate-800">{item.hasData ? item.totalScore : '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Gudbay</span>
                        <span className="font-semibold text-slate-700">
                          {item.hasData ? `${item.passedSubjects}/${item.subjectCount}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Xaaladda</span>
                        <span className={`font-bold text-[11px] ${
                          item.status === 'Pass' ? 'text-emerald-600' : item.hasData ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {item.status === 'Pass' ? 'Baas' : item.hasData ? 'Dhacay' : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Signature lines on print */}
      <div className="hidden print:grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-slate-300 text-xs">
        <div className="text-center">
          <div className="border-b border-slate-400 pb-8"></div>
          <div className="font-bold mt-2">Saxiixa Macallinka Fasalka</div>
        </div>
        <div className="text-center">
          <div className="border-b border-slate-400 pb-8"></div>
          <div className="font-bold mt-2">Saxiixa & Shaambadda Maamulaha</div>
        </div>
      </div>
    </div>
  );
}
