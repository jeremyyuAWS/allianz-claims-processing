import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg z-10 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      onClick={onClick}
      aria-label="Open chat assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
};

export default ChatButton;