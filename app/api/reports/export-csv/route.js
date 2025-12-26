import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

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

    // Prepare CSV content
    let csvContent = 'Consultations Trend Report\n\n';
    csvContent += 'Weekly Trends\n';
    csvContent += 'Period,Count\n';

    weeklyTrend.reverse().forEach(row => {
      csvContent += `${row.week || 'Unknown'},${row.count || 0}\n`;
    });

    csvContent += '\n\nMonthly Trends\n';
    csvContent += 'Period,Count\n';

    monthlyTrend.reverse().forEach(row => {
      csvContent += `${row.month || 'Unknown'},${row.count || 0}\n`;
    });

    // Generate response with CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="consultations-trend-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export CSV',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
