import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { initializeFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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

// --- 状态管理 ---
const state = {
    posts: [],
    currentPostId: null,
    isAdmin: false
};

// --- 初始化系统 ---
async function initSystem() {
    try {
        // 1. 初始化 Firebase
        const appInstance = initializeApp(firebaseConfig);
        const db = initializeFirestore(appInstance, { experimentalForceLongPolling: true });
        const auth = getAuth(appInstance);
        const POSTS_COLLECTION = collection(db, 'posts');

        // 2. 定义功能函数
        const renderHome = () => {
            state.currentPostId = null;
            const container = document.getElementById('mainContainer');
            if (state.posts.length === 0) return container.innerHTML = `<div class="empty-state"><h3>👋 数据库是空的</h3><p>快去写第一篇文章吧！</p></div>`;
            
            container.innerHTML = state.posts.map(post => {
                const deleteBtn = state.isAdmin ? `<button class="delete-btn" onclick="event.stopPropagation(); window.app.deletePost('${post.id}')">🗑️ 删除</button>` : '';
                const imageTag = post.image ? `<img src="${post.image}" class="post-image" onerror="this.style.display='none'">` : '';

                return `
                    <article class="post-card" onclick="window.app.viewPost('${post.id}')">
                        ${deleteBtn}
                        ${imageTag}
                        <div class="post-meta">📅 ${new Date(post.createdAt).toLocaleDateString()} <span>❤️ ${post.likes || 0}</span> <span>💬 ${post.comments?.length || 0}</span></div>
                        <h2 class="post-title">${escapeHtml(post.title)}</h2>
                        <div class="post-excerpt">${escapeHtml(post.content)}</div>
                    </article>
                `;
            }).join('');
        };

        const renderDetail = (id) => {
            const post = state.posts.find(p => p.id === id);
            if (!post) return renderHome();
            state.currentPostId = id;
            
            const imageTag = post.image ? `<img src="${post.image}" class="post-image">` : '';
            const deleteBtn = state.isAdmin ? `<button class="delete-btn" onclick="window.app.deletePost('${post.id}')">🗑️ 删除文章</button>` : '';

            const commentsHtml = (post.comments || []).map(c => `
                <div class="comment-item">
                    <div class="comment-header"><span>👤 ${escapeHtml(c.user)}</span> <span style="font-size:0.8em">${new Date(c.time).toLocaleDateString()}</span></div>
                    <div>${escapeHtml(c.text)}</div>
                </div>
            `).reverse().join('');

            document.getElementById('mainContainer').innerHTML = `
                <div class="detail-view">
                    <div class="back-btn" onclick="window.app.goHome()">← 返回列表</div>
                    ${deleteBtn}
                    ${imageTag}
                    <div class="post-meta">📅 ${new Date(post.createdAt).toLocaleString()}</div>
                    <h1 class="post-title">${escapeHtml(post.title)}</h1>
                    <div class="article-content">${escapeHtml(post.content)}</div>
                    <div class="interaction-area"><button class="like-btn" onclick="window.app.addLike('${post.id}')">❤️ 点赞 (${post.likes || 0})</button></div>
                    
                    <div class="comment-section">
                        <h3>评论区</h3>
                        <div class="comment-form">
                            <input type="text" id="commentNick" class="nickname-input" placeholder="你的昵称 (可选)">
                        </div>
                        <textarea id="commentInput" class="comment-input" placeholder="说点什么..."></textarea>
                        <button class="btn-primary" onclick="window.app.addComment('${post.id}')">发表评论</button>
                        <div class="comment-list" style="margin-top:20px;">${commentsHtml || '<div style="color:#999">暂无评论</div>'}</div>
                    </div>
                </div>
            `;
        };

        // 3. 覆盖全局 app 对象 (连接成功，激活功能)
        window.app = {
            goHome: renderHome,
            viewPost: (id) => renderDetail(id),
            
            openLoginModal: () => {
                state.isAdmin ? 
                    document.getElementById('writeModal').classList.add('active') : 
                    document.getElementById('loginModal').classList.add('active');
            },
            closeModal: (id) => document.getElementById(id).classList.remove('active'),
            
            checkLogin: () => {
                if(document.getElementById('adminPassword').value === 'admin666') {
                    state.isAdmin = true;
                    showToast('验证成功！已获得管理员权限');
                    document.getElementById('loginModal').classList.remove('active');
                    document.getElementById('writeModal').classList.add('active');
                    renderHome(); 
                } else {
                    showToast('密码错误');
                }
            },

            publishPost: async () => {
                const title = document.getElementById('postTitle').value;
                const content = document.getElementById('postContent').value;
                const image = document.getElementById('postImage').value;

                if(!title || !content) return showToast('标题和内容不能为空');
                try {
                    await addDoc(POSTS_COLLECTION, { 
                        title, content, image, 
                        createdAt: Date.now(), likes: 0, comments: [] 
                    });
                    showToast('发布成功'); 
                    document.getElementById('writeModal').classList.remove('active');
                    document.getElementById('postTitle').value = ''; 
                    document.getElementById('postContent').value = '';
                    document.getElementById('postImage').value = '';
                } catch(e) { 
                    console.error(e);
                    showToast('发布失败: ' + e.message); 
                }
            },

            deletePost: async (id) => {
                if (!confirm("确定要删除这篇文章吗？不可恢复哦！")) return;
                try {
                    await deleteDoc(doc(db, 'posts', id));
                    showToast('已删除 🗑️');
                    renderHome(); 
                } catch (e) { 
                    console.error(e);
                    showToast('删除失败'); 
                }
            },

            addLike: async (id) => { 
                try { await updateDoc(doc(db, 'posts', id), { likes: increment(1) }); } 
                catch(e) { console.error(e); } 
            },
            
            addComment: async (id) => {
                const text = document.getElementById('commentInput').value.trim();
                let user = document.getElementById('commentNick').value.trim();
                if (!user) user = "匿名访客";

                if(!text) return showToast('评论不能为空');
                try {
                    await updateDoc(doc(db, 'posts', id), { comments: arrayUnion({ user, text, time: Date.now() }) });
                    showToast('评论成功');
                    document.getElementById('commentInput').value = ''; 
                } catch(e) { console.error(e); }
            }
        };

        // 4. 开始连接
        await signInAnonymously(auth);
        
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
            renderError("读取数据失败：" + error.message);
        });

    } catch (err) {
        console.error("初始化错误:", err);
        renderError("连接服务器失败：" + err.message);
    }
}

function renderError(msg) {
    document.getElementById('mainContainer').innerHTML = `<div class="error-state"><h3>❌ 出错了</h3><div style="text-align:left; background:#f9f9f9; padding:10px; margin-top:10px;">${msg}</div></div>`;
}

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

initSystem();
