import { PDFProcessor } from './pdf-processor.js';
import { UIManager } from './ui-manager.js';
import { toast } from './toast.js';
import { formatFileSize } from './utils.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Import assets
import referenceImageUrl from '../assets/reference-back-side.jpg';

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
      this.ui.generateLayout(8); // Default to 8 pages
      this.ui.setStatus('Upload a PDF file to get started', 'info');
    } catch (error) {
      console.error('Initialization error:', error);
      this.ui.setStatus('Failed to initialize. Please refresh the page.', 'error');
      toast.error('Initialization Error', 'Failed to load required libraries.');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // UI Events
    this.ui.on('fileSelected', (file) => this.handleFileSelected(file));
    this.ui.on('processAndPreview', () => this.handleProcessAndPreview());
    this.ui.on('print', () => this.handlePrint());
    this.ui.on('export', () => this.handleExport());
    this.ui.on('paperSizeChanged', (data) => this.updatePaperSettings(data));
    this.ui.on('orientationChanged', (data) => this.updatePaperSettings(data));
    this.ui.on('pagesSwapped', (data) => this.handlePagesSwapped(data));

    // Direct element listeners if needed (already handled by UIManager)
    this.ui.elements.printBtn?.addEventListener('click', () => this.handlePrint());
    this.ui.elements.exportPdfBtn?.addEventListener('click', () => this.handleExport());
  }

  setupInteractiveTicks() {
    // Ported from palette-interactive-ticks
    // This allows clicking labels or specific areas to jump to values

    // We could add visual ticks in HTML, but for now we'll just ensure 
    // the sliders themselves feel robust.
  }

  checkLibraries() {
    // Basic connectivity check
    if (!window.jspdf) {
      console.warn('PDF library not yet loaded...');
    }
  }

  handleFileSelected(file) {
    this.selectedFile = file;
    this.ui.setStatus(`File selected: ${file.name} (${formatFileSize(file.size)})`, 'success');
    // Start processing immediately on selection for better UX
    this.processPDF(file);
  }

  async processPDF(file) {
    try {
      this.ui.showProgress(true, 'Reading PDF...', '0%');

      const result = await this.pdfProcessor.loadPDF(file, (progress) => {
        this.ui.updateProgress(progress);
      });

      const { numPages } = result;
      this.selectedLayout = numPages > 8 ? 16 : 8;
      const maxPages = Math.min(this.selectedLayout, numPages);

      // Handle UI state and description
      const description = this.selectedLayout > 8
        ? 'Rearranged into two 8-page layouts (16 pages total).'
        : 'Rearranged into a standard 8-page mini-zine layout.';

      this.ui.generateLayout(this.selectedLayout);

      this.ui.setReady(true, description);
      this.allPageImages = new Array(16).fill(null);

      // Process pages
      for (let i = 1; i <= maxPages; i++) {
        const canvas = await this.pdfProcessor.renderPage(i);
        const url = await this.pdfProcessor.canvasToBlob(canvas);

        // Revoke old URL if it exists
        if (this.allPageImages[i - 1]) {
          this.pdfProcessor.revokeBlobUrl(this.allPageImages[i - 1]);
        }

        this.allPageImages[i - 1] = url;
        this.ui.updatePagePreview(i - 1, url);

        const percent = Math.round((i / maxPages) * 100);
        this.ui.showProgress(true, `Processing Page ${i} of ${maxPages}`, `${percent}%`);
        this.ui.updateProgress(percent);
      }

      // Fill blanks - using the same blank page logic
      for (let i = maxPages + 1; i <= (this.selectedLayout); i++) {
        await this.createBlankPage(i);
      }

      this.ui.showProgress(false);
      this.ui.setStatus(`Successfully processed ${numPages} pages`, 'success');
      toast.success('Done!', 'Your zine is ready to print.');

    } catch (error) {
      console.error('PDF Error:', error);
      this.ui.showProgress(false);
      toast.error('Error', 'Failed to process PDF.');
    }
  }

  async createBlankPage(pageNum) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1400);
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLANK', 500, 700);

    const url = await this.pdfProcessor.canvasToBlob(canvas);

    // Revoke old URL if it exists
    if (this.allPageImages[pageNum - 1]) {
      this.pdfProcessor.revokeBlobUrl(this.allPageImages[pageNum - 1]);
    }

    this.allPageImages[pageNum - 1] = url;
    this.ui.updatePagePreview(pageNum - 1, url);
  }

  handlePagesSwapped({ fromIndex, toIndex }) {
    // Swap images in array
    const temp = this.allPageImages[fromIndex];
    this.allPageImages[fromIndex] = this.allPageImages[toIndex];
    this.allPageImages[toIndex] = temp;

    // Update previews
    this.ui.updatePagePreview(fromIndex, this.allPageImages[fromIndex]);
    this.ui.updatePagePreview(toIndex, this.allPageImages[toIndex]);

    toast.info('Pages swapped');
  }

  updateZineView(zineNum) {
    // Update the UI to show the correct 8 pages for the selected zine (1 or 2)
    const startPageIndex = (zineNum - 1) * 8;
    for (let i = 0; i < 8; i++) {
      const globalPageIndex = startPageIndex + i;
      const imageUrl = this.allPageImages[globalPageIndex];
      this.ui.updatePagePreview(i, imageUrl); // Update the 8 visible cells
    }
  }

  updatePaperSettings(settings) {
    this.paperSize = settings.paperSize;
    this.orientation = settings.orientation;
  }

  handlePrint() {
    if (!this.ui.hasContent()) { return; }
    this.createPrintLayout();
  }

  createPrintLayout() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Blocked', 'Please allow popups.');
      return;
    }

    const zineSheets = [];

    // Get HTML for all sheets
    document.querySelectorAll('.zine-grid').forEach(grid => {
      zineSheets.push(grid.innerHTML);
    });

    const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');
    const scale = this.ui.elements.scaleSlider?.value / 100 || 1;
    const margin = this.ui.elements.marginSlider?.value || 0;

    const sheetsHtml = zineSheets.map((content) => `
      <div class="sheet">
        <div class="zine-grid">${content}</div>
      </div>
      <div class="sheet"><div class="back-side"></div></div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Zine</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: ${dimensions.width}mm ${dimensions.height}mm; margin: 0; }
          body { background: white; width: ${dimensions.width}mm; height: ${dimensions.height}mm; overflow: hidden; }
          .sheet { width: 100%; height: 100%; page-break-after: always; display: block; overflow: hidden; }
          .zine-grid {
            display: grid;
            grid-template-areas:
                "page5 page4 page3 page2"
                "page6 page7 page8 page1";
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(2, 1fr);
            height: ${dimensions.height}mm;
            width: ${dimensions.width}mm;
          }
          .page-cell {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 0.1mm dashed #eee;
          }
          .page-cell:nth-child(1) { grid-area: page1; }
          .page-cell:nth-child(2) { grid-area: page2; }
          .page-cell:nth-child(3) { grid-area: page3; }
          .page-cell:nth-child(4) { grid-area: page4; }
          .page-cell:nth-child(5) { grid-area: page5; }
          .page-cell:nth-child(6) { grid-area: page6; }
          .page-cell:nth-child(7) { grid-area: page7; }
          .page-cell:nth-child(8) { grid-area: page8; }
          
          /* Upside down pages for folding */
          .page-cell:nth-child(2), .page-cell:nth-child(3), 
          .page-cell:nth-child(4), .page-cell:nth-child(5) {
            transform: rotate(180deg);
          }
          
          .page-content-img { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
            transform: scale(${scale});
            padding: ${margin}px;
          }
          .page-label, .page-placeholder { display: none; }
          
          .back-side {
            width: 100%; height: 100%;
            background-image: url('${this.referenceImageUrl}');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            transform: rotate(180deg);
          }
        </style>
      </head>
      <body>
        ${sheetsHtml}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  async handleExport() {
    if (!this.ui.hasContent()) { return; }
    try {
      this.ui.elements.exportPdfBtn.disabled = true;
      toast.info('Generating PDF...');

      const doc = new jsPDF({
        orientation: this.orientation || 'landscape',
        unit: 'mm',
        format: this.paperSize || 'a4'
      });

      const dimensions = this.ui.getPaperDimensions(this.paperSize || 'a4', this.orientation || 'landscape');

      const captureZine = async (sheetNum) => {
        const grid = document.querySelector(`#zine-grid-sheet-${sheetNum}`);
        if (!grid) { return; }

        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(grid, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        if (sheetNum > 1) { doc.addPage(); }
        doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, dimensions.width, dimensions.height);

        // Add back side
        doc.addPage();
        const backCanvas = document.createElement('canvas');
        backCanvas.width = canvas.width;
        backCanvas.height = canvas.height;
        const bctx = backCanvas.getContext('2d');
        const refImg = new Image();
        refImg.src = this.referenceImageUrl;
        await new Promise(r => { refImg.onload = r; });

        bctx.translate(backCanvas.width / 2, backCanvas.height / 2);
        bctx.rotate(Math.PI);
        bctx.drawImage(refImg, -backCanvas.width / 2, -backCanvas.height / 2, backCanvas.width, backCanvas.height);
        doc.addImage(backCanvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, dimensions.width, dimensions.height);
      };

      await captureZine(1);
      if (this.selectedLayout > 8) { await captureZine(2); }

      doc.save(`zine-${Date.now()}.pdf`);
      toast.success('Downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Export Failed');
    } finally {
      this.ui.elements.exportPdfBtn.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PDFZineMaker();
});