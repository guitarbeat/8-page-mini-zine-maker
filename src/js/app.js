import { PDFProcessor } from './pdf-processor.js';
import { UIManager } from './ui-manager.js';
import { toast } from './toast.js';
import { formatFileSize } from './utils.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createIcons, BookOpen, FileText, Edit, Star, ArrowRight, Image as ImageIcon, CheckCircle, Mail } from 'lucide';

// Import assets
const referenceImageUrl = '../assets/reference-back-side.jpg';

class PDFZineMaker {
  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.ui = new UIManager();
    this.referenceImageUrl = referenceImageUrl;
    this.allPageImages = new Array(16).fill(null);
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

      // Initialize Lucide icons
      createIcons({
        icons: {
          BookOpen, FileText, Edit, Star, ArrowRight, ImageIcon, CheckCircle, Mail
        }
      });

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
    this.ui.on('zineTabChanged', (zineNum) => this.updateZineView(zineNum));

    // Theme change re-render if needed, but CSS handles variables usually.
    // If icons were dynamic SVG elements that needed fill updates not handled by CSS current-color, we'd do it here.

    // Button events
    this.ui.elements.printBtn?.addEventListener('click', () => this.handlePrint());
    this.ui.elements.exportPdfBtn?.addEventListener('click', () => this.handleExport());
  }

  /**
   * Check if required libraries are loaded
   */
  checkLibraries() {
    const libraries = {
      // PDF.js is loaded dynamically/async by the processor, but others are bundled
      'App Modules': true
    };

    const missingLibraries = Object.entries(libraries)
      .filter(([_name, loaded]) => !loaded)
      .map(([name]) => name);

    if (missingLibraries.length > 0) {
      console.warn('Libraries not yet loaded:', missingLibraries.join(', '));
      this.ui.setStatus('Loading required libraries... Please wait.', 'loading');

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
      1: { title: 'Front Cover', desc: 'Your story begins here', icon: 'book-open' },
      2: { title: 'Inside Front', desc: 'Introduction or foreword', icon: 'file-text' },
      3: { title: 'Page Content', desc: 'Main content area', icon: 'edit' },
      4: { title: 'Center Spread', desc: 'Focal point of your zine', icon: 'star' },
      5: { title: 'More Content', desc: 'Continue your story', icon: 'arrow-right' },
      6: { title: 'Visual Break', desc: 'Artwork or illustration', icon: 'image' },
      7: { title: 'Back Inside', desc: 'Conclusion or credits', icon: 'check-circle' },
      8: { title: 'Back Cover', desc: 'Contact info & close', icon: 'mail' }
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
      'book-open': 'book-open',
      'file-text': 'file-text',
      'edit': 'edit',
      'star': 'star',
      'arrow-right': 'arrow-right',
      'image': 'image', // Maps to ImageIcon imported as ImageIcon 
      'check-circle': 'check-circle',
      'mail': 'mail'
    };

    // Direct mapping for lucide
    // For 'image', we need to check if we used 'image' or 'image-icon' in lucide setup.
    // In import: Image as ImageIcon. In createIcons: ImageIcon. 
    // Lucide default mapping for Image is 'image'.
    const iconName = icons[content.icon];

    return `
        <div class="placeholder-icon">
          <i data-lucide="${iconName}" width="48" height="48"></i>
        </div>
        <div class="placeholder-content">
          <h4 class="placeholder-title">${content.title}</h4>
          <p class="placeholder-desc">${content.desc}</p>
        </div>
        <div class="placeholder-hint">
          <span class="hint-text">Upload PDF to see your content here</span>
          <div class="hint-arrow">
            <i data-lucide="arrow-right" width="16" height="16"></i>
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
   * Revoke existing object URLs to free memory
   */
  revokePageImages() {
    this.allPageImages.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.allPageImages.fill(null);
  }

  /**
   * Process uploaded PDF file
   * @param {File} file - PDF file to process
   */
  async processPDF(file) {
    try {
      this.ui.showProgress('Starting PDF processing...', 0);

      // Clean up previous images
      this.revokePageImages();

      // Load PDF
      const result = await this.pdfProcessor.loadPDF(file, (progress) => {
        this.ui.showProgress(progress);
      });

      const { numPages, fileName, fileSize } = result;
      // Support up to 16 pages (two 8-page zines)
      const maxPages = Math.min(16, numPages);

      this.ui.setStatus(`PDF loaded: ${fileName} (${formatFileSize(fileSize)}) - ${numPages} pages`);
      toast.success('PDF Loaded', `Successfully loaded ${numPages} pages`);

      // Reset zine tabs
      const zineTabs = document.getElementById('zine-tabs');
      if (zineTabs) {
        if (maxPages > 8) {
          zineTabs.classList.remove('hidden');
          // Reset to zine 1
          document.getElementById('zine-tab-1')?.classList.add('active');
          document.getElementById('zine-tab-2')?.classList.remove('active');
          this.currentZine = 1;
        } else {
          zineTabs.classList.add('hidden');
          this.currentZine = 1;
        }
      }

      // Process pages sequentially for better memory management
      for (let i = 1; i <= maxPages; i++) {
        try {
          const canvas = await this.pdfProcessor.renderPage(i, (progress) => {
            const percent = Math.round((i - 1) / maxPages * 100);
            this.ui.showProgress(progress, percent);
          });

          // Use Blob/Object URL instead of Data URL for better performance
          const blob = await this.pdfProcessor.canvasToBlob(canvas);
          const objectUrl = URL.createObjectURL(blob);
          this.allPageImages[i - 1] = objectUrl;

          // Only update preview if it belongs to current zine view
          const currentZineStart = (this.currentZine - 1) * 8;
          const currentZineEnd = this.currentZine * 8;

          if (i > currentZineStart && i <= currentZineEnd) {
            const displayNum = i > 8 ? i - 8 : i;
            this.ui.updatePagePreview(displayNum, objectUrl);
          }

          const percent = Math.round(i / maxPages * 100);
          this.ui.showProgress(`Page ${i} of ${maxPages} converted`, percent);

        } catch (pageError) {
          console.error(`Failed to process page ${i}:`, pageError);
          toast.warning(`Page ${i} Error`, 'Using blank page as fallback');
          await this.createBlankPage(i);
        }
      }

      // Handle remaining pages
      const targetPages = maxPages > 8 ? 16 : 8;
      for (let i = maxPages + 1; i <= targetPages; i++) {
        await this.createBlankPage(i);
      }

      this.ui.hideProgress();

      let statusMessage;
      if (maxPages > 8) {
        const zine1Pages = 8;
        const zine2Pages = maxPages - 8;
        statusMessage = `Created 2 zines: Zine 1 (${zine1Pages} pages) and Zine 2 (${zine2Pages} pages). Use tabs to switch!`;
      } else {
        const blanksAdded = 8 - maxPages;
        statusMessage = blanksAdded > 0
          ? `Converted ${maxPages} page(s). Filled ${blanksAdded} blank page(s). Ready to print!`
          : `Successfully converted all ${maxPages} pages. Ready to print!`;
      }

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
  async createBlankPage(pageNum) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1400);

    // Add text info
    ctx.font = '40px Arial';
    ctx.fillStyle = '#cccccc';
    ctx.textAlign = 'center';
    ctx.fillText('Blank Page', 500, 700);

    // Use Blob/Object URL for consistency and performance
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const objectUrl = URL.createObjectURL(blob);
        this.allPageImages[pageNum - 1] = objectUrl;

        // Only update if visible in current zine
        const currentZineStart = (this.currentZine - 1) * 8;
        const currentZineEnd = this.currentZine * 8;

        if (pageNum > currentZineStart && pageNum <= currentZineEnd) {
          const displayNum = pageNum > 8 ? pageNum - 8 : pageNum;
          this.ui.updatePagePreview(displayNum, objectUrl);
        }
    } catch (error) {
        console.error('Error creating blank page blob:', error);
    }
  }

  /**
   * Update the zine view based on selected tab
   * @param {number} zineNum - Zine number (1 or 2)
   */
  updateZineView(zineNum) {
    this.currentZine = zineNum;
    const startPage = (zineNum - 1) * 8;

    // Update all 8 slots
    for (let i = 1; i <= 8; i++) {
      const pageIndex = startPage + i - 1;
      const dataUrl = this.allPageImages[pageIndex];

      if (dataUrl) {
        this.ui.updatePagePreview(i, dataUrl);
      }
    }
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

      // Create PDF
      const pdf = new jsPDF({
        orientation: this.orientation || 'landscape',
        unit: 'mm',
        format: this.paperSize || 'a4'
      });

      // Add temp container to DOM
      document.body.appendChild(tempContainer);

      const processZine = async (zineIndex) => {
        // Switch view if needed
        if (this.allPageImages.filter(img => img).length > 8) {
          this.updateZineView(zineIndex);
          // Allow DOM to update
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Clone and prepare zine for export
        const zineClone = this.ui.elements.zine.cloneNode(true);
        this.prepareZineForExport(zineClone);

        // Clear temp container
        tempContainer.innerHTML = '';
        tempContainer.appendChild(zineClone);

        // Capture zine as canvas
        const canvas = await html2canvas(zineClone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: dimensions.width * 4,
          height: dimensions.height * 4
        });

        // Add front side
        const imgData = canvas.toDataURL('image/png', 1.0);
        if (zineIndex > 1) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, dimensions.width, dimensions.height);
        pdf.addPage();
        await this.addBackSideToPDF(pdf);
      };

      if (this.allPageImages.filter(img => img).length > 8) {
        // Render Zine 1 and Zine 2
        console.log('Exporting 16-page zine (2 parts)...');
        await processZine(1);
        await processZine(2);
        // Restore view to 1
        this.updateZineView(1);
      } else {
        // Standard single zine
        console.log('Exporting 8-page zine...');
        await processZine(1);
      }

      // Clean up temporary container
      document.body.removeChild(tempContainer);

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