export default function PrescriptionPrintView({ patient, medications, clinicInfo, doctorInfo }) {
  const activeMedications = medications.filter(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const rxNumber = generateRxNumber();


  if (activeMedications.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body * {
            visibility: hidden;
          }
          #prescription-print-content,
          #prescription-print-content * {
            visibility: visible;
          }
          #prescription-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div id="prescription-print-content" className="hidden print:block" style={{ 
        pageBreakAfter: 'always',
        backgroundColor: 'white',
        padding: '40px',
        maxWidth: '210mm',
        margin: '0 auto'
      }}>
        {/* header   containing doctor info */}
        <div style={{ 
          borderBottom: '2px solid black', 
          paddingBottom: '20px', 
          marginBottom: '30px' 
        }}>
          {/* doctor name */}
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: '0 0 8px 0',
            color: 'black'
          }}>
            {doctorInfo.name || 'Dr Bendounan Djilali'}
          </h1>
          
          {/* specialty */}
          <p style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 12px 0',
            color: 'black'
          }}>
            {doctorInfo.specialty || 'Cardiologue'}
          </p>
          
          {/* city */}
          <p style={{ 
            fontSize: '14px', 
            margin: '0 0 4px 0',
            color: 'black'
          }}>
            {clinicInfo.city || 'Alger'}
          </p>
          
          {/* contact info */}
          <p style={{ 
            fontSize: '12px', 
            margin: '0 0 2px 0',
            color: 'black'
          }}>
            Tél : {clinicInfo.phone || '0552265120'}
          </p>
          <p style={{ 
            fontSize: '12px', 
            margin: '0',
            color: 'black'
          }}>
            N° Ordre : {doctorInfo.orderNumber || '00152017'}
          </p>
        </div>

        {/* title - ordonnance */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px' 
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            margin: '0',
            color: 'black'
          }}>
            Ordonnance
          </h2>
        </div>

        {/* date and patient info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '40px',
          fontSize: '14px'
        }}>
          <div>
            <p style={{ margin: '0', color: 'black' }}>
              <strong>Faite le :</strong> {currentDate}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', color: 'black' }}>
              <strong>Patient(e) :</strong> {patient?.name || 'IBACHIRENE Abdelkrim'}
            </p>
            <p style={{ margin: '0', fontSize: '12px', color: 'black' }}>
              Age : {patient?.age || '43'} ans
            </p>
          </div>
        </div>

        {/* medications list */}
        <div style={{ marginBottom: '60px' }}>
          {activeMedications.map((med, index) => (
            <div key={med.id} style={{ marginBottom: '30px' }}>
              {/* medication header with quantity */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    margin: '0',
                    color: 'black'
                  }}>
                    {med.drugName} {med.dosage}
                  </p>
                </div>
                <div style={{ marginLeft: '20px' }}>
                  <p style={{ 
                    fontSize: '13px', 
                    fontWeight: '600',
                    margin: '0',
                    color: 'black'
                  }}>
                    Qte: {index + 1}
                  </p>
                </div>
              </div>
              
              {/* instructions */}
              <p style={{ 
                fontSize: '13px', 
                margin: '8px 0 0 0',
                lineHeight: '1.6',
                color: 'black'
              }}>
                {med.instructions}
              </p>
              
              {/* duration */}
              {med.duration && (
                <p style={{ 
                  fontSize: '13px', 
                  margin: '4px 0 0 0',
                  color: 'black'
                }}>
                  Durée : {med.duration}
                </p>
              )}
              
              {/* separator line between medications */}
              {index < activeMedications.length - 1 && (
                <div style={{ 
                  borderBottom: '1px solid #ddd',
                  marginTop: '20px'
                }}></div>
              )}
            </div>
          ))}
        </div>

        {/* barcode and number */}
        <div style={{ 
          textAlign: 'center',
          marginTop: '80px',
          paddingTop: '20px'
        }}>
          {/* simple barcode representation */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: '2px',
            marginBottom: '10px',
            height: '50px',
            alignItems: 'flex-end'
          }}>
            {[3, 1, 3, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 3].map((width, i) => (
              <div key={i} style={{
                width: `${width}px`,
                height: '40px',
                backgroundColor: 'black'
              }}></div>
            ))}
          </div>
          
          <p style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            margin: '10px 0 4px 0',
            color: 'black'
          }}>
            {rxNumber}
          </p>
          <p style={{ 
            fontSize: '10px',
            margin: '0',
            color: '#666'
          }}>
            https://www.pharmanet-dz.com
          </p>
        </div>
      </div>
    </>
  );
}

// Helper function to generate prescription number
function generateRxNumber() {
  const random = Math.floor(Math.random() * 1000);
  return `0291-${random.toString().padStart(3, '0')}`;
}