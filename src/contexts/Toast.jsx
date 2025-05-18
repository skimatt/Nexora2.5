// Toast.jsx
import React from "react";

const Toast = ({ message, type }) => {
  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`fixed bottom-5 right-5 px-4 py-2 text-white rounded shadow-lg transition-all ${bgColor}`}
    >
      {message}
    </div>
  );
};

export default Toast;
