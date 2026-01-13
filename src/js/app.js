// Modern PDF Zine Maker - Main Application

import { PDFProcessor } from './pdf-processor.js';
import { UIManager } from './ui-manager.js';
import { toast } from './toast.js';
import { delay, formatFileSize } from './utils.js';

class PDFZineMaker {
  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.ui = new UIManager();
    this.referenceImageUrl = 'src/assets/reference-back-side.jpg';
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      await this.pdfProcessor.initialize();
      this.setupEventListeners();
      this.checkLibraries();
      this.generatePagePlaceholders();
      this.ui.setStatus('Upload a PDF file to get started', 'info');
    } catch (error) {
      console.error('Initialization error:', error);
      this.ui.setStatus('Failed to initialize. Please refresh the page and check your internet connection.', 'error');
      toast.error('Initialization Error', 'Failed to load required libraries. Please check your internet connection.');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File upload events
    this.ui.elements.pdfUpload?.addEventListener('change', (e) => this.handleFileUpload(e));

    // UI events
    this.ui.on('fileSelected', (data) => this.processPDF(data.file));
    this.ui.on('print', () => this.handlePrint());
    this.ui.on('export', () => this.handleExport());
    this.ui.on('paperSizeChanged', (data) => this.updatePaperSettings(data));
    this.ui.on('orientationChanged', (data) => this.updatePaperSettings(data));

    // Button events
    this.ui.elements.printBtn?.addEventListener('click', () => this.handlePrint());
    this.ui.elements.exportPdfBtn?.addEventListener('click', () => this.handleExport());
  }

  /**
   * Check if required libraries are loaded
   */
  checkLibraries() {
    const libraries = {
      'PDF.js': typeof pdfjsLib !== 'undefined',
      'jsPDF': typeof jspdf !== 'undefined',
      'html2canvas': typeof html2canvas !== 'undefined'
    };

    const missingLibraries = Object.entries(libraries)
      .filter(([name, loaded]) => !loaded)
      .map(([name]) => name);

    if (missingLibraries.length > 0) {
      console.warn('Libraries not yet loaded:', missingLibraries.join(', '));
      this.ui.setStatus(`Loading required libraries... Please wait.`, 'loading');

      // Wait for libraries to load
      setTimeout(() => this.checkLibraries(), 1000);
    }
  }

  /**
   * Generate engaging page placeholders
   */
  generatePagePlaceholders() {
    // Page content ideas for different positions in the zine
    const pageContent = {
      1: { title: "Front Cover", desc: "Your story begins here", icon: "book-open" },
      2: { title: "Inside Front", desc: "Introduction or foreword", icon: "file-text" },
      3: { title: "Page Content", desc: "Main content area", icon: "edit" },
      4: { title: "Center Spread", desc: "Focal point of your zine", icon: "star" },
      5: { title: "More Content", desc: "Continue your story", icon: "arrow-right" },
      6: { title: "Visual Break", desc: "Artwork or illustration", icon: "image" },
      7: { title: "Back Inside", desc: "Conclusion or credits", icon: "check-circle" },
      8: { title: "Back Cover", desc: "Contact info & close", icon: "mail" }
    };

    // Pages that get rotated in the final zine layout
    const rotatedPages = [5, 4, 3, 2];

    for (let i = 1; i <= 8; i++) {
      const page = document.createElement('article');
      page.className = 'fade-in-up';
      page.style.animationDelay = `${i * 0.1}s`;

      // Add rotation class for pages that will be rotated in print
      if (rotatedPages.includes(i)) {
        page.classList.add('preview-rotated');
      }

      const content = document.createElement('div');
      content.className = 'page-content';
      content.id = `content-${i}`;

      const pageNumber = document.createElement('div');
      pageNumber.className = 'page-number';
      pageNumber.textContent = i;

      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder enhanced';
      placeholder.innerHTML = this.createPlaceholderContent(i, pageContent[i]);

      const imgPreview = document.createElement('img');
      imgPreview.id = `preview-${i}`;
      imgPreview.alt = `Page ${i} preview`;

      content.appendChild(pageNumber);
      content.appendChild(placeholder);
      content.appendChild(imgPreview);
      page.appendChild(content);
      this.ui.elements.zine.appendChild(page);
    }
  }

  /**
   * Create engaging placeholder content for each page
   * @param {number} pageNum - Page number
   * @param {Object} content - Content info for this page
   * @returns {string} HTML content
   */
  createPlaceholderContent(pageNum, content) {
    const icons = {
      'book-open': `<path d="M2 3h6a2 2 0 0 0 2 2v2H6v-2a2 2 0 0 0-2-2H2V3zm6 5v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8h6z"/><path d="M12 3h6a2 2 0 0 0 2 2v2h-6V5a2 2 0 0 0-2-2h-2V3z"/><path d="M18 8v9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8h6z"/>`,
      'file-text': `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
      'edit': `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
      'star': `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
      'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
      'image': `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
      'check-circle': `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
      'mail': `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>`
    };

    return `
      <div class="placeholder-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${icons[content.icon]}
        </svg>
      </div>
      <div class="placeholder-content">
        <h4 class="placeholder-title">${content.title}</h4>
        <p class="placeholder-desc">${content.desc}</p>
      </div>
      <div class="placeholder-hint">
        <span class="hint-text">Upload PDF to see your content here</span>
        <div class="hint-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 13l3 3 3-3"/><path d="M12 2v14"/><path d="M17 9l-5 5-5-5"/>
          </svg>
        </div>
      </div>
    `;
  }

  /**
   * Handle file upload event
   * @param {Event} event - File input change event
   */
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      await this.processPDF(file);
    }
  }

  /**
   * Process uploaded PDF file
   * @param {File} file - PDF file to process
   */
  async processPDF(file) {
    try {
      this.ui.showProgress('Starting PDF processing...', 0);

      // Load PDF
      const result = await this.pdfProcessor.loadPDF(file, (progress) => {
        this.ui.showProgress(progress);
      });

      const { pdf, numPages, fileName, fileSize } = result;
      const maxPages = Math.min(8, numPages);

      this.ui.setStatus(`PDF loaded: ${fileName} (${formatFileSize(fileSize)}) - ${numPages} pages`);
      toast.success('PDF Loaded', `Successfully loaded ${numPages} pages`);

      // Process pages sequentially for better memory management
      for (let i = 1; i <= maxPages; i++) {
        try {
          const canvas = await this.pdfProcessor.renderPage(i, (progress) => {
            const percent = Math.round((i - 1) / maxPages * 100);
            this.ui.showProgress(progress, percent);
          });

          const dataUrl = this.pdfProcessor.canvasToDataURL(canvas);
          this.ui.updatePagePreview(i, dataUrl);

          const percent = Math.round(i / maxPages * 100);
          this.ui.showProgress(`Page ${i} of ${maxPages} converted`, percent);

        } catch (pageError) {
          console.error(`Failed to process page ${i}:`, pageError);
          toast.warning(`Page ${i} Error`, 'Using blank page as fallback');
          this.createBlankPage(i);
        }
      }

      // Handle remaining pages if PDF has fewer than 8 pages
      for (let i = maxPages + 1; i <= 8; i++) {
        this.createBlankPage(i);
      }

      this.ui.hideProgress();
      const blanksAdded = 8 - maxPages;
      const statusMessage = blanksAdded > 0
        ? `Converted ${maxPages} page(s). Filled ${blanksAdded} blank page(s). Ready to print!`
        : `Successfully converted all ${maxPages} pages. Ready to print!`;

      this.ui.setStatus(statusMessage, 'success');
      toast.success('Processing Complete', statusMessage);

      // Show action buttons now that content is loaded
      this.ui.showActionButtons();

    } catch (error) {
      console.error('PDF processing error:', error);
      this.ui.hideProgress();
      this.ui.setStatus(error.message, 'error');
      toast.error('Processing Error', error.message);
    }
  }

  /**
   * Create a blank page as fallback
   * @param {number} pageNum - Page number
   */
  createBlankPage(pageNum) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    this.ui.updatePagePreview(pageNum, dataUrl);
  }

  /**
   * Handle print action
   */
  handlePrint() {
    if (!this.ui.hasContent()) {
      toast.error('No Content', 'Please upload a PDF first before printing');
      return;
    }

    try {
      this.createPrintLayout();
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Print Error', 'Failed to create print layout');
    }
  }

  /**
   * Update paper settings
   * @param {Object} settings - Paper size and orientation settings
   */
  updatePaperSettings(settings) {
    this.paperSize = settings.paperSize;
    this.orientation = settings.orientation;
    console.log(`Paper settings updated: ${settings.paperSize} ${settings.orientation}`);
  }

  /**
   * Create print layout with front and back sides
   */
  createPrintLayout() {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast.error('Popup Blocked', 'Please allow popups for this site to enable printing');
      return;
    }

    const zineContent = this.ui.elements.zine.outerHTML;

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Zine Print Layout</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: ${this.paperSize || 'a4'} ${this.orientation || 'landscape'}; margin: 0; }
          body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; }
          .print-page { width: 100%; height: 100vh; page-break-after: always; position: relative; display: block; }
          .print-page:last-child { page-break-after: auto; }
          .front-side { display: grid; grid-template-areas: "page5 page4 page3 page2" "page6 page7 page8 page1"; width: 100%; height: 100%; gap: 0; padding: 0; margin: 0; }
          .back-side { background-image: url('${this.referenceImageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center; transform: rotate(180deg); width: 100%; height: 100%; }
          .zine { display: grid; grid-template-areas: "page5 page4 page3 page2" "page6 page7 page8 page1"; width: 100%; height: 100%; gap: 0; padding: 0; margin: 0; }
          .zine > * { width: 100%; height: 100%; border: none; box-shadow: none; display: grid; grid-template-columns: repeat(15, 1fr); grid-template-rows: repeat(21, 1fr); background-color: white; overflow: hidden; position: relative; }
          .zine > *:nth-child(1) { grid-area: page1; }
          .zine > *:nth-child(2) { grid-area: page2; }
          .zine > *:nth-child(3) { grid-area: page3; }
          .zine > *:nth-child(4) { grid-area: page4; }
          .zine > *:nth-child(5) { grid-area: page5; }
          .zine > *:nth-child(6) { grid-area: page6; }
          .zine > *:nth-child(7) { grid-area: page7; }
          .zine > *:nth-child(8) { grid-area: page8; }
          .zine > *:nth-child(8), .zine > *:nth-child(1), .zine > *:nth-child(2), .zine > *:nth-child(7) { transform: rotate(180deg); }
          .page-content { grid-column: 1 / -1; grid-row: 1 / -1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
          .page-content img { width: 100%; height: 100%; object-fit: contain; }
          .page-number { display: none; }
        </style>
      </head>
      <body>
        <div class="print-page front-side">${zineContent}</div>
        <div class="print-page back-side"></div>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  /**
   * Handle PDF export action
   */
  async handleExport() {
    if (!this.ui.hasContent()) {
      toast.error('No Content', 'Please upload a PDF first before exporting');
      return;
    }

    try {
      await this.exportAsPDF();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Error', error.message || 'Failed to export PDF');
    }
  }

  /**
   * Export zine as PDF
   */
  async exportAsPDF() {
    try {
      // Show loading state
      this.ui.elements.exportPdfBtn.disabled = true;
      this.ui.elements.exportPdfBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Exporting...
      `;

      toast.info('Export Started', 'Generating PDF... This may take a moment.');

      // Create temporary container for rendering
      const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = dimensions.width + 'mm';
      tempContainer.style.height = dimensions.height + 'mm';
      tempContainer.style.background = 'white';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';

      // Clone and prepare zine for export
      const zineClone = this.ui.elements.zine.cloneNode(true);
      this.prepareZineForExport(zineClone);

      tempContainer.appendChild(zineClone);
      document.body.appendChild(tempContainer);

      // Configure html2canvas
      window.html2canvas.logging = false;

      // Capture zine as canvas
      const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
      const canvas = await html2canvas(zineClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: dimensions.width * 4,
        height: dimensions.height * 4
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: this.orientation || 'landscape',
        unit: 'mm',
        format: this.paperSize || 'a4'
      });

      // Add front side
      const imgData = canvas.toDataURL('image/png', 1.0);
      const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
      pdf.addImage(imgData, 'PNG', 0, 0, dimensions.width, dimensions.height);

      // Add back side
      pdf.addPage();
      await this.addBackSideToPDF(pdf);

      // Generate filename and save
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `zine-export-${timestamp}.pdf`;
      pdf.save(filename);

      // Reset button
      this.ui.elements.exportPdfBtn.disabled = false;
      this.ui.elements.exportPdfBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export PDF
      `;

      this.ui.setStatus(`PDF exported successfully as ${filename}`, 'success');
      toast.success('Export Complete', `Saved as ${filename}`);

    } catch (error) {
      // Reset button on error
      this.ui.elements.exportPdfBtn.disabled = false;
      this.ui.elements.exportPdfBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export PDF
      `;

      throw error;
    }
  }

  /**
   * Prepare zine clone for PDF export
   * @param {Element} zineClone - Cloned zine element
   */
  prepareZineForExport(zineClone) {
    zineClone.style.display = 'grid';
    zineClone.style.gridTemplateAreas = '"page5 page4 page3 page2" "page6 page7 page8 page1"';
    zineClone.style.width = '100%';
    zineClone.style.height = '100%';
    zineClone.style.gap = '0';
    zineClone.style.padding = '0';
    zineClone.style.margin = '0';
    zineClone.style.position = 'fixed';
    zineClone.style.top = '0';
    zineClone.style.left = '0';

    // Apply rotation for proper folding
    const pages = zineClone.querySelectorAll('article');
    pages.forEach((page, index) => {
      page.style.width = '100%';
      page.style.height = '100%';
      page.style.border = 'none';
      page.style.boxShadow = 'none';

      const pageNumber = index + 1;
      if (pageNumber === 5 || pageNumber === 4 || pageNumber === 3 || pageNumber === 2) {
        page.style.transform = 'rotate(180deg)';
      }
    });

    // Add cut line
    const cutLine = document.createElement('div');
    cutLine.style.position = 'absolute';
    cutLine.style.top = '50%';
    cutLine.style.left = '0';
    cutLine.style.right = '0';
    cutLine.style.height = '2px';
    cutLine.style.background = 'repeating-linear-gradient(to right, #000 0px, #000 10px, transparent 10px, transparent 20px)';
    cutLine.style.zIndex = '10';
    cutLine.style.pointerEvents = 'none';
    zineClone.appendChild(cutLine);
  }

  /**
   * Add back side with reference image to PDF
   * @param {jsPDF} pdf - PDF document
   */
  async addBackSideToPDF(pdf) {
    return new Promise((resolve, reject) => {
      const backSideCanvas = document.createElement('canvas');
      const backSideContext = backSideCanvas.getContext('2d');
      const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
      backSideCanvas.width = dimensions.width * 4;
      backSideCanvas.height = dimensions.height * 4;

      const referenceImg = new Image();
      referenceImg.crossOrigin = 'anonymous';
      referenceImg.onload = () => {
        try {
          backSideContext.save();
          backSideContext.translate(backSideCanvas.width / 2, backSideCanvas.height / 2);
          backSideContext.rotate(Math.PI);
          backSideContext.drawImage(referenceImg, -backSideCanvas.width / 2, -backSideCanvas.height / 2, backSideCanvas.width, backSideCanvas.height);
          backSideContext.restore();

          const backSideData = backSideCanvas.toDataURL('image/png', 1.0);
          const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
          pdf.addImage(backSideData, 'PNG', 0, 0, dimensions.width, dimensions.height);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      referenceImg.onerror = () => reject(new Error('Failed to load reference image'));
      referenceImg.src = this.referenceImageUrl;
    });
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PDFZineMaker();
});