(function(){
    // Shared voice commands script for all pages.
    // Defensive: waits for DOM ready, inserts UI if missing, and wires SpeechRecognition + TTS.

    function insertVoiceButtonIfMissing() {
        let btn = document.getElementById('voiceToggle');
        if (btn) return btn;

        const langBtn = document.getElementById('languageToggle');
        const wrapper = document.createElement('div');
        wrapper.className = 'voice-toggle-wrapper';

        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voiceToggle';
        voiceBtn.className = 'bg-white text-primary px-3 py-2 rounded-lg shadow-subtle hover:bg-primary-50 transition-smooth flex items-center gap-2';
        voiceBtn.setAttribute('aria-pressed','false');
        voiceBtn.title = 'Voice Commands (click to start/stop)';

        const icon = document.createElement('i');
        icon.id = 'voiceIcon';
        icon.className = 'fas fa-microphone';

        const span = document.createElement('span');
        span.id = 'voiceStatus';
        span.className = 'text-sm';
        span.textContent = 'Voice';

        voiceBtn.appendChild(icon);
        voiceBtn.appendChild(span);

        // Try to insert next to language button if found
        if (langBtn && langBtn.parentNode) {
            langBtn.parentNode.insertBefore(voiceBtn, langBtn.nextSibling);
        } else {
            // fallback: fixed top-right container
            const fixed = document.createElement('div');
            fixed.style.position = 'fixed';
            fixed.style.top = '1rem';
            fixed.style.right = '5.5rem';
            fixed.style.zIndex = '60';
            fixed.appendChild(voiceBtn);
            document.body.appendChild(fixed);
        }

        return voiceBtn;
    }

    function speak(text) {
        try {
            if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(text);
                u.lang = (window.currentLanguage === 'hi') ? 'hi-IN' : 'en-US';
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
            } else {
                console.log('TTS not supported:', text);
            }
        } catch (e) { console.error('TTS error', e); }
    }

    function initRecognition(ui) {
        let recognition = null;
        let recognizing = false;

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) throw new Error('No SpeechRecognition');

            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.lang = (window.currentLanguage === 'hi') ? 'hi-IN' : 'en-US';

            ui.addEventListener('click', () => {
                if (recognizing) { recognition.stop(); }
                else {
                    try {
                        recognition.lang = (window.currentLanguage === 'hi') ? 'hi-IN' : 'en-US';
                        recognition.start();
                    } catch (e) { console.error(e); }
                }
            });

            recognition.addEventListener('start', () => {
                recognizing = true;
                ui.setAttribute('aria-pressed','true');
                const icon = document.getElementById('voiceIcon');
                if (icon) { icon.classList.remove('fa-microphone'); icon.classList.add('fa-microphone-slash'); icon.classList.add('text-red-600'); }
                const status = document.getElementById('voiceStatus'); if (status) status.textContent = (window.currentLanguage === 'hi') ? 'सुन रहा है...' : 'Listening...';
            });

            recognition.addEventListener('end', () => {
                recognizing = false;
                ui.setAttribute('aria-pressed','false');
                const icon = document.getElementById('voiceIcon');
                if (icon) { icon.classList.remove('fa-microphone-slash'); icon.classList.remove('text-red-600'); icon.classList.add('fa-microphone'); }
                const status = document.getElementById('voiceStatus'); if (status) status.textContent = 'Voice';
            });

            recognition.addEventListener('error', (e) => {
                console.error('Speech recognition error', e);
                const status = document.getElementById('voiceStatus'); if (status) status.textContent = 'Error';
                speak((window.currentLanguage === 'hi') ? 'वाणी पहचान में त्रुटि' : 'Speech recognition error');
            });

            recognition.addEventListener('result', (evt) => {
                const transcript = evt.results[0][0].transcript.trim();
                handleVoiceCommand(transcript);
            });
        } catch (e) {
            ui.disabled = true;
            ui.title = 'Voice commands not supported in this browser';
            ui.classList.add('opacity-50');
            const status = document.getElementById('voiceStatus'); if (status) status.textContent = (window.currentLanguage === 'hi') ? 'समर्थित नहीं' : 'Not supported';
            console.info('SpeechRecognition not available:', e);
        }

        return recognition;
    }

    function handleVoiceCommand(text) {
        text = (text || '').toLowerCase();
        console.log('Voice command:', text);

        if (text.includes('help') || text.includes('commands')) {
            const msg = (window.currentLanguage === 'hi') ?
                'उपलब्ध कमांड: परिणाम खोलो, डैशबोर्ड दिखाओ, क्रॉप एनालिटिक्स दिखाओ, मौसम दिखाओ, मिट्टी दिखाओ, क्षेत्र चुनो पंजाब या हरियाणा, डेटा निर्यात करो, सहायता के लिए हेल्प बोलें' :
                'Available commands: open results, show dashboard, show crop analytics, show weather, show soil analysis, filter region Punjab or Haryana, export data, say help for this list';
            speak(msg); return;
        }

        // Navigation
        if (text.includes('results') || text.includes('open results')) { speak((window.currentLanguage === 'hi') ? 'परिणाम पृष्ठ खोल रहा हूँ' : 'Opening results page'); window.location.href = 'crop_recommendation_results.html'; return; }
        if (text.includes('dashboard') || text.includes('farm')) { speak((window.currentLanguage === 'hi') ? 'डैशबोर्ड खोल रहा हूँ' : 'Opening dashboard'); window.location.href = 'farm_parameter_dashboard.html'; return; }

        // Show specific areas if present
        if (text.includes('crop analytics') && document.getElementById('cropAnalyticsChart')) { document.getElementById('cropAnalyticsChart').scrollIntoView({behavior:'smooth', block:'center'}); speak((window.currentLanguage === 'hi') ? 'फसल सिफारिश विश्लेषण दिखा रहा हूँ' : 'Showing crop analytics'); return; }
        if (text.includes('weather') && document.getElementById('weatherTrendsChart')) { document.getElementById('weatherTrendsChart').scrollIntoView({behavior:'smooth', block:'center'}); speak((window.currentLanguage === 'hi') ? 'मौसम के रुझान दिखा रहा हूँ' : 'Showing weather trends'); return; }
        if (text.includes('soil') && document.getElementById('soilAnalysisChart')) { document.getElementById('soilAnalysisChart').scrollIntoView({behavior:'smooth', block:'center'}); speak((window.currentLanguage === 'hi') ? 'मिट्टी विश्लेषण दिखा रहा हूँ' : 'Showing soil analysis'); return; }

        // Export
        if (text.includes('export') && document.getElementById('exportBtn')) { document.getElementById('exportBtn').click(); speak((window.currentLanguage === 'hi') ? 'डेटा निर्यात कर रहा हूँ' : 'Exporting data'); return; }

        // Filter region
        if (text.includes('punjab') || text.includes('haryana') || text.includes('uttar') || text.includes('maharashtra') || text.includes('all regions') || text.includes('all')) {
            const sel = document.getElementById('regionFilter');
            if (sel) {
                let val = 'all';
                if (text.includes('punjab')) val = 'punjab';
                else if (text.includes('haryana')) val = 'haryana';
                else if (text.includes('uttar') || text.includes('up')) val = 'uttar-pradesh';
                else if (text.includes('maharashtra')) val = 'maharashtra';
                sel.value = val; sel.dispatchEvent(new Event('change'));
                speak((window.currentLanguage === 'hi') ? 'क्षेत्र सेट कर दिया गया' : `Region set to ${sel.options[sel.selectedIndex].text}`);
                return;
            }
        }

        // Fallback
        speak((window.currentLanguage === 'hi') ? 'माफ़ कीजिए, मैं वह कमांड नहीं समझ पाया। सहायता के लिए हेल्प कहिए' : 'Sorry, I did not understand that. Say help to hear available commands.');
    }

    // Wait for DOM and then init
    document.addEventListener('DOMContentLoaded', function() {
        const btn = insertVoiceButtonIfMissing();
        initRecognition(btn);

        // If updateLanguage exists, wrap it so we can update recognition language on toggle
        if (typeof window.updateLanguage === 'function') {
            const _orig = window.updateLanguage;
            window.updateLanguage = function() {
                _orig();
                try { window.currentLanguage = window.currentLanguage || 'en'; } catch(e){}
                // update status text if available
                const status = document.getElementById('voiceStatus'); if (status) status.textContent = 'Voice';
            };
        }
    });
})();
