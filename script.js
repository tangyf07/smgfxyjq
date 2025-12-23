/* --- 保持原有的基础样式 --- */
:root { --primary-color: #3b82f6; --bg-color: #f3f4f6; --card-bg: #ffffff; --text-main: #1f2937; --text-light: #6b7280; --error-color: #ef4444; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background-color: var(--bg-color); color: var(--text-main); margin: 0; padding: 0; line-height: 1.6; }
header { background-color: var(--card-bg); box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
.nav-container { max-width: 1000px; margin: 0 auto; padding: 1rem 20px; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.5rem; font-weight: 800; color: var(--primary-color); text-decoration: none; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.admin-btn { background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 5px 15px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s; }
.admin-btn:hover { background: var(--primary-color); color: white; }
main { max-width: 800px; margin: 30px auto; padding: 0 20px; min-height: 80vh; }
.loading-state, .empty-state, .error-state { text-align: center; padding: 40px; color: var(--text-light); background: white; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.error-state { color: var(--error-color); border: 1px solid #fee2e2; }

/* --- 文章卡片升级 --- */
.post-card { background: var(--card-bg); border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; transition: transform 0.2s; position: relative; }
.post-card:hover { transform: translateY(-3px); }
.post-meta { font-size: 0.85rem; color: var(--text-light); margin-bottom: 10px; display: flex; gap: 15px; align-items: center; }
.post-title { font-size: 1.5rem; margin: 0 0 10px 0; color: #111; }
.post-excerpt { color: #4b5563; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* --- 图片样式 (新功能) --- */
.post-image {
    width: 100%;
    max-height: 300px;
    object-fit: cover; /* 保持比例裁剪 */
    border-radius: 8px;
    margin-bottom: 15px;
}
.detail-view .post-image {
    max-height: 500px; /* 详情页图片可以大一点 */
}

/* --- 删除按钮 (新功能) --- */
.delete-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #fee2e2;
    color: #ef4444;
    border: none;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: bold;
    z-index: 10; /* 保证按钮在最上层 */
}
.delete-btn:hover { background: #ef4444; color: white; }

/* --- 详情页 --- */
.detail-view { background: var(--card-bg); border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); animation: fadeIn 0.3s ease; position: relative; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.back-btn { display: inline-block; margin-bottom: 20px; color: var(--primary-color); cursor: pointer; font-weight: bold; }
.article-content { font-size: 1.1rem; margin: 30px 0; border-bottom: 1px solid #eee; padding-bottom: 30px; white-space: pre-wrap; }
.interaction-area { margin-top: 20px; }
.like-btn { background: #ffe4e6; color: #e11d48; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: transform 0.2s; }
.like-btn:hover { transform: scale(1.05); }
.like-btn.liked { background: #e11d48; color: white; }

/* --- 评论区升级 --- */
.comment-section { margin-top: 30px; }
.comment-form { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
/* 昵称输入框 */
.nickname-input {
    flex: 1;
    min-width: 120px;
    max-width: 200px;
    padding: 10px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
}
.comment-input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 10px;
    resize: vertical;
    box-sizing: border-box;
    font-family: inherit;
}
.comment-item { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; font-size: 0.95rem; }
.comment-header { font-weight: bold; font-size: 0.85rem; color: var(--text-light); margin-bottom: 5px; display: flex; justify-content: space-between; }

/* --- 弹窗与通用 --- */
.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000; }
.modal.active { display: flex; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
.btn-primary { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel { background: transparent; border: none; cursor: pointer; margin-right: 10px; color: #666; }
#toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 30px; opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 2000; }
#toast.show { opacity: 1; }
