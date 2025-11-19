// src/utils/exportUtils.js
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

// Enhanced export utilities with TRON theme support
export const exportChartData = {
  // Export as CSV with enhanced formatting
  toCSV: (data, filename, options = {}) => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return false;
    }

    try {
      const { includeHeaders = true, delimiter = ',' } = options;
      
      let csvContent = '';
      
      // Add headers
      if (includeHeaders) {
        const headers = Object.keys(data[0]);
        csvContent += headers.map(header => `"${header}"`).join(delimiter) + '\n';
      }
      
      // Add data rows
      const rows = data.map(row => 
        Object.values(row).map(value => {
          if (value === null || value === undefined) return '""';
          const stringValue = String(value);
          return stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        }).join(delimiter)
      ).join('\n');
      
      csvContent += rows;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, finalFilename);
      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return false;
    }
  },

  // Export as JSON
  toJSON: (data, filename, options = {}) => {
    if (!data) {
      console.warn('No data to export');
      return false;
    }

    try {
      const { prettyPrint = true } = options;
      const jsonContent = prettyPrint 
        ? JSON.stringify(data, null, 2) 
        : JSON.stringify(data);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      saveAs(blob, finalFilename);
      return true;
    } catch (error) {
      console.error('Error exporting JSON:', error);
      return false;
    }
  },

  // Export as PNG with TRON theme
// In src/utils/exportUtils.js - Update the toPNG function
toPNG: async (element, filename, options = {}) => {
  if (!element) {
    console.warn('No element to capture');
    return false;
  }

  try {
    const { 
      backgroundColor = '#111827',
      scale = 2,
      quality = 0.95,
      width = 800,
      height = 600
    } = options;

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);
    clonedElement.style.visibility = 'hidden';
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    document.body.appendChild(clonedElement);

    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(clonedElement, {
      backgroundColor: backgroundColor,
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      removeContainer: true,
      imageTimeout: 15000,
      width: width,
      height: height,
      onclone: (clonedDoc, clonedEl) => {
        // Enhance the cloned element for better capture
        clonedEl.style.transform = 'none';
        clonedEl.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.3)';
        clonedEl.style.border = '1px solid rgba(34, 211, 238, 0.3)';
        
        // Force SVG elements to render properly
        const svgs = clonedEl.querySelectorAll('svg');
        svgs.forEach(svg => {
          svg.style.transform = 'none';
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
        });
      }
    });

    // Clean up cloned element
    document.body.removeChild(clonedElement);

    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        if (blob) {
          const finalFilename = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
          saveAs(blob, finalFilename);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 'image/png', quality);
    });
  } catch (error) {
    console.error('Error exporting PNG:', error);
    
    // Fallback: Try simple capture without enhancements
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 1,
        useCORS: true
      });
      
      canvas.toBlob(blob => {
        if (blob) {
          const finalFilename = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
          saveAs(blob, finalFilename);
          return true;
        }
      });
    } catch (fallbackError) {
      console.error('Fallback PNG export also failed:', fallbackError);
      return false;
    }
  }
},

  // Export as PDF with TRON styling
  toPDF: async (element, filename, options = {}) => {
    if (!element) {
      console.warn('No element to capture');
      return false;
    }

    try {
      const { 
        backgroundColor = '#111827',
        scale = 2,
        orientation = 'landscape'
      } = options;

      const canvas = await html2canvas(element, {
        backgroundColor: backgroundColor,
        scale: scale,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add background
      pdf.setFillColor(17, 24, 39);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Add image
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add footer with TRON style
      pdf.setFont('courier');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 242, 254);
      pdf.text(
        `Generated by HackTrack Analytics • ${new Date().toLocaleString()}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      );

      const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(finalFilename);
      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      return false;
    }
  },

  // Export multiple formats at once
  exportMultiple: async (element, data, filename, formats = ['csv', 'png']) => {
    const results = {};
    
    for (const format of formats) {
      switch (format) {
        case 'csv':
          results.csv = exportChartData.toCSV(data, filename);
          break;
        case 'json':
          results.json = exportChartData.toJSON(data, filename);
          break;
        case 'png':
          results.png = await exportChartData.toPNG(element, filename);
          break;
        case 'pdf':
          results.pdf = await exportChartData.toPDF(element, filename);
          break;
        default:
          console.warn(`Unknown format: ${format}`);
      }
      
      // Small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }
};

// Utility function to get chart data based on chart type
export const getChartData = (chartType, processedData) => {
  switch (chartType) {
    case 'roleDistribution':
      return processedData.roleDistribution || [];
    case 'performance':
      return processedData.performanceData || [];
    case 'engagement':
      return processedData.engagementMetrics || [];
    case 'registration':
      return processedData.registrationSources || [];
    default:
      return [];
  }
};

// Download manager with progress tracking
export class DownloadManager {
  constructor() {
    this.downloads = new Map();
    this.listeners = new Set();
  }

  addDownload(id, filename, type) {
    this.downloads.set(id, { id, filename, type, progress: 0, status: 'pending' });
    this.notifyListeners();
  }

  updateProgress(id, progress) {
    const download = this.downloads.get(id);
    if (download) {
      download.progress = progress;
      download.status = progress === 100 ? 'completed' : 'downloading';
      this.notifyListeners();
    }
  }

  completeDownload(id, success = true) {
    const download = this.downloads.get(id);
    if (download) {
      download.status = success ? 'completed' : 'failed';
      download.progress = 100;
      this.notifyListeners();
      
      // Remove after 5 seconds
      setTimeout(() => {
        this.downloads.delete(id);
        this.notifyListeners();
      }, 5000);
    }
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.downloads));
  }
}

// Create global download manager instance
export const downloadManager = new DownloadManager();