// floating-chat-board.js
// Floating chat panel with localStorage-backed history, draggable UI, text + voice input, and basic bot replies.
(function(){
  const STORAGE_KEY = 'floatingChatHistory_v1';

  function injectStyles(){
    const css = `
      #fc-toggle{position:fixed;right:1rem;bottom:1rem;z-index:9999;background:#14b8a6;color:#fff;border:none;padding:10px 14px;border-radius:999px;box-shadow:0 6px 18px rgba(20,184,166,0.24);cursor:pointer;font-weight:600}
      #floatingChatBoard{position:fixed;right:1rem;bottom:4.5rem;width:320px;max-width:90vw;height:420px;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,0.3);z-index:9999;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,Helvetica,sans-serif}
      #fc-header{padding:10px 12px;background:linear-gradient(90deg,#0ea5a4,#06b6d4);color:#fff;display:flex;align-items:center;justify-content:space-between;cursor:grab}
      #fc-title{font-weight:700}
      #fc-close,#fc-minimize{background:transparent;border:none;color:#fff;font-size:14px;cursor:pointer;margin-left:8px}
      #fc-messages{flex:1;padding:12px;overflow:auto;background:#f8fafc}
      .fc-msg{margin:6px 0;display:flex}
      .fc-msg.user{justify-content:flex-end}
      .fc-bubble{max-width:78%;padding:8px 12px;border-radius:12px;background:#e6fffa;color:#064e3b}
      .fc-bubble.user{background:#0ea5a4;color:#fff}
      #fc-inputBar{display:flex;padding:10px;border-top:1px solid #eef2f7;gap:8px}
      #fc-input{flex:1;padding:8px 10px;border:1px solid #e6e6e6;border-radius:8px}
      #fc-send,#fc-voice{background:#06b6d4;border:none;color:#fff;padding:8px 10px;border-radius:8px;cursor:pointer}
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  function createUI(){
    // toggle
    if (document.getElementById('fc-toggle')) return {};
    const toggle = document.createElement('button');
    toggle.id = 'fc-toggle';
    toggle.title = 'Open chat assistant';
    toggle.textContent = 'Chat';
    document.body.appendChild(toggle);

    const board = document.createElement('div'); board.id = 'floatingChatBoard'; board.style.display = 'none';
    board.innerHTML = `
      <div id="fc-header">
        <div id="fc-title">Assistant</div>
        <div>
          <button id="fc-minimize" aria-label="Minimize">—</button>
          <button id="fc-close" aria-label="Close">✕</button>
        </div>
      </div>
      <div id="fc-messages" role="log" aria-live="polite"></div>
      <div id="fc-inputBar">
        <input id="fc-input" placeholder="Type a message or use voice" aria-label="Message" />
        <button id="fc-voice" title="Voice input">🎤</button>
        <button id="fc-send">Send</button>
      </div>
    `;
    document.body.appendChild(board);

    return {toggle, board};
  }

  function makeDraggable(board){
    const header = board.querySelector('#fc-header');
    let offset = {x:0,y:0}, dragging=false, start={x:0,y:0};
    header.addEventListener('pointerdown', (e)=>{
      dragging = true; header.setPointerCapture(e.pointerId); start = {x:e.clientX,y:e.clientY}; const rect = board.getBoundingClientRect(); offset = {x:rect.left, y:rect.top}; board.style.transition = 'none';
    });
    window.addEventListener('pointermove', (e)=>{ if (!dragging) return; const dx = e.clientX - start.x; const dy = e.clientY - start.y; board.style.left = (offset.x + dx) + 'px'; board.style.top = (offset.y + dy) + 'px'; board.style.right = 'auto'; board.style.bottom = 'auto'; board.style.position = 'fixed'; });
    window.addEventListener('pointerup', (e)=>{ if (!dragging) return; dragging = false; try{ header.releasePointerCapture(e.pointerId);}catch(e){} board.style.transition=''; // store pos
      try{ localStorage.setItem('floatingChatPos', JSON.stringify({x:board.style.left, y:board.style.top})); }catch(e){}
    });
  }

  function loadHistory(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
  }
  function saveHistory(h){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); }catch(e){}
  }

  function renderMessages(container, history){ container.innerHTML = ''; history.forEach(item=>{ const row = document.createElement('div'); row.className = 'fc-msg ' + (item.from==='user' ? 'user':'bot'); const bubble = document.createElement('div'); bubble.className = 'fc-bubble ' + (item.from==='user' ? 'user':''); bubble.textContent = item.text; row.appendChild(bubble); container.appendChild(row); }); container.scrollTop = container.scrollHeight; }

  function speak(text){ try{ if ('speechSynthesis' in window){ const u = new SpeechSynthesisUtterance(text); u.lang = (window.currentLanguage==='hi') ? 'hi-IN' : 'en-US'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } }catch(e){console.error(e);} }

  function simpleBotReply(userText){ // very small rule-based reply
    const t = (userText||'').toLowerCase();
    if (t.includes('hello')||t.includes('hi')) return 'Hello! How can I assist you with your farm data today?';
    if (t.includes('recommend')||t.includes('crop')) return 'For crop recommendations, check the Results page or say "open results".';
    if (t.includes('export')) return 'I can trigger data export. Say "export data" or press the Export button on the page.';
    if (t.includes('help')) return 'Try: open results, show dashboard, export data, or ask about recommendations.';
    return "I heard: '" + userText + "' — I'm a simple assistant. Ask for help to see commands.";
  }

  // instantiate
  document.addEventListener('DOMContentLoaded', function(){
    injectStyles();
    const ui = createUI();
    if (!ui.board) return; // maybe already present
    const {toggle, board} = ui;
    const messages = board.querySelector('#fc-messages');
    const input = board.querySelector('#fc-input');
    const sendBtn = board.querySelector('#fc-send');
    const voiceBtn = board.querySelector('#fc-voice');
    const closeBtn = board.querySelector('#fc-close');
    const minBtn = board.querySelector('#fc-minimize');

    makeDraggable(board);

    // restore position if previously moved (optional)
    try{ const pos = JSON.parse(localStorage.getItem('floatingChatPos')||'null'); if (pos && pos.x && pos.y){ board.style.left = pos.x; board.style.top = pos.y; board.style.right = 'auto'; board.style.bottom = 'auto'; } }catch(e){}

    // history
    let history = loadHistory(); renderMessages(messages, history);

    function pushMessage(text, from){ const item = {text: text, from: from, ts: Date.now()}; history.push(item); saveHistory(history); renderMessages(messages, history); }

    function doSend(text){ if (!text || !text.trim()) return; pushMessage(text.trim(), 'user'); input.value = ''; // bot reply
      setTimeout(()=>{ const reply = simpleBotReply(text.trim()); pushMessage(reply, 'bot'); speak(reply); }, 400);
    }

    sendBtn.addEventListener('click', ()=> doSend(input.value));
    input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter'){ e.preventDefault(); doSend(input.value); } });

    toggle.addEventListener('click', ()=>{ if (board.style.display === 'none'){ board.style.display = 'flex'; toggle.textContent = 'Close'; } else { board.style.display = 'none'; toggle.textContent = 'Chat'; } });
    closeBtn.addEventListener('click', ()=>{ board.style.display = 'none'; toggle.textContent = 'Chat'; });
    minBtn.addEventListener('click', ()=>{ board.style.display = 'none'; toggle.textContent = 'Chat'; });

    // voice input specific to chat component (doesn't rely on shared module)
    voiceBtn.addEventListener('click', ()=>{
      try{
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition){ alert('Speech recognition not supported in this browser'); return; }
        const r = new SpeechRecognition(); r.lang = (window.currentLanguage==='hi') ? 'hi-IN' : 'en-US'; r.interimResults = false; r.maxAlternatives = 1; r.start(); voiceBtn.textContent = 'Listening...';
        r.addEventListener('result', (ev)=>{ const t = ev.results[0][0].transcript; doSend(t); });
        r.addEventListener('end', ()=>{ voiceBtn.textContent = '🎤'; });
        r.addEventListener('error', (e)=>{ console.error('Speech err', e); voiceBtn.textContent = '🎤'; });
      }catch(e){ console.error(e); alert('Voice input failed'); }
    });

    // expose small API for other scripts
    window.floatingChat = {
      send: doSend,
      open: ()=>{ board.style.display='flex'; toggle.textContent='Close'; },
      close: ()=>{ board.style.display='none'; toggle.textContent='Chat'; },
      history: ()=> history
    };
  });
})();
