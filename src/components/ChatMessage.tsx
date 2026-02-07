import { useState, useRef, useEffect } from "react";
import { User, Sprout, Volume2, StopCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  voiceLanguage?: string;
  autoPlay?: boolean;
  onSpeakStart?: () => void;
  selectedVoiceURI?: string;
}

const ChatMessage = ({ role, content, isLoading, voiceLanguage = "en-US", autoPlay, onSpeakStart, selectedVoiceURI }: ChatMessageProps) => {
  const isUser = role === "user";
  const { isSupported } = useSpeechSynthesis();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLElement | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const detectLanguage = (text: string): string => {
    // Devanagari (Hindi, Marathi)
    if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
    // Bengali
    if (/[\u0980-\u09FF]/.test(text)) return "bn-IN";
    // Punjabi (Gurmukhi)
    if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN";
    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN";
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN";
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN";
    // Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
    // Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN";
    
    return voiceLanguage === "auto" ? (navigator.language || "en-US") : voiceLanguage;
  };

  const removeHighlight = () => {
    if (highlightRef.current) {
      const parent = highlightRef.current.parentNode;
      if (parent) {
        while (highlightRef.current.firstChild) {
          parent.insertBefore(highlightRef.current.firstChild, highlightRef.current);
        }
        parent.removeChild(highlightRef.current);
        parent.normalize();
      }
      highlightRef.current = null;
    }
  };

  const highlightRange = (index: number, length: number) => {
    removeHighlight();
    if (!contentRef.current) return;

    const treeWalker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let current = 0;
    let node = treeWalker.nextNode();

    while (node) {
      const nodeText = node.textContent || "";
      const nodeLen = nodeText.length;

      if (current + nodeLen > index) {
        const startOffset = Math.max(0, index - current);
        const endOffset = Math.min(startOffset + length, nodeLen);

        if (endOffset > startOffset) {
          const range = document.createRange();
          range.setStart(node, startOffset);
          range.setEnd(node, endOffset);

          const mark = document.createElement("mark");
          mark.className = "bg-yellow-200 dark:bg-yellow-800/50 rounded-sm text-inherit";
          try {
            range.surroundContents(mark);
            highlightRef.current = mark;
          } catch (e) {
            // Ignore complex range errors
          }
        }
        return;
      }
      current += nodeLen;
      node = treeWalker.nextNode();
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      removeHighlight();
    } else {
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!contentRef.current) return;
      const text = contentRef.current.textContent || "";
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoiceURI) {
        const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        utterance.lang = detectLanguage(text);
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); removeHighlight(); };
      utterance.onerror = () => { setIsSpeaking(false); removeHighlight(); };
      utterance.onboundary = (e) => {
        if (e.name === "word") highlightRange(e.charIndex, e.charLength);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      removeHighlight();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && !isSpeaking && !isLoading) {
      handleSpeak();
      onSpeakStart?.();
    }
  }, [autoPlay, isLoading]);

  return (
    <div
      ref={messageRef}
      className={`flex gap-3 animate-fade-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User size={20} /> : <Sprout size={20} />}
      </div>

      {/* Message Content Wrapper */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`chat-bubble ${
          isUser ? "chat-bubble-user" : "chat-bubble-ai"
        } !max-w-full`}
        ref={contentRef}
      >
        {isLoading ? (
          <div className="flex gap-1 items-center py-1">
            <span className="w-2 h-2 bg-current rounded-full animate-bounce-gentle" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-current rounded-full animate-bounce-gentle" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-current rounded-full animate-bounce-gentle" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 text-primary">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-md font-bold mb-1 mt-2 text-foreground">{children}</h3>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2 text-muted-foreground">{children}</blockquote>,
                code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>,
                pre: ({ children }) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2 text-sm font-mono text-foreground">{children}</pre>,
                table: ({ children }) => <div className="overflow-x-auto my-3 border rounded-lg"><table className="min-w-full divide-y divide-border">{children}</table></div>,
                thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-border bg-card">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 text-sm text-foreground align-top">{children}</td>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Message Actions */}
      {!isLoading && (
        <div className={`flex gap-1 mt-1 px-1 opacity-70 hover:opacity-100 transition-opacity ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && isSupported && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSpeak}
              className="h-6 w-6 p-0 rounded-full hover:bg-muted"
              title={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? (
                <StopCircle size={14} />
              ) : (
                <Volume2 size={14} />
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 w-6 p-0 rounded-full hover:bg-muted"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatMessage;
