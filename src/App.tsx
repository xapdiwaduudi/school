import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Teacher, 
  AttendanceRecord, 
  ExamResult, 
  Schedule, 
  Expense, 
  SchoolData, 
  AppUser, 
  UserRole,
  ParentMessage,
  FinancialTransaction,
  SchoolAccount,
  PaymentSubmission
} from './types';
import { subscribeToSchoolData, saveSchoolDataToCloud, fetchSchoolDataFromCloud } from './firebase';
import { DEFAULT_ACCOUNTS } from './accountsData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import TeachersPage from './components/TeachersPage';
import AttendancePage from './components/AttendancePage';
import FeesPage from './components/FeesPage';
import AccountingPage from './components/AccountingPage';
import SchedulePage from './components/SchedulePage';
import ExpensesPage from './components/ExpensesPage';
import ExamEntryPage from './components/ExamEntryPage';
import ExamResultPage from './components/ExamResultPage';
import TrackerPage from './components/TrackerPage';
import ParentPortal from './components/ParentPortal';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import UsersManagementPage from './components/UsersManagementPage';
import ClassRankingPage from './components/ClassRankingPage';
import ParentTeacherChat from './components/ParentTeacherChat';
import AIAssistantPage from './components/AIAssistantPage';
import LoginPage from './components/LoginPage';
import { 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  HeartHandshake, 
  GraduationCap, 
  X, 
  Menu,
  Sparkles,
  Trophy,
  MessageCircle,
  Eye,
  EyeOff,
  CalendarCheck,
  CreditCard,
  DollarSign
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'XaajiSalaad_SchoolData';
const AUTH_STORAGE_KEY = 'XaajiSalaad_CurrentUser';

const DEFAULT_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'TX-1001',
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    account: 'Zaad',
    category: 'Student Fees',
    amount: 350,
    reference: 'REC-9011',
    payerPayee: 'Ardayda Class 1-4 (Bixinta Bisha)',
    note: 'Kharashka waxbarashada bisha ardayda',
    status: 'completed',
    createdBy: 'Maamulka'
  },
  {
    id: 'TX-1002',
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    account: 'Dahabshiil Bank',
    category: 'Uniform Sales',
    amount: 420,
    reference: 'REC-9012',
    payerPayee: 'Waalidiinta (Iibka Dareeska)',
    note: 'Dareeska cusub ee sanad-dugsiyeedka',
    status: 'completed',
    createdBy: 'Maamulka'
  },
  {
    id: 'TX-1003',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    account: 'Zaad',
    category: 'Teacher Salary',
    amount: 300,
    reference: 'SAL-TCH-01',
    payerPayee: 'Ustaad Axmed (Macallin)',
    note: 'Mushaharka bisha oo dhan',
    status: 'completed',
    createdBy: 'Maamulka'
  },
  {
    id: 'TX-1004',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    account: 'Cash Box',
    category: 'Utilities',
    amount: 65,
    reference: 'BILL-EL-88',
    payerPayee: 'Shirkadda Korontada & Biyaha',
    note: 'Bill-ka korontada & biyaha xafiisyada',
    status: 'completed',
    createdBy: 'Maamulka'
  },
  {
    id: 'TX-1005',
    date: new Date().toISOString().split('T')[0],
    type: 'transfer',
    account: 'Zaad',
    toAccount: 'Dahabshiil Bank',
    category: 'Other Expense',
    amount: 500,
    reference: 'TRF-3321',
    payerPayee: 'Laga soo wareejiyey Zaad loona wareejiyey Dahabshiil',
    note: 'Kaydinta lacagaha qasnadda ee bangiga',
    status: 'completed',
    createdBy: 'Maamulka'
  }
];

const DEFAULT_SUBJECTS = ["Somali", "English", "Arabic", "Maths", "Agriculture", "Physics", "Biology", "ICT"];

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin_1',
    username: 'admin1',
    password: '123',
    role: 'admin',
    fullName: 'Maamule Sare (Admin)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_deputy_1',
    username: 'ku_xigeen1',
    password: '123',
    role: 'vice_principal_1',
    fullName: 'Maamule Ku-xigeenka 1aad (Attendance)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_deputy_2',
    username: 'ku_xigeen2',
    password: '123',
    role: 'vice_principal_2',
    fullName: 'Maamule Ku-xigeenka 2aad (Fee Collection)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_teacher_1',
    username: 'ustaad1',
    password: '123',
    role: 'teacher',
    fullName: 'Ustaad Axmed (Macallin)',
    assignedSubject: 'Somali',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_parent_1',
    username: 'waalid1',
    password: '123',
    role: 'parent',
    fullName: 'Waalid Xasan (Parent)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_student_1',
    username: 'arday1',
    password: '123',
    role: 'student',
    fullName: 'Arday Cabdi (Student)',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});

  // Core States
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(DEFAULT_TRANSACTIONS);
  const [accounts, setAccounts] = useState<SchoolAccount[]>(DEFAULT_ACCOUNTS);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [passThreshold, setPassThreshold] = useState<number>(50);
  const [schoolName, setSchoolName] = useState<string>('Xaaji Salaad School');
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS);
  const [messages, setMessages] = useState<ParentMessage[]>([]);

  // Sync state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('Akkhor_SchoolData');
    if (stored) {
      try {
        const data: SchoolData = JSON.parse(stored);
        if (data.students) setStudents(data.students);
        if (data.teachers) setTeachers(data.teachers);
        if (data.attendance) setAttendance(data.attendance);
        if (data.exams) setExams(data.exams);
        if (data.schedules) setSchedules(data.schedules);
        if (data.expenses) setExpenses(data.expenses);
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
        if (data.accounts && data.accounts.length > 0) {
          setAccounts(data.accounts);
        }
        if (data.paymentSubmissions && data.paymentSubmissions.length > 0) {
          setPaymentSubmissions(data.paymentSubmissions);
        }
        if (data.subjects) setSubjects(data.subjects);
        if (data.threshold !== undefined) setPassThreshold(data.threshold);
        if (data.schoolName && data.schoolName !== 'Akkhor™' && data.schoolName !== 'Akkhor') {
          setSchoolName(data.schoolName);
        } else {
          setSchoolName('Xaaji Salaad School');
        }
        if (data.users && data.users.length > 0) {
          let mergedUsers = [...data.users];
          DEFAULT_USERS.forEach(defU => {
            if (!mergedUsers.some(u => u.username === defU.username || u.id === defU.id)) {
              mergedUsers.push(defU);
            }
          });
          setUsers(mergedUsers);
        }
        if (data.messages) setMessages(data.messages);
      } catch (e) {
        console.error("Error parsing local storage school data:", e);
      }
    }
  }, []);

  // 2. Real-time Cloud Synchronization with Firebase Firestore
  useEffect(() => {
    setIsSyncing(true);
    
    const unsubscribe = subscribeToSchoolData(
      (cloudData) => {
        setIsSyncing(false);
        setIsOnline(true);
        if (!cloudData) return;

        if (cloudData.students !== undefined) setStudents(cloudData.students || []);
        if (cloudData.teachers !== undefined) setTeachers(cloudData.teachers || []);
        if (cloudData.attendance !== undefined) setAttendance(cloudData.attendance || []);
        if (cloudData.exams !== undefined) setExams(cloudData.exams || []);
        if (cloudData.schedules !== undefined) setSchedules(cloudData.schedules || []);
        if (cloudData.expenses !== undefined) setExpenses(cloudData.expenses || []);
        if (cloudData.transactions !== undefined && cloudData.transactions.length > 0) {
          setTransactions(cloudData.transactions);
        }
        if (cloudData.accounts !== undefined && cloudData.accounts.length > 0) {
          setAccounts(cloudData.accounts);
        }
        if (cloudData.paymentSubmissions !== undefined) {
          setPaymentSubmissions(cloudData.paymentSubmissions || []);
        }
        if (cloudData.subjects !== undefined && cloudData.subjects.length > 0) {
          setSubjects(cloudData.subjects);
        }
        if (cloudData.threshold !== undefined) setPassThreshold(cloudData.threshold);
        if (cloudData.schoolName && cloudData.schoolName !== 'Akkhor™' && cloudData.schoolName !== 'Akkhor') {
          setSchoolName(cloudData.schoolName);
        } else {
          setSchoolName('Xaaji Salaad School');
        }
        if (cloudData.messages !== undefined) setMessages(cloudData.messages || []);
        if (cloudData.users !== undefined && cloudData.users.length > 0) {
          let mergedCloudUsers = [...cloudData.users];
          DEFAULT_USERS.forEach(defU => {
            if (!mergedCloudUsers.some(u => u.username === defU.username || u.id === defU.id)) {
              mergedCloudUsers.push(defU);
            }
          });
          setUsers(mergedCloudUsers);
          
          if (currentUser) {
            const freshUser = mergedCloudUsers.find(u => u.id === currentUser.id);
            if (freshUser) {
              setCurrentUser(freshUser);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
            }
          }
        }

        // Update local backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
      },
      (error) => {
        console.warn("Real-time cloud listener notice:", error);
        setIsSyncing(false);
      }
    );

    // Initial check: If cloud is empty, seed defaults
    fetchSchoolDataFromCloud().then((remoteData) => {
      setIsSyncing(false);
      if (!remoteData || !remoteData.users || remoteData.users.length === 0) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        let exportData: SchoolData;
        if (stored) {
          try {
            exportData = JSON.parse(stored);
            if (!exportData.users || exportData.users.length === 0) {
              exportData.users = DEFAULT_USERS;
            }
          } catch (e) {
            exportData = {
              students: [],
              teachers: [],
              attendance: [],
              exams: [],
              schedules: [],
              expenses: [],
              transactions: DEFAULT_TRANSACTIONS,
              accounts: DEFAULT_ACCOUNTS,
              paymentSubmissions: [],
              subjects: DEFAULT_SUBJECTS,
              threshold: 50,
              schoolName: 'Xaaji Salaad School',
              users: DEFAULT_USERS,
              messages: []
            };
          }
        } else {
          exportData = {
            students: [],
            teachers: [],
            attendance: [],
            exams: [],
            schedules: [],
            expenses: [],
            transactions: DEFAULT_TRANSACTIONS,
            accounts: DEFAULT_ACCOUNTS,
            paymentSubmissions: [],
            subjects: DEFAULT_SUBJECTS,
            threshold: 50,
            schoolName: 'Xaaji Salaad School',
            users: DEFAULT_USERS,
            messages: []
          };
        }
        saveSchoolDataToCloud(exportData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update active tab when user logs in to respect role permissions
  const handleUserLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    if (user.role === 'vice_principal_1') {
      setActiveTab('attendance');
    } else if (user.role === 'vice_principal_2') {
      setActiveTab('fees');
    } else if (user.role === 'teacher') {
      setActiveTab('exam-input');
    } else if (user.role === 'parent') {
      setActiveTab('parent');
    } else if (user.role === 'student') {
      setActiveTab('exam-portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setShowSwitchModal(false);
  };

  const handleQuickSwitch = (targetUser: AppUser) => {
    handleUserLogin(targetUser);
    setShowSwitchModal(false);
  };

  // General Save Callback that writes to Firestore Cloud AND LocalStorage
  const saveAllData = async (
    updatedStudents?: Student[],
    updatedExams?: ExamResult[],
    updatedSubjects?: string[],
    updatedThreshold?: number,
    updatedSchoolName?: string,
    updatedUsers?: AppUser[],
    updatedMessages?: ParentMessage[],
    updatedTransactions?: FinancialTransaction[],
    updatedAccounts?: SchoolAccount[],
    updatedPaymentSubmissions?: PaymentSubmission[],
    updatedTeachers?: Teacher[],
    updatedAttendance?: AttendanceRecord[],
    updatedSchedules?: Schedule[],
    updatedExpenses?: Expense[]
  ) => {
    const freshStudents = updatedStudents !== undefined ? updatedStudents : students;
    const freshTeachers = updatedTeachers !== undefined ? updatedTeachers : teachers;
    const freshAttendance = updatedAttendance !== undefined ? updatedAttendance : attendance;
    const freshExams = updatedExams !== undefined ? updatedExams : exams;
    const freshSchedules = updatedSchedules !== undefined ? updatedSchedules : schedules;
    const freshExpenses = updatedExpenses !== undefined ? updatedExpenses : expenses;
    const freshSubjects = updatedSubjects !== undefined ? updatedSubjects : subjects;
    const freshThreshold = updatedThreshold !== undefined ? updatedThreshold : passThreshold;
    const freshSchoolName = updatedSchoolName !== undefined ? updatedSchoolName : schoolName;
    const freshUsers = updatedUsers !== undefined ? updatedUsers : users;
    const freshMessages = updatedMessages !== undefined ? updatedMessages : messages;
    const freshTransactions = updatedTransactions !== undefined ? updatedTransactions : transactions;
    const freshAccounts = updatedAccounts !== undefined ? updatedAccounts : accounts;
    const freshPaymentSubmissions = updatedPaymentSubmissions !== undefined ? updatedPaymentSubmissions : paymentSubmissions;

    const exportObject: SchoolData = {
      students: freshStudents,
      attendance: freshAttendance,
      exams: freshExams,
      schedules: freshSchedules,
      expenses: freshExpenses,
      transactions: freshTransactions,
      teachers: freshTeachers,
      subjects: freshSubjects,
      threshold: freshThreshold,
      schoolName: freshSchoolName,
      users: freshUsers,
      messages: freshMessages,
      accounts: freshAccounts,
      paymentSubmissions: freshPaymentSubmissions
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(exportObject));

    try {
      setIsSyncing(true);
      await saveSchoolDataToCloud(exportObject);
      setIsSyncing(false);
    } catch (err) {
      console.warn("Could not push changes to cloud:", err);
      setIsSyncing(false);
    }
  };

  const handleAccountsSave = async (updatedAccounts: SchoolAccount[]) => {
    setAccounts(updatedAccounts);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedAccounts);
  };

  const handlePaymentSubmissionsSave = async (updatedSubmissions: PaymentSubmission[]) => {
    setPaymentSubmissions(updatedSubmissions);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedSubmissions);
  };

  const handleStudentsSave = (updatedStudents: Student[], updatedUsers?: AppUser[]) => {
    setStudents(updatedStudents);
    if (updatedUsers) {
      setUsers(updatedUsers);
      saveAllData(updatedStudents, undefined, undefined, undefined, undefined, updatedUsers);
    } else {
      saveAllData(updatedStudents);
    }
  };

  const handleTransactionsSave = async (updatedTransactions: FinancialTransaction[]) => {
    setTransactions(updatedTransactions);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedTransactions);
  };

  const handleTeachersSave = async (updatedTeachers: Teacher[], updatedUsers?: AppUser[]) => {
    setTeachers(updatedTeachers);
    if (updatedUsers) {
      setUsers(updatedUsers);
      saveAllData(undefined, undefined, undefined, undefined, undefined, updatedUsers, undefined, undefined, undefined, undefined, updatedTeachers);
    } else {
      saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedTeachers);
    }
  };

  const handleAttendanceSave = async (updatedAttendance: AttendanceRecord[]) => {
    setAttendance(updatedAttendance);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedAttendance);
  };

  const handleExamsSave = (updatedExams: ExamResult[]) => {
    setExams(updatedExams);
    saveAllData(undefined, updatedExams);
  };

  const handleSchedulesSave = async (updatedSchedules: Schedule[]) => {
    setSchedules(updatedSchedules);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedSchedules);
  };

  const handleExpensesSave = async (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, updatedExpenses);
  };

  const handleUsersSave = (updatedUsers: AppUser[]) => {
    setUsers(updatedUsers);
    saveAllData(undefined, undefined, undefined, undefined, undefined, updatedUsers);
  };

  const handleMessagesSave = (updatedMessages: ParentMessage[]) => {
    setMessages(updatedMessages);
    saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, updatedMessages);
  };

  const handleClearAllData = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setStudents([]);
    setTeachers([]);
    setAttendance([]);
    setExams([]);
    setSchedules([]);
    setExpenses([]);
    setSubjects(DEFAULT_SUBJECTS);
    setPassThreshold(50);
    setSchoolName('Xaaji Salaad School');
    setUsers(DEFAULT_USERS);
    setMessages([]);

    const emptyData: SchoolData = {
      students: [],
      teachers: [],
      attendance: [],
      exams: [],
      schedules: [],
      expenses: [],
      subjects: DEFAULT_SUBJECTS,
      threshold: 50,
      schoolName: 'Xaaji Salaad School',
      users: DEFAULT_USERS,
      messages: []
    };

    try {
      setIsSyncing(true);
      await saveSchoolDataToCloud(emptyData);
      setIsSyncing(false);
    } catch (err) {
      console.warn("Failed to clear cloud data:", err);
      setIsSyncing(false);
    }

    alert("Dhammaan xogta waa la tirtiray online & offline-ba!");
    setActiveTab('dashboard');
  };

  // If not logged in, render the login page
  if (!currentUser) {
    return (
      <LoginPage 
        users={users} 
        onLogin={handleUserLogin} 
        schoolName={schoolName}
        isOnline={isOnline}
      />
    );
  }

  const renderActivePage = () => {
    // Role protection checks: ensure all roles can access chat, ranking, and ai-assistant
    if (currentUser.role === 'vice_principal_1' && !['attendance', 'chat', 'ranking', 'ai-assistant'].includes(activeTab)) {
      return <AttendancePage students={students} attendance={attendance} setAttendance={setAttendance} saveData={handleAttendanceSave} />;
    }
    if (currentUser.role === 'vice_principal_2' && !['fees', 'accounting', 'chat', 'ranking', 'ai-assistant'].includes(activeTab)) {
      return (
        <FeesPage 
          students={students} 
          setStudents={setStudents} 
          saveData={handleStudentsSave}
          accounts={accounts}
          paymentSubmissions={paymentSubmissions}
          setPaymentSubmissions={setPaymentSubmissions}
          savePaymentSubmissions={handlePaymentSubmissionsSave}
          transactions={transactions}
          setTransactions={setTransactions}
          saveTransactions={handleTransactionsSave}
          currentUser={currentUser}
        />
      );
    }
    if (currentUser.role === 'teacher' && !['exam-input', 'chat', 'ai-assistant'].includes(activeTab)) {
      return (
        <ExamEntryPage 
          students={students} 
          subjects={subjects} 
          exams={exams} 
          setExams={setExams} 
          saveData={handleExamsSave} 
          passThreshold={passThreshold} 
          currentUser={currentUser}
        />
      );
    }
    if (currentUser.role === 'parent' && !['parent', 'chat', 'ranking', 'ai-assistant'].includes(activeTab)) {
      return (
        <ParentPortal 
          students={students} 
          attendance={attendance} 
          exams={exams} 
          passThreshold={passThreshold}
          currentUser={currentUser}
          accounts={accounts}
          paymentSubmissions={paymentSubmissions}
          setPaymentSubmissions={setPaymentSubmissions}
          savePaymentSubmissions={handlePaymentSubmissionsSave}
        />
      );
    }
    if (currentUser.role === 'student' && !['exam-portal', 'chat', 'ai-assistant'].includes(activeTab)) {
      return <ExamResultPage students={students} exams={exams} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} teachers={teachers} expenses={expenses} schoolName={schoolName} />;
      case 'ranking':
        return (
          <ClassRankingPage 
            students={students} 
            exams={exams} 
            subjects={subjects} 
            passThreshold={passThreshold} 
            schoolName={schoolName} 
          />
        );
      case 'chat':
        return (
          <ParentTeacherChat 
            students={students} 
            teachers={teachers} 
            users={users}
            messages={messages} 
            setMessages={setMessages} 
            saveMessages={handleMessagesSave} 
            currentUser={currentUser} 
            schoolName={schoolName}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistantPage 
            students={students} 
            teachers={teachers} 
            exams={exams} 
            subjects={subjects} 
            currentUser={currentUser} 
            schoolName={schoolName} 
          />
        );
      case 'student':
        return (
          <StudentsPage 
            students={students} 
            setStudents={setStudents} 
            saveData={handleStudentsSave} 
            users={users} 
          />
        );
      case 'teacher':
        return (
          <TeachersPage 
            teachers={teachers} 
            setTeachers={setTeachers} 
            saveData={handleTeachersSave} 
            users={users} 
            subjects={subjects} 
          />
        );
      case 'attendance':
        return <AttendancePage students={students} attendance={attendance} setAttendance={setAttendance} saveData={handleAttendanceSave} />;
      case 'fees':
        return (
          <FeesPage 
            students={students} 
            setStudents={setStudents} 
            saveData={handleStudentsSave}
            accounts={accounts}
            paymentSubmissions={paymentSubmissions}
            setPaymentSubmissions={setPaymentSubmissions}
            savePaymentSubmissions={handlePaymentSubmissionsSave}
            transactions={transactions}
            setTransactions={setTransactions}
            saveTransactions={handleTransactionsSave}
            currentUser={currentUser}
          />
        );
      case 'accounting':
        return (
          <AccountingPage 
            transactions={transactions} 
            setTransactions={setTransactions} 
            saveTransactions={handleTransactionsSave} 
            teachers={teachers} 
            students={students} 
            currentUser={currentUser} 
            schoolName={schoolName}
            accounts={accounts}
            setAccounts={setAccounts}
            saveAccounts={handleAccountsSave}
          />
        );
      case 'schedule':
        return <SchedulePage schedules={schedules} setSchedules={setSchedules} saveData={handleSchedulesSave} />;
      case 'expenses':
        return (
          <ExpensesPage 
            expenses={expenses} 
            setExpenses={setExpenses} 
            saveData={handleExpensesSave}
            accounts={accounts}
            transactions={transactions}
            setTransactions={setTransactions}
            saveTransactions={handleTransactionsSave}
            currentUser={currentUser}
          />
        );
      case 'exam-input':
        return (
          <ExamEntryPage 
            students={students} 
            subjects={subjects} 
            exams={exams} 
            setExams={setExams} 
            saveData={handleExamsSave} 
            passThreshold={passThreshold} 
            currentUser={currentUser}
          />
        );
      case 'exam-portal':
        return <ExamResultPage students={students} exams={exams} />;
      case 'tracker':
        return <TrackerPage students={students} attendance={attendance} exams={exams} passThreshold={passThreshold} />;
      case 'parent':
        return (
          <ParentPortal 
            students={students} 
            attendance={attendance} 
            exams={exams} 
            passThreshold={passThreshold}
            currentUser={currentUser}
            accounts={accounts}
            paymentSubmissions={paymentSubmissions}
            setPaymentSubmissions={setPaymentSubmissions}
            savePaymentSubmissions={handlePaymentSubmissionsSave}
          />
        );
      case 'report':
        return <ReportsPage attendance={attendance} />;
      case 'users':
        return (
          <UsersManagementPage 
            users={users} 
            setUsers={setUsers} 
            saveData={handleUsersSave}
            students={students}
            teachers={teachers}
            subjects={subjects}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            students={students} 
            setStudents={setStudents} 
            exams={exams} 
            setExams={setExams} 
            subjects={subjects} 
            setSubjects={setSubjects} 
            passThreshold={passThreshold} 
            setPassThreshold={setPassThreshold} 
            schoolName={schoolName} 
            setSchoolName={setSchoolName} 
            saveAllData={saveAllData} 
            clearAllData={handleClearAllData}
            accounts={accounts}
            setAccounts={setAccounts}
            saveAccounts={handleAccountsSave}
          />
        );
      default:
        return <Dashboard students={students} teachers={teachers} expenses={expenses} />;
    }
  };

  const getRoleBadgeUI = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <ShieldCheck className="w-3 h-3 text-amber-700" />
            <span>Admin</span>
          </span>
        );
      case 'vice_principal_1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
            <CalendarCheck className="w-3 h-3 text-cyan-700" />
            <span>Ku-xigeen 1aad (Attendance)</span>
          </span>
        );
      case 'vice_principal_2':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <CreditCard className="w-3 h-3 text-amber-700" />
            <span>Ku-xigeen 2aad (Fees)</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <BookOpen className="w-3 h-3 text-blue-700" />
            <span>Macallin ({currentUser.assignedSubject || 'Teacher'})</span>
          </span>
        );
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <HeartHandshake className="w-3 h-3 text-emerald-700" />
            <span>Waalid</span>
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            <GraduationCap className="w-3 h-3 text-purple-700" />
            <span>Arday</span>
          </span>
        );
    }
  };

  const toggleRevealPassword = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f0f1f3] flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        schoolName={schoolName}
        isOnline={isOnline}
        isSyncing={isSyncing}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={() => setShowSwitchModal(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        pendingReceiptsCount={paymentSubmissions.filter(s => s.status === 'pending').length}
      />

      {/* Main content body wrapper */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header Bar with Mobile Drawer Toggle, Switch User & Logout */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Fur Menu-ga"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider font-display truncate max-w-[150px] sm:max-w-none">
              {schoolName || "Xaaji Salaad School"} &bull; <span className="text-[#042954]">{activeTab.toUpperCase()}</span>
            </h1>
          </div>

          {/* User Controls and Switch Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                {currentUser.fullName || currentUser.username}
              </span>
              {getRoleBadgeUI(currentUser.role)}
            </div>

            {/* Live Chat Help Button in Header */}
            <button
              onClick={() => setActiveTab('chat')}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[38px]"
              title="Live Chat Help - Toos ula hadal Maamulka"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Live Chat Help</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowSwitchModal(true)}
                className="px-2.5 sm:px-3 py-1.5 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[38px]"
                title="Bedel User-ka"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#ffae01]" />
                <span className="hidden sm:inline">Switch User</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer min-h-[38px]"
              title="Ka bax nidaamka"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="p-3.5 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Switch User Modal (Admin only) */}
      {showSwitchModal && currentUser.role === 'admin' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#042954]/5 text-[#042954] rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Bedel User-ka (Switch User)
                  </h3>
                  <p className="text-xs text-slate-500">Dooro akoonka aad rabto inaad u wareegto</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = currentUser?.id === u.id;
                const isPassVisible = revealedPasswords[u.id];

                return (
                  <div
                    key={u.id}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div 
                      onClick={() => handleQuickSwitch(u)}
                      className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden pr-2"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#042954] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span className="truncate">{u.fullName || u.username}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>User: <strong className="text-slate-700">{u.username}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {getRoleBadgeUI(u.role)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRevealPassword(u.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Muuji/Qari Password-ka"
                      >
                        {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ka bax (Log Out)</span>
              </button>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Xir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Chat Help Button (Visible when not in Chat tab) */}
      {activeTab !== 'chat' && (
        <div className="fixed bottom-5 right-5 z-40 no-print">
          <button
            onClick={() => setActiveTab('chat')}
            className="group flex items-center gap-2.5 bg-[#042954] hover:bg-[#031d3d] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#ffae01] transition-all hover:scale-105 cursor-pointer"
            title="Live Chat Help - Toos ula hadal Maamulka"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-[#ffae01]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#042954] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#042954]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold font-display leading-tight flex items-center gap-1 text-white">
                Live Chat Help
              </span>
              <span className="text-[10px] text-[#ffae01] font-semibold leading-tight">
                {currentUser.role === 'admin' ? 'Messenger' : 'La Hadal Maamulka'}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
