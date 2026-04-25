// ===== State =====
let apiKey = localStorage.getItem('openai_api_key') || 'sk-EoeYUSLSxGfNcGSS4d04Bc0c6e5f46Ce9138E28eAf009503';
let baseUrl = localStorage.getItem('openai_base_url') || 'https://api.vveai.com';
let model = localStorage.getItem('openai_model') || 'gpt-4o-mini';
let messages = [];
let currentPatientIndex = 0;
let isLoading = false;
let currentTheme = localStorage.getItem('theme') || 'dark';
let abortController = null;
let knowledgeBase = '';

// Patient data
const patients = [
    {
        name: '张先生',
        avatar: '张',
        appointment: '种植牙',
        doctor: '李主任',
        status: 'waiting',
        triggerTime: '24h后',
        // 扩展信息
        basicInfo: '男，45岁，企业家，抽烟多年，有高血压病史',
        medicalHistory: '2024年3月：种植牙手术一期；2024年6月：种植牙二期手术；慢性牙周炎',
        preferences: '喜欢简洁直接的沟通方式，对疼痛敏感，怕麻烦',
        messages: [
            { role: 'assistant', content: '您好，张先生！我是您的 AI 智能助手小齿。\n您的种植牙手术已完成，请问恢复情况如何？', time: '10:00' },
            { role: 'user', content: '李主任您好！手术恢复得不错，就是有点肿，正常吗？', time: '10:05' },
            { role: 'assistant', content: '张先生您好，种植牙手术后出现肿胀是正常现象，通常在 3-5 天内会逐渐消退。\n\n建议您：\n• 冰敷患处，每次 15-20 分钟\n• 服用消炎药按时服用\n• 保持口腔清洁，避免刺激手术区域\n\n如果肿胀超过一周或加重，请及时联系我们复诊。', time: '10:06' }
        ]
    },
    {
        name: '李女士',
        avatar: '李',
        appointment: '正畸复诊',
        doctor: '王主任',
        status: 'done',
        triggerTime: '昨天',
        basicInfo: '女，28岁，教师，钢丝牙套矫正中',
        medicalHistory: '2023年8月：开始正畸治疗；2024年2月：复诊调整钢丝；需要定期复诊',
        preferences: '注重美观，喜欢隐形牙套但因价格选择钢丝',
        messages: [
            { role: 'assistant', content: '您好，李女士！您的正畸复诊预约是明天上午10点。', time: '昨天 09:00' },
            { role: 'user', content: '好的，我会准时到。', time: '昨天 09:15' },
            { role: 'assistant', content: '好的，请记得准时到达。复诊时无需空腹，请保持口腔清洁。', time: '昨天 09:16' },
            { role: 'user', content: '谢谢提醒！', time: '昨天 09:30' }
        ]
    },
    {
        name: '王先生',
        avatar: '王',
        appointment: '洗牙服务',
        doctor: '张医生',
        status: 'pending',
        triggerTime: '2h前',
        basicInfo: '男，35岁，程序员，平时咖啡喝得多',
        medicalHistory: '牙结石较多，每年定期洗牙；轻微四环素牙',
        preferences: '工作忙，时间宝贵，喜欢高效沟通',
        messages: [
            { role: 'assistant', content: '王先生您好，请问您预约的洗牙服务体验如何？', time: '2h前' },
            { role: 'user', content: '服务很好，就是有点酸痛感。', time: '1h前' },
            { role: 'assistant', content: '洗牙后出现轻微酸痛是正常现象，通常会在24小时内缓解。建议您避免过冷过热的食物，如果持续不适请联系我们。', time: '1h前' }
        ]
    },
    {
        name: '赵先生',
        avatar: '赵',
        appointment: '种植牙二期',
        doctor: '李主任',
        status: 'waiting',
        triggerTime: '48h后',
        basicInfo: '男，52岁，银行职员，无不良嗜好',
        medicalHistory: '2024年5月：种植牙一期；牙周炎治疗中',
        preferences: '谨慎仔细，喜欢问详细问题',
        messages: [
            { role: 'assistant', content: '您好，赵先生！您的种植牙二期手术即将安排。', time: '昨天' },
            { role: 'user', content: '好的，请问需要注意什么？', time: '昨天' }
        ]
    }
];

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initApiKey();
    loadKnowledgeBase();
    renderPatientList();
    selectPatient(0);
});

// ===== Theme Management =====
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    const themes = ['dark', 'light', 'blue', 'green'];
    const currentIndex = themes.indexOf(currentTheme);
    currentTheme = themes[(currentIndex + 1) % themes.length];
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    const icons = { dark: '🌙', light: '☀️', blue: '🌊', green: '🌿' };
    icon.textContent = icons[currentTheme];
}

// ===== API Key Management =====
function initApiKey() {
    const input = document.getElementById('apiKey');
    const baseUrlInput = document.getElementById('baseUrl');
    const modelSelect = document.getElementById('modelSelect');
    const statusDot = document.getElementById('statusDot');

    input.value = apiKey;
    baseUrlInput.value = baseUrl;
    modelSelect.value = model;
    statusDot.classList.add('connected');
}

function saveApiKey() {
    const input = document.getElementById('apiKey');
    const baseUrlInput = document.getElementById('baseUrl');
    const modelSelect = document.getElementById('modelSelect');
    const statusDot = document.getElementById('statusDot');

    apiKey = input.value.trim();
    baseUrl = baseUrlInput.value.trim();
    model = modelSelect.value;

    if (apiKey && baseUrl) {
        localStorage.setItem('openai_api_key', apiKey);
        localStorage.setItem('openai_base_url', baseUrl);
        localStorage.setItem('openai_model', model);
        statusDot.classList.add('connected');
    }
}

// ===== Knowledge Base =====
async function loadKnowledgeBase() {
    // 优先使用嵌入的知识库
    if (typeof knowledgeBaseContent !== 'undefined') {
        knowledgeBase = knowledgeBaseContent;
        console.log('知识库已加载（嵌入）');
        return;
    }
    // 备用：从文件加载（需要Web服务器）
    try {
        const response = await fetch('data/医患沟通常见500问.md');
        if (response.ok) {
            knowledgeBase = await response.text();
            console.log('知识库已加载');
        }
    } catch (e) {
        console.warn('知识库加载失败:', e);
    }
}

function searchKnowledge(query) {
    if (!knowledgeBase) return '';
    const lines = knowledgeBase.split('\n');
    const queryLower = query.toLowerCase();
    let relevantLines = [];
    let inSection = false;
    let sectionContent = [];

    for (let line of lines) {
        const lineLower = line.toLowerCase();
        if (lineLower.includes(queryLower) ||
            queryLower.split(' ').some(w => w.length > 2 && lineLower.includes(w))) {
            inSection = true;
        }
        if (inSection) {
            sectionContent.push(line);
            if (line.match(/^\d+\./) && sectionContent.length > 10) {
                relevantLines.push(sectionContent.join('\n'));
                if (relevantLines.length >= 3) break;
                inSection = false;
                sectionContent = [];
            }
        }
    }
    if (sectionContent.length > 0) relevantLines.push(sectionContent.join('\n'));
    return relevantLines.slice(0, 2).join('\n\n');
}

// ===== Patient Management =====
function selectPatient(index) {
    currentPatientIndex = index;

    // Update patient list
    document.querySelectorAll('.patient-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Update header
    const patient = patients[index];
    document.getElementById('currentPatientAvatar').textContent = patient.avatar;
    document.getElementById('currentPatientName').textContent = patient.name;
    document.getElementById('currentPatientMeta').textContent =
        `预约：${patient.appointment} | 医生：${patient.doctor}`;

    // Update trigger button state
    updateTriggerButton(patient.status);

    // Render messages
    renderMessages(patient.messages);
}

function updateTriggerButton(status) {
    const btn = document.querySelector('.patient-header-actions .btn-primary');
    if (status === 'done') {
        btn.innerHTML = '<span>✓</span> 已完成';
        btn.disabled = true;
        btn.style.opacity = '0.6';
    } else {
        btn.innerHTML = '<span>▶</span> 触发自动消息';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

function renderPatientList() {
    const list = document.getElementById('patientList');
    list.innerHTML = patients.map((p, i) => `
        <div class="patient-item ${i === 0 ? 'active' : ''}" onclick="selectPatient(${i})" ondblclick="editPatient(${i})">
            <div class="patient-avatar ${p.status === 'done' ? 'success' : p.status === 'pending' ? 'warning' : ''}">${p.avatar}</div>
            <div class="patient-info">
                <div class="patient-name">${p.name}</div>
                <div class="patient-status ${p.status}">${getStatusText(p.status)}</div>
            </div>
            <div class="patient-time">${p.triggerTime}</div>
        </div>
    `).join('');
}

// ===== Patient Edit =====
function editPatient(index) {
    const patient = patients[index];
    const modal = document.getElementById('patientEditModal');
    const form = document.getElementById('patientEditForm');

    document.getElementById('editName').value = patient.name;
    document.getElementById('editAppointment').value = patient.appointment;
    document.getElementById('editDoctor').value = patient.doctor;
    document.getElementById('editBasicInfo').value = patient.basicInfo || '';
    document.getElementById('editMedicalHistory').value = patient.medicalHistory || '';
    document.getElementById('editPreferences').value = patient.preferences || '';
    document.getElementById('editPatientIndex').value = index;

    modal.style.display = 'flex';
}

function savePatientEdit() {
    const index = parseInt(document.getElementById('editPatientIndex').value);
    const patient = patients[index];

    patient.name = document.getElementById('editName').value;
    patient.appointment = document.getElementById('editAppointment').value;
    patient.doctor = document.getElementById('editDoctor').value;
    patient.basicInfo = document.getElementById('editBasicInfo').value;
    patient.medicalHistory = document.getElementById('editMedicalHistory').value;
    patient.preferences = document.getElementById('editPreferences').value;

    // Update avatar first letter
    patient.avatar = patient.name.charAt(0);

    renderPatientList();
    selectPatient(index);
    closePatientEdit();
    alert('患者信息已更新');
}

function closePatientEdit() {
    document.getElementById('patientEditModal').style.display = 'none';
}

function getStatusText(status) {
    const texts = { waiting: '待回访', done: '已完成', pending: '跟进中' };
    return texts[status] || status;
}

// ===== Messages =====
function renderMessages(messageList) {
    const container = document.getElementById('chatMessages');

    let html = `
        <div class="message-time-divider">
            <span>今天</span>
        </div>
    `;

    messageList.forEach(msg => {
        html += `
            <div class="message ${msg.role}">
                <div class="message-avatar">${msg.role === 'assistant' ? '🤖' : '👤'}</div>
                <div class="message-content">
                    <div class="message-bubble">${escapeHtml(msg.content)}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function addMessage(role, content, time = null) {
    const container = document.getElementById('chatMessages');
    const timeStr = time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    patients[currentPatientIndex].messages.push({ role, content, time: timeStr });

    const html = `
        <div class="message ${role}">
            <div class="message-avatar">${role === 'assistant' ? '🤖' : '👤'}</div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(content)}</div>
                <div class="message-time">${timeStr}</div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    // 禁用输入框
    const input = document.getElementById('userInput');
    input.disabled = true;
    input.placeholder = 'AI 正在回复...';

    const container = document.getElementById('chatMessages');
    const html = `
        <div class="message assistant" id="typingMessage">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingMessage');
    if (typing) typing.remove();

    // 恢复输入框
    const input = document.getElementById('userInput');
    input.disabled = false;
    input.placeholder = '输入消息...';
    input.focus();
}

let streamingMessageId = 0;

function addStreamingMessage() {
    const container = document.getElementById('chatMessages');
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const id = ++streamingMessageId;

    const html = `
        <div class="message assistant" id="streamingMessage_${id}">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-bubble" id="streamingBubble_${id}"></div>
                <div class="message-time" id="streamingTime_${id}">${timeStr}</div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;

    return {
        bubble: document.getElementById(`streamingBubble_${id}`),
        time: document.getElementById(`streamingTime_${id}`),
        id: id
    };
}

function updateStreamingMessage(bubble, timeEl, content) {
    bubble.textContent = content;
}

function finishStreamingMessage(bubble, timeEl, patientIndex) {
    const timeStr = timeEl.textContent;
    patients[patientIndex].messages.push({ role: 'assistant', content: bubble.textContent, time: timeStr });
}

// ===== Send Message =====
async function sendMessage() {
    const input = document.getElementById('userInput');
    const content = input.value.trim();

    if (!content || isLoading) return;

    if (!apiKey || !baseUrl) {
        alert('请先配置 API Base URL 和 Key');
        return;
    }

    addMessage('user', content);
    input.value = '';
    input.style.height = 'auto';
    isLoading = true;
    showTyping();

    // Prepare messages for API
    const knowledgeContext = searchKnowledge(content);
    const basePrompt = '你是一个专业的口腔门诊AI客服助手，名字叫"小齿"。你需要用专业、友好的态度回答用户关于口腔健康、治疗、护理等方面的问题。如果需要列表，使用 • 或数字标记。';
    const fullPrompt = knowledgeContext ? basePrompt + '\n\n参考知识库：\n' + knowledgeContext : basePrompt;

    const conversationMessages = [
        { role: 'system', content: fullPrompt }
    ];

    // Add patient context
    const patient = patients[currentPatientIndex];
    let patientInfo = `患者信息：姓名${patient.name}，预约项目：${patient.appointment}，主治医生：${patient.doctor}`;
    if (patient.basicInfo) patientInfo += `\n基本信息：${patient.basicInfo}`;
    if (patient.medicalHistory) patientInfo += `\n就诊记录：${patient.medicalHistory}`;
    if (patient.preferences) patientInfo += `\n个人喜好：${patient.preferences}`;

    conversationMessages.push({
        role: 'system',
        content: patientInfo
    });

    // Add chat history
    patient.messages.forEach(m => {
        conversationMessages.push({ role: m.role, content: m.content });
    });

    conversationMessages.push({ role: 'user', content: content });

    try {
        // Check if streaming is supported
        const supportsStreaming = await checkStreamingSupport();

        if (supportsStreaming) {
            await streamResponse(conversationMessages, currentPatientIndex);
        } else {
            await sendNonStreamingRequest(conversationMessages, currentPatientIndex);
        }

    } catch (error) {
        hideTyping();
        addMessage('assistant', `错误: ${error.message}`);
    } finally {
        isLoading = false;
    }
}

async function checkStreamingSupport() {
    try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 5
            })
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function streamResponse(conversationMessages, patientIndex) {
    hideTyping();

    abortController = new AbortController();
    const { bubble, time } = addStreamingMessage();
    let fullContent = '';

    try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: conversationMessages,
                stream: true,
                max_tokens: 2000
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API错误: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            fullContent += delta;
                            updateStreamingMessage(bubble, time, fullContent);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        finishStreamingMessage(bubble, time, patientIndex);

    } catch (error) {
        if (error.name === 'AbortError') {
            addMessage('assistant', '请求已取消');
        } else {
            throw error;
        }
    } finally {
        abortController = null;
    }
}

async function sendNonStreamingRequest(conversationMessages, patientIndex) {
    hideTyping();
    const { bubble, time } = addStreamingMessage();
    let fullContent = '';

    try {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: conversationMessages,
                stream: false,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API错误: ${response.status}`);
        }

        const data = await response.json();
        fullContent = data.choices[0]?.message?.content || '抱歉，我没有收到有效的回复。';

        updateStreamingMessage(bubble, time, fullContent);
        finishStreamingMessage(bubble, time, patientIndex);

    } catch (error) {
        // Remove the streaming message element
        const msg = document.getElementById('streamingMessage');
        if (msg) msg.remove();
        throw error;
    }
}

function sendQuickQuestion(question) {
    document.getElementById('userInput').value = question;
    sendMessage();
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ===== Auto Trigger =====
function triggerAutoMessage() {
    const patient = patients[currentPatientIndex];

    if (patient.status === 'done') return;

    // Add to log
    addLog('已发送自动消息 → ' + patient.name);

    // Show typing then send auto message
    showTyping();

    setTimeout(async () => {
        hideTyping();

        const contextMessages = [
            { role: 'system', content: '你是一个专业的口腔门诊AI客服助手"小齿"。根据患者的治疗情况，生成一句自然的自动回访消息。' },
            { role: 'system', content: `患者信息：${patient.name}，预约项目：${patient.appointment}，主治医生：${patient.doctor}` },
            { role: 'user', content: '请生成一句术后回访消息，语气亲切专业，不超过50字。' }
        ];

        try {
            const supportsStreaming = await checkStreamingSupport();

            if (supportsStreaming) {
                await streamResponse(contextMessages, currentPatientIndex);
            } else {
                await sendNonStreamingRequest(contextMessages, currentPatientIndex);
            }

            // Update patient status
            patient.status = 'done';
            patient.triggerTime = '已完成';
            updateTriggerButton('done');
            renderPatientList();

        } catch (error) {
            // Fallback to preset messages
            const autoMessages = {
                'waiting': `您好，${patient.name}！我是您的 AI 智能助手小齿。\n您的治疗已经完成一段时间了，请问恢复情况如何？有什么不适吗？`,
                'done': `您好，${patient.name}！感谢您选择我们的服务。请问您对最近一次的治疗体验满意吗？`,
                'pending': `您好，${patient.name}！我们注意到您之前咨询过的问题还未得到帮助，请问您还需要了解什么信息吗？`
            };
            addMessage('assistant', autoMessages[patient.status] || autoMessages['waiting']);
        }

    }, 1500);
}

function addLog(text) {
    const list = document.getElementById('logList');
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const html = `
        <div class="log-item">
            <span class="log-time">${time}</span>
            <span class="log-status success">✓</span>
            <span class="log-text">${text}</span>
        </div>
    `;

    list.insertAdjacentHTML('afterbegin', html);
}

// ===== Section Toggle =====
function toggleSection(section) {
    const header = event.currentTarget;
    header.classList.toggle('collapsed');
    const content = document.getElementById(section + 'Section');
    content.style.display = header.classList.contains('collapsed') ? 'none' : 'block';
}

// ===== Modal =====
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ===== Upload =====
function uploadDocument() {
    document.getElementById('uploadModal').classList.add('active');
}

function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const preview = document.getElementById('uploadPreview');
    preview.innerHTML = `
        <div class="file-item">
            <span>📄</span>
            <span>${file.name}</span>
            <span style="color: var(--success);">准备上传</span>
        </div>
    `;
}

function confirmUpload() {
    const preview = document.getElementById('uploadPreview');
    const fileName = preview.querySelector('.file-item span:nth-child(2)')?.textContent;

    if (fileName) {
        // Add to file list
        const fileList = document.getElementById('fileList');
        const html = `
            <div class="file-item">
                <span>📄</span>
                <span>${fileName}</span>
                <button class="btn-icon" onclick="removeFile(this)">×</button>
            </div>
        `;
        fileList.insertAdjacentHTML('beforeend', html);

        closeModal('uploadModal');
        preview.innerHTML = '';

        addLog('已上传知识库文档 → ' + fileName);
    }
}

function removeFile(btn) {
    btn.parentElement.remove();
}

// ===== Templates =====
function showTemplates() {
    document.getElementById('templateModal').classList.add('active');
}

function addTemplate() {
    alert('添加模板功能 - 敬请期待');
}

// ===== Trigger Rules =====
function addTriggerRule() {
    alert('添加触发规则功能 - 敬请期待');
}

// ===== Utility =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}