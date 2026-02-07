import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useLocation } from "@/hooks/useLocation";
import ConversationSidebar from "@/components/ConversationSidebar";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MessageCircle, Copy, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farmer-chat`;

const Index = () => {
  const { user, isLoading: authLoading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { city, temperature, condition, humidity, isLoading: locationLoading } = useLocation();
  const {
    conversations,
    currentConversationId,
    messages,
    isLoadingMessages,
    createConversation,
    saveMessage,
    deleteConversation,
    selectConversation,
    startNewChat,
    addLocalMessage,
    updateLastMessage,
    refreshConversations,
    setCurrentConversationId,
    togglePinConversation,
    toggleArchiveConversation,
  } = useConversations(user?.id);

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState(navigator.language || "en-US");
  const [autoPlayResponse, setAutoPlayResponse] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleDownloadChat = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Farm Helper AI';
      return `${role}:\n${m.content}\n${'-'.repeat(40)}\n`;
    }).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-helper-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Farm Helper AI - Chat Export</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #15803d; margin-bottom: 8px; }
            .date { color: #6b7280; font-size: 14px; }
            .message { margin-bottom: 24px; page-break-inside: avoid; }
            .role { font-weight: 600; font-size: 14px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
            .user .role { color: #2563eb; }
            .assistant .role { color: #15803d; }
            .content { white-space: pre-wrap; background: #f9fafb; padding: 12px 16px; border-radius: 8px; border: 1px solid #f3f4f6; }
            .user .content { background: #eff6ff; border-color: #dbeafe; }
            .assistant .content { background: #f0fdf4; border-color: #dcfce7; }
            @media print {
              body { padding: 0; }
              .content { border: none; background: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Farm Helper AI</div>
            <div class="date">Chat History • ${new Date().toLocaleDateString()}</div>
          </div>
          ${messages.map(m => `
            <div class="message ${m.role}">
              <div class="role">${m.role === 'user' ? 'You' : 'Farm Helper AI'}</div>
              <div class="content">${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          `).join('')}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getFormattedChat = () => {
    return messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Farm Helper AI';
      return `${role}:\n${m.content}\n${'-'.repeat(20)}\n`;
    }).join('\n');
  };

  const handleShare = async () => {
    if (messages.length === 0) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Farm Helper AI Chat History',
          text: getFormattedChat(),
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const shareToWhatsApp = () => {
    const content = getFormattedChat();
    const url = `https://wa.me/?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const shareToEmail = () => {
    const content = getFormattedChat();
    const subject = encodeURIComponent("Farm Helper Chat History");
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    const content = getFormattedChat();
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Chat history copied successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
    setShowShareModal(false);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle.trim() })
        .eq('id', id);
      
      if (error) throw error;
      refreshConversations();
    } catch (error) {
      console.error("Rename error:", error);
      toast({ title: "Error", description: "Failed to rename conversation", variant: "destructive" });
    }
  };

  const handleSend = async (input: string, file?: File, isVoice: boolean = false) => {
    let conversationId = currentConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    let messageContent = input;

    if (file) {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      messageContent = input ? `${input}\n\n!Uploaded Image` : `!Uploaded Image`;
    }

    const userMessage = { role: "user" as const, content: messageContent };
    addLocalMessage(userMessage);
    setIsLoading(true);

    // Save user message to database
    await saveMessage(conversationId, "user", messageContent);

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: `[LOCATION CONTEXT: Location: ${city}, Temperature: ${temperature}°C, Weather: ${condition}, Humidity: ${humidity}%]\n[INSTRUCTION: Please reply in the same language as the user's input message below. If an image is provided in the message, please analyze it. Use Markdown formatting for better readability (headings, lists, bold text, tables if applicable). If the user requests a specific format (e.g., table, steps, list), strictly follow that format.]\n\n${messageContent}`,
            },
          ],
        }),
      });

      if (response.status === 429) {
        toast({
          title: "Too Many Requests",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Usage Limit Reached",
          description: "Please check your account credits.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateLastMessage(assistantContent);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message to database
      if (assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
        await refreshConversations();
        // Only enable voice output if input was from voice
        if (isVoice) {
          setAutoPlayResponse(true);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    toast({
      title: "File Uploaded",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    });
    console.log("File uploaded:", file);
  };

  const handleVoiceRecord = (blob: Blob) => {
    toast({
      title: "Voice Recording",
      description: `Recording captured (${(blob.size / 1024).toFixed(2)} KB)`,
    });
    console.log("Voice blob:", blob);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0];

  return (
    <div className="flex h-screen bg-background">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelect={(id) => {
          selectConversation(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          startNewChat();
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        onRename={handleRenameConversation}
        onSignOut={handleSignOut}
        onOpenSettings={() => setShowSettingsModal(true)}
        onShare={handleShare}
        onDownload={handleDownloadChat}
        onExportPDF={handleExportPDF}
        onPin={togglePinConversation}
        onArchive={toggleArchiveConversation}
        userName={userName}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col min-w-0 h-full">
        <Header
          location={{
            city,
            temperature,
            condition,
            humidity,
          }}
        />

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !currentConversationId ? (
            <WelcomeScreen
              onQuickAction={handleSend}
              location={{
                city,
                temperature,
                condition,
                humidity,
              }}
            />
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  role={message.role}
                  content={message.content}
                  voiceLanguage={voiceLanguage}
                  autoPlay={index === messages.length - 1 && autoPlayResponse && message.role === "assistant"}
                  onSpeakStart={() => setAutoPlayResponse(false)}
                  selectedVoiceURI={selectedVoiceURI}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <ChatMessage role="assistant" content="" isLoading />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <footer className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSend}
              onFileUpload={handleFileUpload}
              onVoiceRecord={handleVoiceRecord}
              isLoading={isLoading}
              voiceLanguage={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              For serious issues, please consult your local agriculture officer.
            </p>
          </div>
        </footer>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-card border border-border shadow-lg rounded-xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">Share Conversation</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowShareModal(false)} className="h-8 w-8">
                <X size={18} />
              </Button>
            </div>
            
            <div className="grid gap-3">
              <Button variant="outline" className="w-full justify-start gap-3" onClick={shareToWhatsApp}>
                <MessageCircle size={18} className="text-green-600" />
                Share via WhatsApp
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={shareToEmail}>
                <Mail size={18} className="text-blue-600" />
                Share via Email
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={copyToClipboard}>
                <Copy size={18} className="text-muted-foreground" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-card border border-border shadow-lg rounded-xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground">Settings</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSettingsModal(false)} className="h-8 w-8">
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Preference</label>
                <select 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                >
                  <option value="">Auto-detect (Default)</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a specific voice accent or gender. Leave as Auto-detect to let AI choose based on language.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
