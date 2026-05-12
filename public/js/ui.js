const moreToggle = document.querySelector('.more');
const moreContent = document.querySelector('.more-content');
moreToggle.addEventListener("click", function(e) {
    if (!moreContent.contains(e.target) || e.target === moreContent) {
        moreContent.classList.toggle('is-visible');
    }
    e.stopPropagation();
})

moreContent.addEventListener("click", function(e) {
    e.stopPropagation();
})

window.addEventListener("click", function(event) {
    if (!moreContent.contains(event.target)) {
        moreContent.classList.remove('is-visible');
    }
});

document.addEventListener("DOMContentLoaded", function(showMenu) {
    // Apply saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    const quizPage = window.location.pathname === '/quiz';
    if (savedTheme && quizPage) {
        document.body.className = savedTheme;
    }

    const currentPath = window.location.pathname;
    const isHome = currentPath.includes('/')
    const isQuiz = currentPath.includes('/quiz')
    const isShop = currentPath.includes('/shop')
    const isProfile = currentPath.includes('/profile')

    if (isQuiz) {
        document.getElementById('quiz').classList.add('active-page')
    } else if (isShop) {
        document.getElementById('shop').classList.add('active-page')
    } else if (isProfile) {
        document.getElementById('profile').classList.add('active-page')
    }else if (isHome) {
        document.getElementById('home').classList.add('active-page')
    }
});