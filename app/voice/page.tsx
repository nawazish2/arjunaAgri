'use client';
import AuthGuard from '@/components/AuthGuard';

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent { results: SpeechRecognitionResultList; }
interface SpeechRecognitionResultList { [index: number]: SpeechRecognitionResult; length: number; }
interface SpeechRecognitionResult { [index: number]: SpeechRecognitionAlternative; isFinal: boolean; }
interface SpeechRecognitionAlternative { transcript: string; }

interface Message { role: 'user' | 'ai'; text: string; time: string; }

export default function VoicePage() {
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [interimText, setInterimText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice'|'text'>('voice');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendToAI = async (text: string) => {
    setLoading(true);
    setError('');
    try {
      const contextStr = localStorage.getItem('latest_soil_report') ? `Context: ${localStorage.getItem('latest_soil_report')}. ` : '';
      const res = await fetch('/api/voice-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, context: contextStr, language: lang }) });
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json();
      const aiText: string = data.response;
      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { role: 'ai', text: aiText, time }]);
      const utter = new SpeechSynthesisUtterance(aiText);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  const startListening = () => {
    setError('');
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported on this browser. Try Chrome.'); return; }
    const recognition = new (SR as new () => SpeechRecognition)();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        else setInterimText(event.results[i][0].transcript);
      }
      if (transcript) {
        setInterimText('');
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [...prev, { role: 'user', text: transcript, time }]);
        sendToAI(transcript);
      }
    };
    recognition.onerror = () => { setError('Microphone error. Please try again.'); setListening(false); };
    recognition.onend = () => { setListening(false); setInterimText(''); };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const sendText = () => {
    const msg = textInput.trim();
    if (!msg || loading) return;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, time }]);
    setTextInput('');
    sendToAI(msg);
  };

  return (
    <AuthGuard>
    <div className="app-light min-h-screen relative overflow-hidden flex flex-col">
      <div className="orb w-64 h-64 -top-16 left-1/2 -translate-x-1/2" style={{ background: '#22c55e' }} />

      {/* Header */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Assistant</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ask anything about farming</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Input mode toggle */}
            <div className="pill-select">
              <button onClick={() => setInputMode('voice')} className={`pill-option${inputMode==='voice'?' active':''}`}>🎤</button>
              <button onClick={() => setInputMode('text')} className={`pill-option${inputMode==='text'?' active':''}`}>⌨️</button>
            </div>
            {/* Language Toggle */}
            <div className="pill-select">
              {(['en', 'hi'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`pill-option${lang===l?' active':''}`}>
                  {l === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative overflow-y-auto px-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 page-enter">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 glow-green" style={{ background: 'rgba(34,197,94,0.12)' }}>
              <span className="text-4xl">🎤</span>
            </div>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Start a conversation</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap the mic and ask about crops, pests, weather, or anything farming related</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['When to sow wheat?', 'Cure for yellowing leaves?', 'Organic fertilizers?'].map((hint) => (
                <button key={hint} onClick={() => { const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); setMessages((prev) => [...prev, { role: 'user', text: hint, time }]); sendToAI(hint); }}
                  className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(220,252,231,0.72)', color: '#166534', border: '1px solid rgba(21,128,61,0.12)' }}>
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} page-enter`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1" style={{ background: 'rgba(34,197,94,0.15)' }}>🤖</div>
              )}
              <div style={{ maxWidth: '80%' }}>
                <div className="rounded-2xl px-4 py-3 text-sm"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ecfdf5', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.82)', color: 'var(--text-primary)', border: '1px solid rgba(21,128,61,0.1)', borderBottomLeftRadius: 4, boxShadow: '0 10px 24px rgba(15,23,42,0.04)' }}>
                  {msg.text}
                </div>
                <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1" style={{ background: 'rgba(34,197,94,0.2)' }}>👨‍🌾</div>
              )}
            </div>
          ))}

          {(loading || interimText) && (
            <div className="flex justify-start page-enter">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2" style={{ background: 'rgba(34,197,94,0.15)' }}>🤖</div>
              <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(21,128,61,0.1)', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' }}>
                {interimText ? <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{interimText}...</p>
                  : <div className="flex gap-1 items-center py-1">{[0, 1, 2].map((d) => (<div key={d} className="w-2 h-2 rounded-full" style={{ background: '#4ade80', animation: `bounce 1s ${d * 0.2}s infinite` }} />))}</div>}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Mic Area */}
      <div className="relative p-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {error && <p className="text-sm text-red-400 bg-red-900/20 px-4 py-3 rounded-xl mb-3 text-center">{error}</p>}
          
          {inputMode === 'text' ? (
            /* Text input mode */
            <div className="flex gap-2">
              <input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendText()}
                placeholder={lang === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                className="input-field-lg flex-1"
                disabled={loading}
              />
              <button onClick={sendText} disabled={loading || !textInput.trim()}
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', opacity: (!textInput.trim() || loading) ? 0.5 : 1 }}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: '#fff' }} />
                  : <span className="text-xl">↑</span>}
              </button>
            </div>
          ) : (
            /* Voice mode */
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 glass-card rounded-2xl px-4 py-3 text-center text-sm" style={{ color: 'var(--text-muted)', minHeight: 50 }}>
                {listening ? <span style={{ color: '#4ade80' }}>🎙️ Listening{lang === 'hi' ? ' (हिंदी)' : ''}...</span>
                  : loading ? <span style={{ color: 'var(--text-muted)' }}>AI is thinking...</span>
                    : <span>Tap mic to speak</span>}
              </div>
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: listening ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: listening ? '0 0 0 0 rgba(239,68,68,0.5), 0 0 30px rgba(239,68,68,0.3)' : '0 0 20px rgba(34,197,94,0.3)',
                  animation: listening ? 'pulse 1.5s infinite' : undefined,
                }}>
                <span className="text-2xl">{listening ? '⏹' : '🎤'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 70% { box-shadow: 0 0 0 15px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
      `}</style>
    </div>
    </AuthGuard>
  );
}
