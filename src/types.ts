export interface Student {
  id: string;
  name: string;
  img: string; // Base64 uploaded photo or empty string
  gender: 'Male' | 'Female';
  form: string; // e.g. "Class 1", "Class 2"
  section: string; // e.g. "Section A"
  age: string;
  mother: string;
  guardian: string;
  parentPhone?: string; // For WhatsApp direct chat
  feeAmount: number;
  feePaid: boolean;
  username?: string;
  password?: string;
  parentUsername?: string;
  parentPassword?: string;
}

export interface Teacher {
  id: string;
  name: string;
  img: string; // Base64 uploaded photo or empty string
  gender: 'Male' | 'Female';
  phone: string; // For WhatsApp direct chat
  age: string;
  subject: string;
  salary?: number;
  username?: string;
  password?: string;
}

export interface AttendanceRecord {
  id: string; // Student ID
  name: string; // Student Name
  form: string; // Class
  date: string;
  status: 'present' | 'absent';
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  type: string; // "Month 1", "Month 2", "Month 3", "Term", "Month 4", "Month 5", "Final Exam"
  marks: { [subject: string]: number };
  average: number;
  status: 'Pass' | 'Fail';
}

export interface Schedule {
  cls: string; // Class name
  day: string; // "Saturday", etc.
  sub: string; // Subject
  tch: string; // Teacher
  time: string; // e.g., "08:30"
}

export interface Expense {
  name: string;
  amt: number;
  date: string;
  note: string;
  account?: string; // "Accounts-kee lacagta laga saaray"
  accountId?: string;
}

export type PaymentAccount = 'Zaad' | 'Sahal' | 'EVC Plus' | 'Dahabshiil Bank' | 'Premier Bank' | 'Cash Box' | string;

export interface SchoolAccount {
  id: string;
  name: string; // e.g. "Salaam Bank / Hormuud EVC"
  bankName: string; // e.g. "Salaam Bank", "EVC Plus", "Zaad", "Sahal", "Dahabshiil Bank", "Premier Bank", "Cash Box"
  accountNumber: string; // e.g. "411840"
  phoneNumber: string; // e.g. "+252906305090"
  initialBalance: number; // 0
  description?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface PaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  submittedBy: string; // Parent or student name
  submitterRole: 'parent' | 'student' | 'admin';
  submitterPhone?: string;
  amount: number;
  accountId: string; // ID of the account deposited into
  accountName: string; // Account description
  transactionRef: string; // Reference number or mobile money code
  receiptUrl?: string; // Screenshot or receipt photo
  month: string; // Month covered
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type TransactionCategory = 
  | 'Student Fees' 
  | 'Teacher Salary' 
  | 'Staff Salary'
  | 'Uniform Sales' 
  | 'Books & Materials' 
  | 'Utilities' 
  | 'Rent' 
  | 'Maintenance' 
  | 'Internet & IT' 
  | 'Transportation' 
  | 'Exam & Stationery' 
  | 'Donation & Grants'
  | 'Other Income' 
  | 'Other Expense';

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  account: PaymentAccount | string;
  accountId?: string;
  toAccount?: PaymentAccount | string; // For transfers
  toAccountId?: string;
  category: TransactionCategory;
  amount: number;
  reference: string;
  payerPayee: string;
  note: string;
  createdBy?: string;
  status: 'completed' | 'pending';
}

export type UserRole = 'admin' | 'vice_principal_1' | 'vice_principal_2' | 'teacher' | 'parent' | 'student';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  assignedSubject?: string; // For teacher
  assignedStudentId?: string; // For student / parent
  phone?: string;
  createdAt: string;
}

export interface ParentMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'admin' | 'student' | 'vice_principal_1' | 'vice_principal_2';
  senderAvatar?: string;
  recipientId: string; // 'admin', user ID, or channel ID e.g. 'channel_general'
  recipientName: string;
  recipientRole?: 'admin' | 'teacher' | 'parent' | 'student' | 'vice_principal_1' | 'vice_principal_2' | 'channel';
  channelId?: string; // Optional channel id e.g. 'general', 'teachers', 'class_form1'
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status?: 'sent' | 'read';
  replyToId?: string;
  replyToSnippet?: {
    senderName: string;
    text: string;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> list of user names
  isEdited?: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}

export interface SchoolData {
  students: Student[];
  attendance: AttendanceRecord[];
  exams: ExamResult[];
  schedules: Schedule[];
  expenses: Expense[];
  transactions?: FinancialTransaction[];
  accounts?: SchoolAccount[];
  paymentSubmissions?: PaymentSubmission[];
  teachers: Teacher[];
  subjects: string[];
  threshold: number;
  schoolName: string;
  users?: AppUser[];
  messages?: ParentMessage[];
  updatedAt?: string;
}
