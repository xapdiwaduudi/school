import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Lightbulb, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { Student, Teacher, ExamResult, AppUser } from '../types';

interface AIAssistantPageProps {
  students: Student[];
  teachers: Teacher[];
  exams: ExamResult[];
  subjects: string[];
  currentUser: AppUser | null;
  schoolName: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage({
  students,
  teachers,
  exams,
  subjects,
  currentUser,
  schoolName
}: AIAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      text: `Asc **${currentUser?.fullName || 'Walaal'}**! Waxaan ahay **AI Assistant** — caawiyahaaga caqliga macmalka ah.\n\nWaxaad i weydiin kartaa **su'aal kasta oo aad doonto**, ha ahaato mid ku saabsan iskuulka ama aqoonta guud:\n* 🌍 **Aqoonta Guud & Sayniska** (Taariikhda, Juqraafiga, Fiisikiska, Bayoolajiga, Caafimaadka)\n* 💻 **Tiknoolajiyada & Coding-ka** (Python, Web Development, ICT, Xisaabta adag)\n* 📚 **Maadooyinka & Casharrada** (Somali, English, Carabi, Xisaab, Saynis, Diinta Islaamka)\n* ✍️ **Qoraalka & Gabayada** (Maqaallo, Gabayo, Suugaan, Turjumaad, Warqado rasmi ah)\n* 🏆 **Iskuulka & Ardayda** (Kaalmaha, Natiijooyinka, Qorshe Cashar, Talooyinka Waalidiinta)`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    "Waa maxay xeerarka lagu xisaabiyo xawaaraha (Physics)?",
    "I sharax sida loo qoro function fudud oo Python ah",
    "I sii qorshe cashar (Lesson Plan) oo ku saabsan Xisaabta",
    "Qor maqaal kooban oo ku saabsan muhiimadda waxbarashada",
    "I sii 5 talo oo waalidku ku caawin karo waxbarashada carruurta",
    "Waa maxay wareegga biyaha ee dabiiciga ah (Water cycle)?"
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const textToSend = promptToSend || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptToSend) setInputText('');
    setLoading(true);

    try {
      // Build school summary context
      const context = {
        schoolName: schoolName || 'Xaaji Salaad School',
        totalStudents: students.length,
        totalTeachers: teachers.length,
        subjectsList: subjects,
        classes: Array.from(new Set(students.map(s => s.form))),
        userName: currentUser?.fullName || currentUser?.username,
        userRole: currentUser?.role
      };

      const history = messages.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history,
          context
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "Waan ka xumahay, ma awoodin inaan jawaab helo xilligan.";

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: botReply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("AI fetch error:", err);
      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        role: 'assistant',
        text: `Waxaan ka xumahay, cilad farsamo ayaa dhacday intii su'aashaada laga jawaabayey. Fadlan hubi xiriirka internetka ama mar kale isku day.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_msg_reset',
        role: 'assistant',
        text: `Sheekada waa la nadiifiyay. Maxaan kugu caawin karaa hadda?`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#042954] via-[#063870] to-[#042954] p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ffae01] text-slate-950 rounded-2xl shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black font-display tracking-wide">
              {schoolName || 'Xaaji Salaad School'} &bull; Caawiyaha Iskuulka (AI Assistant)
            </h2>
            <p className="text-xs text-blue-200">
              Weydii su'aal kasta oo ku saabsan casharrada, manhajka, talooyinka, iyo maamulka iskuulka
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          title="Nadiifi sheekada"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-[#ffae01]" />
          <span>Su'aalo Tusaale ah:</span>
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-900 rounded-full text-xs font-medium shrink-0 transition-all shadow-2xs cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#042954] text-[#ffae01] flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#042954] text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Xaaji Salaad AI &bull; Gemini 3.7</span>
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Nuqul ka qaado"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-[#042954] text-[#ffae01] flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                <span>AI-ga ayaa ka fikiraya su'aashaada...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Qor su'aashaada halkan (tusaale: I sii talooyin ku saabsan xisaabta)..."
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#042954] focus:ring-2 focus:ring-[#042954]/10 transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-[#042954] hover:bg-[#031d3d] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Send className="w-4 h-4 text-[#ffae01]" />
              <span className="hidden sm:inline">Weydii</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
