import React from 'react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRoadmapClick: () => void;
}

export default function LandingPage({ onLoginClick, onRoadmapClick }: LandingPageProps) {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">⚡ High Extraction Accuracy Guarantee</div>
              <h1>Snap Receipts. <span>Sync to Google Sheets.</span> Zero Hallucinations.</h1>
              <p>
                An AI bookkeeping assistant that parses receipts, automates recurring payments, tracks manual entries, and builds structured audit folders directly inside your own Google Drive.
              </p>
              <div className="hero-btns">
                <button className="btn btn-primary" onClick={onLoginClick}>Start Free Trial</button>
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--color-white)', borderColor: 'var(--color-white)' }} 
                  onClick={onLoginClick}
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* MOCKUP DISPLAY */}
            <div className="mockup-wrapper">
              <div className="mockup-card">
                <div className="mockup-header">
                  <div>
                    <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-navy)' }}>Financial Overview</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>August 2026 Sync Active</div>
                  </div>
                  <span style={{ color: '#2ECC71', fontWeight: 700, fontSize: '13px' }}>● Live Drive Link</span>
                </div>

                <div className="mockup-stat-row">
                  <div className="stat-box income">
                    <div className="stat-label">Total Income</div>
                    <div className="stat-val">$6,450.00</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Expense</div>
                    <div className="stat-val">$3,120.50</div>
                  </div>
                </div>

                <div className="mockup-list">
                  <div className="mockup-item">
                    <div>
                      <strong>Starbucks Coffee</strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>2026-08-14 • Meals</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="item-tag tag-amex">Amex (*8899)</span>
                      <div style={{ fontWeight: 700, marginTop: '4px' }}>$12.50</div>
                    </div>
                  </div>

                  <div className="mockup-item">
                    <div>
                      <strong>Local Hardware</strong>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>2026-08-12 • Supplies</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="item-tag tag-cash">Cash Wallet</span>
                      <div style={{ fontWeight: 700, marginTop: '4px' }}>$45.00</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-title">
            <h2>Enterprise Intelligence for Your Google Ecosystem</h2>
            <p>Hover over any card below to view detailed specifications.</p>
          </div>

          <div className="features-grid">
            
            <div className="feature-card">
              <div className="feature-icon">👁️</div>
              <h3>100% Verification Review</h3>
              <p>Never worry about misread digits. Our human-in-the-loop preview screen ensures every vendor, tax rate, and total is verified before writing to your ledger.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Card & Cash Auto-Matching</h3>
              <p>Recognizes payment accounts based on the last 4 digits of card numbers on receipts. Automatically logs cash purchases into physical cash wallets.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Structured Drive Folders</h3>
              <p>Automatically files original receipt photos into organized folders (Transaction Record &gt; 2026 &gt; 08 - August) with standardized audit file names.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Recurring Payments</h3>
              <p>Automate monthly subscriptions and fixed billing schedules, forecasting your upcoming recurring expenses directly in your sheets.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Manual Data Entry</h3>
              <p>Directly log cash transactions, unique invoices, or manual incomes without needing an image capture or receipt upload.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Account Overview Dashboard</h3>
              <p>Get high-level visibility into net balances, active subscriptions, pending audit files, and visual expense category breakdowns.</p>
            </div>

            <div className="feature-card" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div className="feature-icon" style={{ marginBottom: 0, flexShrink: 0 }}>📁</div>
                <div>
                  <h3 style={{ marginBottom: '6px' }}>CSV Log Export & Import</h3>
                  <p style={{ opacity: 1, maxHeight: 'none', color: 'var(--color-text-muted)' }}>Bulk transfer records between local files and your active ledger with simple one-click CSV export and smart merge utilities.</p>
                </div>
              </div>
            </div>

          </div>

          {/* BALANCED WIDE ROADMAP BANNER */}
          <div className="feature-card-wide" onClick={onRoadmapClick}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span style={{ fontSize: '24px' }}>🚀</span>
                <h3>Many more features will be added as we develop further</h3>
              </div>
              <p>Explore our active product roadmap, upcoming multi-currency converters, accountant portals, and submit feedback.</p>
            </div>
            <div>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-primary)', whiteSpace: 'nowrap' }}>View Roadmap →</button>
            </div>
          </div>

        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="workflow" id="workflow">
        <div className="container">
          <div className="section-title">
            <h2>Four Simple Steps to Automated Bookkeeping</h2>
            <p>Hover over any step below to view details.</p>
          </div>

          <div className="workflow-steps">
            <div className="step-card">
              <div className="step-num">1</div>
              <h4>Capture Receipt</h4>
              <p>Snap a photo on mobile or batch-upload invoices in your browser.</p>
            </div>

            <div className="step-card">
              <div className="step-num">2</div>
              <h4>AI Parsing</h4>
              <p>Vision AI extracts line items, totals, dates, and card metadata instantly.</p>
            </div>

            <div className="step-card">
              <div className="step-num">3</div>
              <h4>Verify & Confirm</h4>
              <p>Quick 2-second visual check to ensure 100% spreadsheet accuracy.</p>
            </div>

            <div className="step-card">
              <div className="step-num">4</div>
              <h4>Sync</h4>
              <p>Export your transaction data directly to Google Sheets with a single click, complete with custom color-coded tags and direct Google Drive links to proof of transaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="container">
        <div className="cta-banner" id="get-started">
          <h2>Take Control of Your Business Finances Today</h2>
          <p>Connect your Google Drive in under 60 seconds. No credit card required.</p>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-navy)' }} onClick={onLoginClick}>Connect Google Sheets Now</button>
        </div>
      </div>
    </div>
  );
}
