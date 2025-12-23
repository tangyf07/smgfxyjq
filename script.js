import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { initializeFirestore, collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 配置信息 ---
const firebaseConfig = {
    apiKey: "AIzaSyBzVD0XuA8Vw-e-7lKEx3K69UCe6lkDhFQ",
    authDomain: "coffee-spark-ai-barista-8b0e2.firebaseapp.com",
    projectId: "coffee-spark-ai-barista-8b0e2",
    storageBucket: "coffee-spark-ai-barista-8b0e2.firebasestorage.app",
    messagingSenderId: "732057248424",
    appId: "1:732057248424:web:cd43ba3f2d87cc58f3989d"
};

// --- 初始化 Firebase ---
const appInstance = initializeApp(firebaseConfig);
const db = initializeFirestore(appInstance, {
    experimentalForceLongPolling: true, // 强制长轮询，解决网络连接问题
});
const auth = getAuth(appInstance);
const POSTS_COLLECTION = collection(db, 'posts');

// --- 状态管理 ---
const state = {
    posts: [],
    currentPostId: null,
    isAdmin: false
};

// --- 初始化程序 ---
async function init() {
    try {
        await signInAnonymously(auth);
        
        // 实时监听数据库
        onSnapshot(POSTS_COLLECTION, (snapshot) => {
            const posts = [];
            snapshot.forEach((doc) => posts.push({ id: doc.id, ...doc.data() }));
            state.posts = posts.sort((a, b) => b.createdAt - a.createdAt);
            
            if (state.currentPostId) {
                renderDetail(state.currentPostId);
            } else {
                renderHome();
            }
        }, (error) => {
            renderError("读取失败：" + error.message);
        });

    } catch (err) {
        renderError("连接失败：" + err.message);
    }
}

// --- 渲染函数 ---
function renderHome() {
    state.currentPostId = null;
    const container = document.getElementById('mainContainer');
    if (state.posts.length === 0) return container.innerHTML = `<div class="empty-state"><h3>👋 数据库是空的</h3><p>快去写第一篇文章吧！</p></div>`;
    
    container.innerHTML = state.posts.map(post => `
        <article class="post-card" onclick="window.app.viewPost('${post.id}')">
            <div class="post-meta">📅 ${new Date(post.createdAt).toLocaleDateString()} <span>❤️ ${post.likes || 0}</span> <span>💬 ${post.comments?.length || 0}</span></div>
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            <div class="post-excerpt">${escapeHtml(post.content)}</div>
        </article>
    `).join('');
}

function renderDetail(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return renderHome();
    state.currentPostId = id;
    
    const commentsHtml = (post.comments || []).map(c => `
        <div class="comment-item">
            <div class="comment-header"><span>👤 ${escapeHtml(c.user)}</span> <span style="font-size:0.8em">${new Date(c.time).toLocaleDateString()}</span></div>
            <div>${escapeHtml(c.text)}</div>
        </div>
    `).reverse().join('');

    document.getElementById('mainContainer').innerHTML = `
        <div class="detail-view">
            <div class="back-btn" onclick="window.app.goHome()">← 返回列表</div>
            <div class="post-meta">📅 ${new Date(post.createdAt).toLocaleString()}</div>
            <h1 class="post-title">${escapeHtml(post.title)}</h1>
            <div class="article-content">${escapeHtml(post.content)}</div>
            <div class="interaction-area"><button class="like-btn" onclick="window.app.addLike('${post.id}')">❤️ 点赞 (${post.likes || 0})</button></div>
            <div class="comment-section">
                <h3>评论区</h3><textarea id="commentInput" class="comment-input" placeholder="说点什么..."></textarea>
                <button class="btn-primary" onclick="window.app.addComment('${post.id}')">发表评论</button>
                <div class="comment-list" style="margin-top:20px;">${commentsHtml || '<div style="color:#999">暂无评论</div>'}</div>
            </div>
        </div>
    `;
}

function renderError(msg) {
    document.getElementById('mainContainer').innerHTML = `<div class="error-state"><h3>❌ 出错了</h3><div style="text-align:left; background:#f9f9f9; padding:10px; margin-top:10px;">${msg}</div></div>`;
}

// --- 辅助函数 ---
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- 暴露给 HTML 的接口 ---
window.app = {
    goHome: renderHome,
    viewPost: (id) => renderDetail(id),
    openLoginModal: () => {
        state.isAdmin ? document.getElementById('writeModal').classList.add('active') : document.getElementById('loginModal').classList.add('active');
    },
    closeModal: (id) => document.getElementById(id).classList.remove('active'),
    
    checkLogin: () => {
        if(document.getElementById('adminPassword').value === 'admin666') {
            state.isAdmin = true;
            showToast('验证成功');
            app.closeModal('loginModal');
            document.getElementById('writeModal').classList.add('active');
        } else {
            showToast('密码错误');
        }
    },

    publishPost: async () => {
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        if(!title || !content) return showToast('内容不能为空');
        try {
            await addDoc(POSTS_COLLECTION, { title, content, createdAt: Date.now(), likes: 0, comments: [] });
            showToast('发布成功'); app.closeModal('writeModal');
            document.getElementById('postTitle').value = ''; document.getElementById('postContent').value = '';
        } catch(e) { showToast('发布失败: ' + e.message); }
    },

    addLike: async (id) => { try { await updateDoc(doc(db, 'posts', id), { likes: increment(1) }); } catch(e) { console.error(e); } },
    
    addComment: async (id) => {
        const text = document.getElementById('commentInput').value.trim();
        if(!text) return;
        try {
            await updateDoc(doc(db, 'posts', id), { comments: arrayUnion({ user: '访客', text, time: Date.now() }) });
            showToast('评论成功');
        } catch(e) { console.error(e); }
    }
};

// 启动程序
init();
