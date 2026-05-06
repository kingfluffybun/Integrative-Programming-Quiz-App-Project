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
    const currentPath = window.location.pathname;
    const isHome = currentPath.includes('/')
    const isQuiz = currentPath.includes('/quiz')

    if (isQuiz) {
        document.getElementById('quiz').classList.add('active-page')
    } else if (isHome) {
        document.getElementById('home').classList.add('active-page')
    }
});

