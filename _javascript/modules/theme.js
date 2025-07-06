/**
 * Theme management class
 *
 * To reduce flickering during page load, this script should be loaded synchronously.
 */
class Theme {
  static #modes = ['light', 'dark', 'varivant'];
  static #modeKey = 'mode';
  static #modeAttr = 'data-mode';
  static #darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  static switchable = !document.documentElement.hasAttribute(this.#modeAttr);

  static get DARK() {
    return 'dark';
  }

  static get LIGHT() {
    return 'light';
  }

  static get VARIVANT() {
    return 'varivant';
  }

  /**
   * @returns {string} Theme mode identifier
   */
  static get ID() {
    return 'theme-mode';
  }

  /**
   * Gets the current visual state of the theme.
   *
   * @returns {string} The current visual state, either the mode if it exists,
   *                   or the system dark mode state ('dark' or 'light').
   */
  static get visualState() {
    if (this.#hasMode) {
      return this.#mode;
    } else {
      return this.#sysDark ? this.DARK : this.LIGHT;
    }
  }

  static get #mode() {
    return sessionStorage.getItem(this.#modeKey);
  }

  static get #isDarkMode() {
    return this.#mode === this.DARK;
  }

  static get #hasMode() {
    return this.#mode !== null;
  }

  static get #sysDark() {
    return this.#darkMedia.matches;
  }

  /**
   * Maps theme modes to provided values
   * @param {string} light Value for light mode
   * @param {string} dark Value for dark mode
   * @param {string} varivant Value for varivant mode
   * @returns {Object} Mapped values
   */
  static getThemeMapper(light, dark, varivant) {
    return {
      [this.LIGHT]: light,
      [this.DARK]: dark,
      [this.VARIVANT]: varivant
    };
  }

  /**
   * Initializes the theme based on system preferences or stored mode
   */
  static init() {
    if (!this.switchable) {
      return;
    }

    this.#darkMedia.addEventListener('change', () => {
      const lastMode = this.#mode;
      this.#clearMode();
      if (lastMode !== this.visualState) {
        this.#notify();
      }
    });

    if (!this.#hasMode) {
      return;
    }

    if (this.#mode === this.DARK) {
      this.#setDark();
    } else if (this.#mode === this.LIGHT) {
      this.#setLight();
    } else if (this.#mode === this.VARIVANT) {
      this.#setVarivant();
    }
  }

  /**
   * Flips the current theme mode (cycles through light, dark, varivant)
   */
  static flip() {
    let nextMode;
    if (!this.#hasMode) {
      nextMode = this.DARK;
    } else {
      const idx = this.#modes.indexOf(this.#mode);
      nextMode = this.#modes[(idx + 1) % this.#modes.length];
    }
    if (nextMode === this.LIGHT) this.#setLight();
    else if (nextMode === this.DARK) this.#setDark();
    else if (nextMode === this.VARIVANT) this.#setVarivant();
    this.#notify();
  }

  static #setVarivant() {
    document.documentElement.setAttribute(this.#modeAttr, this.VARIVANT);
    sessionStorage.setItem(this.#modeKey, this.VARIVANT);
  }

  static #setDark() {
    document.documentElement.setAttribute(this.#modeAttr, this.DARK);
    sessionStorage.setItem(this.#modeKey, this.DARK);
  }

  static #setLight() {
    document.documentElement.setAttribute(this.#modeAttr, this.LIGHT);
    sessionStorage.setItem(this.#modeKey, this.LIGHT);
  }

  static #clearMode() {
    document.documentElement.removeAttribute(this.#modeAttr);
    sessionStorage.removeItem(this.#modeKey);
  }

  /**
   * Notifies other plugins that the theme mode has changed
   */
  static #notify() {
    window.postMessage({ id: this.ID }, '*');
  }
}

Theme.init();

export default Theme;
