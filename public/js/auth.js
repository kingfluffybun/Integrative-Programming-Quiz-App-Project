document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.password-toggle').forEach(function (toggle) {
    const targetId = toggle.dataset.target;
    const input = targetId ? document.getElementById(targetId) : null;
    if (!input) {
      return;
    }

    const eyeIcon = toggle.querySelector('.eye-icon');
    const eyeOffIcon = toggle.querySelector('.eye-off-icon');

    const keepFocus = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    toggle.addEventListener('mousedown', keepFocus, { passive: false });
    toggle.addEventListener('touchstart', keepFocus, { passive: false });
    toggle.addEventListener('touchend', keepFocus, { passive: false });

    const handleToggle = function (event) {
      event.preventDefault();
      event.stopPropagation();
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.classList.toggle('hidden', !isHidden);
        eyeOffIcon.classList.toggle('hidden', isHidden);
      }
      input.focus({ preventScroll: true });
      if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
        requestAnimationFrame(function () {
          try {
            input.setSelectionRange(selectionStart, selectionEnd);
          } catch (error) {
            // ignore if browser does not allow restoring selection after type change
          }
        });
      }
      toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    };

    toggle.addEventListener('click', handleToggle);
    toggle.addEventListener('touchend', handleToggle);
  });
});
