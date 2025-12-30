import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDatabase();

    // 1. Total patients count
    const patientCountResult = db.prepare(`
      SELECT COUNT(*) as total FROM patients
    `).get();
    const totalPatients = patientCountResult.total;

    // 2. Total consultations count
    const consultationCountResult = db.prepare(`
      SELECT COUNT(*) as total FROM consultations
    `).get();
    const totalConsultations = consultationCountResult.total;

    // 3. Upcoming appointments (next 5)
    const upcomingAppointments = db.prepare(`
      SELECT 
        appointment_id,
        patient_name,
        appointment_date,
        appointment_time,
        appointment_type
      FROM appointments
      WHERE appointment_date >= DATE('now')
      AND status = 'scheduled'
      ORDER BY appointment_date ASC, appointment_time ASC
      LIMIT 5
    `).all();

    // 4. Recent consultations (last 5)
    const recentConsultations = db.prepare(`
      SELECT 
        c.consultation_id,
        p.full_name as patient_name,
        c.consultation_date,
        c.description
      FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      ORDER BY c.consultation_date DESC
      LIMIT 5
    `).all();

    // 5. Recent prescriptions (last 5)
    const recentPrescriptions = db.prepare(`
      SELECT 
        pr.prescription_id,
        p.full_name as patient_name,
        pr.prescription_date
      FROM prescriptions pr
      LEFT JOIN patients p ON pr.patient_id = p.patient_id
      ORDER BY pr.prescription_date DESC
      LIMIT 5
    `).all();

    // 6. Count of new patients this month
    const newPatientsThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM patients
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get();

    // 7. Recent prescriptions (last 7 days)
    const recentPrescriptionsCount = db.prepare(`
      SELECT COUNT(*) as count FROM prescriptions
      WHERE prescription_date >= datetime('now', '-7 days')
    `).get();

    // 8. Recent activity (combined from consultations and prescriptions)
    const recentActivity = db.prepare(`
      SELECT 
        'consultation' as type,
        c.consultation_id as id,
        p.full_name as patient_name,
        c.consultation_date as activity_date,
        c.description as description
      FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      WHERE c.consultation_date >= datetime('now', '-7 days')
      
      UNION ALL
      
      SELECT 
        'prescription' as type,
        pr.prescription_id as id,
        p.full_name as patient_name,
        pr.prescription_date as activity_date,
        'Prescription created' as description
      FROM prescriptions pr
      LEFT JOIN patients p ON pr.patient_id = p.patient_id
      WHERE pr.prescription_date >= datetime('now', '-7 days')
      
      UNION ALL
      
      SELECT 
        'patient' as type,
        NULL as id,
        p.full_name as patient_name,
        p.created_at as activity_date,
        'Patient added' as description
      FROM patients p
      WHERE p.created_at >= datetime('now', '-7 days')
      
      ORDER BY activity_date DESC
      LIMIT 10
    `).all();

    // Format the response to match dashboard expectations
    const stats = [
      {
        label: 'Total Patients',
        value: String(totalPatients),
        change: `${newPatientsThisMonth.count} nouveau(x) ce mois`,
        changeType: newPatientsThisMonth.count > 0 ? 'positive' : 'neutral',
        icon: 'Users'
      },
      {
        label: 'Rendez-vous a venir',
        value: String(upcomingAppointments.length),
        change: upcomingAppointments.length > 0 ? 'À venir' : 'Aucun',
        changeType: upcomingAppointments.length > 0 ? 'positive' : 'neutral',
        icon: 'CalendarCheck'
      },
      {
        label: 'Ordonnances récentes',
        value: String(recentPrescriptionsCount.count),
        change: recentPrescriptionsCount.count > 0 ? `${recentPrescriptionsCount.count} cette semaine` : 'Aucun',
        changeType: recentPrescriptionsCount.count > 0 ? 'positive' : 'neutral',
        icon: 'FileCheck'
      }
    ];

    // Format appointments for display
    const appointments = upcomingAppointments.map(apt => ({
      time: apt.appointment_time || 'N/A',
      patient: apt.patient_name || 'Unknown',
      type: apt.appointment_type || 'Appointment'
    }));

    // Format activity items
    const activities = recentActivity.map(activity => {
      let icon = 'FileText';
      let text = `${activity.patient_name}: ${activity.description || 'Activity'}`;
      
      if (activity.type === 'consultation') {
        icon = 'CalendarCheck';
        text = `Consultation de ${activity.patient_name}`;
      } else if (activity.type === 'prescription') {
        icon = 'FileCheck';
        text = `Ordonnance pour ${activity.patient_name}`;
      } else if (activity.type === 'patient') {
        icon = 'Users';
        text = `Nouveau patient: ${activity.patient_name}`;
      }

      return {
        text,
        time: formatTimeAgo(activity.activity_date),
        icon
      };
    });

    return NextResponse.json({
      stats,
      appointments,
      activities,
      metadata: {
        totalPatients,
        totalConsultations,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to format time relative to now
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} heure(s)`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} jour(s)`;
  
  return date.toLocaleDateString('fr-FR');
}
