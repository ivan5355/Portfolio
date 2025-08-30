// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with animate-in class
document.querySelectorAll('.animate-in').forEach(el => {
    observer.observe(el);
});

//Interactive hover effects to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Agent: API base URL
// Agent: API base URL

let API_BASE_URL;

API_BASE_URL = 'https://portfolio-agent-ym3om.ondigitalocean.app';

if (location.hostname === '127.0.0.1' || location.protocol === 'file:') {
    API_BASE_URL = 'http://127.0.0.1:9000';
} 
    
function wireChat(formId, inputId, messagesId, sendBtnId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const messagesEl = document.getElementById(messagesId);
    const inputEl = document.getElementById(inputId);
    const sendBtnEl = document.getElementById(sendBtnId);

    function appendMessage(text, role = 'bot') {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    }

    function setLoading(isLoading) {
        if (sendBtnEl) sendBtnEl.disabled = isLoading;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = inputEl.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        inputEl.value = '';
        setLoading(true);
        const typing = appendMessage('Typing…', 'bot');
        typing.classList.add('typing-indicator');

        try {
            console.log('Making API request to:', `${API_BASE_URL}/ask`);
            console.log('Request payload:', { question: message });
            
            const resp = await fetch(`${API_BASE_URL}/ask`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ question: message })
            });
            
            console.log('Response status:', resp.status);
            console.log('Response headers:', resp.headers);
            
            if (!resp.ok) {
                let errorText = '';
                try {
                    const errJson = await resp.json();
                    errorText = errJson?.error || JSON.stringify(errJson);
                } catch (_) {
                    errorText = await resp.text();
                }
                console.error('API Error Response:', errorText);
                throw new Error(`API Error (${resp.status}): ${errorText || 'Unknown error'}`);
            }
            
            const data = await resp.json();
            console.log('API Response data:', data);
            
            typing.remove();
            appendMessage((data && (data.answer || data.error)) || 'No response received', 'bot');
        } catch (err) {
            typing.remove();
            console.error('Chat error:', err);
            
            // More specific error messages
            let errorMsg = 'Sorry, something went wrong. ';
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMsg += 'Unable to connect to the server. Please check your internet connection.';
            } else if (err.message.includes('CORS')) {
                errorMsg += 'Cross-origin request blocked. The API server may have CORS issues.';
            } else if (err.message.includes('404')) {
                errorMsg += 'API endpoint not found. The server may be misconfigured.';
            } else if (err.message.includes('500')) {
                errorMsg += 'Server error. Please try again later.';
            } else {
                errorMsg += 'Please try again.';
            }
            
            appendMessage(errorMsg, 'bot');
        } finally {
            setLoading(false);
            inputEl.focus();
        }
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });
}

// Wire modal agent
wireChat('chatFormModal', 'chatInputModal', 'chatMessagesModal', 'sendBtnModal');

// Floating chat modal controls
const chatFab = document.getElementById('chatFab');
const chatModal = document.getElementById('chatModal');
const chatClose = document.getElementById('chatClose');

function openChatModal() {
    chatModal.classList.add('open');
    chatModal.setAttribute('aria-hidden', 'false');
    document.getElementById('chatInputModal')?.focus();
}
function closeChatModal() {
    chatModal.classList.remove('open');
    chatModal.setAttribute('aria-hidden', 'true');
}
chatFab?.addEventListener('click', openChatModal);
chatClose?.addEventListener('click', closeChatModal);
// Close popover on outside click or Escape
document.addEventListener('click', (e) => {
    const content = document.querySelector('#chatModal .chat-modal-content');
    const isTrigger = e.target.closest('#chatFab') || e.target.closest('#openAgentBtn');
    const clickedInside = content && content.contains(e.target);
    if (chatModal.classList.contains('open') && !clickedInside && !isTrigger) {
        closeChatModal();
    }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chatModal.classList.contains('open')) closeChatModal(); });

document.getElementById('openAgentBtn')?.addEventListener('click', (e) => { e.preventDefault(); if (typeof openChatModal === 'function') openChatModal(); });
