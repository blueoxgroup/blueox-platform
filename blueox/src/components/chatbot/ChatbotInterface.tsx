import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, ArrowRight, Check, User, Bot, RotateCcw, LogIn } from 'lucide-react';
import { UserPath, ConversationMessage, ChatChoice, CollectedData } from './types';
import { WELCOME_MESSAGE, INITIAL_CHOICES, PATH_CONFIGS, getCompletionMessage } from './conversationFlow';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const generateId = () => Math.random().toString(36).substring(2, 15);

const ChatbotInterface: React.FC = () => {
  const navigate = useNavigate();
  const { user, client } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userPath, setUserPath] = useState<UserPath | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  // Reset conversation
  const resetConversation = () => {
    setMessages([]);
    setUserPath(null);
    setCurrentStepIndex(-1);
    setCollectedData({});
    setIsComplete(false);
    setInputValue('');
    setSelectedOptions([]);
    setShowAccountPrompt(false);
    localStorage.removeItem('blueox_conversation_data');
    setTimeout(() => {
      addBotMessage(WELCOME_MESSAGE, INITIAL_CHOICES);
    }, 300);
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      addBotMessage(WELCOME_MESSAGE, INITIAL_CHOICES);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addBotMessage = (content: string, choices?: ChatChoice[], inputType?: string, inputOptions?: string[], placeholder?: string, field?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        choices,
        inputType: inputType as ConversationMessage['inputType'],
        inputOptions,
        inputPlaceholder: placeholder,
        field
      }]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 800 + Math.random() * 400);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handlePathSelect = (choice: ChatChoice) => {
    addUserMessage(choice.label);
    const path = choice.value as UserPath;
    setUserPath(path);
    setCollectedData({ userPath: path });
    setCurrentStepIndex(0);
    
    // Get first step of the selected path
    const config = PATH_CONFIGS[path];
    if (config && config.steps.length > 0) {
      const step = config.steps[0];
      setTimeout(() => {
        addBotMessage(
          step.question,
          step.inputType === 'choices' ? step.choices : undefined,
          step.inputType,
          step.inputOptions,
          step.placeholder,
          step.field
        );
      }, 100);
    }
  };

  const processUserInput = (value: string | string[]) => {
    if (!userPath) return;
    
    const config = PATH_CONFIGS[userPath];
    const currentStep = config.steps[currentStepIndex];
    
    // Store the collected data
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    addUserMessage(displayValue);
    
    const newData = { ...collectedData, [currentStep.field]: value };
    setCollectedData(newData);
    
    // Move to next step
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex >= config.steps.length) {
      // Conversation complete
      setIsComplete(true);
      setTimeout(() => {
        addBotMessage(getCompletionMessage(userPath, newData));
        setShowAccountPrompt(true);
        saveConversationData(newData);
      }, 100);
    } else {
      // Continue to next question
      setCurrentStepIndex(nextIndex);
      const nextStep = config.steps[nextIndex];
      setTimeout(() => {
        addBotMessage(
          nextStep.question,
          nextStep.inputType === 'choices' ? nextStep.choices : undefined,
          nextStep.inputType,
          nextStep.inputOptions,
          nextStep.placeholder,
          nextStep.field
        );
      }, 100);
    }
    
    setInputValue('');
    setSelectedOptions([]);
  };

  const saveConversationData = async (data: CollectedData) => {
    try {
      // Save to localStorage for now (will be synced when user creates account)
      localStorage.setItem('blueox_conversation_data', JSON.stringify({
        ...data,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving conversation data:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processUserInput(inputValue.trim());
    }
  };

  const handleSelectOption = (option: string) => {
    processUserInput(option);
  };

  const handleMultiSelectToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleMultiSelectSubmit = () => {
    if (selectedOptions.length > 0) {
      processUserInput(selectedOptions);
    }
  };

  const handleCreateAccount = () => {
    // Navigate to login/signup with conversation data
    navigate('/login', { 
      state: { 
        from: { pathname: '/apply/' + (userPath?.includes('student') ? 'student' : 'workforce') },
        conversationData: collectedData 
      }
    });
  };

  const currentMessage = messages[messages.length - 1];
  const showTextInput = currentMessage?.inputType === 'text' || currentMessage?.inputType === 'number';
  const showSelectInput = currentMessage?.inputType === 'select';
  const showMultiSelectInput = currentMessage?.inputType === 'multiselect';
  const showInitialChoices = currentMessage?.choices && !userPath;

  // Calculate progress
  const totalSteps = userPath ? PATH_CONFIGS[userPath]?.steps.length || 0 : 0;
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-dark to-navy flex flex-col">
      {/* Header */}
      <div className="bg-navy-dark/50 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron text-lg font-bold text-white">Blue Ox AI Consultant</h1>
            <p className="text-xs text-gray-400 font-space">Online - Here to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {userPath && !isComplete && (
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-xs text-gray-400 font-space">Progress</span>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-coral transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-coral font-space">{Math.round(progress)}%</span>
            </div>
          )}
          {(userPath || isComplete) && (
            <button
              onClick={resetConversation}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Start Over"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          {!user && (
            <Link
              to="/login"
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-1"
              title="Sign In"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-space">Sign In</span>
            </Link>
          )}
          {user && client && (
            <Link
              to={`/apply/${client.role === 'student' ? 'student' : 'workforce'}`}
              className="text-coral hover:text-coral-light font-space text-sm font-medium"
            >
              Go to Portal
            </Link>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-coral/20' : 'bg-white/10'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-coral" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-coral text-white' 
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="font-space text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Initial Path Selection */}
          {showInitialChoices && currentMessage?.choices && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {currentMessage.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handlePathSelect(choice)}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-coral rounded-xl p-4 text-left transition-all group"
                >
                  <p className="font-space font-medium text-white group-hover:text-coral transition-colors">
                    {choice.label}
                  </p>
                  {choice.description && (
                    <p className="text-xs text-gray-400 mt-1">{choice.description}</p>
                  )}
                  <ArrowRight className="w-4 h-4 text-coral mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Account Creation Prompt */}
          {showAccountPrompt && (
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleCreateAccount}
                className="bg-coral hover:bg-coral-dark text-white font-space font-semibold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-white/10 hover:bg-white/20 text-white font-space px-6 py-3 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isComplete && !showInitialChoices && userPath && (
        <div className="bg-navy-dark/50 backdrop-blur-sm border-t border-white/10 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Select Options */}
            {showSelectInput && currentMessage?.inputOptions && (
              <div className="flex flex-wrap gap-2 mb-3">
                {currentMessage.inputOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="bg-white/10 hover:bg-coral text-white font-space text-sm px-4 py-2 rounded-full transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Multi-Select Options */}
            {showMultiSelectInput && currentMessage?.inputOptions && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {currentMessage.inputOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleMultiSelectToggle(option)}
                      className={`font-space text-sm px-4 py-2 rounded-full transition-all flex items-center space-x-2 ${
                        selectedOptions.includes(option)
                          ? 'bg-coral text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {selectedOptions.includes(option) && <Check className="w-3 h-3" />}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
                {selectedOptions.length > 0 && (
                  <button
                    onClick={handleMultiSelectSubmit}
                    className="bg-coral hover:bg-coral-dark text-white font-space font-medium px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>Continue with {selectedOptions.length} selected</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Text Input */}
            {showTextInput && (
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                  ref={inputRef}
                  type={currentMessage?.inputType === 'number' ? 'number' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentMessage?.inputPlaceholder || 'Type your answer...'}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 font-space focus:outline-none focus:border-coral transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-coral hover:bg-coral-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotInterface;
