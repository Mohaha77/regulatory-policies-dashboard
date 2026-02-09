import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { SubjectService } from './subject.service';

export class ExportService {
  static async exportToExcel(filters: Record<string, any> = {}) {
    const result = SubjectService.getAll({ ...filters, limit: 1000 });
    const data = result.data;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Regulatory Policies Dashboard';

    const worksheet = workbook.addWorksheet('Subjects', {
      views: [{ rightToLeft: true }],
    });

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'العنوان / Title', key: 'title', width: 40 },
      { header: 'النوع / Type', key: 'type', width: 15 },
      { header: 'الأولوية / Priority', key: 'priority', width: 12 },
      { header: 'الحالة / Status', key: 'status', width: 15 },
      { header: 'تاريخ الاستحقاق / Due Date', key: 'dueDate', width: 18 },
      { header: 'أنشئ بواسطة / Created By', key: 'createdBy', width: 20 },
      { header: 'تاريخ الإنشاء / Created At', key: 'createdAt', width: 18 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    for (const item of data) {
      worksheet.addRow({
        id: item.id,
        title: item.title,
        type: item.type,
        priority: item.priority,
        status: item.status,
        dueDate: item.dueDate || '-',
        createdBy: item.createdBy?.displayNameEn || '-',
        createdAt: item.createdAt,
      });
    }

    return workbook;
  }

  static async exportMyWorkToExcel(userId: number) {
    const data = SubjectService.getMyWork(userId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Work', {
      views: [{ rightToLeft: true }],
    });

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'العنوان / Title', key: 'title', width: 40 },
      { header: 'النوع / Type', key: 'type', width: 15 },
      { header: 'الأولوية / Priority', key: 'priority', width: 12 },
      { header: 'الحالة / Status', key: 'status', width: 15 },
      { header: 'تاريخ الاستحقاق / Due Date', key: 'dueDate', width: 18 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };

    for (const item of data) {
      worksheet.addRow({
        id: item.id,
        title: item.title,
        type: item.type,
        priority: item.priority,
        status: item.status,
        dueDate: item.dueDate || '-',
      });
    }

    return workbook;
  }

  static async exportMyWorkToWord(userId: number) {
    const data = SubjectService.getMyWork(userId);

    const tableRows = [
      new TableRow({
        tableHeader: true,
        children: ['#', 'Title / العنوان', 'Type', 'Priority', 'Status', 'Due Date'].map(text =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: 'Noto Sans Arabic' })],
              alignment: AlignmentType.CENTER,
            })],
            shading: { fill: '1F4E79' },
            width: { size: 15, type: WidthType.PERCENTAGE },
          })
        ),
      }),
    ];

    for (const item of data) {
      tableRows.push(
        new TableRow({
          children: [
            String(item.id),
            item.title,
            item.type,
            item.priority,
            item.status,
            item.dueDate || '-',
          ].map(text =>
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text, font: 'Noto Sans Arabic' })],
                bidirectional: true,
              })],
              width: { size: 15, type: WidthType.PERCENTAGE },
            })
          ),
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'My Work Report / تقرير أعمالي', bold: true, size: 32, font: 'Noto Sans Arabic' })],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            bidirectional: true,
          }),
          new Paragraph({
            children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('ar-SA')}`, size: 20, font: 'Noto Sans Arabic' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }],
    });

    return Packer.toBuffer(doc);
  }
}
