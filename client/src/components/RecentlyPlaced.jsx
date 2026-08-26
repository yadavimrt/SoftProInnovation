import React from 'react';

const placements = [
  { id: 1, name: 'Aditya Kumar', company: 'Feeding Trends' },
  { id: 2, name: 'Ansh Pandey', company: 'Digivity Technology' },
  { id: 3, name: 'Anshika Sharma', company: 'Hytrix' },
  { id: 4, name: 'Anushka Maurya', company: 'India Fast Forward Advisory Services' },
  { id: 5, name: 'Aruna Yadav', company: 'Tasknova Solutions' },
  { id: 6, name: 'Ashish Kumar Yadav', company: 'Clinch Fusion Bridge' },
  { id: 7, name: 'Rahul Singh', company: 'Tech Innovators' },
  { id: 8, name: 'Priya Patel', company: 'SoftPro Innovation' }
];

const RecentlyPlaced = () => {
  return (
    <section className="recently-placed-section py-3">
      <div className="container-fluid px-0">
        <div className="d-flex align-items-center bg-dark-blue p-2 overflow-hidden position-relative">
          
          {/* Static Title on Left */}
          <div className="recently-placed-title px-4 flex-shrink-0 d-flex align-items-center justify-content-center border-end border-secondary border-opacity-25" style={{ zIndex: 10, backgroundColor: '#1b1b3a' }}>
            <h5 className="mb-0 fw-bold lh-sm text-uppercase" style={{ color: '#2dd4bf', fontSize: '14px', letterSpacing: '1px' }}>
              Recently<br/>Placed
            </h5>
          </div>

          {/* Marquee Ticker */}
          <div className="ticker-wrapper flex-grow-1 overflow-hidden">
            <div className="ticker-content d-flex gap-3 align-items-center py-2 px-3">
              {/* Double the array for seamless infinite loop */}
              {[...placements, ...placements].map((item, index) => (
                <div key={`${item.id}-${index}`} className="placement-pill flex-shrink-0 d-flex align-items-center gap-3 px-2 py-1 rounded-pill">
                  <div className="placement-avatar rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold fs-6">
                    {item.name.charAt(0)}
                  </div>
                  <div className="pe-3">
                    <h6 className="mb-0 text-white fw-bold" style={{ fontSize: '14px' }}>{item.name}</h6>
                    <small style={{ color: '#94a3b8', fontSize: '12px' }}>{item.company}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default RecentlyPlaced;
