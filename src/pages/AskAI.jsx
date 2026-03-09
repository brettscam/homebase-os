import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  getHomeData,
  getChatHistory,
  createConversation,
  updateConversation,
  deleteConversation,
  generateId,
} from '../lib/homeDataStore';
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

// Build the full home context prompt
function buildHomeContext(homeData) {
  const roomsList = homeData.rooms?.length > 0
    ? homeData.rooms.map(r => `- ${r.name}: ${r.width || ''}' × ${r.length || ''}', Ceiling: ${r.ceilingHeight || 'N/A'}, Flooring: ${r.flooringType || 'N/A'}`).join('\n')
    : `- Kitchen: 16'4" × 18'2" (297 sq ft), Ceiling: 9'6", Flooring: White Oak 7" wide plank
- Living Room: 18' × 22', Ceiling: 10' (vaulted)
- Master Bedroom: 16' × 18'
- Bedroom 2: 12' × 14'
- Bedroom 3: 12' × 14'
- Dining Room: 12' × 14'
- Master Bathroom: 10' × 12'
- Guest Bathroom: 8' × 10'`;

  const appliancesList = homeData.appliances?.length > 0
    ? homeData.appliances.map(a => `- ${a.name}: ${a.brand || ''} ${a.model || ''} (Installed: ${a.installDate || 'N/A'}, Warranty: ${a.warrantyExpiry || 'N/A'})`).join('\n')
    : `- Refrigerator: Sub-Zero BI-42U (Installed March 2021, Warranty until March 2026)
- Dishwasher: Bosch 800 Series SHPM88Z75N
- Range: Wolf 36" Dual Fuel DF366 (Installed January 2022)`;

  const paintList = homeData.paint?.length > 0
    ? homeData.paint.map(p => `- ${p.location || 'Room'}: ${p.brand || ''} "${p.colorName || ''}" (${p.colorCode || ''}), Finish: ${p.finish || 'N/A'}`).join('\n')
    : `- Walls: Benjamin Moore "Chantilly Lace" (OC-65)
- Trim: Benjamin Moore "White Dove" (OC-17)
- Accent/Cabinets: Farrow & Ball "Hague Blue" (No. 30)`;

  return `You are HomeBase AI, an intelligent assistant for a homeowner.
You have COMPLETE knowledge of this home and can answer detailed questions about every aspect of it.
When users ask about home improvement projects, provide specific advice based on what's actually in this home (existing materials, brands, specs, ages).
When doing calculations (paint coverage, flooring area, etc.), show your math step by step.

PROPERTY:
- Address: ${homeData.property?.address || '142 Cascade Drive'}, ${homeData.property?.city || 'Mill Valley'}, ${homeData.property?.state || 'CA'}
- Year Built: ${homeData.property?.yearBuilt || '1987'}
- Total Square Feet: ${homeData.property?.sqft || '2,847'} sq ft
- Lot Size: ${homeData.property?.lotSize || '0.31 acres'}
- Bedrooms: ${homeData.property?.bedrooms || '4'}, Bathrooms: ${homeData.property?.bathrooms || '3.5'}
- Stories: ${homeData.property?.stories || '2'}

ROOMS & DIMENSIONS:
${roomsList}

PAINT COLORS:
${paintList}

WINDOWS:
- Kitchen: 2× Casement, Milgard Tuscany Series, Rough Opening: 36"w × 48"h, Glass: 32"w × 44"h
- Living Room: 3-Panel Bay Window (Center: 60"w × 72"h, Sides: 30"w × 72"h each), Side Window 48"w × 60"h
- Master Bedroom: 2× Double-Hung, Andersen 400 Series, 42"w × 60"h

APPLIANCES:
${appliancesList}

MECHANICAL SYSTEMS:
- HVAC: ${homeData.systems?.hvac?.brand || 'Carrier'} ${homeData.systems?.hvac?.model || ''}, Type: ${homeData.systems?.hvac?.type || 'Central AC + Gas Furnace'}, Thermostat: Nest Learning (Hallway)
- Water Heater: ${homeData.systems?.waterHeater?.brand || 'Rheem'} ${homeData.systems?.waterHeater?.model || 'Performance Platinum'} ${homeData.systems?.waterHeater?.capacity || '50'} Gallon (${homeData.systems?.waterHeater?.type || 'Tank'}, Installed ${homeData.systems?.waterHeater?.installDate || '2023'})
- Electrical Panel: ${homeData.systems?.electrical?.amperage || '200'}A Main Panel, ${homeData.systems?.electrical?.circuits || '16'} Circuits, Location: ${homeData.systems?.electrical?.panelLocation || 'Garage'}

EMERGENCY SHUTOFFS:
- Water Main: ${homeData.emergency?.waterShutoff?.location || 'Front Yard, Blue Lid'} - ${homeData.emergency?.waterShutoff?.instructions || 'Turn clockwise to close'}
- Gas Main: ${homeData.emergency?.gasShutoff?.location || 'North Wall'} - ${homeData.emergency?.gasShutoff?.instructions || 'Wrench attached, turn perpendicular to pipe'}
- Electrical Panel: ${homeData.emergency?.electricalPanel?.location || 'Garage Panel A'} - ${homeData.emergency?.electricalPanel?.instructions || 'Main breaker top left'}

SMART HOME:
- WiFi: ${homeData.smartHome?.wifi?.networkName || 'Redwood_Mesh_Pro'} (Password: ${homeData.smartHome?.wifi?.password || 'TreeHouse2026!'})
- Front Door: Yale Assure Lock (Code: ${homeData.smartHome?.doorLocks?.[0]?.code || '4821#'})
- Garage: ${homeData.smartHome?.garage?.brand || 'LiftMaster'} Opener (Code: ${homeData.smartHome?.garage?.code || '8900'})
- Security: ${homeData.smartHome?.security?.provider || 'ADT Pulse'}, Panel at ${homeData.smartHome?.security?.panelLocation || 'Kitchen Entrance'}

EXTERIOR:
- Roof: ${homeData.exterior?.roof?.material || 'GAF Timberline Asphalt Shingle'} (Installed ${homeData.exterior?.roof?.installDate || '2018'})
- Siding: ${homeData.exterior?.siding?.material || 'Wood'}
- Gutters: ${homeData.exterior?.gutters?.type || 'Seamless Aluminum 5"'}, French Drain System

LANDSCAPE:
- Coast Redwood (3) - Front Yard, 65-70 ft tall, Planted 1987
- Japanese Maple (2) - Back Yard, 12-15 ft tall, Planted 2015
- Irrigation: ${homeData.landscape?.irrigation?.controller || 'Hunter X-Core'} Controller (${homeData.landscape?.irrigation?.zones || '4'} zones, Controller in Garage)

SERVICE PROVIDERS:
${homeData.contacts?.length > 0
  ? homeData.contacts.map(c => `- ${c.trade || 'Provider'}: ${c.name}${c.company ? ` (${c.company})` : ''}, Phone: ${c.phone || 'N/A'}${c.isEmergency ? ' [EMERGENCY]' : ''}${c.jobs?.length > 0 ? `, Last job: ${c.jobs[c.jobs.length - 1].description} ($${c.jobs[c.jobs.length - 1].cost || '?'}, ${c.jobs[c.jobs.length - 1].date || '?'})` : ''}`).join('\n')
  : '- No service providers added yet'}

UTILITY ACCOUNTS:
${homeData.utilities?.length > 0
  ? homeData.utilities.map(u => `- ${u.utilityType || 'Utility'}: ${u.provider}, Account: ${u.accountNumber || 'N/A'}, ~$${u.avgMonthlyCost || '?'}/mo, Autopay: ${u.autopay ? 'Yes' : 'No'}`).join('\n')
  : '- No utility accounts added yet'}

When answering:
1. Be helpful and conversational
2. Use specific details from this home's data
3. For projects like "redo my roof", reference the CURRENT roof type, age, and material so the homeowner knows what to tell contractors
4. For window blinds, use the rough opening dimensions (subtract 1/4" for clearance)
5. For paint calculations, use room dimensions to compute wall area (height × perimeter - windows/doors), then divide by coverage per gallon (typically 350-400 sq ft/gallon)
6. If asked about something not in the data, say so politely
7. For measurements, be precise
8. When recommending contractors/quotes, reference the homeowner's existing service providers if applicable`;
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

  const homeData = getHomeData();
  const homeContext = buildHomeContext(homeData);

  // Load conversations on mount
  useEffect(() => {
    const loaded = getChatHistory();
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveConvoId(loaded[0].id);
      setMessages(loaded[0].messages || []);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvoId]);

  const handleNewChat = () => {
    const convo = createConversation('New Chat');
    setConversations(prev => [convo, ...prev]);
    setActiveConvoId(convo.id);
    setMessages([]);
  };

  const handleSelectConvo = (convo) => {
    setActiveConvoId(convo.id);
    setMessages(convo.messages || []);
  };

  const handleDeleteConvo = (e, id) => {
    e.stopPropagation();
    const updated = deleteConversation(id);
    setConversations(updated);
    if (activeConvoId === id) {
      if (updated.length > 0) {
        setActiveConvoId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        setActiveConvoId(null);
        setMessages([]);
      }
    }
  };

  const handleRenameConvo = (e, id) => {
    e.stopPropagation();
    const convo = conversations.find(c => c.id === id);
    setEditingTitle(id);
    setEditTitleValue(convo?.title || '');
  };

  const handleSaveTitle = (e, id) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      const updated = updateConversation(id, { title: editTitleValue.trim() });
      setConversations(getChatHistory());
    }
    setEditingTitle(null);
  };

  const handleSendMessage = async (text) => {
    const question = text || inputValue;
    if (!question.trim() || isLoading) return;

    // Create a conversation if none exists
    let convoId = activeConvoId;
    if (!convoId) {
      const convo = createConversation('New Chat');
      setConversations(prev => [convo, ...prev]);
      convoId = convo.id;
      setActiveConvoId(convo.id);
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

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${homeContext}\n\nConversation so far:\n${historyPrompt}\n\nProvide a helpful, accurate answer based on the home data above. If doing calculations, show your math.`,
      });

      const assistantMessage = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Auto-title: use the first user question as the title if it's "New Chat"
      const convo = conversations.find(c => c.id === convoId);
      const autoTitle = convo?.title === 'New Chat' && newMessages.filter(m => m.role === 'user').length === 1
        ? question.slice(0, 60) + (question.length > 60 ? '...' : '')
        : undefined;

      updateConversation(convoId, {
        messages: updatedMessages,
        ...(autoTitle ? { title: autoTitle } : {}),
      });
      setConversations(getChatHistory());
    } catch {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      updateConversation(convoId, { messages: updatedMessages });
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
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
                          ? 'bg-blue-50 border-r-2 border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                        activeConvoId === convo.id ? 'text-blue-600' : 'text-gray-400'
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
                              {formatTimestamp(convo.updatedAt || convo.createdAt)}
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ask HomeBase AI</h2>
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
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-5 py-3'
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
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
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
                className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
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
