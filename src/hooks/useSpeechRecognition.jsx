import { useState, useEffect, useRef } from "react";

export const useSpeechRecognition = (setNewMessage, setToast) => {
  const [isListening, setIsListening] = useState(false);
  const [audioURL, setAudioURL] = useState(null); // Menyimpan URL audio
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Inisialisasi Speech Recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setNewMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        stopRecording();
      };
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [setNewMessage]);

  // Fungsi untuk memulai perekaman audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url); // Simpan URL untuk pemutaran
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setToast({
        type: "error",
        message: "Gagal mengakses mikrofon",
      });
    }
  };

  // Fungsi untuk menghentikan perekaman
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopRecording();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        startRecording();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting voice recognition:", error);
        setToast({
          type: "error",
          message: "Gagal memulai input suara",
        });
      }
    }
  };

  return { isListening, toggleVoiceInput, recognitionRef, audioURL };
};
