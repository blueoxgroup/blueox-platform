import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowRight, Check, RotateCcw, ExternalLink, Upload, X, Menu, Briefcase } from 'lucide-react';
import { UserPath, ConversationMessage, ChatChoice, CollectedData, Job } from './types';
import { 
  WELCOME_MESSAGE, 
  INITIAL_CHOICES, 
  PATH_CONFIGS, 
  CHARACTER,
  WHATSAPP_LINK,
  COMPANY_REDIRECT_MESSAGE,
  getPreFormMessage,
  getCompletionMessage 
} from './conversationFlow';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Skill mapping for job matching
const SKILL_KEYWORDS: Record<string, string[]> = {
  'Technical/Trade Skills': ['technical', 'trade', 'mechanic', 'electrician', 'plumber', 'welder'],
  'Manufacturing': ['manufacturing', 'factory', 'production', 'warehouse', 'assembly'],
  'Healthcare': ['healthcare', 'care', 'nurse', 'medical', 'hospital', 'elderly'],
  'IT/Technology': ['it', 'technology', 'software', 'developer', 'tech', 'computer'],
  'Hospitality': ['hotel', 'restaurant', 'hospitality', 'kitchen', 'chef', 'reception'],
  'Construction': ['construction', 'building', 'builder', 'carpenter'],
  'Driving': ['driver', 'driving', 'delivery', 'logistics', 'transport'],
  'Agriculture': ['farm', 'agriculture', 'agricultural', 'harvest'],
  'Customer Service': ['customer', 'service', 'reception', 'support'],
  'Language Skills': ['language', 'translator', 'interpreter'],
  'Management': ['manager', 'management', 'supervisor', 'team lead'],
};

const ChatbotInterface: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userPath, setUserPath] = useState<UserPath | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset conversation
  const resetConversation = () => {
    setMessages([]);
    setUserPath(null);
    setCurrentStepIndex(-1);
    setCollectedData({});
    setIsComplete(false);
    setInputValue('');
    setSelectedOptions([]);
    setShowForm(false);
    setFormData({});
    setUploadedFiles({});
    setMatchedJobs([]);
    setSelectedJob(null);
    setShowJobSelection(false);
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
  }, [messages, scrollToBottom, showForm, showJobSelection]);

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
    }, 600 + Math.random() * 300);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  // Fetch live jobs from Supabase and match based on user preferences
  const fetchAndMatchJobs = async (data: CollectedData): Promise<Job[]> => {
    const userSkills = (data.skills as string[]) || [];
    const userCountries = (data.targetCountries as string[]) || [];
    
    try {
      // Fetch active jobs from Supabase
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);
      
      if (error || !jobsData) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      // Match jobs based on user preferences
      const matchedJobs = jobsData.filter(job => {
        // Country matching
        const countryMatch = userCountries.length === 0 || 
          userCountries.includes(job.country) || 
          userCountries.includes('Any') || 
          userCountries.includes('Other');
        
        if (!countryMatch) return false;

        // Skill matching - check if job title/description contains skill keywords
        if (userSkills.length === 0 || userSkills.includes('Other')) return true;
        
        const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase();
        
        return userSkills.some(skill => {
          const keywords = SKILL_KEYWORDS[skill] || [skill.toLowerCase()];
          return keywords.some(keyword => jobText.includes(keyword));
        });
      });

      // Sort by relevance (more keyword matches = higher score)
      const scoredJobs = matchedJobs.map(job => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        let score = 0;
        userSkills.forEach(skill => {
          const keywords = SKILL_KEYWORDS[skill] || [skill.toLowerCase()];
          keywords.forEach(keyword => {
            if (jobText.includes(keyword)) score++;
          });
        });
        if (userCountries.includes(job.country)) score += 2;
        return { ...job, score };
      });

      scoredJobs.sort((a, b) => b.score - a.score);
      
      // Convert to Job type format
      return scoredJobs.slice(0, 5).map(job => ({
        id: job.id,
        title: job.title,
        company: job.company || 'Blue Ox Partner',
        location: job.country,
        salary: job.salary_range,
        type: job.job_type,
        skills: [],
        description: job.description
      }));
    } catch (err) {
      console.error('Error in job matching:', err);
      return [];
    }
  };

  const handlePathSelect = (choice: ChatChoice) => {
    addUserMessage(choice.label);
    const path = choice.value as UserPath;
    
    // Company path - redirect to WhatsApp
    if (path === 'company') {
      setTimeout(() => {
        addBotMessage(COMPANY_REDIRECT_MESSAGE);
        setIsComplete(true);
      }, 100);
      return;
    }
    
    setUserPath(path);
    setCollectedData({ userPath: path });
    setCurrentStepIndex(0);
    
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

  const processUserInput = async (value: string | string[]) => {
    if (!userPath) return;
    
    const config = PATH_CONFIGS[userPath];
    const currentStep = config.steps[currentStepIndex];
    
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    addUserMessage(displayValue);
    
    const newData = { ...collectedData, [currentStep.field]: value };
    setCollectedData(newData);
    
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex >= config.steps.length) {
      // Check if we need job matching
      if (config.showJobMatching) {
        setIsTyping(true);
        const jobs = await fetchAndMatchJobs(newData);
        setIsTyping(false);
        setMatchedJobs(jobs);
        setTimeout(() => {
          if (jobs.length > 0) {
            addBotMessage("Great news! I found some jobs that match what you're looking for. Take a look and pick the one that catches your eye:");
            setShowJobSelection(true);
          } else {
            addBotMessage("I don't have exact matches right now, but don't worry - fill out your details and our team will find something perfect for you!");
            setShowForm(true);
          }
        }, 100);
      } else {
        // Show form directly
        setTimeout(() => {
          addBotMessage(getPreFormMessage(userPath));
          setShowForm(true);
        }, 100);
      }
      saveConversationData(newData);
    } else {
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

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    addUserMessage(`Selected: ${job.title} at ${job.company}`);
    setShowJobSelection(false);
    setTimeout(() => {
      addBotMessage(getPreFormMessage(userPath!, job.title));
      setShowForm(true);
    }, 100);
  };

  const saveConversationData = async (data: CollectedData) => {
    try {
      localStorage.setItem('blueox_conversation_data', JSON.stringify({
        ...data,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving conversation data:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPath || isSubmitting) return;

    setIsSubmitting(true);
    setIsTyping(true);

    const config = PATH_CONFIGS[userPath];
    const allData = {
      ...collectedData,
      ...formData,
      selectedJob: selectedJob?.id,
      uploadedDocuments: Object.keys(uploadedFiles)
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        // Upload files first
        for (const [fieldName, file] of Object.entries(uploadedFiles)) {
          const fileName = `${Date.now()}-${file.name}`;
          const { error } = await supabase.storage
            .from('documents')
            .upload(`applications/${fileName}`, file);
          if (error) console.error('Upload error:', error);
        }

        // Save application
        await supabase.from('applications').insert({
          user_path: userPath,
          data: allData,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
    }

    setShowForm(false);
    setIsTyping(false);
    setIsComplete(true);
    setIsSubmitting(false);
    addBotMessage(getCompletionMessage(userPath, allData));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [field]: file }));
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

  const currentMessage = messages[messages.length - 1];
  const showTextInput = currentMessage?.inputType === 'text' || currentMessage?.inputType === 'number';
  const showSelectInput = currentMessage?.inputType === 'select';
  const showMultiSelectInput = currentMessage?.inputType === 'multiselect';
  const showInitialChoices = currentMessage?.choices && !userPath;

  // Calculate progress
  const config = userPath ? PATH_CONFIGS[userPath] : null;
  const totalSteps = config?.steps.length || 0;
  const formSteps = config?.formFields?.length ? 1 : 0;
  const jobStep = config?.showJobMatching ? 1 : 0;
  const totalProgress = totalSteps + formSteps + jobStep;
  
  let currentProgress = currentStepIndex + 1;
  if (showJobSelection) currentProgress = totalSteps + 1;
  if (showForm) currentProgress = totalSteps + jobStep + 1;
  if (isComplete) currentProgress = totalProgress;
  
  const progress = totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-dark to-navy flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BO</span>
              </div>
              <span className="font-orbitron text-lg font-bold text-white hidden sm:block">Blue Ox</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-coral font-space text-sm transition-colors"
              >
                Talk to previous customers
              </a>
              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-coral font-space text-sm transition-colors"
              >
                Contact us
              </a>
              <Link 
                to="/jobs"
                className="text-gray-300 hover:text-coral font-space text-sm transition-colors flex items-center"
              >
                <Briefcase className="w-4 h-4 mr-1" />
                Jobs Open
              </Link>
              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-coral hover:bg-coral-dark text-white font-space text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Sign in
              </a>
            </nav>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-3">
                <a 
                  href={WHATSAPP_LINK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-coral font-space text-sm"
                >
                  Talk to previous customers
                </a>
                <a 
                  href={WHATSAPP_LINK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-coral font-space text-sm"
                >
                  Contact us
                </a>
                <Link 
                  to="/jobs"
                  className="text-gray-300 hover:text-coral font-space text-sm"
                >
                  Jobs Open
                </Link>
                <a 
                  href={WHATSAPP_LINK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-coral font-space text-sm"
                >
                  Sign in
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Progress Bar - Fixed below header */}
      {userPath && !isComplete && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-navy-dark/90 backdrop-blur-sm px-4 py-3 border-b border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400 font-space whitespace-nowrap">Progress</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-coral transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-xs text-coral font-space whitespace-nowrap">{Math.round(Math.min(progress, 100))}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area with Emmanuel */}
      <div className={`flex-1 overflow-y-auto px-4 py-6 ${userPath && !isComplete ? 'pt-32' : 'pt-24'}`}>
        <div className="max-w-3xl mx-auto">
          {/* Emmanuel's Profile Card */}
          {messages.length <= 1 && (
            <div className="flex items-center space-x-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <img 
                src={CHARACTER.profilePic} 
                alt={CHARACTER.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-coral"
              />
              <div>
                <h2 className="font-orbitron text-lg font-bold text-white">{CHARACTER.name}</h2>
                <p className="text-coral font-space text-sm">{CHARACTER.role}</p>
                <p className="text-gray-400 font-space text-xs mt-1">{CHARACTER.status}</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.role === 'assistant' ? (
                    <img 
                      src={CHARACTER.profilePic}
                      alt={CHARACTER.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-coral/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral text-xs font-bold">You</span>
                    </div>
                  )}
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

            {/* Job Selection */}
            {showJobSelection && matchedJobs.length > 0 && (
              <div className="space-y-3 mt-4">
                {matchedJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleJobSelect(job)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-coral rounded-xl p-4 text-left transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-space font-semibold text-white group-hover:text-coral transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-400">{job.company} - {job.location}</p>
                        <p className="text-xs text-gray-500 mt-1">{job.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-coral font-space text-sm">{job.salary}</span>
                        <p className="text-xs text-gray-500">{job.type}</p>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowJobSelection(false);
                    addBotMessage("No worries! Let's get your details anyway - we might have something perfect coming up soon.");
                    setShowForm(true);
                  }}
                  className="text-gray-400 hover:text-white font-space text-sm underline"
                >
                  None of these fit - show me the form anyway
                </button>
              </div>
            )}

            {/* Application Form */}
            {showForm && userPath && PATH_CONFIGS[userPath]?.formFields && (
              <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-4">
                <h3 className="font-orbitron text-lg font-bold text-white mb-4">Your Details</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {PATH_CONFIGS[userPath].formFields!.map((field) => (
                    <div key={field.field}>
                      <label className="block text-sm font-space text-gray-300 mb-1">
                        {field.label} {field.required && <span className="text-coral">*</span>}
                      </label>
                      {field.type === 'file' ? (
                        <div>
                          <div 
                            onClick={() => {
                              const input = document.getElementById(`file-${field.field}`) as HTMLInputElement;
                              input?.click();
                            }}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                              uploadedFiles[field.field] 
                                ? 'border-coral bg-coral/10' 
                                : 'border-white/20 hover:border-coral/50'
                            }`}
                          >
                            <input
                              id={`file-${field.field}`}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileChange(field.field, e)}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            {uploadedFiles[field.field] ? (
                              <div className="flex items-center justify-center space-x-2 text-coral">
                                <Check className="w-5 h-5" />
                                <span className="font-space text-sm">{uploadedFiles[field.field].name}</span>
                              </div>
                            ) : (
                              <div className="text-gray-400">
                                <Upload className="w-6 h-6 mx-auto mb-1" />
                                <span className="font-space text-sm">Click to upload</span>
                              </div>
                            )}
                          </div>
                          {field.helpText && (
                            <p className="text-xs text-gray-500 mt-1">
                              {field.helpText}{' '}
                              {field.helpLink && (
                                <a 
                                  href={field.helpLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-coral hover:underline inline-flex items-center"
                                >
                                  Create here <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.field] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.field]: e.target.value }))}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 font-space focus:outline-none focus:border-coral transition-colors"
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-coral hover:bg-coral-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-space font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <img 
                  src={CHARACTER.profilePic}
                  alt={CHARACTER.name}
                  className="w-8 h-8 rounded-full object-cover border border-coral/50"
                />
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Completion Actions */}
            {isComplete && !showForm && (
              <div className="mt-6 space-y-4">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-space font-semibold py-3 rounded-lg transition-colors text-center"
                >
                  Follow up on WhatsApp
                </a>
                <button
                  onClick={resetConversation}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-space py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start New Conversation</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      {!isComplete && !showInitialChoices && !showForm && !showJobSelection && userPath && (
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
