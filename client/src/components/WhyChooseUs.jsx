
const WhyChooseUs = () => {
  const features = [
    {
      icon: "bi bi-truck",
      title: "Fast Delivery",
      description: "Deliver across India",
      color: "text-primary"
    },
    {
      icon: "bi bi-shield-lock",
      title: "Secure Payments",
      description: "100% secure checkout",
      color: "text-success"
    },
    {
      icon: "bi bi-patch-check",
      title: "Quality Components",
      description: "Tested & reliable products",
      color: "text-warning"
    },
    {
      icon: "bi bi-chat-dots",
      title: "Expert Support",
      description: "Get help with your projects",
      color: "text-info"
    },
    {
      icon: "bi bi-arrow-return-left",
      title: "Easy Returns",
      description: "Simple return policy",
      color: "text-danger"
    }
  ];

  return (
    <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{ color: '#0f172a' }}>Why Makers Choose Us</h2>
          <div className="mx-auto mt-2" style={{ width: '50px', height: '3px', backgroundColor: '#2563eb', borderRadius: '2px' }}></div>
        </div>
        <div className="row g-4 justify-content-center">
          {features.map((feature, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg">
              <div 
                className="card h-100 border-0 shadow-sm text-center p-3 p-lg-4" 
                style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div className="card-body p-0">
                  <div className="mb-3">
                    <i className={`${feature.icon} ${feature.color}`} style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h6 className="card-title fw-bold mb-2">{feature.title}</h6>
                  <p className="card-text text-muted small mb-0">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
