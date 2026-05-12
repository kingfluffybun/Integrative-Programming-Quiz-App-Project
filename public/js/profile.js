document.addEventListener('DOMContentLoaded', function () {
    setupTabNavigation();
    setupEditProfileButton();
    setupThemeSelection();
    setupSoundToggles();
    setupSettingsToggles();
    setupProfileUpdates();
});

function setupTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const editBtn = document.getElementById('editProfileBtn');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            if (tabId === 'manage-profile') {
                editBtn.classList.add('hidden');
            } else {
                editBtn.classList.remove('hidden');
            }
            document.querySelector('.profile-content').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
}

function setupEditProfileButton() {
    const editBtn = document.getElementById('editProfileBtn');
    const manageProfileTab = document.querySelector('[data-tab="manage-profile"]');

    if (editBtn && manageProfileTab) {
        editBtn.addEventListener('click', function (e) {
            e.preventDefault();
            manageProfileTab.click();
        });
    }
}

function setupThemeSelection() {
    const themeCards = document.querySelectorAll('.theme-card');

    // Initialize active state from localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        themeCards.forEach(card => {
            if (card.getAttribute('data-theme') === savedTheme) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    themeCards.forEach(card => {
        card.addEventListener('click', function () {
            if (this.classList.contains('locked')) {
                alert('This theme is locked! Purchase it in the Shop to unlock.');
                return;
            }
            
            const theme = this.getAttribute('data-theme');

            themeCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            // Apply and save theme
            localStorage.setItem('selectedTheme', theme);
        });
    });
}

function setupSoundToggles() {
    const soundCheckboxes = document.querySelectorAll('.sound-option input[type="checkbox"]');

    soundCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const soundId = this.getAttribute('id');
            const isChecked = this.checked;
        });
    });
}

function setupSettingsToggles() {
    const settingCheckboxes = document.querySelectorAll('.toggle-switch input[type="checkbox"]');

    settingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const settingId = this.getAttribute('id');
            const isEnabled = this.checked;
        });
    });
}

function setupProfileUpdates() {
    document.addEventListener('click', async function (e) {
        if (e.target.classList.contains('btn-save-profile')) {
            const profileFormGroup = e.target.closest('.profile-form-group');
            
            if (profileFormGroup) {
                const input = profileFormGroup.querySelector('.profile-input');
                const field = e.target.getAttribute('data-field');
                const value = input.value;
                const originalText = e.target.textContent;

                try {
                    e.target.disabled = true;
                    e.target.textContent = 'Saving...';

                    const response = await fetch('/profile/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ field, value })
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert('Profile updated successfully!');
                        if (field === 'fullName') {
                            const headerUsername = document.querySelector('.bottom a p');
                            const profileHeaderName = document.querySelector('.profile-info h2');
                            if (headerUsername) headerUsername.textContent = value;
                            if (profileHeaderName) profileHeaderName.textContent = value;
                        }
                    } else {
                        alert('Error: ' + data.message);
                    }
                } catch (error) {
                    console.error('Update error:', error);
                    alert('An error occurred while saving.');
                } finally {
                    e.target.disabled = false;
                    e.target.textContent = originalText;
                }
            }
        }
    });
}
