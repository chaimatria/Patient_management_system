import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDatabase();

    // 1. Consultations trend (last 30 days, grouped by date)
    const consultationsTrend = db.prepare(`
      SELECT 
        DATE(consultation_date) as date,
        COUNT(*) as count
      FROM consultations
      WHERE consultation_date >= datetime('now', '-30 days')
      GROUP BY DATE(consultation_date)
      ORDER BY date ASC
    `).all();

    // 2. Consultation status distribution
    // Based on appointments status
    const statusDistribution = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM appointments
      GROUP BY status
    `).all();

    // 3. Common pathologies (from patients pathology field)
    const commonPathologies = db.prepare(`
      SELECT 
        pathology,
        COUNT(*) as count
      FROM patients
      WHERE pathology IS NOT NULL AND pathology != ''
      GROUP BY pathology
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // 4. Pathologies by count (with better aggregation)
    const pathologiesByCount = db.prepare(`
      SELECT 
        pathology,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM patients WHERE pathology IS NOT NULL AND pathology != '') as percentage
      FROM patients
      WHERE pathology IS NOT NULL AND pathology != ''
      GROUP BY pathology
      ORDER BY count DESC
      LIMIT 8
    `).all();

    // 5. Total consultations
    const totalConsultations = db.prepare(`
      SELECT COUNT(*) as total FROM consultations
    `).get();

    // 6. Total prescriptions
    const totalPrescriptions = db.prepare(`
      SELECT COUNT(*) as total FROM prescriptions
    `).get();

    // 7. Success rate (completed appointments / total appointments)
    const successRate = db.prepare(`
      SELECT 
        CAST(COUNT(CASE WHEN status = 'completed' THEN 1 END) AS FLOAT) * 100.0 / COUNT(*) as rate
      FROM appointments
      WHERE status IN ('completed', 'cancelled', 'no-show')
    `).get();

    // 8. Weekly trend (last 12 weeks)
    const weeklyTrend = db.prepare(`
      SELECT 
        strftime('%Y-W%W', consultation_date) as week,
        strftime('%W', consultation_date) as week_number,
        COUNT(*) as count
      FROM consultations
      WHERE consultation_date >= datetime('now', '-84 days')
      GROUP BY week
      ORDER BY week ASC
    `).all();

    // 9. Monthly trend (last 12 months)
    const monthlyTrend = db.prepare(`
      SELECT 
        strftime('%Y-%m', consultation_date) as month,
        COUNT(*) as count
      FROM consultations
      WHERE consultation_date >= datetime('now', '-1 year')
      GROUP BY month
      ORDER BY month ASC
    `).all();

    // 10. Consultation status breakdown (detailed)
    const statusBreakdown = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        CAST(COUNT(*) AS FLOAT) * 100.0 / (SELECT COUNT(*) FROM appointments) as percentage
      FROM appointments
      GROUP BY status
    `).all();

    // Format response
    const response = {
      stats: {
        totalConsultations: totalConsultations.total || 0,
        totalPrescriptions: totalPrescriptions.total || 0,
        successRate: Math.round(successRate?.rate || 0),
        totalPathologies: commonPathologies.length
      },
      trends: {
        weekly: formatTrendData(weeklyTrend, 'week'),
        monthly: formatTrendData(monthlyTrend, 'month'),
        daily: formatTrendData(consultationsTrend, 'date')
      },
      consultationStatus: formatStatusDistribution(statusBreakdown),
      pathologies: {
        common: formatPathologies(commonPathologies),
        byCount: formatPathologiesByCount(pathologiesByCount)
      },
      metadata: {
        lastUpdated: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data', details: error.message },
      { status: 500 }
    );
  }
}

// Format trend data for charts
function formatTrendData(data, type) {
  return data.map(item => ({
    label: formatLabel(item, type),
    count: item.count,
    timestamp: item.date || item.month || item.week
  }));
}

// Format label based on type
function formatLabel(item, type) {
  if (type === 'date') {
    const date = new Date(item.date + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  } else if (type === 'month') {
    const [year, month] = item.month.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  } else if (type === 'week') {
    return `Week ${item.week_number || item.week}`;
  }
  return item.label;
}

// Format status distribution for pie charts
function formatStatusDistribution(data) {
  const completed = data.find(d => d.status === 'completed')?.count || 0;
  const pending = data.find(d => d.status === 'scheduled')?.count || 0;
  const cancelled = data.find(d => d.status === 'cancelled')?.count || 0;

  const total = completed + pending + cancelled;
  
  return {
    completed: {
      label: 'Completed',
      count: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    },
    pending: {
      label: 'Pending',
      count: pending,
      percentage: total > 0 ? Math.round((pending / total) * 100) : 0
    },
    cancelled: {
      label: 'Cancelled',
      count: cancelled,
      percentage: total > 0 ? Math.round((cancelled / total) * 100) : 0
    },
    total
  };
}

// Format pathologies for display
function formatPathologies(data) {
  return data.map((item, index) => ({
    name: item.pathology || 'Unknown',
    count: item.count,
    category: categorizePathology(item.pathology) || 'General'
  }));
}

// Format pathologies by count for bar charts
function formatPathologiesByCount(data) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return data.map((item, index) => ({
    name: item.pathology || 'Unknown',
    count: item.count,
    maxCount: maxCount,
    percentage: Math.round(item.percentage || 0)
  }));
}

// Categorize pathology based on common medical knowledge
function categorizePathology(pathology) {
  if (!pathology) return 'General';
  
  const pathologyLower = pathology.toLowerCase();

  if (pathologyLower.includes('cold') || pathologyLower.includes('flu') || pathologyLower.includes('respiratory') || pathologyLower.includes('cough')) {
    return 'Respiratory';
  }
  if (pathologyLower.includes('hypertension') || pathologyLower.includes('heart') || pathologyLower.includes('cardiac') || pathologyLower.includes('cardiovascular')) {
    return 'Cardiovascular';
  }
  if (pathologyLower.includes('diabetes') || pathologyLower.includes('endocrine')) {
    return 'Endocrine';
  }
  if (pathologyLower.includes('allerg')) {
    return 'Immunology';
  }
  if (pathologyLower.includes('arthritis') || pathologyLower.includes('bone') || pathologyLower.includes('joint')) {
    return 'Orthopedic';
  }
  if (pathologyLower.includes('depression') || pathologyLower.includes('anxiety') || pathologyLower.includes('mental') || pathologyLower.includes('psychiatric')) {
    return 'Mental Health';
  }
  if (pathologyLower.includes('stomach') || pathologyLower.includes('digestive') || pathologyLower.includes('gastro')) {
    return 'Gastroenterology';
  }

  return 'General';
}
