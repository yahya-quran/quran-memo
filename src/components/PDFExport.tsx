import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  sessionTitle: string;
  sessionDate: string;
  elementId: string;
}

export const PDFExport: React.FC<PDFExportProps> = ({ 
  sessionTitle, 
  sessionDate, 
  elementId 
}) => {
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        alert('لم يتم العثور على المحتوى للتصدير');
        return;
      }

      // Create canvas from element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add header
      pdf.setFontSize(16);
      pdf.text('دار داركوم – تقرير جلسة تحفيظ القرآن', pdfWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`العنوان: ${sessionTitle}`, pdfWidth - 20, 35, { align: 'right' });
      pdf.text(`التاريخ: ${sessionDate}`, pdfWidth - 20, 45, { align: 'right' });

      // Add image
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Generate filename
      const date = new Date(sessionDate).toISOString().split('T')[0];
      const filename = `جلسة_${date}_${sessionTitle}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تصدير الملف');
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="btn-primary flex items-center space-x-2 space-x-reverse"
    >
      <Download className="h-5 w-5" />
      <span>تصدير PDF</span>
    </button>
  );
};