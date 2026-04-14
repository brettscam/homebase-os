import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// base44 LLM integration removed — AI chat will use a new backend
import { useProperty } from '../lib/PropertyContext';
import { useAuth } from '../lib/AuthContext';
import { getChatConversations, upsertChatConversation, deleteChatConversation } from '../lib/supabaseDataStore';
import { toast } from 'sonner';
import {
  Send,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Clock,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Paintbrush,
  Wrench,
  Thermometer,
  Droplets,
  Zap,
  Home,
  Calculator,
  ShieldCheck,
  Pencil,
  Check,
  X,
} from 'lucide-react';

// Build the full home context prompt from PropertyContext data
function buildHomeContext(activeProperty, homeData) {
  const property = activeProperty || {};
  const data = homeData || {};
  const rooms = data.rooms || [];
  const appliances = data.appliances || [];
  const systems = data.systems || [];
  const paintRecords = data.paintRecords || [];
  const smartHome = data.smartHome || [];
  const emergencyInfo = data.emergencyInfo || [];
  const exterior = data.exterior || [];
  const contacts = data.contacts || [];
  const documents = data.documents || [];

  const sections = [];

  sections.push(`PROPERTY: ${property.address || 'No address set'}${property.city ? `, ${property.city}` : ''}${property.state ? `, ${property.state}` : ''}`);
  sections.push(`Year Built: ${property.year_built || 'Unknown'} | Sqft: ${property.sqft || 'Unknown'} | Bedrooms: ${property.bedrooms || 'Unknown'} | Bathrooms: ${property.bathrooms || 'Unknown'} | Lot: ${property.lot_size || 'Unknown'}`);

  if (rooms.length > 0) {
    sections.push(`ROOMS:\n${rooms.map(r => `- ${r.name}${r.type ? ` (${r.type})` : ''}${r.sqft ? ` ${r.sqft} sqft` : ''}`).join('\n')}`);
  } else { sections.push('ROOMS: No rooms recorded yet'); }

  if (appliances.length > 0) {
    sections.push(`APPLIANCES:\n${appliances.map(a => `- ${a.name || a.type}: ${[a.brand, a.model].filter(Boolean).join(' ') || 'No details'}`).join('\n')}`);
  } else { sections.push('APPLIANCES: No appliances recorded yet'); }

  if (systems.length > 0) {
    sections.push(`SYSTEMS:\n${systems.map(s => `- ${s.type}: ${JSON.stringify(s.data || {})}`).join('\n')}`);
  } else { sections.push('SYSTEMS: No systems recorded yet'); }

  if (paintRecords.length > 0) {
    sections.push(`PAINT:\n${paintRecords.map(p => `- ${p.room_name || 'Room'}: ${[p.brand, p.color_name].filter(Boolean).join(' ') || 'Unknown'} ${p.color_hex || ''}`).join('\n')}`);
  }

  if (smartHome.length > 0) {
    sections.push(`SMART HOME:\n${smartHome.map(s => `- ${s.type}: ${s.name || ''} ${JSON.stringify(s.data || {})}`).join('\n')}`);
  }

  if (emergencyInfo.length > 0) {
    sections.push(`EMERGENCY SHUTOFFS:\n${emergencyInfo.map(e => `- ${e.type}: ${e.data?.location || 'Location not set'} ${e.data?.instructions || ''}`).join('\n')}`);
  }

  if (contacts.length > 0) {
    sections.push(`SERVICE CONTACTS:\n${contacts.map(c => `- ${c.name}${c.role ? ` (${c.role})` : ''}: ${c.phone || 'No phone'}`).join('\n')}`);
  }

  if (documents.length > 0) {
    sections.push(`DOCUMENTS:\n${documents.map(d => `- ${d.name} (${d.type || 'unknown'})`).join('\n')}`);
  }

  return `You are Homer, the HomeBase AI assistant. You know everything about this home and help the owner with questions about their property, maintenance, and home management.

${sections.join('\n\n')}

If information is missing, say so honestly. Never make up data. Suggest the user add missing information through HomeBase.`;
}

// Suggested starter questions organized by category
const STARTER_QUESTIONS = [
  {
    icon: Paintbrush,
    color: 'text-pink-600 bg-pink-50',
    question: 'How much paint do I need for the master bedroom?',
    label: 'Paint calculator',
  },
  {
    icon: Home,
    color: 'text-blue-600 bg-blue-50',
    question: 'I want to redo my roof — what should I ask contractors for quotes?',
    label: 'Roof project',
  },
  {
    icon: Calculator,
    color: 'text-green-600 bg-green-50',
    question: 'What are my total monthly utility costs?',
    label: 'Utility costs',
  },
  {
    icon: Wrench,
    color: 'text-orange-600 bg-orange-50',
    question: "When is my appliance warranty expiring? What should I do to prepare?",
    label: 'Warranty check',
  },
  {
    icon: Thermometer,
    color: 'text-red-600 bg-red-50',
    question: "What size HVAC filter do I need and when should I replace it?",
    label: 'HVAC maintenance',
  },
  {
    icon: ShieldCheck,
    color: 'text-indigo-600 bg-indigo-50',
    question: "What's the security alarm code and WiFi password for the house sitter?",
    label: 'House sitter info',
  },
];

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AskAI() {
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { activeProperty, homeData } = useProperty();
  const { user } = useAuth();
  const homeContext = buildHomeContext(activeProperty, homeData);

  // Load conversations from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    const loadConversations = async () => {
      try {
        const loaded = await getChatConversations(user.id);
        setConversations(loaded);
        if (loaded.length > 0) {
          setActiveConvoId(loaded[0].id);
          setMessages(loaded[0].messages || []);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    loadConversations();
  }, [user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvoId]);

  const handleNewChat = async () => {
    if (!user?.id) return;
    try {
      const convo = await upsertChatConversation({ user_id: user.id, property_id: activeProperty?.id, title: 'New Chat', messages: [] });
      setConversations(prev => [convo, ...prev]);
      setActiveConvoId(convo.id);
      setMessages([]);
    } catch (err) { console.error('Failed to create conversation:', err); }
  };

  const handleSelectConvo = (convo) => {
    setActiveConvoId(convo.id);
    setMessages(convo.messages || []);
  };

  const handleDeleteConvo = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteChatConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConvoId === id) {
        if (remaining.length > 0) { setActiveConvoId(remaining[0].id); setMessages(remaining[0].messages || []); }
        else { setActiveConvoId(null); setMessages([]); }
      }
      toast.success('Conversation deleted');
    } catch (err) { console.error('Failed to delete conversation:', err); }
  };

  const handleRenameConvo = (e, id) => {
    e.stopPropagation();
    const convo = conversations.find(c => c.id === id);
    setEditingTitle(id);
    setEditTitleValue(convo?.title || '');
  };

  const handleSaveTitle = async (e, id) => {
    e.stopPropagation();
    if (!editTitleValue.trim()) return;
    try {
      await upsertChatConversation({ id, title: editTitleValue.trim() });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitleValue.trim() } : c));
      setEditingTitle(null);
    } catch (err) { console.error('Failed to rename conversation:', err); }
  };

  const handleSendMessage = async (text) => {
    const question = text || inputValue;
    if (!question.trim() || isLoading) return;

    // Create a conversation if none exists
    let convoId = activeConvoId;
    if (!convoId) {
      if (!user?.id) return;
      try {
        const convo = await upsertChatConversation({ user_id: user.id, property_id: activeProperty?.id, title: 'New Chat', messages: [] });
        setConversations(prev => [convo, ...prev]);
        convoId = convo.id;
        setActiveConvoId(convo.id);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        return;
      }
    }

    const userMessage = { role: 'user', content: question, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const historyPrompt = newMessages.slice(-10).map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n\n');

      // AI backend temporarily unavailable during migration
      const response = 'AI chat is being migrated to a new backend. This feature will be available again soon.';

      const assistantMessage = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Auto-title: use the first user question as the title if it's "New Chat"
      const convo = conversations.find(c => c.id === convoId);
      const autoTitle = convo?.title === 'New Chat' && newMessages.filter(m => m.role === 'user').length === 1
        ? question.slice(0, 60) + (question.length > 60 ? '...' : '')
        : undefined;

      await upsertChatConversation({
        id: convoId,
        messages: updatedMessages,
        ...(autoTitle ? { title: autoTitle } : {}),
      });
      setConversations(prev => prev.map(c => c.id === convoId
        ? { ...c, messages: updatedMessages, ...(autoTitle ? { title: autoTitle } : {}) }
        : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      try {
        await upsertChatConversation({ id: convoId, messages: updatedMessages });
      } catch (saveErr) { console.error('Failed to save error message:', saveErr); }
    } finally {
      setIsLoading(false);
    }
  };

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#F9F9F9]">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-r border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-hb-teal text-white rounded-xl text-sm font-medium hover:bg-hb-teal-600 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-300 mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="py-2">
                  {conversations.map((convo) => (
                    <div
                      key={convo.id}
                      onClick={() => handleSelectConvo(convo)}
                      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                        activeConvoId === convo.id
                          ? 'bg-hb-teal-50 border-r-2 border-hb-teal'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                        activeConvoId === convo.id ? 'text-hb-teal' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        {editingTitle === convo.id ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input
                              value={editTitleValue}
                              onChange={e => setEditTitleValue(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveTitle(e, convo.id)}
                              className="text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded px-1.5 py-0.5 w-full outline-none"
                              autoFocus
                            />
                            <button onClick={e => handleSaveTitle(e, convo.id)} className="p-0.5 text-green-600 hover:text-green-700">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setEditingTitle(null); }} className="p-0.5 text-gray-400 hover:text-gray-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm font-medium truncate ${
                              activeConvoId === convo.id ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {convo.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(convo.updated_at || convo.created_at)}
                              <span className="text-gray-300 mx-1">·</span>
                              {(convo.messages || []).filter(m => m.role === 'user').length} messages
                            </p>
                          </>
                        )}
                      </div>
                      {editingTitle !== convo.id && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleRenameConvo(e, convo.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConvo(e, convo.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                {activeConvo?.title || 'HomeBase AI'}
              </h1>
              <p className="text-xs text-gray-400">Knows everything about your home</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto px-6 py-12">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-hb-navy mb-2">Ask Homer</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  I know your home inside and out — room dimensions, paint colors, appliance specs, utility accounts, and more. Ask me anything.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_QUESTIONS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(item.question)}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all text-left group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item.question}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'flex gap-3'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`${
                      message.role === 'user'
                        ? 'bg-hb-teal text-white rounded-2xl rounded-br-md px-5 py-3'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      {message.timestamp && (
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-200' : 'text-gray-300'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-hb-teal animate-spin" />
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl flex items-end p-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about your home — paint, dimensions, warranties, projects..."
                className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-700 text-sm resize-none max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 bg-hb-teal rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-hb-teal-600 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-300 text-center mt-2">
              HomeBase AI uses your home data to give personalized answers. Shift+Enter for new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
