import { useEffect, useRef, useState } from "react";

type OnFinalCallback = (text: string) => void;

export const useSpeechRecognition = (onFinal?: OnFinalCallback) => {
  const recognitionRef = useRef<any | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [lang, setLang] = useState(navigator.language || "en-US");

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Prepare a singleton recognition instance, but we recreate on start to reset settings.
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current = null;
        } catch {}
      }
    };
  }, []);

  const start = (language?: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language || lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
      setFinalTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalT = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalT += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setInterimTranscript((prev) => interim);
      if (finalT) {
        setFinalTranscript((prev) => prev + finalT);
        if (onFinal) onFinal(finalT.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error:", event);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start error:", e);
    }
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
    setIsListening(false);
  };

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    start,
    stop,
    lang,
    setLang,
  };
};
