import Theme from '../theme';

/**
 * Add listener for theme mode toggle
 */

const $toggle = document.getElementById('mode-toggle');

function updateModeIcon() {
  if (!$toggle) return;
  const mode = Theme.visualState;
  $toggle.querySelectorAll('.mode-icon').forEach((icon) => {
    icon.style.display = icon.dataset.mode === mode ? '' : 'none';
  });
}

export function modeWatcher() {
  if (!$toggle) {
    return;
  }

  $toggle.addEventListener('click', () => {
    Theme.flip();
    updateModeIcon();
  });

  // 初始化时设置正确的图标
  updateModeIcon();
}
