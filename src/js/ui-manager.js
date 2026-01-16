// Modern UI management class

import { $, $$, addClass, removeClass, debounce } from './utils.js';
import { toast } from './toast.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.currentScale = 100;
    this.isDarkMode = false;
    this.paperSize = 'a4';
    this.orientation = 'landscape';
    this.init();
  }

  /**
   * Initialize UI elements and event listeners
   */
  init() {
    this.cacheElements();
    this.setupTheme();
    this.loadSettings();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      zine: $('.zine'),
      printBtn: $('#printBtn'),
      exportPdfBtn: $('#exportPdfBtn'),
      settingsBtn: $('#settingsBtn'),
      pdfUpload: $('#pdf-upload'),
      uploadStatus: $('#upload-status'),
      uploadZone: $('#upload-zone'),
      uploadLink: $('.upload-link'),
      themeToggle: $('#themeToggle'),
      themeIcon: $('#themeIcon'),
      scaleSlider: $('#scale-slider'),
      scaleValue: $('#scale-value'),
      progressContainer: $('#progress-container'),
      progressFill: $('#progress-fill'),
      progressText: $('#progress-text'),
      actionButtons: $('#action-buttons'),
      settingsPanel: $('#settings-panel'),
      paperSizeSelect: $('#paper-size-select'),
      orientationSelect: $('#orientation-select'),
      settingsCloseBtn: $('.settings-close'),
      settingsOverlay: $('.settings-overlay'),
      toastContainer: $('#toast-container')
    };
  }

  /**
   * Setup theme management
   */
  setupTheme() {
    this.isDarkMode = localStorage.getItem('theme') === 'dark' ||
                     (!localStorage.getItem('theme') &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.updateTheme();
    this.updateThemeToggleAria();
  }

  /**
   * Update theme display
   */
  updateTheme() {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.setAttribute('data-theme', 'dark');
      this.elements.themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
    } else {
      html.setAttribute('data-theme', 'light');
      this.elements.themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
    this.updateThemeToggleAria();
    toast.info('Theme', `Switched to ${this.isDarkMode ? 'dark' : 'light'} mode`);
  }

  /**
   * Update theme toggle accessibility attributes
   */
  updateThemeToggleAria() {
    if (this.elements.themeToggle) {
      this.elements.themeToggle.setAttribute('aria-pressed', this.isDarkMode.toString());
      this.elements.themeToggle.setAttribute('aria-label', `Switch to ${this.isDarkMode ? 'light' : 'dark'} mode`);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Theme toggle
    this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Settings button
    this.elements.settingsBtn?.addEventListener('click', () => this.toggleSettings());

    // Settings panel controls
    this.elements.settingsCloseBtn?.addEventListener('click', () => this.setSettingsVisible(false));
    this.elements.settingsOverlay?.addEventListener('click', () => this.setSettingsVisible(false));
    this.elements.paperSizeSelect?.addEventListener('change', (e) => this.updatePaperSize(e.target.value));
    this.elements.orientationSelect?.addEventListener('change', (e) => this.updateOrientation(e.target.value));

    // Upload zone interactions
    this.elements.uploadZone?.addEventListener('click', () => this.triggerFileUpload());
    this.elements.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.elements.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.elements.uploadZone?.addEventListener('drop', (e) => this.handleFileDrop(e));

    // Upload link
    this.elements.uploadLink?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.triggerFileUpload();
    });

    // Scale slider
    this.elements.scaleSlider?.addEventListener('input', debounce((e) => {
      this.updateScale(parseInt(e.target.value));
    }, 100));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Space bar for theme toggle
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Trigger file upload dialog
   */
  triggerFileUpload() {
    this.elements.pdfUpload?.click();
  }

  /**
   * Handle drag over event
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    addClass(this.elements.uploadZone, 'dragover');
  }

  /**
   * Handle drag leave event
   * @param {DragEvent} e - Drag event
   */
  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    // Only remove class if we're actually leaving the upload zone
    if (!this.elements.uploadZone.contains(e.relatedTarget)) {
      removeClass(this.elements.uploadZone, 'dragover');
    }
  }

  /**
   * Handle file drop event
   * @param {DragEvent} e - Drop event
   */
  handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    removeClass(this.elements.uploadZone, 'dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.emit('fileSelected', { file, source: 'drop' });
      } else {
        toast.error('Invalid File', 'Please drop a PDF file');
      }
    }
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboard(e) {
    // Ctrl+O for file upload
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      this.triggerFileUpload();
    }

    // Ctrl+P for print
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      this.emit('print');
    }

    // Ctrl+S for export
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.emit('export');
    }

    // Enter or Space on upload zone
    if ((e.key === 'Enter' || e.key === ' ') &&
        e.target === this.elements.uploadZone) {
      e.preventDefault();
      this.triggerFileUpload();
    }

    // Escape key closes settings panel
    if (e.key === 'Escape' && !this.elements.settingsPanel?.classList.contains('hidden')) {
      e.preventDefault();
      this.setSettingsVisible(false);
    }
  }

  /**
   * Update scale display and apply transformations
   * @param {number} scale - Scale percentage (50-200)
   */
  updateScale(scale) {
    this.currentScale = Math.max(50, Math.min(200, scale));
    this.elements.scaleValue.textContent = this.currentScale + '%';
    this.elements.scaleSlider.value = this.currentScale;

    // Apply scale to zine container
    if (this.elements.zine) {
      addClass(this.elements.zine, 'scaled');
      this.elements.zine.style.transform = `scale(${this.currentScale / 100})`;
    }

    // Apply scale to page contents
    const pageContents = $$('.page-content');
    pageContents.forEach(content => {
      addClass(content, 'scaled');
      content.style.transform = `scale(${this.currentScale / 100})`;
    });

    // Apply scale to images
    const images = $$('.page-content img');
    images.forEach(img => {
      addClass(img, 'scaled');
      img.style.transform = `scale(${this.currentScale / 100})`;
    });
  }

  /**
   * Show progress indicator
   * @param {string} text - Progress text
   * @param {number} percent - Progress percentage (0-100)
   */
  showProgress(text, percent = 0) {
    if (this.elements.progressContainer) {
      this.elements.progressContainer.classList.remove('hidden');
      this.elements.progressText.textContent = text;

      if (this.elements.progressFill) {
        this.elements.progressFill.style.width = percent + '%';
      }
    }

    // Update upload zone to show processing state
    this.setUploadZoneProcessing(true);
  }

  /**
   * Set upload zone processing state
   * @param {boolean} processing - Whether processing is active
   */
  setUploadZoneProcessing(processing) {
    if (processing) {
      this.elements.uploadZone?.classList.add('processing');
      this.elements.uploadZone?.setAttribute('aria-disabled', 'true');
    } else {
      this.elements.uploadZone?.classList.remove('processing');
      this.elements.uploadZone?.removeAttribute('aria-disabled');
    }
  }

  /**
   * Hide progress indicator
   */
  hideProgress() {
    if (this.elements.progressContainer) {
      this.elements.progressContainer.classList.add('hidden');
    }

    // Reset upload zone state
    this.setUploadZoneProcessing(false);
  }

  /**
   * Update upload status
   * @param {string} text - Status text
   * @param {string} type - Status type ('success', 'error', 'info')
   */
  setStatus(text, type = 'info') {
    if (this.elements.uploadStatus) {
      this.elements.uploadStatus.textContent = text;
      this.elements.uploadStatus.className = 'text-center text-muted';

      // Remove existing status classes
      removeClass(this.elements.uploadStatus, 'text-green-600', 'text-red-500', 'text-blue-600', 'font-bold');

      // Add new status class
      switch (type) {
        case 'success':
          addClass(this.elements.uploadStatus, 'text-green-600', 'font-bold');
          break;
        case 'error':
          addClass(this.elements.uploadStatus, 'text-red-500', 'font-bold');
          break;
        case 'loading':
          addClass(this.elements.uploadStatus, 'text-blue-600', 'font-bold');
          break;
      }
    }
  }

  /**
   * Update page preview image
   * @param {number} pageNum - Page number
   * @param {string} dataUrl - Image data URL
   */
  updatePagePreview(pageNum, dataUrl) {
    const imgElement = $(`#preview-${pageNum}`);
    if (!imgElement) {
      console.error(`Preview image element for page ${pageNum} not found`);
      return;
    }

    // Hide placeholder immediately when we start loading
    const placeholder = $(`#content-${pageNum} .placeholder`);
    if (placeholder) {
      placeholder.style.transition = 'opacity 0.3s ease';
      placeholder.style.opacity = '0';
    }

    // Set up image load handlers
    imgElement.onload = () => {
      console.log(`Page ${pageNum} preview loaded successfully`);
      addClass(imgElement, 'scale-in');

      // Hide placeholder completely after image loads
      if (placeholder) {
        setTimeout(() => {
          placeholder.style.display = 'none';
        }, 300);
      }
    };

    imgElement.onerror = (error) => {
      console.error(`Failed to load page ${pageNum} preview:`, error);
      // Show placeholder again on error
      if (placeholder) {
        placeholder.style.opacity = '1';
        placeholder.style.display = 'flex';
      }
      toast.error(`Page ${pageNum} Error`, 'Failed to load page preview');
    };

    // Set the image source
    try {
      imgElement.src = dataUrl;
      console.log(`Setting page ${pageNum} preview src, data URL length: ${dataUrl.length}`);
    } catch (error) {
      console.error(`Error setting page ${pageNum} preview src:`, error);
      if (placeholder) {
        placeholder.style.opacity = '1';
        placeholder.style.display = 'flex';
      }
    }
  }

  /**
   * Check if content is loaded
   * @returns {boolean} True if content is loaded
   */
  hasContent() {
    const images = $$('.page-content img');
    return Array.from(images).some(img => img.src && img.src !== '');
  }

  /**
   * Toggle settings panel visibility
   */
  toggleSettings() {
    const isVisible = !this.elements.settingsPanel?.classList.contains('hidden');
    this.setSettingsVisible(!isVisible);

    // Focus management
    if (!isVisible) {
      // Panel is about to be shown, focus the first focusable element
      setTimeout(() => {
        const firstFocusable = this.elements.settingsPanel?.querySelector('input, button, select, textarea');
        firstFocusable?.focus();
      }, 100);
    }
  }

  /**
   * Set settings panel visibility
   * @param {boolean} visible - Whether to show the settings panel
   */
  setSettingsVisible(visible) {
    if (visible) {
      this.elements.settingsPanel?.classList.remove('hidden');
      this.elements.settingsBtn?.setAttribute('aria-expanded', 'true');
    } else {
      this.elements.settingsPanel?.classList.add('hidden');
      this.elements.settingsBtn?.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Show action buttons when content is loaded
   */
  showActionButtons() {
    this.elements.actionButtons?.classList.remove('hidden');
    this.elements.zine?.classList.add('has-content');

    // Announce to screen readers that content is ready
    this.setStatus('PDF processed successfully. Ready to print or export.', 'success');
  }

  /**
   * Hide action buttons
   */
  hideActionButtons() {
    this.elements.actionButtons?.classList.add('hidden');
    this.setSettingsVisible(false); // Also hide settings when hiding actions
  }

  /**
   * Event emitter pattern
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const customEvent = new CustomEvent(event, { detail: data });
    document.dispatchEvent(customEvent);
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    this.paperSize = localStorage.getItem('paperSize') || 'a4';
    this.orientation = localStorage.getItem('orientation') || 'landscape';

    // Update UI elements
    if (this.elements.paperSizeSelect) {
      this.elements.paperSizeSelect.value = this.paperSize;
    }
    if (this.elements.orientationSelect) {
      this.elements.orientationSelect.value = this.orientation;
    }
  }

  /**
   * Update paper size setting
   * @param {string} paperSize - New paper size
   */
  updatePaperSize(paperSize) {
    this.paperSize = paperSize;
    localStorage.setItem('paperSize', paperSize);
    this.emit('paperSizeChanged', { paperSize, orientation: this.orientation });
    toast.info('Paper Size', `Changed to ${this.getPaperSizeLabel(paperSize)}`);
  }

  /**
   * Update orientation setting
   * @param {string} orientation - New orientation
   */
  updateOrientation(orientation) {
    this.orientation = orientation;
    localStorage.setItem('orientation', orientation);
    this.emit('orientationChanged', { paperSize: this.paperSize, orientation });
    toast.info('Orientation', `Changed to ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`);
  }

  /**
   * Get paper size dimensions in mm
   * @param {string} paperSize - Paper size identifier
   * @param {string} orientation - Orientation (landscape/portrait)
   * @returns {Object} Dimensions object with width and height
   */
  getPaperDimensions(paperSize, orientation) {
    const dimensions = {
      a4: { width: 210, height: 297 },
      a3: { width: 297, height: 420 },
      letter: { width: 215.9, height: 279.4 }, // 8.5 × 11 inches in mm
      legal: { width: 215.9, height: 355.6 },  // 8.5 × 14 inches in mm
      a5: { width: 148, height: 210 }
    };

    const size = dimensions[paperSize] || dimensions.a4;

    // Swap dimensions for portrait
    if (orientation === 'portrait') {
      return { width: size.height, height: size.width };
    }

    return size;
  }

  /**
   * Get human-readable paper size label
   * @param {string} paperSize - Paper size identifier
   * @returns {string} Human-readable label
   */
  getPaperSizeLabel(paperSize) {
    const labels = {
      a4: 'A4',
      a3: 'A3',
      letter: 'Letter',
      legal: 'Legal',
      a5: 'A5'
    };
    return labels[paperSize] || 'A4';
  }

  /**
   * Event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  }
}