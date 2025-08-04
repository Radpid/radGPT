import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { askAi, resetChatCompletely } from '../store/slices/appSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CornerDownLeft, Sparkles, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatPanel = () => {
  const dispatch = useAppDispatch();
  const { messages, isAiTyping, patient } = useAppSelector((state) => state.app);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const patientSuggestions = [
      "Erstelle eine Zusammenfassung der Akte.",
      "Was zeigt der letzte CT-Bericht?",
      "Liste alle Komorbiditäten auf.",
      "Welche Behandlungsempfehlungen gibt es?",
  ];

  const generalSuggestions = [
      "Liste mir alle Patienten für die Chirurgie heute",
      "Zeige mir Patienten mit Onkologie-Diagnosen",
      "Statistiken der aktuellen Patienten",
      "Patienten für die Kardiologie-Abteilung",
  ];

  const suggestions = patient ? patientSuggestions : generalSuggestions;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const handleSend = () => {
    if (input.trim()) {
      dispatch(askAi(input.trim()));
      setInput('');
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      dispatch(askAi(suggestion));
  };

  const handleReset = () => {
    dispatch(resetChatCompletely());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="font-bold text-lg text-foreground">radGPT Assistent</h2>
            <p className="text-sm text-muted-foreground">
              {patient ? `Akte: ${patient.last_name}, ${patient.first_name}` : 'Keine Akte geladen'}
            </p>
          </div>
          {patient && (
            <button
              onClick={handleReset}
              className="ml-2 p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Chat zurücksetzen"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-primary" /></div>}
              
              {msg.sender === 'user' ? (
                <div className="max-w-md p-3 rounded-2xl bg-slate-700 text-white shadow-lg">
                  <div className="prose prose-sm prose-invert prose-p:my-0">
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl p-4 rounded-2xl bg-secondary shadow-md">
                  <div className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground prose-ul:my-2 prose-li:my-1 prose-li:block">
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isAiTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-primary" /></div>
            <div className="p-3 rounded-2xl bg-secondary flex items-center gap-2">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-4 border-t flex-shrink-0 bg-background/80 backdrop-blur-sm">
        {(messages.length <= 1) && (
            <div className="mb-3 flex flex-wrap gap-2 justify-center">
                {suggestions.map(s => (
                    <button key={s} onClick={() => handleSuggestionClick(s)} className="px-3 py-1 bg-secondary hover:bg-accent text-sm rounded-full border transition-colors">
                        {s}
                    </button>
                ))}
            </div>
        )}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={patient ? "Stellen Sie eine Frage zur Akte..." : "Fragen Sie nach der heutigen Patientenliste..."}
            className="w-full bg-muted rounded-lg p-3 pr-24 resize-none border border-input focus:ring-2 focus:ring-ring shadow-inner"
            rows={1}
          />
          <button 
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-md p-2 hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
            disabled={!input.trim() || isAiTyping}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Drücken Sie <CornerDownLeft className="inline h-3 w-3" /> zum Senden.</p>
      </div>
    </div>
  );
};
export default ChatPanel;
