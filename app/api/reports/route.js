import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDatabase();
    
    //Total consultations count
    const totalConsultationsResult = db.prepare(
      'SELECT COUNT(*) as count FROM consultations'
    ).get();
    const totalConsultations = totalConsultationsResult.count;

    //Average consultations per day
    const dayCountResult = db.prepare(`
      SELECT COUNT(DISTINCT DATE(consultation_date)) as days 
      FROM consultations 
      WHERE consultation_date IS NOT NULL
    `).get();
    const avgPerDay = dayCountResult.days > 0 
      ? Math.round(totalConsultations / dayCountResult.days) 
      : 0;

    //Successful resolutions percentage
    const completedResult = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
    `).get();
    const successRate = totalConsultations > 0 
      ? Math.round((completedResult.count / totalConsultations) * 100) 
      : 0;
    
    // Weekly trend
    const weeklyTrend = db.prepare(`
      SELECT 
        strftime('%Y-W%W', consultation_date) as week,
        COUNT(*) as count,
        strftime('%Y-%m-%d', consultation_date) as first_date
      FROM consultations
      WHERE consultation_date IS NOT NULL
      GROUP BY strftime('%Y-W%W', consultation_date)
      ORDER BY week DESC
      LIMIT 8
    `).all();

    const weeklyData = weeklyTrend.reverse().map(row => ({
      period: row.week || 'Unknown',
      count: row.count || 0
    }));

    // Monthly trend
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

    const monthlyData = monthlyTrend.reverse().map(row => ({
      period: row.month || 'Unknown',
      count: row.count || 0
    }));
    
    //Completed: all consultations with consultation_date <= today
    const completedCount = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
      WHERE consultation_date IS NOT NULL AND DATE(consultation_date) <= DATE('now')
    `).get().count || 0;

    //Pending: consultations with future dates
    const pendingCount = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
      WHERE consultation_date IS NOT NULL AND DATE(consultation_date) > DATE('now')
    `).get().count || 0;

    const cancelledCount = Math.max(0, totalConsultations - completedCount - pendingCount);

    const statusTotal = completedCount + pendingCount + cancelledCount;
    const statusData = {
      completed: statusTotal > 0 ? Math.round((completedCount / statusTotal) * 100) : 0,
      pending: statusTotal > 0 ? Math.round((pendingCount / statusTotal) * 100) : 0,
      cancelled: statusTotal > 0 ? Math.round((cancelledCount / statusTotal) * 100) : 0
    };


    const pathologiesData = db.prepare(`
      SELECT 
        pathology_name as name,
        COUNT(*) as count,
        'General' as category
      FROM pathologies
      WHERE pathology_name IS NOT NULL AND pathology_name != ''
      GROUP BY pathology_name
      ORDER BY count DESC
      LIMIT 5
    `).all();

    const pathologies = pathologiesData.map(p => ({
      name: p.name || 'Unknown',
      count: p.count || 0,
      category: p.category || 'General'
    }));

    //FETCH PATHOLOGIES BY COUNT (for bar chart)
    const pathologiesByCountData = db.prepare(`
      SELECT 
        pathology_name as name,
        COUNT(*) as count
      FROM pathologies
      WHERE pathology_name IS NOT NULL AND pathology_name != ''
      GROUP BY pathology_name
      ORDER BY count DESC
      LIMIT 5
    `).all();

    const pathologiesByCount = pathologiesByCountData.map(p => ({
      name: p.name || 'Unknown',
      count: p.count || 0
    }));

    // Return aggregated report data
    return NextResponse.json(
      {
        stats: {
          totalConsultations,
          avgPerDay,
          successRate
        },
        trend: {
          weekly: weeklyData,
          monthly: monthlyData
        },
        status: statusData,
        pathologies,
        pathologiesByCount
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reports data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
