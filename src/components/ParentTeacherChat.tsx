import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ParentMessage, Student, Teacher, AppUser } from '../types';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Search, 
  Sparkles, 
  Reply, 
  GraduationCap, 
  HeartHandshake, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Trash2,
  Edit3,
  X,
  Save,
  Copy,
  Smile,
  Megaphone,
  BookOpen,
  CalendarCheck,
  CreditCard,
  ChevronLeft,
  Plus,
  CornerDownRight,
  CheckCheck,
  Check,
  Paperclip,
  CheckCheck as DoubleCheck
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface ParentTeacherChatProps {
  students: Student[];
  teachers: Teacher[];
  users?: AppUser[];
  messages: ParentMessage[];
  setMessages: (msgs: ParentMessage[]) => void;
  saveMessages: (updatedMessages: ParentMessage[]) => void;
  currentUser: AppUser | null;
  schoolName?: string;
}

// Conversation Target Definition (can be a channel or an individual)
interface ChatTarget {
  id: string; // e.g. 'channel_general', 'channel_staff', 'class_Form 1A', or user ID
  type: 'channel' | 'direct';
  name: string;
  roleLabel: string;
  roleBadge: 'admin' | 'vice_principal' | 'teacher' | 'student' | 'parent' | 'channel';
  subtext: string;
  phone?: string;
  photo?: string;
  classGroup?: string;
  subject?: string;
  isOfficialChannel?: boolean;
}

// Quick reaction emojis
const QUICK_EMOJIS = ['👍', '❤️', '👏', '💡', '📚', '✅', '🙏', '🎯'];

// Quick templates for fast Somalilife school communication
const QUICK_TEMPLATES = [
  "Asc, waan helay fariintaada, mahadsanid! 👍",
  "Fadlan soo wac xafiiska iskuulka marka aad fursad hesho 📞",
  "Casharka maanta fadlan dib u eega 📚",
  "Ardaygu maanta fasax buu ka ahaa xanuun darted 🏥",
  "Goormaa la qaadayaa imtixaanka maaddada? ⏱️",
  "Hambalyo dadaalkaaga iyo natiijadaada fiican! 🌟",
  "Waalid fadlan la soco xaadirinta ardaygaaga 👨‍👩‍👧"
];

export default function ParentTeacherChat({
  students,
  teachers,
  users = [],
  messages,
  setMessages,
  saveMessages,
  currentUser,
  schoolName = 'Xaaji Salaad School'
}: ParentTeacherChatProps) {
  const currentRole = currentUser?.role || 'admin';
  const isAdmin = currentRole === 'admin';
  const isVicePrincipal = currentRole === 'vice_principal_1' || currentRole === 'vice_principal_2';
  const isAnyAdmin = isAdmin || isVicePrincipal;
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isParent = currentRole === 'parent';

  // Find linked models
  const linkedStudent = useMemo(() => {
    if (isStudent) {
      return students.find(s => s.id === currentUser?.assignedStudentId || s.username === currentUser?.username) || null;
    }
    if (isParent) {
      return students.find(s => s.id === currentUser?.assignedStudentId) || null;
    }
    return null;
  }, [isStudent, isParent, currentUser, students]);

  const linkedTeacher = useMemo(() => {
    if (isTeacher) {
      return teachers.find(t => t.id === currentUser?.id || t.username === currentUser?.username) || null;
    }
    return null;
  }, [isTeacher, currentUser, teachers]);

  // Current user's normalized identifier in chat
  const myChatId = useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    if (isTeacher && linkedTeacher?.id) return linkedTeacher.id;
    if (isStudent && linkedStudent?.id) return linkedStudent.id;
    if (isParent && linkedStudent?.id) return `parent_${linkedStudent.id}`;
    return 'admin';
  }, [currentUser, isTeacher, linkedTeacher, isStudent, linkedStudent, isParent]);

  const myChatName = useMemo(() => {
    if (currentUser?.fullName) return currentUser.fullName;
    if (isTeacher && linkedTeacher?.name) return `Macallin ${linkedTeacher.name}`;
    if (isStudent && linkedStudent?.name) return `Arday ${linkedStudent.name}`;
    if (isParent && linkedStudent) return linkedStudent.guardian ? `Waalidka ${linkedStudent.guardian}` : `Waalidka ${linkedStudent.name}`;
    return currentUser?.username || 'Maamulka Iskuulka';
  }, [currentUser, isTeacher, linkedTeacher, isStudent, linkedStudent, isParent]);

  // Active channel/conversation ID - Non-admin defaults to Maamulaha Sare (Live Chat)
  const [activeChatId, setActiveChatId] = useState<string>(() => isAnyAdmin ? 'channel_general' : 'admin');
  // Left sidebar filter tab: 'all' | 'channels' | 'teachers' | 'students' | 'parents' | 'admin'
  const [chatCategoryFilter, setChatCategoryFilter] = useState<'all' | 'channels' | 'teachers' | 'students' | 'parents' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile drawer view: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  // Input & composer state
  const [messageInput, setMessageInput] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ParentMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [copiedToastId, setCopiedToastId] = useState<string | null>(null);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [newChatSearch, setNewChatSearch] = useState<string>('');
  const [newChatCategory, setNewChatCategory] = useState<'all' | 'teacher' | 'student' | 'parent' | 'admin'>('all');

  // WhatsApp directory modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [waSearch, setWaSearch] = useState<string>('');

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Scroll to bottom ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Distinct classes for channels
  const distinctClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.form && s.form.trim()) set.add(s.form.trim());
    });
    if (set.size === 0) {
      set.add('Form 1A');
      set.add('Form 2A');
      set.add('Form 3A');
      set.add('Form 4A');
    }
    return Array.from(set).sort();
  }, [students]);

  // All predefined school channels
  // Sida uu dalbaday macmiilku: Ardayda, macallimiinta iyo waalidiintu waxay arkaan kaliya Ogeysiisyada Guud ee Maamulka.
  // Maamulka kaliya ayaa heli kara kooxaha kale.
  const channelsList: ChatTarget[] = useMemo(() => {
    const list: ChatTarget[] = [
      {
        id: 'channel_general',
        type: 'channel',
        name: '📢 Ogeysiisyada Guud (School Announcements)',
        roleLabel: 'Guud / Dhammaan',
        roleBadge: 'channel',
        subtext: 'Ogeysiisyada rasmiga ah ee Maamulka Iskuulka Xaaji Salaad',
        isOfficialChannel: true
      }
    ];

    // Staff and Class channels are ONLY for Admin
    if (isAnyAdmin) {
      list.push({
        id: 'channel_staff',
        type: 'channel',
        name: '👨‍🏫 Qolka Macallimiinta & Maamulka',
        roleLabel: 'Staff & Faculty',
        roleBadge: 'channel',
        subtext: 'Wadahadalka gaarka ah ee macallimiinta iyo maamulka',
        isOfficialChannel: true
      });

      distinctClasses.forEach(cls => {
        list.push({
          id: `class_${cls}`,
          type: 'channel',
          name: `🏫 Fasalka ${cls}`,
          roleLabel: `Group ${cls}`,
          roleBadge: 'channel',
          subtext: `Kooxda fasalka ${cls} ee ardayda, macallimiinta iyo maamulka`,
          classGroup: cls
        });
      });
    }

    return list;
  }, [distinctClasses, isAnyAdmin]);

  // Build directory of all possible DM targets across school
  // Xeerka Wada-xiriirka:
  // Maamulaha KALIYA ayaa la hadli kara ardayda, macalimiinta ama waalidiinta.
  // Ardayda, macalimiinta iyo waalidka KALIYA maamulaha (Admin & VPs) ayey la hadli karaan si toos ah (Live Chat Help).
  const allDirectTargets: ChatTarget[] = useMemo(() => {
    const list: ChatTarget[] = [];

    // 1. Administrators (Always included, the single contact point for students, teachers, and parents)
    // Main Admin
    list.push({
      id: 'admin',
      type: 'direct',
      name: 'Maamulaha Sare (Head Office & Live Help)',
      roleLabel: 'Maamule Sare',
      roleBadge: 'admin',
      subtext: 'Xafiiska Maamulka Guud & Live Support',
      phone: '+252906305090'
    });

    // Ku-xigeenka 1aad (VP Attendance & Routine)
    list.push({
      id: 'vice_principal_1',
      type: 'direct',
      name: 'Maamule Ku-xigeenka 1aad (Attendance)',
      roleLabel: 'Ku-xigeen 1',
      roleBadge: 'vice_principal',
      subtext: 'Qaybta Xaadirinta, Jadwalka & Anshaxa',
      phone: '+252906305090'
    });

    // Ku-xigeenka 2aad (VP Finance & Fees)
    list.push({
      id: 'vice_principal_2',
      type: 'direct',
      name: 'Maamule Ku-xigeenka 2aad (Fees & Finance)',
      roleLabel: 'Ku-xigeen 2',
      roleBadge: 'vice_principal',
      subtext: 'Qaybta Maaliyadda, Fiiga & Xisaabaadka',
      phone: '+252906305090'
    });

    // 2. Teachers, Students, and Parents are ONLY accessible by Maamulka (Admin & Vice Principals)
    if (isAnyAdmin) {
      // Teachers
      teachers.forEach(t => {
        list.push({
          id: t.id,
          type: 'direct',
          name: `Macallin ${t.name}`,
          roleLabel: `Macallin (${t.subject})`,
          roleBadge: 'teacher',
          subtext: `Maaddada: ${t.subject}`,
          phone: t.phone,
          photo: t.img,
          subject: t.subject
        });
      });

      // Students
      students.forEach(s => {
        list.push({
          id: s.id,
          type: 'direct',
          name: `Arday ${s.name}`,
          roleLabel: `Arday (${s.form})`,
          roleBadge: 'student',
          subtext: `Fasalka: ${s.form} &bull; ID: ${s.id}`,
          phone: s.parentPhone,
          photo: s.img,
          classGroup: s.form
        });
      });

      // Parents (linked by student guardian)
      students.filter(s => s.guardian || s.parentPhone).forEach(s => {
        list.push({
          id: `parent_${s.id}`,
          type: 'direct',
          name: s.guardian ? `Waalidka ${s.guardian}` : `Waalidka ${s.name}`,
          roleLabel: `Waalid (${s.form})`,
          roleBadge: 'parent',
          subtext: `Ardayga: ${s.name} (${s.form})`,
          phone: s.parentPhone,
          photo: s.img,
          classGroup: s.form
        });
      });
    }

    return list;
  }, [teachers, students, isAnyAdmin]);

  // Combine Channels & Direct Targets into quick map
  const allTargetsMap = useMemo(() => {
    const map = new Map<string, ChatTarget>();
    channelsList.forEach(c => map.set(c.id, c));
    allDirectTargets.forEach(t => map.set(t.id, t));
    return map;
  }, [channelsList, allDirectTargets]);

  // Auto-seed welcoming messages if messages list is empty
  useEffect(() => {
    if (messages.length === 0) {
      const initial: ParentMessage[] = [
        {
          id: 'seed_msg_1',
          senderId: 'admin',
          senderName: 'Maamule Sare (Admin)',
          senderRole: 'admin',
          recipientId: 'channel_general',
          recipientName: 'Ogeysiisyada Guud',
          recipientRole: 'channel',
          channelId: 'channel_general',
          subject: 'Kusoo dhawaada Nidaamka Wada-xiriirka',
          message: 'Asc dhammaan macallimiinta, ardayda, iyo waalidiinta Iskuulka Xaaji Salaad. Waxaan idiinku soo dhawaynaynaa nidaamka wada-xiriirka tooska ah. Halkan waxaad toos iskula xiriiri kartaan qoraal, su\'aalo, iyo ogeysiisyo!',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          status: 'read'
        },
        {
          id: 'seed_msg_2',
          senderId: 'vice_principal_1',
          senderName: 'Maamule Ku-xigeenka 1aad',
          senderRole: 'vice_principal_1',
          recipientId: 'channel_general',
          recipientName: 'Ogeysiisyada Guud',
          recipientRole: 'channel',
          channelId: 'channel_general',
          subject: 'Jadwalka & Xaadirinta',
          message: 'Waxaa la ogeysiinayaa ardayda iyo macallimiinta in subax walba 07:30 AM la bilaabayo safka subaxnimo.',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          status: 'read'
        },
        {
          id: 'seed_msg_3',
          senderId: 'user_teacher_1',
          senderName: 'Ustaad Axmed (Macallin)',
          senderRole: 'teacher',
          recipientId: 'channel_staff',
          recipientName: 'Qolka Macallimiinta & Maamulka',
          recipientRole: 'channel',
          channelId: 'channel_staff',
          subject: 'Casharrada Asbuucan',
          message: 'Dhammaan casharradii iyo imtixaanaadkii maaddooyinka waa diyaar. Fadlan maamulku ha eego jadwalka.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          status: 'read'
        }
      ];
      setMessages(initial);
      saveMessages(initial);
    }
  }, [messages.length, setMessages, saveMessages]);

  // Messages matching currently active conversation (channel or 1-on-1 thread)
  const activeConversationMessages = useMemo(() => {
    const isChannel = activeChatId.startsWith('channel_') || activeChatId.startsWith('class_');

    if (isChannel) {
      return messages.filter(m => m.channelId === activeChatId || m.recipientId === activeChatId);
    }

    if (!isAnyAdmin) {
      // User is Student, Teacher, or Parent.
      // They can ONLY communicate with Maamulka (admin, vice_principal_1, vice_principal_2).
      const adminTargetIds = ['admin', 'vice_principal_1', 'vice_principal_2'];
      const targetAdminId = adminTargetIds.includes(activeChatId) ? activeChatId : 'admin';

      return messages.filter(m => {
        if (m.channelId || m.recipientRole === 'channel') return false;

        // Sent by me to Maamulka
        const sentByMeToAdmin = 
          (m.senderId === myChatId) && 
          (m.recipientId === targetAdminId || adminTargetIds.includes(m.recipientId) || m.recipientRole === 'admin');

        // Sent by Maamulka to me
        const sentByAdminToMe = 
          (m.senderId === targetAdminId || adminTargetIds.includes(m.senderId) || m.senderRole === 'admin' || m.senderRole === 'vice_principal_1' || m.senderRole === 'vice_principal_2') && 
          (m.recipientId === myChatId || (linkedStudent && m.recipientId === linkedStudent.id));

        return sentByMeToAdmin || sentByAdminToMe;
      });
    } else {
      // Current user is an Administrator / Vice Principal
      // Viewing a conversation with another user (student, teacher, parent, or VP)
      const otherId = activeChatId;
      return messages.filter(m => {
        if (m.channelId || m.recipientRole === 'channel') return false;

        const fromAdminToUser = 
          (m.senderId === myChatId || m.senderId === 'admin' || m.senderRole === 'admin' || m.senderRole === 'vice_principal_1' || m.senderRole === 'vice_principal_2') &&
          (m.recipientId === otherId);

        const fromUserToAdmin = 
          (m.senderId === otherId) &&
          (m.recipientId === myChatId || m.recipientId === 'admin' || m.recipientRole === 'admin' || m.recipientRole === 'vice_principal_1' || m.recipientRole === 'vice_principal_2');

        return fromAdminToUser || fromUserToAdmin;
      });
    }
  }, [messages, activeChatId, myChatId, isAnyAdmin, linkedStudent]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages.length, activeChatId]);

  // List of active conversations to show in the left list
  const conversationListItems = useMemo(() => {
    const items: Array<{
      target: ChatTarget;
      lastMessage?: ParentMessage;
      unreadCount: number;
    }> = [];

    // If not admin: ONLY show Ogeysiisyada Guud & Maamulka Offices
    if (!isAnyAdmin) {
      // 1. Ogeysiisyada Guud
      const generalChan = channelsList.find(c => c.id === 'channel_general');
      if (generalChan) {
        const chanMsgs = messages.filter(m => m.channelId === generalChan.id || m.recipientId === generalChan.id);
        items.push({
          target: generalChan,
          lastMessage: chanMsgs[chanMsgs.length - 1],
          unreadCount: 0
        });
      }

      // 2. ONLY Maamulka Contacts
      ['admin', 'vice_principal_1', 'vice_principal_2'].forEach(id => {
        const target = allTargetsMap.get(id);
        if (!target) return;

        const dmMessages = messages.filter(m => {
          if (m.channelId || m.recipientRole === 'channel') return false;
          return (m.senderId === myChatId && (m.recipientId === id || (id === 'admin' && m.recipientRole === 'admin'))) ||
                 ((m.senderId === id || (id === 'admin' && m.senderRole === 'admin')) && (m.recipientId === myChatId || (linkedStudent && m.recipientId === linkedStudent.id)));
        });

        items.push({
          target,
          lastMessage: dmMessages[dmMessages.length - 1],
          unreadCount: 0
        });
      });

      // Filter by search query if any
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return items.filter(item => 
          item.target.name.toLowerCase().includes(q) ||
          item.target.subtext.toLowerCase().includes(q) ||
          (item.lastMessage?.message && item.lastMessage.message.toLowerCase().includes(q))
        );
      }

      return items;
    }

    // Admin view: shows all channels and all active/contacted users
    // 1. All channels
    channelsList.forEach(chan => {
      const chanMsgs = messages.filter(m => m.channelId === chan.id || m.recipientId === chan.id);
      const lastMsg = chanMsgs[chanMsgs.length - 1];
      items.push({
        target: chan,
        lastMessage: lastMsg,
        unreadCount: 0
      });
    });

    // 2. Direct conversations where there's already message history or key directory contacts
    const contactedIds = new Set<string>();
    messages.forEach(m => {
      if (m.channelId || m.recipientRole === 'channel') return;
      contactedIds.add(m.senderId);
      contactedIds.add(m.recipientId);
    });

    // Also include key teachers and students for fast access
    teachers.forEach(t => contactedIds.add(t.id));
    students.slice(0, 15).forEach(s => contactedIds.add(s.id));

    contactedIds.forEach(id => {
      if (id === myChatId || id === 'admin') return;
      const target = allTargetsMap.get(id);
      if (!target) return;

      const dmMessages = messages.filter(m => {
        if (m.channelId) return false;
        return (m.senderId === id && (m.recipientId === myChatId || m.recipientId === 'admin')) ||
               ((m.senderId === myChatId || m.senderId === 'admin') && m.recipientId === id);
      });

      const lastMsg = dmMessages[dmMessages.length - 1];
      items.push({
        target,
        lastMessage: lastMsg,
        unreadCount: 0
      });
    });

    // Filter by Category for admin
    let filtered = items;
    if (chatCategoryFilter === 'channels') {
      filtered = filtered.filter(item => item.target.type === 'channel');
    } else if (chatCategoryFilter === 'teachers') {
      filtered = filtered.filter(item => item.target.roleBadge === 'teacher');
    } else if (chatCategoryFilter === 'students') {
      filtered = filtered.filter(item => item.target.roleBadge === 'student');
    } else if (chatCategoryFilter === 'parents') {
      filtered = filtered.filter(item => item.target.roleBadge === 'parent');
    } else if (chatCategoryFilter === 'admin') {
      filtered = filtered.filter(item => item.target.roleBadge === 'admin' || item.target.roleBadge === 'vice_principal');
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.target.name.toLowerCase().includes(q) ||
        item.target.subtext.toLowerCase().includes(q) ||
        (item.lastMessage?.message && item.lastMessage.message.toLowerCase().includes(q))
      );
    }

    // Sort: Channels first, then latest message timestamp
    return filtered.sort((a, b) => {
      if (a.target.type === 'channel' && b.target.type !== 'channel') return -1;
      if (b.target.type === 'channel' && a.target.type !== 'channel') return 1;
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [channelsList, messages, myChatId, isAnyAdmin, teachers, students, linkedStudent, allTargetsMap, chatCategoryFilter, searchQuery]);

  // Current active target
  const activeTarget = useMemo(() => {
    return allTargetsMap.get(activeChatId) || {
      id: activeChatId,
      type: 'channel' as const,
      name: 'Ogeysiis Guud',
      roleLabel: 'Guud',
      roleBadge: 'channel' as const,
      subtext: 'Iskoolka Xaaji Salaad'
    };
  }, [allTargetsMap, activeChatId]);

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const isChannel = activeTarget.type === 'channel';

    const senderRoleBadge: 'admin' | 'vice_principal_1' | 'vice_principal_2' | 'teacher' | 'student' | 'parent' =
      currentUser?.role === 'admin' ? 'admin' :
      currentUser?.role === 'vice_principal_1' ? 'vice_principal_1' :
      currentUser?.role === 'vice_principal_2' ? 'vice_principal_2' :
      currentUser?.role === 'teacher' ? 'teacher' :
      currentUser?.role === 'student' ? 'student' : 'parent';

    let targetId = activeTarget.id;
    let targetName = activeTarget.name;
    let targetRole: any = isChannel ? 'channel' : activeTarget.roleBadge;
    let chId = isChannel ? activeTarget.id : undefined;

    // Role Enforcement:
    // Students, teachers, and parents can ONLY send messages to Maamulka (Live Chat).
    if (!isAnyAdmin) {
      const allowedAdminIds = ['admin', 'vice_principal_1', 'vice_principal_2'];
      if (isChannel) {
        // Automatically route to Maamulaha Sare as live inquiry
        targetId = 'admin';
        targetName = 'Maamulaha Sare (Head Office & Live Help)';
        targetRole = 'admin';
        chId = undefined;
        setActiveChatId('admin');
      } else if (!allowedAdminIds.includes(activeTarget.id)) {
        alert("Wada-xiriirka waxaa loo oggol yahay kaliya inaad la hadasho Maamulka Iskuulka (Live Chat).");
        return;
      }
    }

    const newMsg: ParentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: myChatId,
      senderName: myChatName,
      senderRole: senderRoleBadge,
      senderAvatar: currentUser?.role === 'teacher' ? linkedTeacher?.img : linkedStudent?.img,
      recipientId: targetId,
      recipientName: targetName,
      recipientRole: targetRole,
      channelId: chId,
      studentId: linkedStudent?.id,
      studentName: linkedStudent?.name,
      studentClass: linkedStudent?.form || activeTarget.classGroup,
      subject: activeTarget.subject,
      message: messageInput.trim(),
      createdAt: new Date().toISOString(),
      status: 'sent',
      replyToId: replyingTo?.id,
      replyToSnippet: replyingTo ? {
        senderName: replyingTo.senderName,
        text: replyingTo.message
      } : undefined
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(updated);

    setMessageInput('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  // Keyboard Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick Emoji reaction
  const handleAddReaction = (msgId: string, emoji: string) => {
    const updated = messages.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        const currentUsers = reactions[emoji] || [];
        if (currentUsers.includes(myChatName)) {
          // Remove reaction
          reactions[emoji] = currentUsers.filter(u => u !== myChatName);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          // Add reaction
          reactions[emoji] = [...currentUsers, myChatName];
        }
        return { ...m, reactions };
      }
      return m;
    });
    setMessages(updated);
    saveMessages(updated);
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    if (window.confirm("Ma hubtaa inaad tirtirto fariintan?")) {
      const updated = messages.filter(m => m.id !== msgId);
      setMessages(updated);
      saveMessages(updated);
    }
  };

  // Save edit message
  const handleSaveEdit = (msgId: string) => {
    if (!editingText.trim()) return;
    const updated = messages.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          message: editingText.trim(),
          isEdited: true
        };
      }
      return m;
    });
    setMessages(updated);
    saveMessages(updated);
    setEditingMessageId(null);
    setEditingText('');
  };

  // Copy message text
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToastId(id);
    setTimeout(() => setCopiedToastId(null), 2000);
  };

  // WhatsApp quick launcher
  const openWhatsApp = (phoneStr?: string, name?: string) => {
    if (!phoneStr || !phoneStr.trim()) {
      alert("Qofkan ma laha taleefan WhatsApp oo diiwaangashan!");
      return;
    }
    const cleanPhone = phoneStr.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Asc ${name || ''}, waxaan kugu soo xiriiraynaa Nidaamka Iskuulka ${schoolName}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${greeting}`, '_blank');
  };

  // Helper formatting for timestamps
  const formatTime = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Maanta';
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return 'Shalay';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filtered list for "Start New Chat" modal
  const filteredNewChatTargets = useMemo(() => {
    let list = allDirectTargets;
    if (newChatCategory === 'teacher') list = list.filter(t => t.roleBadge === 'teacher');
    if (newChatCategory === 'student') list = list.filter(t => t.roleBadge === 'student');
    if (newChatCategory === 'parent') list = list.filter(t => t.roleBadge === 'parent');
    if (newChatCategory === 'admin') list = list.filter(t => t.roleBadge === 'admin' || t.roleBadge === 'vice_principal');

    if (newChatSearch.trim()) {
      const q = newChatSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.subtext.toLowerCase().includes(q));
    }
    return list;
  }, [allDirectTargets, newChatCategory, newChatSearch]);

  // Filtered contacts for WhatsApp modal
  const filteredWhatsAppContacts = useMemo(() => {
    const q = waSearch.toLowerCase();
    return allDirectTargets.filter(t => t.phone && (!q || t.name.toLowerCase().includes(q) || t.phone.includes(q) || t.subtext.toLowerCase().includes(q)));
  }, [allDirectTargets, waSearch]);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#042954] text-[#ffae01] rounded-2xl shadow-xs">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                Xarunta Wada-xiriirka Iskuulka (School Messenger & Chat)
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-full border border-emerald-200">
                ● Live Chat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Wadahadal toos ah oo dhexmaraya Ardayda, Macallimiinta, Waalidiinta, iyo Dhammaan Maamulka Iskuulka.
            </p>
          </div>
        </div>

        {/* User Identity & Fast Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Directory</span>
          </button>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-3 py-2 bg-[#042954] hover:bg-[#031d3d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffae01]" />
            <span>Bilow Wadahadal Cusub</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400 font-bold">Adiga:</span>
            <span className="font-bold text-slate-900">{myChatName}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              isAnyAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              isTeacher ? 'bg-blue-100 text-blue-900 border border-blue-300' :
              isStudent ? 'bg-purple-100 text-purple-900 border border-purple-300' :
              'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {isAnyAdmin ? 'Maamul' : isTeacher ? 'Macallin' : isStudent ? 'Arday' : 'Waalid'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Pane Messenger Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
        
        {/* LEFT COLUMN: Channels & Conversations List (4 cols on MD/LG) */}
        <div className={`md:col-span-4 lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi qof, fasal, ama fariin..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
              <button
                onClick={() => setChatCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                  chatCategoryFilter === 'all' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Dhammaan
              </button>
              <button
                onClick={() => setChatCategoryFilter('admin')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                  chatCategoryFilter === 'admin' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                🛡️ Maamulka (Live Help)
              </button>
              <button
                onClick={() => setChatCategoryFilter('channels')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                  chatCategoryFilter === 'channels' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                📢 Ogeysiisyada
              </button>
              {isAnyAdmin && (
                <>
                  <button
                    onClick={() => setChatCategoryFilter('teachers')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      chatCategoryFilter === 'teachers' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    👨‍🏫 Macallimiinta
                  </button>
                  <button
                    onClick={() => setChatCategoryFilter('students')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      chatCategoryFilter === 'students' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    🎓 Ardayda
                  </button>
                  <button
                    onClick={() => setChatCategoryFilter('parents')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      chatCategoryFilter === 'parents' ? 'bg-[#042954] text-white' : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    👨‍👩‍👧 Waalidiinta
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversationListItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Wadahadal lama helin. Riix badhanka <strong>"Bilow Wadahadal Cusub"</strong> si aad u bilowdo.
              </div>
            ) : (
              conversationListItems.map(({ target, lastMessage }) => {
                const isActive = activeChatId === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => {
                      setActiveChatId(target.id);
                      setMobileView('chat');
                    }}
                    className={`w-full p-3 flex items-start gap-3 text-left transition-all cursor-pointer ${
                      isActive ? 'bg-blue-50/80 border-l-4 border-[#042954]' : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {target.type === 'channel' ? (
                        <div className="w-11 h-11 rounded-2xl bg-[#042954] text-[#ffae01] flex items-center justify-center font-bold text-base shadow-2xs">
                          {target.id.includes('staff') ? <Users className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                        </div>
                      ) : (
                        <UserAvatar 
                          name={target.name} 
                          role={target.roleBadge === 'vice_principal' ? 'vice_principal_1' : (target.roleBadge as any)} 
                          size="md" 
                          photo={target.photo} 
                        />
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-[#042954]' : 'text-slate-900'}`}>
                          {target.name}
                        </span>
                        {lastMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                          target.roleBadge === 'channel' ? 'bg-indigo-100 text-indigo-800' :
                          target.roleBadge === 'admin' ? 'bg-amber-100 text-amber-800' :
                          target.roleBadge === 'vice_principal' ? 'bg-cyan-100 text-cyan-800' :
                          target.roleBadge === 'teacher' ? 'bg-blue-100 text-blue-800' :
                          target.roleBadge === 'student' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {target.roleLabel}
                        </span>
                        {target.phone && (
                          <span className="text-[10px] text-slate-400 truncate">
                            &bull; {target.phone}
                          </span>
                        )}
                      </div>

                      {/* Last message snippet */}
                      <p className="text-[11px] text-slate-500 truncate">
                        {lastMessage ? (
                          <>
                            <span className="font-semibold text-slate-700">{lastMessage.senderName.split(' ')[0]}: </span>
                            {lastMessage.message}
                          </>
                        ) : (
                          <span className="italic text-slate-400">Weli fariin lama dirin...</span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Conversation (8 cols on MD/LG) */}
        <div className={`md:col-span-8 lg:col-span-8 flex flex-col bg-white ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back to list button */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                {activeTarget.type === 'channel' ? (
                  <div className="w-10 h-10 rounded-2xl bg-[#042954] text-[#ffae01] flex items-center justify-center font-bold shadow-2xs">
                    {activeTarget.id.includes('staff') ? <Users className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                  </div>
                ) : (
                  <UserAvatar 
                    name={activeTarget.name} 
                    role={activeTarget.roleBadge === 'vice_principal' ? 'vice_principal_1' : (activeTarget.roleBadge as any)} 
                    size="md" 
                    photo={activeTarget.photo} 
                  />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {activeTarget.name}
                  </h3>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase ${
                    activeTarget.roleBadge === 'channel' ? 'bg-indigo-100 text-indigo-800' :
                    activeTarget.roleBadge === 'admin' ? 'bg-amber-100 text-amber-800' :
                    activeTarget.roleBadge === 'vice_principal' ? 'bg-cyan-100 text-cyan-800' :
                    activeTarget.roleBadge === 'teacher' ? 'bg-blue-100 text-blue-800' :
                    activeTarget.roleBadge === 'student' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeTarget.roleLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeTarget.subtext}
                </p>
              </div>
            </div>

            {/* Quick Actions (WhatsApp & Call) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {activeTarget.phone && (
                <>
                  <button
                    onClick={() => openWhatsApp(activeTarget.phone, activeTarget.name)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                    title="Kala xiriir WhatsApp"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </button>
                  <a
                    href={`tel:${activeTarget.phone}`}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Toos u wac"
                  >
                    <UserCheck className="w-4 h-4 text-slate-600" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
            {activeConversationMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  Weli wax fariin ah ma jiraan
                </h4>
                <p className="text-xs max-w-xs text-slate-500">
                  U qor fariin toos ah <strong>{activeTarget.name}</strong> adigoo isticmaalaya sanduuqa qoraalka ee hoose.
                </p>
              </div>
            ) : (
              activeConversationMessages.map((msg, index) => {
                const isMine = msg.senderId === myChatId;
                const showDateDivider = index === 0 || 
                  formatDateLabel(msg.createdAt) !== formatDateLabel(activeConversationMessages[index - 1].createdAt);

                const isEditingThis = editingMessageId === msg.id;

                return (
                  <React.Fragment key={msg.id}>
                    {/* Date Divider */}
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-1 bg-slate-200/70 text-slate-600 rounded-full text-[10px] font-bold shadow-2xs">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    {/* Message Bubble Row */}
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}>
                      
                      {/* Sender Name & Role above bubble if not mine */}
                      {!isMine && (
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                          <span className="font-bold text-slate-800">{msg.senderName}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            msg.senderRole === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            msg.senderRole === 'teacher' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                            msg.senderRole === 'student' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {msg.senderRole}
                          </span>
                        </div>
                      )}

                      {/* Quoted snippet if replying */}
                      {msg.replyToSnippet && (
                        <div className={`mb-1 px-3 py-1.5 rounded-xl text-[11px] max-w-md border-l-4 border-[#ffae01] bg-slate-100/90 text-slate-600 truncate ${
                          isMine ? 'mr-1' : 'ml-1'
                        }`}>
                          <span className="font-bold text-slate-800">{msg.replyToSnippet.senderName}: </span>
                          <span>{msg.replyToSnippet.text}</span>
                        </div>
                      )}

                      {/* Main Bubble Content */}
                      <div className="relative max-w-[85%] sm:max-w-[70%]">
                        {isEditingThis ? (
                          /* Inline Edit Mode */
                          <div className="p-3 bg-white border border-blue-400 rounded-2xl shadow-md space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                            />
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                Ka noqo
                              </button>
                              <button
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3 py-1 bg-blue-600 text-white font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>Keydi</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs transition-all ${
                            isMine
                              ? 'bg-[#042954] text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                          }`}>
                            {/* Subject if present */}
                            {msg.subject && (
                              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 pb-1 border-b ${
                                isMine ? 'text-amber-300 border-white/20' : 'text-blue-700 border-slate-100'
                              }`}>
                                {msg.subject}
                              </div>
                            )}

                            {/* Message Body */}
                            <p className="whitespace-pre-wrap leading-relaxed break-words">
                              {msg.message}
                            </p>

                            {/* Footer: Time, Edited status, Checkmark */}
                            <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-mono ${
                              isMine ? 'text-white/70' : 'text-slate-400'
                            }`}>
                              {msg.isEdited && <span className="italic">(la beddelay)</span>}
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMine && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                            </div>
                          </div>
                        )}

                        {/* Hover Quick Actions Bar */}
                        <div className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
                          isMine ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
                        }`}>
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer"
                            title="Ka jawaab (Reply)"
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleCopyText(msg.message, msg.id)}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-600 cursor-pointer"
                            title="Koobiyeey (Copy)"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {(isMine || isAnyAdmin) && (
                            <>
                              {isMine && (
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingText(msg.message);
                                  }}
                                  className="p-1 hover:bg-slate-100 rounded-full text-blue-600 cursor-pointer"
                                  title="Wax ka beddel (Edit)"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 hover:bg-rose-50 rounded-full text-rose-600 cursor-pointer"
                                title="Tirtir (Delete)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <div className="h-3 w-px bg-slate-200 mx-0.5" />
                          {/* Quick Emoji Reaction Buttons */}
                          {['👍', '❤️', '👏'].map(emo => (
                            <button
                              key={emo}
                              onClick={() => handleAddReaction(msg.id, emo)}
                              className="text-xs hover:scale-125 transition-transform cursor-pointer px-0.5"
                            >
                              {emo}
                            </button>
                          ))}
                        </div>

                        {/* Reactions Drawer below bubble */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className={`flex items-center gap-1 mt-1 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(msg.reactions).map(([emo, userList]) => {
                              const users = (userList || []) as string[];
                              return (
                                <button
                                  key={emo}
                                  onClick={() => handleAddReaction(msg.id, emo)}
                                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[11px] flex items-center gap-1 shadow-2xs hover:bg-slate-50 cursor-pointer"
                                  title={`Waxaa falceliyey: ${users.join(', ')}`}
                                >
                                  <span>{emo}</span>
                                  <span className="font-bold text-slate-600 text-[10px]">{users.length}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Copy Feedback Toast */}
                        {copiedToastId === msg.id && (
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Waa la koobiyeeyay!
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Area */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2.5">
            
            {/* Replying banner */}
            {replyingTo && (
              <div className="p-2.5 bg-blue-50 border-l-4 border-[#042954] rounded-r-xl flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-[#042954]">Ka jawaabaya: {replyingTo.senderName}</span>
                  <p className="text-slate-600 text-[11px] truncate italic">"{replyingTo.message}"</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Templates Drawer (horizontally scrollable chips) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ffae01]" />
                Degdeg:
              </span>
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessageInput(tmpl)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Emoji Quick Picker Floating Drawer */}
            {showEmojiPicker && (
              <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-lg flex items-center gap-2 flex-wrap text-lg">
                {QUICK_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setMessageInput(prev => prev + e)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Main Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  rows={2}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`U qor fariin ${activeTarget.name}... (Enter = Dir, Shift+Enter = Khad cusub)`}
                  className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-500 resize-none shadow-xs"
                />
                
                {/* Emoji toggle inside input */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 bottom-3 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  title="Dooro Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-3.5 bg-[#042954] hover:bg-[#031d3d] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-md transition-all flex items-center justify-center cursor-pointer shrink-0"
                title="Dir Fariinta"
              >
                <Send className="w-5 h-5 text-[#ffae01]" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* START NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#042954] rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bilow Wadahadal Cusub
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dooro qofka aad rabto inaad fariin toos ah u dirto.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div className="p-3.5 border-b border-slate-100 space-y-2 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Raadi magac, maado, ama fasal..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              {!isAnyAdmin ? (
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Xafiiska Maamulka kaliya ayaa lagala hadli karaa halkan (Live Chat Help Desk).</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold">
                  <button
                    onClick={() => setNewChatCategory('all')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      newChatCategory === 'all' ? 'bg-[#042954] text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Dhammaan
                  </button>
                  <button
                    onClick={() => setNewChatCategory('admin')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      newChatCategory === 'admin' ? 'bg-[#042954] text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Maamulka
                  </button>
                  <button
                    onClick={() => setNewChatCategory('teacher')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      newChatCategory === 'teacher' ? 'bg-[#042954] text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Macallimiinta
                  </button>
                  <button
                    onClick={() => setNewChatCategory('student')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      newChatCategory === 'student' ? 'bg-[#042954] text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Ardayda
                  </button>
                  <button
                    onClick={() => setNewChatCategory('parent')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                      newChatCategory === 'parent' ? 'bg-[#042954] text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    Waalidiinta
                  </button>
                </div>
              )}
            </div>

            {/* List of Contacts */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredNewChatTargets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Qof ku habboon lama helin.
                </div>
              ) : (
                filteredNewChatTargets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveChatId(t.id);
                      setShowNewChatModal(false);
                      setMobileView('chat');
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar 
                        name={t.name} 
                        role={t.roleBadge === 'vice_principal' ? 'vice_principal_1' : (t.roleBadge as any)} 
                        size="sm" 
                        photo={t.photo} 
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {t.subtext}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                      Fariin dir &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP DIRECTORY MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-bold">
                    Buugga Taleefannada & WhatsApp
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Toos ugu fariin dir WhatsApp adigoo isticmaalaya fariin rasmi ah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={waSearch}
                  onChange={(e) => setWaSearch(e.target.value)}
                  placeholder="Raadi magac ama number..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredWhatsAppContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Taleefanno diiwaangashan lama helin.
                </div>
              ) : (
                filteredWhatsAppContacts.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar 
                        name={t.name} 
                        role={t.roleBadge === 'vice_principal' ? 'vice_principal_1' : (t.roleBadge as any)} 
                        size="sm" 
                        photo={t.photo} 
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-mono font-semibold">
                          {t.phone}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {t.subtext}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openWhatsApp(t.phone, t.name)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
