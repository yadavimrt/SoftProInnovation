import React from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const salesData = [
  { name: 'Oct 1', sales: 4000 },
  { name: 'Oct 7', sales: 5200 },
  { name: 'Oct 15', sales: 3800 },
  { name: 'Oct 20', sales: 8500 },
  { name: 'Oct 25', sales: 6000 },
  { name: 'Oct 31', sales: 9800 },
];


const DashboardOverview = () => {
  return (
    <>
      <h1 className="dashboard-header-title">
        Admin <span>Overview</span>
      </h1>
      <p className="dashboard-subtitle">
        Real-time statistics and summary of Softpro Innovation
      </p>

      <div className="row g-4 mb-5">
        {/* Stat Card 1 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-stat-1">
            <div className="stat-card-decor"></div>
            <div className="stat-icon">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="stat-value">72</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-stat-2">
            <div className="stat-card-decor"></div>
            <div className="stat-icon text-primary">
              <i className="bi bi-tags"></i>
            </div>
            <div className="stat-value">10</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        {/* Stat Card 3 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-stat-3">
            <div className="stat-card-decor"></div>
            <div className="stat-icon text-success">
              <i className="bi bi-cart3"></i>
            </div>
            <div className="stat-value">0</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        {/* Stat Card 4 */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-stat-4">
            <div className="stat-card-decor"></div>
            <div className="stat-icon" style={{ color: '#8b5cf6' }}>
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-value">9</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="dashboard-section p-4">
            <h4 className="section-title mb-4">Revenue & Sales Growth</h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3945E0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3945E0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3945E0" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-12 col-lg-6">
          <div className="dashboard-section">
            <h4 className="section-title">Quick Administration Actions</h4>
            <div className="d-flex flex-column gap-3">
              <Link to="/dashboard/products" className="action-btn-primary">
                <i className="bi bi-plus-lg me-2"></i> Add New Product
              </Link>
              <Link to="/dashboard/categories" className="action-btn-outline">
                <i className="bi bi-tag me-2" style={{ color: '#f59e0b' }}></i> Add Category
              </Link>
              <Link to="/dashboard/inventory" className="action-btn-outline">
                <i className="bi bi-graph-up me-2" style={{ color: '#64748b' }}></i> Monitor Inventory Stock
              </Link>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="col-12 col-lg-6">
          <div className="dashboard-section">
            <h4 className="section-title">System Health & Notifications</h4>
            
            <div className="notification-card notify-success">
              <div className="notification-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <div>
                <h5 className="notification-title">Helmet Security Enabled</h5>
                <p className="notification-desc">
                  HTTP security headers are verified active and secure.
                </p>
              </div>
            </div>

            <div className="notification-card notify-info">
              <div className="notification-icon">
                <i className="bi bi-chat-left-dots"></i>
              </div>
              <div>
                <h5 className="notification-title">Customer Complaints Received</h5>
                <p className="notification-desc">
                  There are currently 2 total customer message inquiries. <span className="notify-link">Review messages →</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
