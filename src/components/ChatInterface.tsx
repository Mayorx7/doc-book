import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent } from "@/components/Card";
import { Send, Bot, User, Loader2, Stethoscope, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: "show-doctors" | "show-calendar";
  options?: string[];
  data?: any;
};

// Triage Flow Logic
const triageFlow: Record<string, { question: string, options: string[], next: any }> = {
  start: {
    question: "I understand you're not sure about your concern. Let's find out together. Are you experiencing any physical pain right now?",
    options: ["Yes", "No"],
    next: (ans: string) => ans === "Yes" ? "pain_location" : "general_wellness"
  },
  pain_location: {
    question: "Is the pain located in your chest or head area?",
    options: ["Yes", "No"],
    next: (ans: string) => ans === "Yes" ? "chest_head_urgent" : "body_pain"
  },
  chest_head_urgent: {
    question: "Chest or severe head pain should be checked by a specialist. Would you like to see our Cardiologists or Neurologists?",
    options: ["Cardiology", "Neurology", "General GP"],
    next: (ans: string) => ({ specialization: ans.toLowerCase().includes("cardio") ? "cardiology" : ans.toLowerCase().includes("neuro") ? "neurology" : "general" })
  },
  general_wellness: {
    question: "Are you feeling unusually tired or having trouble sleeping?",
    options: ["Yes", "No"],
    next: (ans: string) => ans === "Yes" ? "mental_health_ref" : "routine_check"
  },
  mental_health_ref: {
    question: "Stress and fatigue are common. It might be helpful to talk to a mental health professional or a general practitioner. Would you like to see a specialist?",
    options: ["Mental Health", "General GP"],
    next: (ans: string) => ({ specialization: ans.toLowerCase().includes("mental") ? "mental" : "general" })
  },
  routine_check: {
    question: "If you're not in pain and feeling okay, a routine check-up with a General Practitioner is the best way to stay healthy. Shall I show you our GPs?",
    options: ["Yes, please", "Not now"],
    next: (ans: string) => ans === "Yes, please" ? { specialization: "general" } : "end"
  },
  body_pain: {
    question: "For general body or muscle pain, we recommend a General Practitioner or a Physiotherapist. Would you like to see our doctors?",
    options: ["Yes", "No"],
    next: (ans: string) => ans === "Yes" ? { specialization: "general" } : "end"
  },
  end: {
    question: "No problem! Feel free to describe your symptoms anytime if you change your mind.",
    options: [],
    next: null
  }
};

const analyzeSymptom = (text: string) => {
  const lower = text.toLowerCase();
  
  if (lower.includes("headache") || lower.includes("dizzy")) return { text: "It sounds like you might be experiencing neurological symptoms. I recommend seeing a Neurologist.", specialization: "neurology" };
  if (lower.includes("heart") || lower.includes("chest")) return { text: "Chest pain can be serious. I strongly recommend a Cardiologist.", specialization: "cardiology" };
  if (lower.includes("skin") || lower.includes("rash")) return { text: "For skin issues, a Dermatologist is your best bet.", specialization: "dermatology" };
  if (lower.includes("stomach") || lower.includes("pain")) return { text: "Abdominal pain is often treated by General Practitioners first.", specialization: "general" };
  if (lower.includes("tooth") || lower.includes("dental")) return { text: "We don't have dentists yet, but a General Practitioner can help with pain management.", specialization: "general" };
  
  return { text: "I understand. Could you describe your symptoms in a bit more detail? For example: 'I have a headache' or 'My chest hurts'.", specialization: null };
};

export function ChatInterface({ onBookDoctor, initialMode = "normal" }: { onBookDoctor: (specialization: string) => void, initialMode?: "normal" | "triage" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [triageStep, setTriageStep] = useState<string | null>(initialMode === "triage" ? "start" : null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      if (initialMode === "triage") {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: triageFlow.start.question,
            options: triageFlow.start.options
          }
        ]);
        setTriageStep("start");
      } else {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "Hello! I'm Dr. AI, your personal health assistant. How are you feeling today? You can tell me your symptoms, and I'll guide you to the right specialist."
          }
        ]);
      }
    }
  }, [initialMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOptionClick = (option: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: option
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      if (triageStep && triageFlow[triageStep]) {
        const next = triageFlow[triageStep].next(option);
        
        if (typeof next === "string") {
          const nextStep = triageFlow[next];
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: nextStep.question,
            options: nextStep.options
          };
          setMessages(prev => [...prev, botMsg]);
          setTriageStep(next);
        } else if (next && next.specialization) {
           const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I've found the best specialists for you based on our conversation.`,
            action: "show-doctors",
            data: next.specialization
          };
          setMessages(prev => [...prev, botMsg]);
          setTriageStep(null);
        } else {
           const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I hope that was helpful! feel free to ask me anything else."
          };
          setMessages(prev => [...prev, botMsg]);
          setTriageStep(null);
        }
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTriageStep(null); // Leave triage if user types

    // Simulate AI thinking
    setTimeout(() => {
      const diagnosis = analyzeSymptom(userMsg.content);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: diagnosis.text,
        action: diagnosis.specialization ? "show-doctors" : undefined,
        data: diagnosis.specialization
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className="h-[650px] flex flex-col border-0 shadow-2xl bg-white/50 backdrop-blur-md dark:bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Dr. AI Assistant</h3>
          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
            <span className="block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
              msg.role === "assistant" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              {msg.role === "assistant" ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            
            <div className="space-y-3">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm border",
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none border-indigo-500" 
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    {msg.options.map((opt) => (
                      <Button
                        key={opt}
                        variant="outline"
                        size="sm"
                        className="rounded-full bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all font-semibold"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt === "Yes" ? <Check className="w-3 h-3 mr-1" /> : opt === "No" ? <X className="w-3 h-3 mr-1" /> : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                )}

                {msg.action === "show-doctors" && (
                   <div className="animate-in fade-in slide-in-from-top-2">
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl"
                        onClick={() => onBookDoctor(msg.data)}
                      >
                         View Recommended Doctors <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                   </div>
                )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2">
             <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
               <Stethoscope className="h-4 w-4" />
             </div>
             <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-12">
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your symptoms or ask a question..."
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 rounded-xl h-12 w-12"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
