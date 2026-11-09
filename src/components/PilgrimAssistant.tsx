import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Globe,
  Navigation,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

interface PilgrimAssistantProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userCoords: { latitude: number; longitude: number } | null;
}

const QUICK_QUESTIONS: Record<Language, string[]> = {
  en: [
    'Where is the nearest 24/7 medical post?',
    'How do I find drinking water near Pushkar Ghat?',
    'What do the map marker colors mean?',
    'Are there wheelchair accessible toilets?',
    'Where are the free shuttle buses to the ghats?',
  ],
  te: [
    'సమీపంలో ఉన్న 24/7 ఆసుపత్రి ఎక్కడ ఉంది?',
    'పుష్కర ఘాట్ వద్ద త్రాగునీరు ఎక్కడ దొరుకుతుంది?',
    'మ్యాప్‌లోని రంగు మార్కర్లు దేనిని సూచిస్తాయి?',
    'దివ్యాంగులకు వీల్‌చైర్ సౌకర్యాలు ఎక్కడ ఉన్నాయి?',
    'పార్కింగ్ నుండి ఉచిత బస్సులు ఎక్కడ ఎక్కాలి?',
  ],
  hi: [
    'निकटतम 24/7 आपातकालीन चिकित्सा केंद्र कहां है?',
    'पुष्कर घाट के पास पीने का पानी कहां मिलेगा?',
    'नक्शे के मार्कर रंगों का क्या अर्थ है?',
    'क्या दिव्यांगों के लिए व्हीलचेयर शौचालय उपलब्ध हैं?',
    'पार्किंग से घाट तक मुफ्त बसें कहां से मिलती हैं?',
  ],
};

export const PilgrimAssistant: React.FC<PilgrimAssistantProps> = ({
  language,
  onLanguageChange,
  userCoords,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'te'
          ? 'నమస్కారం! నేను గోదావరి స్మార్ట్‌మ్యాప్ యాత్రికుల సహాయకుడిని. పుష్కర ఘాట్లు, తాగునీరు, ఆసుపత్రులు, టాయిలెట్లు లేదా రవాణా వివరాల గురించి అడగండి.'
          : language === 'hi'
          ? 'नमस्ते! मैं गोदावरी स्मार्टमैप तीर्थयात्री सहायक हूं। पुष्कर घाट, पेयजल, अस्पताल, शौचालय या परिवहन से संबंधित कोई भी सवाल पूछें।'
          : 'Namaskaram! I am your Godavari SmartMap Pilgrim Assistant. Ask me anything about finding bathing ghats, drinking water points, medical posts, bio-toilets, parking, or understanding map markers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'system',
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string = inputMessage) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          userLat: userCoords?.latitude,
          userLon: userCoords?.longitude,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get assistant response.');
      }

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'te'
            ? 'క్షమించండి, సర్వర్‌లో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.'
            : language === 'hi'
            ? 'क्षमा करें, प्रतिक्रिया प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Apologies, I encountered a connection issue. Emergency helplines: Dial 108 for medical or 100/112 for police assistance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'te'
            ? 'నమస్కారం! సంభాషణ రీసెట్ చేయబడింది. మీరు ఏ సమాచారం తెలుసుకోవాలనుకుంటున్నారు?'
            : language === 'hi'
            ? 'नमस्ते! बातचीत रीसेट कर दी गई है। आप क्या जानकारी प्राप्त करना चाहते हैं?'
            : 'Conversation reset. How can I assist you with Godavari Pushkaralu facilities today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-160px)] min-h-[500px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Assistant Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Pushkaralu Multilingual Assistant
              </h3>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-medium">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Telugu (తెలుగు) · English · Hindi (हिन्दी)
            </p>
          </div>
        </div>

        {/* Language selector & reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            {(['en', 'te', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  language === lang
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`text-[10px] mt-1.5 flex items-center justify-between gap-2 ${
                  msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.source && msg.source !== 'system' && (
                  <span className="font-mono">Grounded: {msg.source}</span>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
            <Bot className="w-4 h-4 animate-spin text-teal-600" />
            <span>Consulting Godavari SmartMap database...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions Bar */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Suggestions:</span>
          {QUICK_QUESTIONS[language].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            language === 'te'
              ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
              : language === 'hi'
              ? 'अपना प्रश्न यहां टाइप करें...'
              : 'Ask about facilities, statuses, or directions...'
          }
          className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
