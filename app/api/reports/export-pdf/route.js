import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const db = getDatabase();

    // Fetch trend data
    const weeklyTrend = db.prepare(`
      SELECT 
        strftime('%Y-W%W', consultation_date) as week,
        COUNT(*) as count
      FROM consultations
      WHERE consultation_date IS NOT NULL
      GROUP BY strftime('%Y-W%W', consultation_date)
      ORDER BY week DESC
      LIMIT 8
    `).all();

    const monthlyTrend = db.prepare(`
      SELECT 
        strftime('%Y-%m', consultation_date) as month,
        COUNT(*) as count
      FROM consultations
      WHERE consultation_date IS NOT NULL
      GROUP BY strftime('%Y-%m', consultation_date)
      ORDER BY month DESC
      LIMIT 12
    `).all();

    // Fetch overall stats
    const totalConsultationsResult = db.prepare(
      'SELECT COUNT(*) as count FROM consultations'
    ).get();
    const totalConsultations = totalConsultationsResult.count;

    const dayCountResult = db.prepare(`
      SELECT COUNT(DISTINCT DATE(consultation_date)) as days 
      FROM consultations 
      WHERE consultation_date IS NOT NULL
    `).get();
    const avgPerDay = dayCountResult.days > 0
      ? Math.round(totalConsultations / dayCountResult.days)
      : 0;

    const completedResult = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
    `).get();
    const successRate = totalConsultations > 0
      ? Math.round((completedResult.count / totalConsultations) * 100)
      : 0;

    // Create PDF using jsPDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(24);
    doc.text('Consultations Trend Report', doc.internal.pageSize.getWidth() / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Summary section
    doc.setFontSize(11);
    doc.text(`Total Consultations: ${totalConsultations}  |  Avg. Per Day: ${avgPerDay}  |  Success Rate: ${successRate}%`, 20, yPosition);
    yPosition += 15;

    // Weekly trends section
    doc.setFontSize(14);
    doc.text('Weekly Trends', 20, yPosition);
    yPosition += 10;

    // Weekly table
    doc.setFontSize(10);
    doc.text('Period', 20, yPosition);
    doc.text('Consultations', 150, yPosition);
    yPosition += 7;

    // Weekly data
    weeklyTrend.reverse().forEach((row) => {
      doc.text(row.week || 'Unknown', 20, yPosition);
      doc.text((row.count || 0).toString(), 150, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Monthly trends section
    doc.setFontSize(14);
    doc.text('Monthly Trends', 20, yPosition);
    yPosition += 10;

    // Monthly table
    doc.setFontSize(10);
    doc.text('Period', 20, yPosition);
    doc.text('Consultations', 150, yPosition);
    yPosition += 7;

    // Monthly data
    monthlyTrend.reverse().forEach((row) => {
      doc.text(row.month || 'Unknown', 20, yPosition);
      doc.text((row.count || 0).toString(), 150, yPosition);
      yPosition += 7;
    });

    // Footer
    doc.setFontSize(9);
    doc.text(`Report generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('Patient Management System', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="consultations-trend-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export PDF',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
