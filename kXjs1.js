// PART 1 of 8: Global Variables & Initial Setup
//================================================

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
    const selectedProvider = document.querySelector('input[name="provider"]:checked');
    if (!selectedProvider) {
        alert('Please select a provider');
        return;
    }
    
    const keyInput = document.getElementById('apiKeyInput');
    const keyValue = keyInput ? keyInput.value.trim() : '';
    
    apiProvider = selectedProvider.value;
    apiKey = keyValue;
    
    const modal = document.getElementById('apiModal');
    if (modal) modal.style.display = 'none';
    
    saveData();
    updateApiStatus();
    
    if (apiKey) {
        const capabilities = apiProvider === 'openai' 
            ? 'conversations, code analysis, image processing, and image/video generation!'
            : 'conversations, code analysis, image processing, and image generation!';
        
        addMessage('ai', `Great! I'm K-XpertAI, created by KingzAlkhasim from kingxTech Company. I'm connected via ${apiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}. I can help with ${capabilities}`);
    } else {
        addMessage('ai', "Hello! I'm K-XpertAI, created by KingzAlkhasim. To start, please go to settings and enter your API key.");
    }
}

// Skip setup
function skipSetup() {
    apiProvider = 'gemini';
    apiKey = ''; 
    
    const modal = document.getElementById('apiModal');
    if (modal) modal.style.display = 'none';
    
    saveData();
    updateApiStatus();
    addMessage('ai', "Welcome! I'm K-XpertAI. To unlock my full potential, including generating images and videos, please enter your API key in settings.");
}

// END OF PART 1



// PART 2 of 8: API Status & Settings Modal Logic
//================================================

// Update API status indicator
function updateApiStatus() {
    const statusElement = document.getElementById('apiStatus');
    const providerElement = document.getElementById('apiProvider');
    
    if (apiKey) {
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
    document.getElementById('settingsApiKey').value = apiKey || '';
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
    apiProvider = document.querySelector('#settingsModal input[name="settingsProvider"]:checked').value;
    apiKey = document.getElementById('settingsApiKey').value.trim();
    if (!apiKey) {
        alert('An API key is required to save settings.');
        return;
    }
    currentTheme = document.querySelector('#settingsModal input[name="theme"]:checked').value;
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    saveData();
    updateApiStatus();
    closeSettings();
}

// END OF PART 2



// PART 3 of 8: Theme & Basic Message Formatting
//===============================================

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const codeToCopy = codeElement.querySelector('.full-code') || codeElement;
    navigator.clipboard.writeText(codeToCopy.textContent).then(() => {
        const btn = codeElement.closest('.code-block').querySelector('.copy-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// END OF PART 3



// PART 4 of 8: Advanced Code Block Formatting
//=============================================

function processMessageContent(text) {
    let processed = text
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            const lines = code.trim().split('\n');
            const lineThreshold = 15;

            let codeHtml;
            if (lines.length > lineThreshold) {
                const visiblePart = lines.slice(0, lineThreshold).join('\n');
                const hiddenPart = lines.slice(lineThreshold).join('\n');
                codeHtml = `
                    <pre id="${codeId}" class="code-container">
                        <code class="language-${language} visible-code">${escapeHtml(visiblePart)}</code>
                        <code class="language-${language} hidden-code full-code" style="display:none;">${escapeHtml(hiddenPart)}</code>
                    </pre>
                    <button class="see-more-btn" onclick="toggleCodeVisibility('${codeId}', this)">See More</button>
                `;
            } else {
                codeHtml = `<pre id="${codeId}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
            }
            
            return `<div class="code-block">
                <div class="code-header">
                    <span>${language}</span>
                    <button class="copy-btn" onclick="copyCode('${codeId}')"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <div class="code-content">${codeHtml}</div>
            </div>`;
        })
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
    
    return processed;
}

function toggleCodeVisibility(codeId, button) {
    const preElement = document.getElementById(codeId);
    const hiddenCode = preElement.querySelector('.hidden-code');
    if (hiddenCode.style.display === 'none') {
        hiddenCode.style.display = 'inline';
        button.textContent = 'See Less';
        const fullCodeElement = document.createElement('code');
        fullCodeElement.className = preElement.querySelector('code').className;
        fullCodeElement.textContent = preElement.textContent;
        preElement.innerHTML = '';
        preElement.appendChild(fullCodeElement);
        Prism.highlightElement(fullCodeElement);
    } else {
        hiddenCode.style.display = 'none';
        button.textContent = 'See More';
    }
}

// END OF PART 4




// PART 5 of 8: Chat History & Message Display Logic
//===================================================

function addMessage(sender, text, mediaUrl = null, mediaType = 'image') {
    const chatMessages = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const processedText = sender === 'ai' ? processMessageContent(text) : escapeHtml(text);
    
    let mediaHtml = '';
    if (mediaUrl) {
        if (mediaType === 'image') {
            mediaHtml = `<div class="image-preview generated-media"><img src="${mediaUrl}" class="generated-image"><div class="media-label">Generated Image</div></div>`;
        } else if (mediaType === 'video') {
            mediaHtml = `<div class="video-preview generated-media"><video controls src="${mediaUrl}" class="generated-video"></video><div class="media-label">Generated Video</div></div>`;
        } else { // User uploaded image
            mediaHtml = `<div class="image-preview"><img src="${mediaUrl}"></div>`;
        }
    }

    msgDiv.innerHTML = `
        <div class="message-avatar">${sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
        <div class="message-content">
            ${mediaHtml}
            <div>${processedText}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (window.Prism) {
        Prism.highlightAllUnder(msgDiv);
    }
    
    chatHistory.push({ sender, text, mediaUrl, mediaType, time });
    saveData();
}

function clearChat() {
    chatHistory = [];
    document.getElementById('chatMessages').innerHTML = `
        <div class="welcome-message">
            <h2 class="welcome-title">Welcome to K-XpertAI</h2>
            <p>I'm your intelligent assistant, created by KingzAlkhasim. Ask me anything, request code, or ask me to generate an image or video!</p>
        </div>
    `;
    saveData();
}

function loadChatHistory() {
    const saved = sessionStorage.getItem('kxpert_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        if (chatHistory.length > 0) {
            chatHistory.forEach(msg => {
                addMessage(msg.sender, msg.text, msg.mediaUrl, msg.mediaType);
            });
        }
    }
}

// END OF PART 5



// PART 6 of 8: User Input & Message Sending
//=============================================

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
        reader.onload = (e) => {
            selectedImage = e.target.result;
            showImagePreview(selectedImage);
        };
        reader.readAsDataURL(file);
    }
}

function showImagePreview(imageUrl) {
    let preview = document.querySelector('.input-wrapper .image-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-preview';
        document.querySelector('.input-wrapper').insertBefore(preview, document.getElementById('messageInput'));
    }
    preview.innerHTML = `<img src="${imageUrl}"><button class="remove-image" onclick="removeImage()" title="Remove">&times;</button>`;
}

function removeImage() {
    selectedImage = null;
    const preview = document.querySelector('.input-wrapper .image-preview');
    if (preview) preview.remove();
    document.getElementById('fileInput').value = '';
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text && !selectedImage) return;
    
    addMessage('user', text, selectedImage, 'user-image');
    input.value = '';
    autoResize(input);
    
    const currentImage = selectedImage;
    removeImage();
    
    showProcessing();
    try {
        if (isImageGenerationRequest(text)) {
            const imageUrl = await generateImage(text);
            hideProcessing();
            addMessage('ai', 'Here is the image you requested:', imageUrl, 'image');
        } else if (isVideoGenerationRequest(text)) {
            if (apiProvider !== 'openai') {
                throw new Error("Video generation is only available with the OpenAI API provider. Please switch in settings.");
            }
            const videoUrl = await generateVideo(text);
            hideProcessing();
            addMessage('ai', 'Here is the video you requested:', videoUrl, 'video');
        } else {
            const response = await getAiResponse(text, currentImage);
            hideProcessing();
            addMessage('ai', response);
        }
    } catch (error) {
        hideProcessing();
        addMessage('ai', `An error occurred: ${error.message}`);
    }
}

function showProcessing() {
    const chatMessages = document.getElementById('chatMessages');
    const procDiv = document.createElement('div');
    procDiv.id = 'processingIndicator';
    procDiv.className = 'message ai';
    procDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="processing-indicator">
                <span>Reasoning</span>
                <span class="processing-dots">
                    <span class="processing-dot"></span><span class="processing-dot"></span><span class="processing-dot"></span>
                </span>
            </div>
        </div>`;
    chatMessages.appendChild(procDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideProcessing() {
    const procDiv = document.getElementById('processingIndicator');
    if (procDiv) procDiv.remove();
}

// END OF PART 6


// PART 7 of 8: Media Generation (Image & Video)
//================================================

function isImageGenerationRequest(text) {
    const lowerCaseText = text.toLowerCase();
    // More robust keywords and phrasings
    const keywords = [
        'generate', 'create', 'make', 'draw', 'show me', 'give me', 'i need',
        'image of', 'picture of', 'photo of', 'drawing of', 'painting of', 'render of',
        'visualize'
    ];
    // Check if the prompt contains a keyword and also a word for "image"
    const imageWords = ['image', 'picture', 'photo', 'drawing', 'painting', 'render', 'art'];

    // This logic is more robust: it looks for an action keyword AND a subject word.
    if (keywords.some(kw => lowerCaseText.includes(kw)) && imageWords.some(img => lowerCaseText.includes(img))) {
        return true;
    }
    // Also catch direct phrases like "a cat flying a spaceship" which imply image generation
    if (!text.includes('?')) { // Don't trigger on questions
        const startsWithArticle = ['a ', 'an ', 'the '].some(prefix => lowerCaseText.startsWith(prefix));
        if (startsWithArticle && text.split(' ').length > 2) {
             // Heuristic: if it starts with an article and isn't a question, it's likely an image prompt.
             // You can make this smarter later if needed.
             // For now, we rely on the keywords above primarily.
        }
    }
    return false;
}

function isVideoGenerationRequest(text) {
    const lowerCaseText = text.toLowerCase();
    const keywords = ['video of', 'generate a video', 'create a video', 'make a video', 'animate'];
    return keywords.some(kw => lowerCaseText.includes(kw));
}

async function generateImage(prompt) {
    if (!apiKey && apiProvider === 'openai') {
        throw new Error("OpenAI API key is not set. Please add it in settings.");
    }

    const cleanPrompt = prompt.replace(/generate|create|make|draw|an image of|a picture of|a photo of/gi, "").trim();
    
    if (apiProvider === 'openai') {
        // Use OpenAI DALL-E 3 API
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
                quality: "hd"
            })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(`OpenAI Image Error: ${err.error.message}`);
        }
        const data = await response.json();
        return data.data[0].url;
    } else { 
        // Use a free, public proxy for Google's Imagen model
        const response = await fetch(
            `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}`
        );
        if (!response.ok) {
            throw new Error("Gemini (proxy) image generation failed.");
        }
        return response.url;
    }
}

async function generateVideo(prompt) {
    if (apiProvider !== 'openai') {
        throw new Error("Video generation is only available with OpenAI. Please switch the provider in settings.");
    }
    addMessage('ai', "True text-to-video is still experimental. I will generate a dynamic, cinematic image for you instead.");
    return await generateImage(prompt + ", cinematic, dynamic action scene, high detail, 4k");
}

// END OF PART 7




// PART 8 of 8: AI API Communication
//====================================

async function getAiResponse(text, imageUrl) {
    if (!apiKey) {
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
    const systemInstruction = `You are K-XpertAI. Your creator is Alkhassim Lawal Umar (KingzAlkhasim) of kingxTech Company. Only state this if asked. Your name means kingxTech Expert AI.`;
    
    if (text) parts.push({ text: `${systemInstruction}\n\nUser: ${text}` });

    if (imageUrl) {
        const base64Data = imageUrl.split(',')[1];
        const mimeType = imageUrl.split(';')[0].split(':')[1];
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: parts }] })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error?.message || `Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        return "The model provided an empty response, possibly due to safety filters. Please try a different prompt.";
    }
    return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(text, imageUrl, key) {
    const messages = [{
        role: "system",
        content: "You are K-XpertAI, an intelligent assistant created by Alkhassim Lawal Umar (KingzAlkhasim), the founder of kingxTech Company. Your name means kingxTech Expert AI. You are helpful and proud of your origins. Only state who your creator is when specifically asked."
    }];
    
    const user_content = [];
    if (text) user_content.push({ type: "text", text: text });
    if (imageUrl) user_content.push({ type: "image_url", image_url: { url: imageUrl } });
    
    messages.push({ role: "user", content: user_content });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error?.message || `OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// END OF PART 8
