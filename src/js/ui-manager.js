// Modern UI management class
import mitt from 'mitt';
import { PAPER_SIZES } from './constants.js';
import clsx from 'clsx';
import { debounce } from './utils.js';
import { toast } from './toast.js';

export class UIManager {
  constructor() {
    this.emitter = mitt();
    this.elements = {};
    this.paperSize = 'a4';
    this.orientation = 'landscape';
    this.init();
  }

  /**
   * Initialize UI elements and event listeners
   */
  init() {
    this.cacheElements();
    this.renderPaperSizeOptions();
    this.loadSettings();
    this.updatePreviewLayout();
    this.setupEventListeners();
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    const $ = (selector) => document.querySelector(selector);

    this.elements = {
      // Main Containers
      uploadZone: $('#upload-zone'),
      previewArea: $('#preview-area'),
      actionButtons: $('#action-buttons'),
      previewDescription: $('#preview-description'),
      zineContainer: $('#zine-container'),
      zine: $('#zine-container'), // Compatibility

      // Interactions
      printBtn: $('#printBtn'),
      exportPdfBtn: $('#exportPdfBtn'),
      pdfUpload: $('#pdf-upload'),
      uploadStatus: $('#upload-status'),

      // Progress
      progressContainer: $('#progress-container'),
      progressFill: $('#progress-fill'),
      progressText: $('#progress-text'),
      progressSubtext: $('#progress-subtext'),

      // Settings
      paperSizeSelect: $('#paper-size-select'),
      orientationSelect: $('#orientation-select'),

      // Toast
      toastContainer: $('#toast-container'),

      // Zine Tabs
      zineTabs: $('#zine-tabs'),
      zineTab1: $('#zine-tab-1'),
      zineTab2: $('#zine-tab-2')
    };
  }

  /**
   * Render paper size options from constants
   */
  renderPaperSizeOptions() {
    if (!this.elements.paperSizeSelect) return;

    this.elements.paperSizeSelect.innerHTML = Object.entries(PAPER_SIZES)
      .map(([id, data]) => `<option value="${id}">${data.label}</option>`)
      .join('');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Settings
    this.elements.paperSizeSelect?.addEventListener('change', (e) => this.updatePaperSize(e.target.value));
    this.elements.orientationSelect?.addEventListener('change', (e) => this.updateOrientation(e.target.value));

    // Zine tabs
    this.elements.zineTab1?.addEventListener('click', () => {
      this.setActiveTab(1);
      this.emitter.emit('zineTabChanged', 1);
    });

    this.elements.zineTab2?.addEventListener('click', () => {
      this.setActiveTab(2);
      this.emitter.emit('zineTabChanged', 2);
    });

    // Upload interactions
    this.elements.uploadZone?.addEventListener('click', () => this.triggerFileUpload());
    this.elements.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.elements.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.elements.uploadZone?.addEventListener('drop', (e) => this.handleFileDrop(e));

    this.elements.pdfUpload?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.emitter.emit('fileSelected', file);
    });

    // Keyboard
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * Set the UI to "ready" state (enable preview area and action buttons)
   */
  setReady(ready, description = null) {
    if (ready) {
      this.elements.previewArea?.classList.remove('opacity-30', 'pointer-events-none');
      this.elements.actionButtons?.classList.remove('hidden');
    } else {
      this.elements.previewArea?.classList.add('opacity-30', 'pointer-events-none');
      this.elements.actionButtons?.classList.add('hidden');
    }

    if (description && this.elements.previewDescription) {
      this.elements.previewDescription.textContent = description;
    }
  }

  /**
   * Update progress bar
   */
  updateProgress(percent) {
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${percent}%`;
    }
  }

  /**
   * Update status message
   */
  setStatus(message, type = 'info') {
    if (this.elements.uploadStatus) {
      this.elements.uploadStatus.textContent = message;
      this.elements.uploadStatus.className = `text-[11px] uppercase font-bold tracking-wider ${type === 'error' ? 'text-red-500' : type === 'success' ? 'text-green-500' : 'text-gray-400'
        }`;
    }
  }

  setActiveTab(tabNum) {
    if (this.elements.zineTab1 && this.elements.zineTab2) {
      const activeClasses = 'bg-white shadow-sm';
      const inactiveClasses = 'text-gray-400';

      if (tabNum === 1) {
        this.elements.zineTab1.classList.add(...activeClasses.split(' '));
        this.elements.zineTab1.classList.remove(...inactiveClasses.split(' '));
        this.elements.zineTab2.classList.remove(...activeClasses.split(' '));
        this.elements.zineTab2.classList.add(...inactiveClasses.split(' '));
      } else {
        this.elements.zineTab2.classList.add(...activeClasses.split(' '));
        this.elements.zineTab2.classList.remove(...inactiveClasses.split(' '));
        this.elements.zineTab1.classList.remove(...activeClasses.split(' '));
        this.elements.zineTab1.classList.add(...inactiveClasses.split(' '));
      }
    }
  }

  triggerFileUpload() {
    this.elements.pdfUpload?.click();
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.elements.uploadZone) {
      this.elements.uploadZone.classList.add('dragover');
    }
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.elements.uploadZone && !this.elements.uploadZone.contains(e.relatedTarget)) {
      this.elements.uploadZone.classList.remove('dragover');
    }
  }

  handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.elements.uploadZone) {
      this.elements.uploadZone.classList.remove('dragover');
    }

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      this.emitter.emit('fileSelected', files[0]);
    } else {
      toast.error('Invalid File', 'Please drop a valid PDF file');
    }
  }

  handleKeyboard(e) {
    // Global keyboard shortcuts
    if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.emitter.emit('print');
    }
  }

  showProgress(show, text = 'Processing PDF...', subtext = '') {
    if (show) {
      this.elements.progressContainer?.classList.remove('hidden');
    } else {
      this.elements.progressContainer?.classList.add('hidden');
    }

    if (this.elements.progressText) this.elements.progressText.textContent = text;
    if (this.elements.progressSubtext) this.elements.progressSubtext.textContent = subtext;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const savedPaperSize = localStorage.getItem('paperSize');
    const savedOrientation = localStorage.getItem('orientation');

    if (savedPaperSize) {
      this.paperSize = savedPaperSize;
      if (this.elements.paperSizeSelect) this.elements.paperSizeSelect.value = savedPaperSize;
    }

    if (savedOrientation) {
      this.orientation = savedOrientation;
      if (this.elements.orientationSelect) this.elements.orientationSelect.value = savedOrientation;
    }
  }

  updatePaperSize(paperSize) {
    this.paperSize = paperSize;
    localStorage.setItem('paperSize', paperSize);
    this.updatePreviewLayout();
    this.emitter.emit('paperSizeChanged', { paperSize, orientation: this.orientation });
  }

  updateOrientation(orientation) {
    this.orientation = orientation;
    localStorage.setItem('orientation', orientation);
    this.updatePreviewLayout();
    this.emitter.emit('orientationChanged', { paperSize: this.paperSize, orientation });
  }

  updatePreviewLayout() {
    const sheet = document.querySelector('.print-sheet');
    if (sheet) {
      if (this.orientation === 'landscape') {
        sheet.style.aspectRatio = '1.414 / 1';
      } else {
        sheet.style.aspectRatio = '1 / 1.414';
      }
    }
  }

  getPaperDimensions(paperSize, orientation) {
    const size = PAPER_SIZES[paperSize] || PAPER_SIZES.a4;

    if (orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }

    return { width: size.width, height: size.height };
  }

  getPaperSizeLabel(paperSize) {
    return PAPER_SIZES[paperSize]?.label || 'A4';
  }

  hasContent() {
    return this.elements.zineContainer && this.elements.zineContainer.children.length > 0;
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }
}