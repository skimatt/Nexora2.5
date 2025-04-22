import { useEffect, useCallback } from "react";

export const useTextareaResize = (textareaRef, value) => {
  const resizeTextarea = useCallback(() => {
    if (!textareaRef?.current) return; // ✅ Tambahan untuk mencegah error

    textareaRef.current.style.height = "auto"; // Reset height dulu
    textareaRef.current.style.overflow = "hidden"; // Hilangkan scroll bar
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Atur tinggi sesuai isi
  }, [textareaRef]);

  useEffect(() => {
    resizeTextarea();
  }, [value, resizeTextarea]);

  return resizeTextarea;
};
