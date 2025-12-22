// 获取按钮元素
const likeBtn = document.getElementById('likeBtn');

// 初始化点赞数
let count = 0;

// 监听点击事件
likeBtn.addEventListener('click', function() {
    count = count + 1; // 每次点击加1
    likeBtn.innerText = `点赞 (${count})`; // 更新按钮文字
    
    // 如果点赞超过10次，改变按钮颜色
    if (count > 10) {
        likeBtn.style.backgroundColor = '#ff4757';
        likeBtn.style.color = 'white';
    }
});