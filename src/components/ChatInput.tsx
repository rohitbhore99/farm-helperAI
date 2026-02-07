import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Send, Mic, Image, StopCircle, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { LANGUAGES } from "@/lib/languages";

interface ChatInputProps {
  onSend: (message: string, file?: File, isVoice?: boolean) => void;
  onFileUpload: (file: File) => void;
  onVoiceRecord: (blob: Blob) => void;
  isLoading: boolean;
  voiceLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

const ChatInput = ({ onSend, onFileUpload, onVoiceRecord, isLoading, voiceLanguage, onLanguageChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  // Speech recognition hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    start: startSpeech,
    stop: stopSpeech,
    lang,
    setLang,
  } = useSpeechRecognition((finalText) => {
    // append final text to input and auto-send
    if (finalText && finalText.trim()) {
      const currentInput = inputRef.current;
      const combined = (currentInput ? currentInput + " " : "") + finalText.trim();
      setInput("");
      // Auto-send after a short delay to allow UI to update
      setTimeout(() => {
        if (!isLoading) {
          onSend(combined.trim(), undefined, true);
        }
      }, 200);
    }
  });

  // 1. Handle Text Sending
  const handleSend = () => {
    if ((input.trim() || selectedFile) && !isLoading) {
      onSend(input.trim(), selectedFile || undefined, false);
      setInput("");
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 2. Handle File/Photo Upload
  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      e.target.value = ""; // Reset for same-file re-uploads
    }
  };

  // 3. Handle Voice Recording Logic
  const startRecording = async () => {
    if (isSpeechSupported) {
      // use speech recognition instead
      const chosenLang = lang === "auto" ? navigator.language || "en-US" : lang;
      startSpeech(chosenLang);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onVoiceRecord(audioBlob);
        chunksRef.current = []; // Clear for next time
        stream.getTracks().forEach(track => track.stop()); // Close mic access
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (isSpeechSupported && isListening) {
      stopSpeech();
      return;
    }

    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto p-4">
      <div className="flex gap-2 items-end">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,image/*"
        />

        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={handleFileClick}
          disabled={isLoading || isRecording || isListening}
          className="h-[52px] w-[52px] rounded-2xl flex-shrink-0"
        >
          <Paperclip size={20} />
        </Button>

        {/* Input Container */}
        <div className={`flex-1 relative flex items-end border rounded-2xl transition-all ${(isRecording || isListening) ? 'border-red-500 bg-red-50/10' : 'border-input bg-background focus-within:ring-1 focus-within:ring-primary'}`}>
          
          {/* Image Preview */}
          {previewUrl && (
            <div className="absolute left-4 -top-20 bg-background border border-border p-2 rounded-lg shadow-sm flex items-center gap-3 animate-in slide-in-from-bottom-2">
              <div className="relative w-12 h-12 rounded overflow-hidden bg-muted border border-border">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium truncate max-w-[120px]">{selectedFile?.name}</span>
                <span className="text-[10px] text-muted-foreground">{(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(1)} KB</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <textarea
            value={isListening ? (input + (interimTranscript ? " " + interimTranscript : "")) : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={(isRecording || isListening) ? "Listening to your voice..." : "Ask me about crops, weather, pests..."}
            className={`w-full min-h-[52px] max-h-[200px] bg-transparent border-none focus:outline-none pl-4 py-3 resize-none overflow-y-auto ${isSpeechSupported ? 'pr-48' : 'pr-14'}`}
            disabled={isLoading || isRecording || isListening}
            rows={1}
          />

          {/* Action Buttons Inside Textarea */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {/* Language selector for speech recognition */}
            {isSpeechSupported && (
              <select
                value={voiceLanguage || lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  onLanguageChange?.(e.target.value);
                }}
                className="text-xs bg-transparent border border-transparent focus:border-input rounded px-2 py-1 mr-2"
                aria-label="Choose speech language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            )}

            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                if (isSpeechSupported) {
                  if (isListening) stopRecording();
                  else startRecording();
                } else {
                  if (isRecording) stopRecording();
                  else startRecording();
                }
              }}
              disabled={isLoading}
              className={`h-9 w-9 rounded-full transition-colors ${
                (isRecording || isListening)
                  ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {(isRecording || isListening) ? <StopCircle size={18} /> : <Mic size={18} />}
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && !selectedFile && !isRecording && !isListening) || isLoading}
          className="h-[52px] w-[52px] rounded-2xl bg-primary hover:bg-primary/90 flex-shrink-0"
        >
          <Send size={20} className="text-primary-foreground" />
        </Button>
      </div>

      {/* Recording Indicator Label */}
      {(isRecording || isListening) && (
        <div className="flex items-center gap-2 ml-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <p className="text-xs font-medium text-red-500">Recording audio... Tap the stop icon to finish.</p>
        </div>
      )}
    </div>
  );
};

export default ChatInput;