// NewChatIcon.jsx
const NewChatIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4V20M4 12H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    />
  </svg>
);

// ThinkModeIcon.jsx
const ThinkModeIcon = ({ className, isActive }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-colors duration-200 ${
        isActive ? "fill-[var(--premium-color)]" : ""
      }`}
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="currentColor"
      className="transition-colors duration-200"
    />
  </svg>
);

// VoiceIcon.jsx
const VoiceIcon = ({ className, isActive }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z"
      fill="currentColor"
      className={`transition-colors duration-200 ${
        isActive ? "fill-[var(--accent-color)]" : ""
      }`}
    />
    <path
      d="M19 11V12C19 15.3137 16.3137 18 13 18H11C7.68629 18 5 15.3137 5 12V11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="transition-colors duration-200"
    />
  </svg>
);

// SendIcon.jsx
const SendIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    />
  </svg>
);

// StopIcon.jsx
const StopIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="6"
      y="6"
      width="12"
      height="12"
      rx="2"
      fill="currentColor"
      className="transition-colors duration-200"
    />
  </svg>
);

export { NewChatIcon, ThinkModeIcon, VoiceIcon, SendIcon, StopIcon };
