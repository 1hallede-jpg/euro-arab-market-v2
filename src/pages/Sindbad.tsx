import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  Send,
  User,
  Loader2,
  Wand2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const suggestedQuestions = [
  "مطاعم عربية في باريس",
  "سوبرماركت حلال في برلين",
  "صالون حلاقة في لندن",
  "وظائف للعرب في أوروبا",
  "جزار حلال في أمستردام",
  "أفضل حلويات شرقية في فيينا",
];

export default function Sindbad() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [wishesRemaining, setWishesRemaining] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const chatMutation = trpc.sindbad.chat.useMutation({
    onSuccess: (data: any) => {
      setSessionId(data.sessionId);
            setWishesRemaining(data.wishesRemaining);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.response,
          createdAt: new Date(),
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (wishesRemaining <= 0 && !user) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    chatMutation.mutate({
      message: userMessage.content,
      sessionId: sessionId || undefined,
      userId: user?.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (chatMutation.isPending) return;
    if (wishesRemaining <= 0 && !user) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: question,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    chatMutation.mutate({
      message: question,
      sessionId: sessionId || undefined,
      userId: user?.id,
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
                🧞‍♂️
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">سندباد</h1>
                <p className="text-xs text-slate-400">مساعدك الذكي</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
              >
                <Wand2 className="h-3 w-3 ml-1" />
                {wishesRemaining} أمنية
              </Badge>
              {wishesRemaining <= 0 && !user && (
                <Badge
                  variant="outline"
                  className="border-red-500/30 text-red-400 bg-red-500/10"
                >
                  <AlertCircle className="h-3 w-3 ml-1" />
                  سجل دخول للمزيد
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                  🧞‍♂️
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  السلام عليكم ورحمة الله وبركاته يا صديقي! 🌙
                </h2>
                <p className="text-slate-300 max-w-lg mx-auto leading-relaxed mb-8">
                  أنا سندباد، مساعدك الذكي في يورو عرب ماركت. عندك{" "}
                  <span className="text-emerald-400 font-bold">
                    {wishesRemaining} أمنيات
                  </span>{" "}
                  يومياً، وإن شاء الله راح أساعدك في كل شي تحتاجه في أوروبا!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestionClick(question)}
                      className="text-right p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700 hover:border-emerald-500/50 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                <div className="mt-8 text-slate-400 text-sm">
                  <p className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    تستطيع طرح {wishesRemaining} أسئلة اليوم
                    {!user && " - سجل دخول للحصول على أسئلة غير محدودة"}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {msg.role === "assistant" ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20">
                        🧞‍♂️
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] ${
                      msg.role === "user" ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-5 py-3 ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-sm"
                          : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 px-2">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}

            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20 shrink-0">
                  🧞‍♂️
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">سندباد يفكر...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            {wishesRemaining <= 0 && !user ? (
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-4 flex items-center justify-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  لقد استنفذت أمنياتك اليوم. سجل دخول للحصول على أمنيات غير
                  محدودة!
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="اكتب أمنيتك هنا... مثال: مطعم عربي في باريس"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-4 pl-12 py-6 text-right"
                    dir="rtl"
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-6"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
