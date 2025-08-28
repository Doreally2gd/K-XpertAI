// Global variables
let apiKey = '';
let apiProvider = 'gemini';
let currentTheme = 'light';
let selectedImage = null;
let chatHistory = [];
let hasSeenSetup = false;
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    checkFirstVisit();
    loadChatHistory();
    updateApiStatus();
    initializeCodeHighlighting();
});

// Initialize code highlighting
function initializeCodeHighlighting() {
    if (window.Prism) {
        Prism.highlightAll();
    }
}

// Load saved data from session storage
function loadSavedData() {
    hasSeenSetup = sessionStorage.getItem('kxpert_setup_complete') === 'true';
    
    if (sessionStorage.getItem('kxpert_theme')) {
        currentTheme = sessionStorage.getItem('kxpert_theme');
        document.body.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
    }
    
    if (sessionStorage.getItem('kxpert_api_key')) {
        apiKey = sessionStorage.getItem('kxpert_api_key');
    }
    
    if (sessionStorage.getItem('kxpert_api_provider')) {
        apiProvider = sessionStorage.getItem('kxpert_api_provider');
    }
}

// Save data to session storage
function saveData() {
    sessionStorage.setItem('kxpert_theme', currentTheme);
    sessionStorage.setItem('kxpert_api_key', apiKey);
    sessionStorage.setItem('kxpert_api_provider', apiProvider);
    sessionStorage.setItem('kxpert_chat_history', JSON.stringify(chatHistory));
    sessionStorage.setItem('kxpert_setup_complete', 'true');
}

// Check if this is the first visit
function checkFirstVisit() {
    if (!hasSeenSetup) {
        document.getElementById('apiModal').style.display = 'flex';
    }
}

// Select API provider in setup
function selectProvider(provider) {
    document.querySelectorAll('.api-option').forEach(opt => opt.classList.remove('selected'));
    event.target.closest('.api-option').classList.add('selected');
    
    const keyInput = document.getElementById('apiKeyInput');
    const keySection = document.getElementById('apiKeySection');
    
    if (provider === 'gemini') {
        keyInput.placeholder = 'Enter your Gemini API key...';
        keySection.querySelector('p').textContent = 'A Google Gemini API key is required.';
    } else {
        keyInput.placeholder = 'Enter your OpenAI API key...';
        keySection.querySelector('p').textContent = 'An OpenAI API key is required.';
    }
    
    // Update radio button
    document.querySelector(`input[value="${provider}"]`).checked = true;
}

// Save API setup
function saveApiSetup() {
    const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
    const keyInput = document.getElementById('apiKeyInput');
    
    if (!keyInput.value.trim()) {
        alert('An API key is required. Please get a free key from Google AI Studio or OpenAI to proceed.');
        return;
    }
    
    apiProvider = selectedProvider;
    apiKey = keyInput.value.trim();
    
    document.getElementById('apiModal').style.display = 'none';
    saveData();
    updateApiStatus();
    
    const capabilities = apiProvider === 'openai' 
        ? 'conversations, code analysis, image processing, and image generation using DALL-E!'
        : 'conversations, code analysis, and image processing!';
    
    addMessage('ai', `Great! I'm now connected using ${apiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}. I'm ready to help with ${capabilities}`);
}

// Skip setup
function skipSetup() {
    apiProvider = 'gemini';
    apiKey = ''; 
    document.getElementById('apiModal').style.display = 'none';
    saveData();
    updateApiStatus();
    addMessage('ai', "Welcome! To start our conversation, please go to settings and enter your API keys. Note: Image generation is only available with OpenAI API keys.");
}

// Update API status indicator
function updateApiStatus() {
    const statusElement = document.getElementById('apiStatus');
    const providerElement = document.getElementById('apiProvider');
    
    if (apiKey && apiKey !== 'auto-gemini') {
        statusElement.style.display = 'flex';
        providerElement.textContent = apiProvider === 'gemini' ? 'Gemini' : 'OpenAI';
        statusElement.style.color = 'var(--success-color)';
    } else {
        statusElement.style.display = 'flex';
        providerElement.textContent = 'No Key';
        statusElement.style.color = 'var(--danger-color)';
    }
}

// Open settings
function openSettings() {
    const settingsProvider = apiProvider;
    document.querySelectorAll('#settingsModal .api-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById(`settings${settingsProvider === 'gemini' ? 'Gemini' : 'OpenAI'}`).classList.add('selected');
    document.querySelector(`#settingsModal input[value="${settingsProvider}"]`).checked = true;
    document.getElementById('settingsApiKey').value = (apiKey === 'auto-gemini' ? '' : apiKey) || '';
    document.getElementById(`lightTheme`).classList.toggle('selected', currentTheme === 'light');
    document.getElementById(`darkTheme`).classList.toggle('selected', currentTheme === 'dark');
    document.querySelector(`#settingsModal input[value="${currentTheme}"]`).checked = true;
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function selectSettingsProvider(provider) {
    document.querySelectorAll('#settingsModal .api-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById(`settings${provider === 'gemini' ? 'Gemini' : 'OpenAI'}`).classList.add('selected');
    document.querySelector(`#settingsModal input[value="${provider}"]`).checked = true;
}

function setThemeFromSettings(theme) {
    document.querySelectorAll('#settingsModal .theme-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById(`${theme}Theme`).classList.add('selected');
    document.querySelector(`#settingsModal input[name="theme"][value="${theme}"]`).checked = true;
}

function saveSettings() {
    // Provider
    apiProvider = document.querySelector('#settingsModal input[name="settingsProvider"]:checked').value;
    
    // API Key
    apiKey = document.getElementById('settingsApiKey').value.trim();
    if (!apiKey) {
        alert('An API key is required. Please enter a valid key to save.');
        return;
    }
    
    // Theme
    currentTheme = document.querySelector('#settingsModal input[name="theme"]:checked').value;
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    saveData();
    updateApiStatus();
    closeSettings();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    saveData();
}

function updateThemeIcon() {
    const themeBtn = document.querySelector('.header-btn[onclick="toggleTheme()"] i');
    themeBtn.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Enhanced message processing for better formatting
function processMessageContent(text) {
    // Convert markdown-style formatting to HTML
    let processed = text
        // Code blocks with language detection
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            return `<div class="code-block">
                <div class="code-header">
                    <span>${language}</span>
                    <button class="copy-btn" onclick="copyCode('${codeId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="code-content">
                    <pre id="${codeId}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>
                </div>
            </div>`;
        })
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Lists
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Line breaks
        .replace(/\n/g, '<br>');
    
    return processed;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const code = codeElement.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = codeElement.parentElement.parentElement.querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// Chat logic with enhanced formatting
function addMessage(sender, text, imageUrl = null, isGenerated = false) {
    const chatMessages = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    // Process the text content for better formatting
    const processedText = sender === 'ai' ? processMessageContent(text) : escapeHtml(text);
    
    msgDiv.innerHTML = `
        <div class="message-avatar">${sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
        <div class="message-content">
            ${imageUrl ? `<div class="image-preview ${isGenerated ? 'generated-media' : ''}">
                <img src="${imageUrl}" ${isGenerated ? 'class="generated-image"' : ''}>
                ${isGenerated ? '<div class="media-label">Generated</div>' : ''}
            </div>` : ''}
            <div>${processedText}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Highlight code after adding the message
    if (window.Prism) {
        Prism.highlightAllUnder(msgDiv);
    }
    
    chatHistory.push({sender, text, imageUrl, time, isGenerated});
    saveData();
}

function clearChat() {
    chatHistory = [];
    document.getElementById('chatMessages').innerHTML = `
        <div class="welcome-message">
            <h2 class="welcome-title">Welcome to K-XpertAI</h2>
            <p>I'm K-XpertAI, your intelligent assistant. I can help with conversations, code analysis, and image processing. Image generation is available with OpenAI API keys using DALL-E!</p>
        </div>
    `;
    saveData();
}

function loadChatHistory() {
    const saved = sessionStorage.getItem('kxpert_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
        document.getElementById('chatMessages').innerHTML = '';
        if(chatHistory.length > 0) {
           chatHistory.forEach(msg => {
                const time = msg.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const msgDiv = document.createElement('div');
                msgDiv.className = `message ${msg.sender}`;
                
                const processedText = msg.sender === 'ai' ? processMessageContent(msg.text) : escapeHtml(msg.text);
                
                msgDiv.innerHTML = `
                    <div class="message-avatar">${msg.sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
                    <div class="message-content">
                        ${msg.imageUrl ? `<div class="image-preview ${msg.isGenerated ? 'generated-media' : ''}">
                            <img src="${msg.imageUrl}" ${msg.isGenerated ? 'class="generated-image"' : ''}>
                            ${msg.isGenerated ? '<div class="media-label">Generated</div>' : ''}
                        </div>` : ''}
                        <div>${processedText}</div>
                        <div class="message-time">${time}</div>
                    </div>
                `;
                document.getElementById('chatMessages').appendChild(msgDiv);
                
                // Highlight code for each message
                if (window.Prism) {
                    Prism.highlightAllUnder(msgDiv);
                }
            });
        }
    }
}

// Input logic
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImage = e.target.result;
            showImagePreview(selectedImage);
        };
        reader.readAsDataURL(file);
    }
}

function showImagePreview(imageUrl) {
    let preview = document.querySelector('.image-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-preview';
        document.querySelector('.input-wrapper').insertBefore(preview, document.getElementById('messageInput'));
    }
    preview.innerHTML = `<img src="${imageUrl}"><button class="remove-image" onclick="removeImage()" title="Remove">&times;</button>`;
}

function removeImage() {
    selectedImage = null;
    const preview = document.querySelector('.image-preview');
    if (preview) preview.remove();
    document.getElementById('fileInput').value = '';
}

// Enhanced message sending with image generation detection
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text && !selectedImage) return;
    
    addMessage('user', text, selectedImage);
    input.value = '';
    autoResize(input);
    
    const currentImage = selectedImage;
    removeImage();
    
    showProcessing();
    try {
        // Check if user is requesting image generation
        if (isImageGenerationRequest(text)) {
            if (apiProvider === 'openai') {
                const imageUrl = await generateImageWithDALLE(text);
                hideProcessing();
                addMessage('ai', 'Here\'s your generated image based on your prompt:', imageUrl, true);
            } else {
                hideProcessing();
                addMessage('ai', 'I understand you want to generate an image, but image generation requires an OpenAI API key to use DALL-E. Gemini doesn\'t support image generation. You can switch to OpenAI in settings to access this feature, or I can help you with text-based responses about what the image might look like instead.');
            }
        } else {
            const response = await getAiResponse(text, currentImage);
            hideProcessing();
            addMessage('ai', response);
        }
    } catch (error) {
        hideProcessing();
        addMessage('ai', `I encountered an error: ${error.message}`);
    }
}

// Detect image generation requests
function isImageGenerationRequest(text) {
    const imageKeywords = [
        'generate image', 'create image', 'make image', 'draw', 'generate picture',
        'create picture', 'make picture', 'image of', 'picture of', 'generate photo',
        'create photo', 'make photo', 'visualize', 'illustrate'
    ];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Detect video generation requests (removed functionality)
function isVideoGenerationRequest(text) {
    return false; // Video generation removed
}

// Image generation using DALL-E (OpenAI)
async function generateImageWithDALLE(prompt) {
    if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add it in settings to generate images.');
    }

    const cleanPrompt = prompt.replace(/generate image|create image|make image|draw|image of|picture of/gi, '').trim();
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt: cleanPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image generation failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
}

function showProcessing() {
    const chatMessages = document.getElementById('chatMessages');
    const procDiv = document.createElement('div');
    procDiv.className = 'processing-indicator';
    procDiv.id = 'processingIndicator';
    procDiv.innerHTML = `
        <span>Thinking</span>
        <span class="processing-dots">
            <span class="processing-dot"></span>
            <span class="processing-dot"></span>
            <span class="processing-dot"></span>
        </span>
    `;
    chatMessages.appendChild(procDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideProcessing() {
    const procDiv = document.getElementById('processingIndicator');
    if (procDiv) procDiv.remove();
}

// Enhanced AI response function
async function getAiResponse(text, imageUrl) {
    if (!apiKey || apiKey === 'auto-gemini') {
        throw new Error('API key not configured. Please go to settings and enter your API key.');
    }

    if (apiProvider === 'gemini') {
        return await callGeminiAPI(text, imageUrl, apiKey);
    } else if (apiProvider === 'openai') {
        return await callOpenAI(text, imageUrl, apiKey);
    } else {
        throw new Error('No API provider configured.');
    }
}

async function callGeminiAPI(text, imageUrl, key) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const parts = [];
    if (text) parts.push({ text: text });
    if (imageUrl) {
        const base64Data = imageUrl.split(',')[1];
        const mimeType = imageUrl.split(';')[0].split(':')[1];
        parts.push({
            inline_data: {
                mime_type: mimeType,
                data: base64Data
            }
        });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: parts
            }]
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = errorBody.error?.message || `API Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        return "I received a response, but it was empty. The model may have refused to answer due to its safety settings. Please try rephrasing your prompt.";
    }
    return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(text, imageUrl, key) {
    const messages = [];
    
    if (imageUrl) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: text },
                { type: "image_url", image_url: { url: imageUrl } }
            ]
        });
    } else {
        messages.push({ role: "user", content: text });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: imageUrl ? "gpt-4-vision-preview" : "gpt-4",
            messages: messages,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error?.message || `OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}