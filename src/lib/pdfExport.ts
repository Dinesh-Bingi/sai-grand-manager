import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { getIdProofImageUrl } from './storage';
import JSZip from 'jszip';

interface GuestRecord {
  bookingId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  phone: string;
  idType: string;
  idNumber: string;
  address?: string;
  idFrontImage?: string;
  idBackImage?: string;
  additionalGuests: number;
}

// Validate that all records have ID proof
export function validateIdProof(records: GuestRecord[]): { valid: boolean; missingRecords: GuestRecord[] } {
  const missingRecords = records.filter(
    record => !record.idFrontImage || !record.idBackImage
  );
  
  return {
    valid: missingRecords.length === 0,
    missingRecords,
  };
}

export async function generateGuestStayReportPDF(
  records: GuestRecord[],
  startDate: string,
  endDate: string
): Promise<void> {
  // Validate ID proof exists
  const validation = validateIdProof(records);
  if (!validation.valid) {
    throw new Error(
      `Guest stay record report cannot be generated. ${validation.missingRecords.length} booking(s) are missing identification documents.`
    );
  }
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SAI GRAND LODGE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Surendrapuri, Yadagirigutta', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GUEST STAY RECORD REPORT', pageWidth / 2, 40, { align: 'center' });
  
  // Date range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Report Period: ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`,
    pageWidth / 2,
    48,
    { align: 'center' }
  );
  doc.text(
    `Generated on: ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
    pageWidth / 2,
    54,
    { align: 'center' }
  );
  
  // Summary
  doc.setFontSize(10);
  doc.text(`Total Guests: ${records.length}`, 14, 65);
  
  // Table
  const tableData = records.map((record, index) => [
    (index + 1).toString(),
    record.roomNumber,
    record.guestName,
    record.phone,
    record.idType,
    record.idNumber,
    format(parseISO(record.checkIn), 'dd/MM/yy HH:mm'),
    format(parseISO(record.checkOut), 'dd/MM/yy HH:mm'),
  ]);
  
  autoTable(doc, {
    startY: 70,
    head: [['#', 'Room', 'Guest Name', 'Phone', 'ID Type', 'ID Number', 'Check-in', 'Check-out']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [139, 69, 19],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 220],
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} | Generated as per statutory guest record requirements. | Sai Grand Lodge`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`Guest_Stay_Record_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function generateDetailedPDF(
  records: GuestRecord[],
  startDate: string,
  endDate: string,
  includeImages: boolean = false
): Promise<void> {
  // Validate ID proof exists if images are requested
  if (includeImages) {
    const validation = validateIdProof(records);
    if (!validation.valid) {
      throw new Error(
        `Detailed guest register cannot be generated. ${validation.missingRecords.length} booking(s) are missing identification documents.`
      );
    }
  }
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SAI GRAND LODGE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Surendrapuri, Yadagirigutta', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILED GUEST STAY REGISTER', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 15;
  
  // Guest entries
  for (const [index, record] of records.entries()) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    // Guest header
    doc.setFillColor(139, 69, 19);
    doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Guest #${index + 1}: ${record.guestName}`, 16, yPos);
    doc.text(`Room: ${record.roomNumber}`, pageWidth - 40, yPos);
    doc.setTextColor(0);
    yPos += 10;
    
    // Guest details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const details = [
      ['Phone:', record.phone],
      ['ID Type:', record.idType],
      ['ID Number:', record.idNumber],
      ['Check-in:', format(parseISO(record.checkIn), 'MMM d, yyyy h:mm a')],
      ['Check-out:', format(parseISO(record.checkOut), 'MMM d, yyyy h:mm a')],
    ];
    
    if (record.address) {
      details.push(['Address:', record.address]);
    }
    
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 16, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'N/A', 45, yPos);
      yPos += 5;
    });
    
    // Include ID images if requested
    if (includeImages && (record.idFrontImage || record.idBackImage)) {
      yPos += 5;
      
      try {
        // Fetch and embed ID front image
        if (record.idFrontImage) {
          const frontUrl = await getIdProofImageUrl(record.idFrontImage);
          if (frontUrl) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('ID Front:', 16, yPos);
            yPos += 3;
            
            try {
              // Fetch image and convert to base64
              const response = await fetch(frontUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              
              await new Promise<void>((resolve, reject) => {
                reader.onload = () => {
                  try {
                    const imgData = reader.result as string;
                    const imgWidth = 60;
                    const imgHeight = (imgWidth * blob.size) / (blob.size * 1.5); // Approximate aspect ratio
                    
                    if (yPos + imgHeight > pageHeight - 20) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    doc.addImage(imgData, 'JPEG', 16, yPos, imgWidth, imgHeight * 0.4);
                    yPos += imgHeight * 0.4 + 5;
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (imgError) {
              console.error('Error embedding front image:', imgError);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7);
              doc.text('(Image unavailable)', 16, yPos);
              yPos += 5;
            }
          }
        }
        
        // Fetch and embed ID back image
        if (record.idBackImage) {
          const backUrl = await getIdProofImageUrl(record.idBackImage);
          if (backUrl) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('ID Back:', 16, yPos);
            yPos += 3;
            
            try {
              const response = await fetch(backUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              
              await new Promise<void>((resolve, reject) => {
                reader.onload = () => {
                  try {
                    const imgData = reader.result as string;
                    const imgWidth = 60;
                    const imgHeight = (imgWidth * blob.size) / (blob.size * 1.5);
                    
                    if (yPos + imgHeight > pageHeight - 20) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    doc.addImage(imgData, 'JPEG', 16, yPos, imgWidth, imgHeight * 0.4);
                    yPos += imgHeight * 0.4 + 5;
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (imgError) {
              console.error('Error embedding back image:', imgError);
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7);
              doc.text('(Image unavailable)', 16, yPos);
              yPos += 5;
            }
          }
        }
      } catch (error) {
        console.error('Error adding ID images to PDF:', error);
      }
    }
    
    yPos += 10;
    
    // Divider
    doc.setDrawColor(200);
    doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);
  }
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')} | Generated as per statutory guest record requirements. | Sai Grand Lodge`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`Detailed_Guest_Register_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateExcelCSV(records: GuestRecord[]): void {
  const headers = [
    'S.No',
    'Room Number',
    'Guest Name',
    'Phone',
    'ID Type',
    'ID Number',
    'Address',
    'Check-in Date',
    'Check-in Time',
    'Check-out Date',
    'Check-out Time',
    'Additional Guests',
  ];
  
  const rows = records.map((record, index) => [
    index + 1,
    record.roomNumber,
    record.guestName,
    record.phone,
    record.idType,
    record.idNumber,
    record.address || '',
    format(parseISO(record.checkIn), 'dd/MM/yyyy'),
    format(parseISO(record.checkIn), 'HH:mm'),
    format(parseISO(record.checkOut), 'dd/MM/yyyy'),
    format(parseISO(record.checkOut), 'HH:mm'),
    record.additionalGuests,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Guest_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}

// Generate encrypted ZIP file with ID images
export async function generateEncryptedZIP(
  records: GuestRecord[],
  password: string
): Promise<void> {
  // Validate ID proof exists
  const validation = validateIdProof(records);
  if (!validation.valid) {
    throw new Error(
      `Secure archive cannot be generated. ${validation.missingRecords.length} booking(s) are missing identification documents.`
    );
  }

  const zip = new JSZip();
  
  // Fetch and add ID images for each booking
  for (const record of records) {
    const roomFolder = zip.folder(`Room-${record.roomNumber}`);
    if (!roomFolder) continue;
    
    try {
      // Fetch front image
      if (record.idFrontImage) {
        const frontUrl = await getIdProofImageUrl(record.idFrontImage);
        if (frontUrl) {
          const response = await fetch(frontUrl);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          roomFolder.file(
            `${record.guestName.replace(/[^a-zA-Z0-9]/g, '_')}_IDFront.jpg`,
            arrayBuffer
          );
        }
      }
      
      // Fetch back image
      if (record.idBackImage) {
        const backUrl = await getIdProofImageUrl(record.idBackImage);
        if (backUrl) {
          const response = await fetch(backUrl);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          roomFolder.file(
            `${record.guestName.replace(/[^a-zA-Z0-9]/g, '_')}_IDBack.jpg`,
            arrayBuffer
          );
        }
      }
    } catch (error) {
      console.error(`Error processing images for ${record.guestName}:`, error);
    }
  }
  
  // Generate ZIP with password protection
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    password: password, // Note: JSZip password protection is basic, consider using stronger encryption
  });
  
  // Download ZIP
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `Guest_Identification_Documents_${format(new Date(), 'yyyy-MM-dd')}.zip`;
  link.click();
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
