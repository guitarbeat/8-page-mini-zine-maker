# 8-Page Mini Zine Maker

A web application that converts PDF files into printable 8-page mini zines with proper folding and cutting instructions.

## Features

- **PDF Upload**: Upload any PDF file (up to 8 pages)
- **Automatic Conversion**: Converts PDF pages to high-quality images
- **Correct Layout**: Proper 8-page mini zine arrangement for printing
- **Live Preview**: See exactly how your zine will look before printing
- **Print Ready**: Optimized for A4 landscape printing
- **PDF Export**: Download the assembled zine layout as a PDF file
- **Folding Guide**: Visual cut line shows where to fold and cut

## How to Use

1. **Upload PDF**: Click "Choose PDF File" and select your PDF
2. **Preview**: See your zine layout with pages arranged correctly
3. **Print or Export**: 
   - Click "Print Zine" to print on A4 landscape paper
   - Click "Export PDF" to download the zine layout as a PDF file
4. **Fold & Cut**: Follow the dashed line to fold and cut your zine

## 8-Page Mini Zine Layout

The zine uses the standard 8-page mini zine layout:

```
Page 4 | Page 3 | Page 2 | Page 1
Page 5 | Page 6 | Page 7 | Page 8
```

- **Top Row**: Pages 4, 3, 2, 1 (rotated 180° for proper folding)
- **Bottom Row**: Pages 5, 6, 7, 8 (normal orientation)
- **Cut Line**: Dashed line in the middle shows where to cut

## Folding Instructions

1. Print the zine on A4 landscape paper
2. Fold the paper in half horizontally (top to bottom)
3. Unfold and fold in half vertically (left to right)
4. Unfold and fold each half in half again
5. Cut along the dashed line in the middle
6. Refold to create your 8-page mini zine

## Technical Details

- **PDF.js**: For high-quality PDF rendering
- **jsPDF**: For PDF generation and export
- **html2canvas**: For capturing the zine layout as an image
- **Tailwind CSS**: For responsive design
- **CSS Grid**: For precise page layout
- **HiDPI Support**: Optimized for high-resolution displays

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use and modify!
