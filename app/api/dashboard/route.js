import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDatabase();
    
    //Total patients count
    const totalPatients = db.prepare(
      'SELECT COUNT(*) as count FROM patients'
    ).get();

    //Count new patients this month
    const newPatientsThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM patients 
      WHERE DATE(created_at) >= DATE('now', 'start of month')
    `).get();

    //Today's appointments count
    const todayAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM consultations 
      WHERE DATE(consultation_date) = DATE('now')
    `).get();

    //Completed consultations count (this can be determined by a status field or recent consultations)
    const completedConsultations = db.prepare(`
      SELECT COUNT(*) as count FROM consultations
    `).get();

    //Build stats array
    const stats = [
      {
        label: 'Total Patients',
        value: totalPatients.count.toString(),
        change: `${newPatientsThisMonth.count} new this month`,
        changeType: newPatientsThisMonth.count > 0 ? 'positive' : 'neutral',
        icon: 'Users'
      },
      {
        label: 'Consultations à venir',
        value: todayAppointments.count.toString(),
        change: 'Today',
        changeType: todayAppointments.count > 0 ? 'positive' : 'neutral',
        icon: 'CalendarCheck'
      },
      {
        label: 'Consultations Complétées',
        value: completedConsultations.count.toString(),
        change: 'Total history',
        changeType: 'positive',
        icon: 'FileCheck'
      }
    ];

    // FETCH APPOINTMENTS (Today's)    
    const appointments = db.prepare(`
      SELECT 
        c.consultation_date,
        p.full_name,
        c.description as type
      FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      WHERE DATE(c.consultation_date) = DATE('now')
      ORDER BY c.consultation_date ASC
    `).all();

    //Format appointments with time
    const formattedAppointments = appointments.map(appt => {
      const date = new Date(appt.consultation_date);
      const timeStr = date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
      
      //Estimate 30 min duration (to be adjusted later on)
      const endTime = new Date(date.getTime() + 30 * 60000);
      const endTimeStr = endTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit'
      });

      return {
        time: `${timeStr} - ${endTimeStr}`,
        patient: appt.full_name,
        type: appt.type || 'Consultation'
      };
    });
    
    //Get recent patient additions
    const recentPatients = db.prepare(`
      SELECT created_at, full_name FROM patients
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    //Get recent consultations
    const recentConsultations = db.prepare(`
      SELECT c.consultation_date, p.full_name FROM consultations c
      JOIN patients p ON c.patient_id = p.patient_id
      ORDER BY c.created_at DESC
      LIMIT 5
    `).all();

    //Combine and format activities
    const allActivities = [];

    //Add recent patients as activities
    recentPatients.forEach(patient => {
      allActivities.push({
        text: `Nouveau patient, ${patient.full_name}, ajouté à la base de données.`,
        time: getTimeAgo(new Date(patient.created_at)),
        icon: 'Users',
        timestamp: new Date(patient.created_at).getTime()
      });
    });

    //Add recent consultations as activities
    recentConsultations.forEach(consultation => {
      allActivities.push({
        text: `Rendez-vous de ${consultation.full_name} enregistré.`,
        time: getTimeAgo(new Date(consultation.consultation_date)),
        icon: 'CalendarCheck',
        timestamp: new Date(consultation.consultation_date).getTime()
      });
    });

    //Sort by timestamp (newest first) and take top 5
    const activities = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ text, time, icon }) => ({ text, time, icon }));

    //Return dashboard data in expected format
    return NextResponse.json(
      {
        stats,
        appointments: formattedAppointments,
        activities
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}


function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) {
    return 'À l\'instant';
  }
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `Il y a ${minutesAgo} min`;
  }
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `Il y a ${hoursAgo} heure${hoursAgo > 1 ? 's' : ''}`;
  }
  const daysAgo = Math.floor(hoursAgo / 24);
  return `Il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}`;
}
