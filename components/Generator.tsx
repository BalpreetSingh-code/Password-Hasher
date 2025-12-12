import React, { useState, useRef, useEffect } from 'react';
import { createPasswordGeneratorChat } from '../services/gemini';
import { Chat } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Generator: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    startNewChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = async () => {
    setMessages([]);
    setGeneratedPassword(null);
    setIsLoading(true);
    try {
      const newChat = createPasswordGeneratorChat();
      setChat(newChat);
      
      // Get initial greeting
      const result = await newChat.sendMessage({ message: "Start the session." });
      const text = result.text || "Hello! I'm ready to help you generate a password.";
      setMessages([{ role: 'model', text }]);
    } catch (e) {
      console.error(e);
      setMessages([{ role: 'model', text: "Error connecting to AI service. Please try resetting." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chat) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chat.sendMessage({ message: userMsg });
      const responseText = result.text || "";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

      // Simple regex to detect if a password was generated in the format requested
      const passMatch = responseText.match(/GENERATED PASSWORD:\s*([^\s]+)/);
      if (passMatch && passMatch[1]) {
        setGeneratedPassword(passMatch[1]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      alert("Password copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="bg-yellow-100 border-b-2 border-black p-4 text-sm font-bold">
        PRIVACY NOTICE: Your conversation helps generate your password but is not stored permanently.
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'}
            `}>
              <div className="whitespace-pre-wrap font-mono text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-gray-200 border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
               Thinking...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {generatedPassword && (
        <div className="p-4 bg-green-100 border-t-2 border-black flex items-center justify-between">
            <div>
                <span className="font-bold text-xs uppercase block text-gray-600">Generated Password</span>
                <span className="font-mono text-xl font-bold">{generatedPassword}</span>
            </div>
            <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none active:translate-y-1 transition-all font-bold uppercase text-sm"
            >
                Copy
            </button>
        </div>
      )}

      <div className="p-4 border-t-2 border-black bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
            disabled={isLoading}
            className="flex-1 p-3 border-2 border-black focus:outline-none focus:ring-0 rounded-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 bg-black text-white font-bold uppercase border-2 border-black hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
          <button
            onClick={startNewChat}
            className="px-4 bg-white text-black font-bold uppercase border-2 border-black hover:bg-gray-100"
            title="Reset Chat"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generator;
