// دالة لإضافة المكافأة إلى رصيد المستخدم وتحديث الواجهة
function addCoins(reward) {
    let currentCoins = parseInt(localStorage.getItem('balance') || '0');
    currentCoins += parseInt(reward);
    localStorage.setItem('balance', currentCoins);

    // تحديث واجهة المستخدم لإظهار الرصيد الجديد
    const userBalanceElement = document.getElementById('balanceAmount');
    if (userBalanceElement) {
        userBalanceElement.textContent = `Your new balance: ${currentCoins} coins`;
    }

    // إظهار إشعار للمستخدم بدلاً من استخدام alert
    showNotification(`Congratulations! You've earned ${reward} coins. Your new balance is: ${currentCoins} coins.`);
}

// تحميل المهام من ملف JSON
fetch('tasks.json')
.then(response => response.json())
.then(tasks => {
    const taskContainer = document.getElementById('taskcontainer'); // لاحظ حرف "c" الصغيرة هنا
    if (!taskContainer) {
        console.error('Task container element not found.');
        return;
    }

    taskContainer.innerHTML = ''; // تنظيف المحتوى قبل إضافة المهام

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';

        // إضافة الصورة
        const img = document.createElement('img');
        img.src = task.image;
        img.alt = task.task;
        img.className = 'task-image';
        taskItem.appendChild(img);

        // إضافة النص
        const taskText = document.createElement('p');
        taskText.textContent = `${task.task} - Reward: ${task.reward || 5000} coins`;
        taskItem.appendChild(taskText);

        // لا يتم عرض تقدم المهمة، لذا تم حذف قسم التقدم
        // إذا كنت تريد حفظ التقدم لكن لا تريد عرضه، يمكنك الاحتفاظ بالتقدم في المتغيرات، ولكن بدون إضافته إلى واجهة المستخدم.

        // إضافة الزر
        const button = document.createElement('button');
        button.className = 'task-button';
        
        // احصل على تقدم المهمة من localStorage
        const taskId = task.link; // استخدام الرابط كمعرف فريد
        let taskProgress = parseInt(localStorage.getItem(taskId) || '0');

        button.textContent = taskProgress >= 2 ? 'Completed' : taskProgress === 1 ? 'Claim' : 'Go to Task';
        button.disabled = taskProgress >= 2;

        button.onclick = () => {
            taskProgress++;
            localStorage.setItem(taskId, taskProgress);

            // لا يتم تحديث عرض التقدم
            // يمكنك الاحتفاظ بالتقدم في localStorage ولكن لا يتم عرضه.

            if (taskProgress === 1) {
                window.open(task.link, '_blank'); // فتح الرابط عند أول نقر
                button.textContent = 'Claim';
            } else if (taskProgress === 2) {
                addCoins(task.reward); // إضافة المكافأة بعد النقر الثاني
                button.textContent = 'Completed';
                button.disabled = true; // تعطيل الزر بعد إتمام المهمة
            }
        };

        taskItem.appendChild(button);
        taskContainer.appendChild(taskItem);
    });
})
.catch(error => console.error('Error loading tasks:', error));

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
});

// تحميل حالة اللعبة المخزنة
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        document.getElementById('Balance').textContent = `Your new balance: ${gameState.balance} coins`;
    }
}
