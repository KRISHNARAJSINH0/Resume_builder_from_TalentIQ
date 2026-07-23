import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getBackendUrl } from './apiConfig';

/**
 * Helper to programmatically trigger a file download from a Blob.
 * Uses native window.showSaveFilePicker when available, falling back to a hidden anchor download.
 */
async function triggerDownload(blob, filename) {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'PDF document',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
    }
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  try {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  } catch (e) {
    link.click();
  }
  
  document.body.removeChild(link);
  // Keep the blob URL alive for 45 seconds to prevent Chrome from revoking it 
  // before the download manager resolves the filename and extension!
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 45000);
}

/**
 * downloadResumeAsPDF
 * Fetches true text-based PDF from backend or falls back to client-side capture.
 * @param {string} candidateName - used for the file name
 * @param {string} resumeId - backend resume identifier
 * @param {Function} onProgress - called with a status string during generation
 */
export async function downloadResumeAsPDF(candidateName = 'resume', resumeId = '', onProgress = () => {}) {
  // If we have a resume ID, fetch the clean ReportLab text-based PDF from the backend
  if (resumeId) {
    onProgress('Fetching text-based PDF...');
    try {
      const apiBase = await getBackendUrl();
      const response = await fetch(`${apiBase}/api/resume/download-pdf/${resumeId}/`);
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const safeName = candidateName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'resume';
      
      onProgress('Saving PDF...');
      await triggerDownload(blob, `${safeName}.pdf`);
      onProgress('');
      return;
    } catch (err) {
      console.warn('Backend PDF generation failed, falling back to client-side layout capture...', err);
    }
  }

  const element = document.getElementById('resume-print-area');
  if (!element) {
    throw new Error('Resume preview not found. Please switch to the Resume tab first.');
  }

  onProgress('Capturing resume layout...');

  // Temporarily make it fully visible for capture
  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,           // 2x resolution for crisp text
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 800,
    });

    onProgress('Generating PDF...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // If content is taller than one A4 page, paginate
    const pageHeightMM = pdf.internal.pageSize.getHeight();
    let yOffset = 0;
    const totalHeightMM = pdfHeight;

    if (totalHeightMM <= pageHeightMM) {
      // Fits on one page
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    } else {
      // Multi-page: slice the image per page
      const pixelsPerMM = imgHeight / totalHeightMM;
      const pageHeightPx = pageHeightMM * pixelsPerMM;
      let page = 0;

      while (yOffset < imgHeight) {
        if (page > 0) pdf.addPage();

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = Math.min(pageHeightPx, imgHeight - yOffset);

        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, -yOffset);

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        const sliceHeightMM = (sliceCanvas.height * pdfWidth) / imgWidth;
        pdf.addImage(sliceData, 'JPEG', 0, 0, pdfWidth, sliceHeightMM);

        yOffset += pageHeightPx;
        page++;
      }
    }

    // Add clickable link annotations to the PDF
    addLinksToPdf(pdf, element, pdfWidth);

    onProgress('Saving PDF...');
    const safeName = candidateName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'resume';
    const pdfBlob = pdf.output('blob');
    await triggerDownload(pdfBlob, `${safeName}.pdf`);
    onProgress('');
  } finally {
    element.style.display = originalDisplay;
  }
}

/**
 * Traverses all anchor tags in the target DOM element, measures their
 * coordinates, and places native clickable PDF link annotations on top of them.
 */
function addLinksToPdf(pdf, element, pdfWidth) {
  try {
    const containerRect = element.getBoundingClientRect();
    const pxToMm = pdfWidth / containerRect.width;
    const pageHeightMM = pdf.internal.pageSize.getHeight();

    const links = element.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.href || link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

      const linkRect = link.getBoundingClientRect();
      const left = linkRect.left - containerRect.left;
      const top = linkRect.top - containerRect.top;
      const width = linkRect.width;
      const height = linkRect.height;

      const x = left * pxToMm;
      const y = top * pxToMm;
      const w = width * pxToMm;
      const h = height * pxToMm;

      // Determine page index and offset on target page
      const pageIndex = Math.floor(y / pageHeightMM);
      const yOnPage = y % pageHeightMM;

      const targetPage = pageIndex + 1;
      const totalPages = pdf.internal.getNumberOfPages();

      if (targetPage <= totalPages) {
        pdf.setPage(targetPage);
        pdf.link(x, yOnPage, w, h, { url: href });
      }
    }
  } catch (err) {
    console.error('Failed to add interactive links to PDF:', err);
  }
}
