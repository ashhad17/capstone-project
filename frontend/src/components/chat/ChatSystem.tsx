import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send, X, Trash2, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  read: boolean;
}

interface ChatSystemProps {
  receiverName?: string;
  minimized?: boolean;
  onMinimize?: () => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  receiverName = "Support",
  minimized = false,
  onMinimize
}) => {
  const { isAuthenticated, redirectToLogin, user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: true
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
  };

  // Key press handler for Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    if (!isAuthenticated) {
      redirectToLogin();
      setCurrentMessage("");
      toast({
        title: "Authentication Required",
        description: "Please login or register to send messages.",
        variant: "destructive"
      });
      return;
    }

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date(),
      read: true
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setCurrentMessage("");
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Generate a contextual response based on message content
      let responseText = "Thank you for your message. Our team will get back to you shortly.";
      const lowerCaseMessage = currentMessage.toLowerCase();
      
      if (lowerCaseMessage.includes("price") || lowerCaseMessage.includes("cost")) {
        responseText = "Our pricing varies depending on the service or vehicle you're interested in. Can you provide more specific details about what you're looking for?";
      } else if (lowerCaseMessage.includes("time") || lowerCaseMessage.includes("when") || lowerCaseMessage.includes("hours")) {
        responseText = "Our service center is open Monday to Friday from 9AM to 6PM, and Saturday from 10AM to 4PM. We're closed on Sundays.";
      } else if (lowerCaseMessage.includes("help") || lowerCaseMessage.includes("support")) {
        responseText = "I'd be happy to help! What specific information are you looking for about our cars or services?";
      } else if (lowerCaseMessage.includes("car") || lowerCaseMessage.includes("vehicle")) {
        responseText = "We have a wide selection of vehicles available. Are you looking for a specific make, model, or price range?";
      } else if (lowerCaseMessage.includes("service") || lowerCaseMessage.includes("repair")) {
        responseText = "We offer a comprehensive range of services including oil changes, tire rotations, brake repairs, and full detailing. Is there a specific service you're interested in?";
      } else if (lowerCaseMessage.includes("location") || lowerCaseMessage.includes("address") || lowerCaseMessage.includes("where")) {
        responseText = "We're located at 123 Auto Avenue, San Francisco, CA 94107. Our service center is easily accessible with parking available on-site.";
      } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("appointment") || lowerCaseMessage.includes("schedule")) {
        responseText = "You can book an appointment through our website or by calling us at (555) 123-4567. Would you like me to help you schedule a service?";
      }
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        sender: "agent",
        timestamp: new Date(),
        read: false
      };
      
      setMessages(prevMessages => [...prevMessages, agentResponse]);
    }, 1500);
  };
  
  const toggleChat = () => {
    setIsVisible(!isVisible);
    if (onMinimize) onMinimize();
  };

  const clearChat = () => {
    setMessages([{
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
      read: true
    }]);
    
    toast({
      title: "Chat cleared",
      description: "Chat history has been cleared.",
    });
  };
  
  if (minimized) {
    return (
      <Button 
        onClick={toggleChat}
        className="fixed right-4 bottom-4 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary-dark flex items-center justify-center"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className={`fixed right-4 bottom-4 z-50 w-80 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${isVisible ? 'h-96' : 'h-12'}`}>
      {/* Chat header */}
      <div 
        className="bg-primary text-white p-3 flex justify-between items-center cursor-pointer"
        onClick={toggleChat}
      >
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <div className="bg-primary-foreground rounded-full flex items-center justify-center h-full">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
          </Avatar>
          <span className="font-medium">{receiverName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="text-white hover:text-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              clearChat();
            }}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            className="text-white hover:text-gray-200"
          >
            {isVisible ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {isVisible && (
        <>
          {/* Messages area */}
          <ScrollArea className="h-72 p-3 bg-gray-50">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-lg p-2 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 text-right mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg rounded-tl-none p-2 max-w-[70%]">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          {/* Input area */}
          <div className="p-3 border-t border-gray-200">
            <form 
              className="flex gap-2" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="px-2"
                disabled={!currentMessage.trim() || isTyping}
              >
                {isTyping ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSystem;
