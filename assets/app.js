// PDF.js initialization will be handled in DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
    const zine = document.querySelector('.zine');
    const printBtn = document.getElementById('printBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const pdfUpload = document.getElementById('pdf-upload');
    const uploadStatus = document.getElementById('upload-status');
    const uploadZone = document.getElementById('upload-zone');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    // Initialize PDF.js worker
    if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    // Library availability checks
    const libraries = {
        'PDF.js': window.pdfjsLib,
        'jsPDF': window.jspdf,
        'html2canvas': window.html2canvas
    };

    const missingLibraries = Object.entries(libraries).filter(([name, lib]) => !lib).map(([name]) => name);

    if (missingLibraries.length > 0) {
        console.warn('Libraries not yet loaded:', missingLibraries.join(', '));
        if (uploadStatus) {
            uploadStatus.textContent = `Loading required libraries... Please wait.`;
            uploadStatus.classList.add('text-blue-600', 'font-bold');
        }

        // Wait a bit for libraries to load and try again
        setTimeout(() => {
            const stillMissing = Object.entries(libraries).filter(([name, lib]) => !lib).map(([name]) => name);
            if (stillMissing.length > 0) {
                if (uploadStatus) {
                    uploadStatus.textContent = `Error: Failed to load required libraries (${stillMissing.join(', ')}). Please check your internet connection and refresh the page.`;
                    uploadStatus.classList.add('text-red-500');
                    uploadStatus.classList.remove('text-blue-600');
                }
            } else {
                if (uploadStatus) {
                    uploadStatus.textContent = 'Ready to upload PDF files.';
                    uploadStatus.classList.remove('text-red-500', 'text-blue-600', 'font-bold');
                }
            }
        }, 3000);
    } else {
        if (uploadStatus) {
            uploadStatus.textContent = 'Ready to upload PDF files.';
            uploadStatus.classList.remove('text-red-500', 'text-blue-600', 'font-bold');
        }
    }

    // Reference image URL (local copy)
    const referenceImageUrl = 'assets/reference-back-side.jpg';

    // Track object URLs to prevent memory leaks
    const pageObjectUrls = [];

    function cleanupObjectUrls() {
        pageObjectUrls.forEach(url => URL.revokeObjectURL(url));
        pageObjectUrls.length = 0;
    }

    // Night mode functionality
    let isDarkMode = localStorage.getItem('theme') === 'dark' ||
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    function updateTheme() {
        const html = document.documentElement;
        if (isDarkMode) {
            html.setAttribute('data-theme', 'dark');
            themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
        } else {
            html.setAttribute('data-theme', 'light');
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        updateTheme();
    }

    // Initialize theme
    updateTheme();

    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);

    // Upload zone click handler
    uploadZone.addEventListener('click', () => {
        console.log('Upload zone clicked, triggering file input');
        pdfUpload.click();
    });

    // Scaling controls
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');

    // Current scaling state
    let currentScale = 100;

    // Scaling functions
    function updateScale(scale) {
        currentScale = scale;
        scaleValue.textContent = scale + '%';
        scaleSlider.value = scale;

        // Update zine container scale
        zine.classList.add('scaled');
        zine.style.transform = `scale(${scale / 100})`;

        // Update individual page content scale
        const pageContents = document.querySelectorAll('.page-content');
        pageContents.forEach(content => {
            content.classList.add('scaled');
            content.style.transform = `scale(${scale / 100})`;
        });

        // Update images scale
        const images = document.querySelectorAll('.page-content img');
        images.forEach(img => {
            img.classList.add('scaled');
            img.style.transform = `scale(${scale / 100})`;
        });
    }

    // Generate the 8 blank page placeholders
    for (let i = 1; i <= 8; i++) {
        const page = document.createElement('article');
        page.className = 'fade-in-up';
        page.style.animationDelay = `${i * 0.1}s`;

        const content = document.createElement('div');
        content.className = 'page-content';
        content.id = `content-${i}`;

        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = i;

        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-2 opacity-30">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span class="text-sm font-medium">Page ${i}</span>
        `;

        const imgPreview = document.createElement('img');
        imgPreview.id = `preview-${i}`;
        imgPreview.alt = `Page ${i} preview`;

        content.appendChild(pageNumber);
        content.appendChild(placeholder);
        content.appendChild(imgPreview);
        page.appendChild(content);
        zine.appendChild(page);
    }

    // Function to create two-page print layout (front + back)
    function createTwoPagePrintLayout() {
        const printWindow = window.open('', '_blank');

        // Check if popup was blocked
        if (!printWindow) {
            showToast('error', 'Popup Blocked', 'Please allow popups for this site to enable printing. You can also try the Export PDF feature instead.');
            return;
        }

        const zineContent = zine.outerHTML;

        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Zine Print Layout</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; }
                    .print-page { width: 100%; height: 100vh; page-break-after: always; position: relative; display: block; }
                    .print-page:last-child { page-break-after: auto; }
                    .front-side { display: grid; grid-template-areas: "page5 page4 page3 page2" "page6 page7 page8 page1"; width: 100%; height: 100%; gap: 0; padding: 0; margin: 0; }
                    .back-side { background-image: url('${referenceImageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center; transform: rotate(180deg); width: 100%; height: 100%; }
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

    // Helper to create a blank white data URL (fallback size if unknown)
    function createBlankDataUrl(width = 1000, height = 1400) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        return canvas.toDataURL('image/png', 1.0);
    }

    // PDF upload handler with improved image conversion
    pdfUpload.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (!file) {
            uploadStatus.textContent = 'No file selected.';
            return;
        }

        if (file.type !== 'application/pdf') {
            uploadStatus.classList.add('text-red-500', 'font-bold');
            uploadStatus.textContent = 'Error: Please select a PDF file (.pdf extension).';
            return;
        }

        // Check file size (limit to 50MB to prevent memory issues)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            uploadStatus.classList.add('text-red-500', 'font-bold');
            uploadStatus.textContent = 'Error: PDF file is too large (max 50MB). Please choose a smaller file.';
            return;
        }

        if (file.size === 0) {
            uploadStatus.classList.add('text-red-500', 'font-bold');
            uploadStatus.textContent = 'Error: PDF file appears to be empty.';
            return;
        }

        // Reset status and start processing
        cleanupObjectUrls();
        uploadStatus.classList.remove('text-red-500', 'font-bold');
        uploadStatus.textContent = `Processing "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB)...`;

        const fileReader = new FileReader();

        fileReader.onerror = function() {
            uploadStatus.classList.add('text-red-500', 'font-bold');
            uploadStatus.textContent = 'Error: Failed to read the PDF file. The file may be corrupted or inaccessible.';
        };

        fileReader.onabort = function() {
            uploadStatus.classList.add('text-red-500', 'font-bold');
            uploadStatus.textContent = 'File reading was cancelled.';
        };

        fileReader.onload = async function() {
            try {
                uploadStatus.textContent = 'Reading PDF file... This may take a moment for large files.';

                const typedarray = new Uint8Array(this.result);

                if (!window.pdfjsLib) {
                    throw new Error('PDF.js library is not loaded. Please refresh the page and try again.');
                }

                uploadStatus.textContent = 'Processing PDF...';

                // Add timeout to PDF loading
                const loadingPromise = pdfjsLib.getDocument(typedarray).promise;
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('PDF loading timed out. The file may be corrupted or too large.')), 30000)
                );

                const pdf = await Promise.race([loadingPromise, timeoutPromise]);
                const numPages = pdf.numPages;

                if (numPages === 0) {
                    throw new Error('PDF appears to be empty or corrupted.');
                }

                uploadStatus.textContent = `PDF loaded with ${numPages} pages. Converting to images...`;

                const maxPages = Math.min(8, numPages);
                let fallbackWidth = 1000;
                let fallbackHeight = 1400;

                // Process pages sequentially to avoid memory issues
                for (let i = 1; i <= maxPages; i++) {
                    try {
                        const page = await pdf.getPage(i);

                        // Use higher scale for better quality and HiDPI support
                        const scale = 2.5;
                        const viewport = page.getViewport({ scale: scale });
                        fallbackWidth = Math.floor(viewport.width);
                        fallbackHeight = Math.floor(viewport.height);

                        // Support HiDPI screens
                        const outputScale = window.devicePixelRatio || 1;

                        // Create canvas with proper dimensions
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');

                        // Set canvas dimensions for HiDPI
                        canvas.width = Math.floor(viewport.width * outputScale);
                        canvas.height = Math.floor(viewport.height * outputScale);
                        canvas.style.width = Math.floor(viewport.width) + "px";
                        canvas.style.height = Math.floor(viewport.height) + "px";

                        // Set up transform for HiDPI
                        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                        // Render page to canvas with proper context
                        const renderContext = {
                            canvasContext: context,
                            transform: transform,
                            viewport: viewport
                        };

                        await page.render(renderContext).promise;

                        // Convert to Blob URL for better performance and memory efficiency
                        const imgPreview = document.getElementById(`preview-${i}`);
                        if (imgPreview) {
                            canvas.toBlob((blob) => {
                                const url = URL.createObjectURL(blob);
                                pageObjectUrls.push(url);
                                imgPreview.src = url;
                                imgPreview.classList.add('scale-in');

                                // Hide placeholder with animation after image is ready
                                const placeholder = document.querySelector(`#content-${i} .placeholder`);
                                if (placeholder) {
                                    placeholder.style.transition = 'opacity 0.3s ease';
                                    placeholder.style.opacity = '0';
                                    setTimeout(() => {
                                        placeholder.style.display = 'none';
                                    }, 300);
                                }
                            }, 'image/png', 1.0);
                        }

                        // Update status
                        uploadStatus.textContent = `Converting page ${i} of ${maxPages}...`;
                    } catch (pageErr) {
                        console.warn(`Failed to render page ${i}:`, pageErr);
                        const imgPreview = document.getElementById(`preview-${i}`);
                        if (imgPreview) {
                            imgPreview.src = createBlankDataUrl(fallbackWidth, fallbackHeight);
                            imgPreview.classList.add('scale-in');
                        }
                        const placeholder = document.querySelector(`#content-${i} .placeholder`);
                        if (placeholder) {
                            placeholder.style.transition = 'opacity 0.3s ease';
                            placeholder.style.opacity = '0';
                            setTimeout(() => {
                                placeholder.style.display = 'none';
                            }, 300);
                        }
                    }
                }

                // Clear any remaining placeholders if PDF has fewer than 8 pages
                for (let i = maxPages + 1; i <= 8; i++) {
                    const imgPreview = document.getElementById(`preview-${i}`);
                    if (imgPreview) {
                        imgPreview.src = createBlankDataUrl(fallbackWidth, fallbackHeight);
                        imgPreview.classList.add('scale-in');
                    }
                    const placeholder = document.querySelector(`#content-${i} .placeholder`);
                    if (placeholder) {
                        placeholder.style.transition = 'opacity 0.3s ease';
                        placeholder.style.opacity = '0';
                        setTimeout(() => {
                            placeholder.style.display = 'none';
                        }, 300);
                    }
                }

                // Reference image will be added to back side during print/export

                // Upload text handled by status updates
                const blanksAdded = 8 - maxPages;
                uploadStatus.textContent = blanksAdded > 0
                    ? `Converted ${maxPages} page(s). Filled ${blanksAdded} blank page(s). Ready to print!`
                    : `Successfully converted ${maxPages} pages to images. Ready to print!`;
                uploadStatus.classList.add('text-green-600', 'font-bold');

            } catch (error) {
                console.error('Error processing PDF:', error);

                let errorMessage = 'Error: Could not process this PDF. ';

                if (error.message.includes('timed out')) {
                    errorMessage += 'The file took too long to load. It may be corrupted or too large.';
                } else if (error.message.includes('corrupted')) {
                    errorMessage += 'The file appears to be corrupted.';
                } else if (error.message.includes('protected')) {
                    errorMessage += 'The file may be password-protected or have security restrictions.';
                } else if (error.message.includes('not loaded')) {
                    errorMessage += 'PDF.js library failed to load. Please refresh the page.';
                } else if (error.message.includes('InvalidPDFException')) {
                    errorMessage += 'The file is not a valid PDF or is corrupted.';
                } else if (error.message.includes('MissingPDFException')) {
                    errorMessage += 'The PDF file appears to be empty or incomplete.';
                } else {
                    errorMessage += error.message || 'Unknown error occurred.';
                }

                uploadStatus.classList.add('text-red-500', 'font-bold');
                uploadStatus.textContent = errorMessage;
            }
        };
        fileReader.readAsArrayBuffer(file);
    });

    // Print button handler
    printBtn.addEventListener('click', () => {
        const hasContent = Array.from(document.querySelectorAll('.page-content img')).some(img => img.src && img.src !== '');

        if (!hasContent) {
            alert('Please upload a PDF first before printing.');
            return;
        }

        // Create print layout with both front and back
        createTwoPagePrintLayout();
    });

    // PDF Export function
    async function exportZineAsPDF() {
        const hasContent = Array.from(document.querySelectorAll('.page-content img')).some(img => img.src && img.src !== '');

        if (!hasContent) {
            alert('Please upload a PDF first before exporting.');
            return;
        }

        try {
            // Show loading state
            exportPdfBtn.disabled = true;
            exportPdfBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
            `;

            // Create a temporary container for the zine layout
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm'; // A4 width
            tempContainer.style.height = '297mm'; // A4 height
            tempContainer.style.background = 'white';
            tempContainer.style.padding = '0';
            tempContainer.style.margin = '0';

            // Clone the zine with print styles applied
            const zineClone = zine.cloneNode(true);
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

            // Apply print styles to cloned pages
            const pages = zineClone.querySelectorAll('article');
            pages.forEach((page, index) => {
                page.style.width = '100%';
                page.style.height = '100%';
                page.style.border = 'none';
                page.style.boxShadow = 'none';

                // Rotate top row pages for proper folding
                // Pages 5, 4, 3, 2 are on top row and need rotation
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

            tempContainer.appendChild(zineClone);
            document.body.appendChild(tempContainer);

            // Disable html2canvas logging to prevent error text overlay
            window.html2canvas.logging = false;

            // Capture the zine as canvas
            const canvas = await html2canvas(zineClone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 210 * 4,
                height: 297 * 4
            });

            // Clean up temporary container
            document.body.removeChild(tempContainer);

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            // Add the front side (zine) to PDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

            // Add new page for back side
            pdf.addPage();

            // Create back side with reference image
            const backSideCanvas = document.createElement('canvas');
            const backSideContext = backSideCanvas.getContext('2d');
            backSideCanvas.width = 210 * 4; // A4 width in pixels at 2x scale
            backSideCanvas.height = 297 * 4; // A4 height in pixels at 2x scale

            const referenceImg = new Image();
            referenceImg.crossOrigin = 'anonymous';
            referenceImg.onload = function() {
                backSideContext.save();
                backSideContext.translate(backSideCanvas.width / 2, backSideCanvas.height / 2);
                backSideContext.rotate(Math.PI);
                backSideContext.drawImage(referenceImg, -backSideCanvas.width / 2, -backSideCanvas.height / 2, backSideCanvas.width, backSideCanvas.height);
                backSideContext.restore();

                const backSideData = backSideCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(backSideData, 'PNG', 0, 0, 297, 210);

                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const filename = `zine-export-${timestamp}.pdf`;
                pdf.save(filename);

                exportPdfBtn.disabled = false;
                exportPdfBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export PDF
                `;

                uploadStatus.textContent = `PDF exported successfully as ${filename}`;
                uploadStatus.classList.remove('text-red-500', 'text-green-600', 'font-bold');
                uploadStatus.classList.add('text-green-600', 'font-bold');
            };
            referenceImg.src = referenceImageUrl;

        } catch (error) {
            console.error('Error exporting PDF:', error);
            exportPdfBtn.disabled = false;
            exportPdfBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export PDF
            `;
            uploadStatus.textContent = `Error exporting PDF: ${error.message}`;
            uploadStatus.classList.remove('text-green-600', 'font-bold');
            uploadStatus.classList.add('text-red-500', 'font-bold');
        }
    }

    // Export PDF button handler
    exportPdfBtn.addEventListener('click', exportZineAsPDF);

    // Scaling control event listeners
    scaleSlider.addEventListener('input', (e) => {
        updateScale(parseInt(e.target.value));
    });

    // Initialize with default values
    updateScale(100);
});

