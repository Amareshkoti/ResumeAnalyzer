import ExcelJS from 'exceljs';
import { SectionTimetable, TimeSlot } from '../types/timetable';

export const exportToExcel = async (
  timetables: SectionTimetable[],
  timeSlots: TimeSlot[]
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  
  timetables.forEach(sectionData => {
    const worksheet = workbook.addWorksheet(`Section ${sectionData.section}`);
    
    // Create headers - Day + Time slots
    const headers = ['DAY', ...timeSlots.map((slot, index) => {
      if (slot.isBreak) return 'BREAK';
      if (slot.isLunch) return 'LUNCH';
      return `${index + 1}\n${slot.label}`;
    })];
    
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2563EB' } // Blue-600
      };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } }
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        wrapText: true 
      };
    });
    
    // Add data rows
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      const rowData = [day.toUpperCase().substring(0, 3)]; // MON, TUE, etc.
      const daySchedule = sectionData.schedule[day] || [];
      
      // Add each time slot data
      timeSlots.forEach((slot, slotIndex) => {
        const cell = daySchedule[slotIndex];
        if (cell) {
          if (cell.isBreak) {
            rowData.push('BREAK');
          } else if (cell.isLunch) {
            rowData.push('LUNCH');
          } else if (cell.subject === 'Free Period') {
            rowData.push('Free Period');
          } else {
            // Format: Subject + Faculty (if available)
            const displayText = cell.faculty ? 
              `${cell.subject}\n${cell.faculty}` : 
              cell.subject;
            rowData.push(displayText);
          }
        } else {
          rowData.push('Free Period');
        }
      });
      
      const dataRow = worksheet.addRow(rowData);
      
      // Style data rows
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        };
        cell.font = { size: 9 };
        
        // Color coding based on content
        if (colNumber === 1) {
          // Day column
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'DBEAFE' } // Blue-100
          };
        } else {
          const cellValue = cell.value as string;
          if (cellValue === 'BREAK') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FEF3C7' } // Yellow-100
            };
            cell.font = { bold: true, size: 9 };
          } else if (cellValue === 'LUNCH') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FCE7F3' } // Pink-100
            };
            cell.font = { bold: true, size: 9 };
          } else if (cellValue === 'Free Period') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F9FAFB' } // Gray-50
            };
            cell.font = { italic: true, color: { argb: '6B7280' }, size: 9 };
          } else if (cellValue && cellValue.includes('LAB')) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'DCFCE7' } // Green-100
            };
            cell.font = { bold: true, size: 9 };
          } else if (cellValue && cellValue !== '') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'EFF6FF' } // Blue-50
            };
          }
        }
      });
      
      // Set row height for better readability
      dataRow.height = 35;
    });
    
    // Auto-fit columns with specific widths
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        // Day column
        column.width = 8;
      } else {
        // Time slot columns
        column.width = 15;
      }
    });
    
    // Set header row height
    headerRow.height = 30;
    
    // Add section title
    worksheet.insertRow(1, [`Section ${sectionData.section} - Timetable`]);
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(1, 1, 1, timeSlots.length + 1);
    titleRow.height = 25;
    
    // Add empty row for spacing
    worksheet.insertRow(2, []);
  });
  
  // Generate buffer and download
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-timetable-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Failed to generate Excel file');
  }
};