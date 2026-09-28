import PDFDocument from 'pdfkit';

type AgreementPdfInput = {
  id: string;
  status: string;
  rentEach: number;
  electricity: string;
  internet: string;
  cleaning: string;
  groceries: string;
  guests: string;
  quietHours: string;
  notes: string | null;
  confirmedAt: string | null;
  moveInConfirmedAt: string | null;
  partyA: string;
  partyB: string;
};

function inr(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function buildAgreementPdf(data: AgreementPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 54, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).text('Roommate Living Agreement', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555555').text('Alaya · Bengaluru · Not a lease', { align: 'center' });
    doc.moveDown(1.5);
    doc.fillColor('#000000').fontSize(11);

    doc.text(`Agreement ID: ${data.id}`);
    doc.text(`Status: ${data.status}`);
    if (data.confirmedAt) doc.text(`Confirmed: ${new Date(data.confirmedAt).toLocaleString('en-IN')}`);
    if (data.moveInConfirmedAt) {
      doc.text(`Move-in acknowledged: ${new Date(data.moveInConfirmedAt).toLocaleString('en-IN')}`);
    }
    doc.moveDown(1);

    doc.fontSize(13).text('Parties');
    doc.moveDown(0.3);
    doc.fontSize(11).text(`${data.partyA} and ${data.partyB} agree to the following house rules.`);

    doc.moveDown(1);
    doc.fontSize(13).text('Terms');
    doc.moveDown(0.5);
    const lines: [string, string][] = [
      ['Rent each', inr(data.rentEach)],
      ['Electricity', data.electricity],
      ['Internet', data.internet],
      ['Cleaning', data.cleaning],
      ['Groceries', data.groceries],
      ['Guests', data.guests],
      ['Quiet hours', data.quietHours],
    ];
    for (const [label, value] of lines) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    }

    if (data.notes) {
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').text('Notes');
      doc.font('Helvetica').text(data.notes);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666666').text(
      'This document records mutual expectations between roommates on Alaya. It is not legal advice or a registered lease.',
      { align: 'left' },
    );

    doc.end();
  });
}
