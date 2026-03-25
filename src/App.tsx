import React, { useState, useEffect, useRef } from 'react';
import { 
  Anchor, 
  Compass, 
  Map as MapIcon, 
  Scroll, 
  MessageSquare, 
  Send, 
  Skull, 
  Ship, 
  Waves, 
  X,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { LogEntry, ChatMessage } from './types';

// --- Constants ---
const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    date: '1724-03-25',
    title: 'The Gilded Compass',
    content: 'We set sail from Tortuga at dawn. The winds be fair and the sea be calm. We seek the Gilded Compass, a relic of the old world.',
    location: 'Tortuga'
  },
  {
    id: '2',
    date: '1724-03-26',
    title: 'A Storm Brews',
    content: 'The sky turned black as ink. The waves crashed against the hull like a giant\'s fist. We lost two crates of rum, but the ship held true.',
    location: 'The Devil\'s Maw'
  }
];

// --- Components ---

const PirateChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are the ship's navigator, a salty pirate who has seen every corner of the Seven Seas. You speak in a thick pirate accent (using words like 'aye', 'matey', 'scallywag', 'avast'). You are helpful but always stay in character. Your name is Old Barnaby.",
        }
      });

      const aiMsg: ChatMessage = { role: 'model', text: response.text || "I be lost at sea, matey. Try again later." };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "The Kraken has disrupted our communications! (Error connectin' to the stars)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden border border-gold/30">
      <div className="p-4 bg-wood/40 border-b border-gold/20 flex items-center gap-2">
        <Skull className="text-gold w-5 h-5" />
        <h3 className="font-pirate text-xl text-gold tracking-wider">Navigator's Quarters</h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gold/20">
        {messages.length === 0 && (
          <div className="text-center py-10 opacity-50 italic">
            "Speak up, scallywag! What be on yer mind?"
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col max-w-[85%]",
            msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
          )}>
            <div className={cn(
              "p-3 rounded-lg text-sm",
              msg.role === 'user' 
                ? "bg-gold text-wood rounded-tr-none" 
                : "bg-wood/60 border border-gold/20 rounded-tl-none"
            )}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
            <span className="text-[10px] uppercase tracking-widest opacity-40 mt-1">
              {msg.role === 'user' ? "Ye" : "Barnaby"}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      <div className="p-4 bg-wood/20 border-t border-gold/10 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the navigator..."
          className="flex-1 bg-black/40 border border-gold/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-gold text-wood p-2 rounded-lg hover:bg-gold/80 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TreasureMap = () => {
  const [treasurePos, setTreasurePos] = useState({ x: 5, y: 3 });
  const [shipPos, setShipPos] = useState({ x: 1, y: 1 });
  const gridSize = 10;

  const moveShip = (dx: number, dy: number) => {
    setShipPos(prev => ({
      x: Math.max(0, Math.min(gridSize - 1, prev.x + dx)),
      y: Math.max(0, Math.min(gridSize - 1, prev.y + dy))
    }));
  };

  const isFound = shipPos.x === treasurePos.x && shipPos.y === treasurePos.y;

  return (
    <div className="glass rounded-xl p-6 border border-gold/30 flex flex-col items-center">
      <div className="flex justify-between w-full mb-4 items-center">
        <h3 className="font-pirate text-2xl text-gold tracking-widest">The Lost Isles</h3>
        <div className="text-xs uppercase tracking-widest opacity-60">
          Pos: {shipPos.x}, {shipPos.y}
        </div>
      </div>

      <div className="relative bg-[#c2b280] p-2 rounded shadow-inner border-4 border-wood/40 paper-texture">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isShip = shipPos.x === x && shipPos.y === y;
            const isTreasure = treasurePos.x === x && treasurePos.y === y && isFound;
            
            return (
              <div 
                key={i} 
                className="w-8 h-8 border border-black/5 flex items-center justify-center relative"
              >
                {isShip && (
                  <motion.div layoutId="ship">
                    <Ship className="w-6 h-6 text-wood" />
                  </motion.div>
                )}
                {isTreasure && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Skull className="w-6 h-6 text-red-800" />
                  </motion.div>
                )}
                {!isShip && !isTreasure && Math.random() > 0.95 && (
                  <Waves className="w-4 h-4 text-blue-800/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div />
        <button onClick={() => moveShip(0, -1)} className="p-2 glass hover:bg-gold/20 rounded"><ChevronRight className="-rotate-90 w-5 h-5" /></button>
        <div />
        <button onClick={() => moveShip(-1, 0)} className="p-2 glass hover:bg-gold/20 rounded"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={() => moveShip(0, 1)} className="p-2 glass hover:bg-gold/20 rounded"><ChevronRight className="rotate-90 w-5 h-5" /></button>
        <button onClick={() => moveShip(1, 0)} className="p-2 glass hover:bg-gold/20 rounded"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {isFound && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-gold font-pirate text-xl animate-pulse"
        >
          X Marks the Spot!
        </motion.div>
      )}
    </div>
  );
};

const CaptainsLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isAdding, setIsAdding] = useState(false);
  const [newLog, setNewLog] = useState({ title: '', content: '', location: '' });

  const addLog = () => {
    if (!newLog.title || !newLog.content) return;
    const log: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...newLog
    };
    setLogs([log, ...logs]);
    setNewLog({ title: '', content: '', location: '' });
    setIsAdding(false);
  };

  return (
    <div className="glass rounded-xl p-6 border border-gold/30 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-pirate text-2xl text-gold tracking-widest flex items-center gap-2">
          <Scroll className="w-6 h-6" /> Captain's Log
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 glass hover:bg-gold/20 rounded-full transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-3 bg-wood/20 p-4 rounded-lg border border-gold/10"
          >
            <input 
              placeholder="Title of the Voyage" 
              value={newLog.title}
              onChange={e => setNewLog({...newLog, title: e.target.value})}
              className="w-full bg-black/40 border border-gold/20 rounded px-3 py-2 text-sm focus:outline-none"
            />
            <input 
              placeholder="Location" 
              value={newLog.location}
              onChange={e => setNewLog({...newLog, location: e.target.value})}
              className="w-full bg-black/40 border border-gold/20 rounded px-3 py-2 text-sm focus:outline-none"
            />
            <textarea 
              placeholder="What be the tale?" 
              value={newLog.content}
              onChange={e => setNewLog({...newLog, content: e.target.value})}
              className="w-full bg-black/40 border border-gold/20 rounded px-3 py-2 text-sm h-24 focus:outline-none"
            />
            <button 
              onClick={addLog}
              className="w-full bg-gold text-wood font-bold py-2 rounded hover:bg-gold/80 transition-colors"
            >
              Seal the Log
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gold/20">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 border-l border-gold/20 group">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gold group-hover:scale-150 transition-transform" />
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gold/90">{log.title}</h4>
              <span className="text-[10px] uppercase tracking-widest opacity-40">{log.date}</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gold/60 mb-2 italic">
              Near {log.location}
            </div>
            <p className="text-sm leading-relaxed opacity-80 italic">
              "{log.content}"
            </p>
            <button 
              onClick={() => setLogs(logs.filter(l => l.id !== log.id))}
              className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sea/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 glass rounded-lg border-gold/30">
            <Compass className="w-8 h-8 text-gold animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h1 className="font-pirate text-3xl text-gold tracking-widest leading-none">The Gilded Compass</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">Navigator's Dashboard</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-medium">
          <a href="#" className="text-gold hover:opacity-70 transition-opacity flex items-center gap-2"><Anchor className="w-3 h-3" /> Fleet</a>
          <a href="#" className="hover:opacity-70 transition-opacity flex items-center gap-2"><MapIcon className="w-3 h-3" /> Charts</a>
          <a href="#" className="hover:opacity-70 transition-opacity flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Tavern</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Left Column: Log & Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[500px]">
              <CaptainsLog />
            </div>
            <div>
              <TreasureMap />
              <div className="mt-6 glass rounded-xl p-6 border border-gold/30">
                <h3 className="font-pirate text-xl text-gold mb-4 tracking-wider">Ship's Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                      <span>Hull Integrity</span>
                      <span>85%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gold w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                      <span>Rum Reserves</span>
                      <span>12%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 w-[12%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                      <span>Morale</span>
                      <span>High</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[95%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:col-span-4 h-[600px] lg:h-auto">
          <PirateChat />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-white/5 text-center relative z-10">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30">
          © 1724 The Gilded Compass • Built with Black Powder & AI
        </p>
      </footer>
    </div>
  );
}
