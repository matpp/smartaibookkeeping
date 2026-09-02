import React, { useState } from 'react';

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const simulateLogin = () => {
    window.location.href = "/app/";
  };

  return (
    <div style={{
      fontFamily: "'Source Sans Pro', sans-serif",
      color: '#323333',
      backgroundColor: '#F5F7FA',
      lineHeight: 1.6,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      {/* HEADER */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px'
          }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="Heading.png" alt="SmartAI Bookkeeping App Logo" style={{ height: '44px', width: 'auto', display: 'block' }} />
            </div>

            <ul style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              listStyle: 'none',
              fontWeight: 600,
              fontSize: '13px',
              margin: 0,
              padding: 0
            }}>
              <li><a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>Features</a></li>
              <li><a href="#workflow" style={{ textDecoration: 'none', color: 'inherit' }}>How It Works</a></li>
              <li>
                <button 
                  onClick={openLoginModal}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#121F3E',
                    border: '2px solid #121F3E',
                    padding: '10px 22px',
                    borderRadius: '6px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign In
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* VIEW 1: LANDING PAGE */}
      <div id="landing-view">
        {/* HERO SECTION */}
        <section style={{
          background: 'linear-gradient(135deg, #121F3E 0%, #1A2B52 100%)',
          color: '#FFFFFF',
          padding: '100px 0 120px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 143, 165, 0.2)',
                  border: '1px solid #008FA5',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#00E5FF',
                  marginBottom: '24px'
                }}>
                  ⚡ High Extraction Accuracy Guarantee
                </div>
                <h1 style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '48px',
                  lineHeight: 1.15,
                  marginBottom: '20px',
                  fontWeight: 800
                }}>
                  Snap Receipts. <span style={{ color: '#008FA5' }}>Sync to Google Sheets.</span> Zero Hallucinations.
                </h1>
                <p style={{
                  fontSize: '18px',
                  color: '#A0AEC0',
                  marginBottom: '36px',
                  maxWidth: '500px'
                }}>
                  An AI bookkeeping assistant that parses receipts, automates recurring payments, tracks manual entries, and builds structured audit folders directly inside your own Google Drive.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={openLoginModal}
                    style={{
                      backgroundColor: '#008FA5',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0, 143, 165, 0.25)',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Start Free Trial
                  </button>
                  <button 
                    onClick={openLoginModal}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Watch Demo
                  </button>
                </div>
              </div>

              {/* MOCKUP DISPLAY */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#323333',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #E2E8F0',
                    paddingBottom: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <strong style={{ fontFamily: "'Montserrat', sans-serif", color: '#121F3E' }}>Financial Overview</strong>
                      <div style={{ fontSize: '12px', color: '#666666' }}>August 2026 Sync Active</div>
                    </div>
                    <span style={{ color: '#2ECC71', fontWeight: 700, fontSize: '13px' }}>● Live Drive Link</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: '#F5F7FA',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2ECC71'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666666', fontWeight: 600, textTransform: 'uppercase' }}>Total Income</div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '22px', fontWeight: 700, color: '#121F3E', marginTop: '4px' }}>$6,450.00</div>
                    </div>
                    <div style={{
                      background: '#F5F7FA',
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #008FA5'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666666', fontWeight: 600, textTransform: 'uppercase' }}>Total Expense</div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '22px', fontWeight: 700, color: '#121F3E', marginTop: '4px' }}>$3,120.50</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '6px',
                      background: '#F5F7FA',
                      fontSize: '14px'
                    }}>
                      <div>
                        <strong>Starbucks Coffee</strong>
                        <div style={{ fontSize: '12px', color: '#666666' }}>2026-08-14 • Meals</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#EBF8FF', color: '#2B6CB0' }}>Amex (*8899)</span>
                        <div style={{ fontWeight: 700, marginTop: '4px' }}>$12.50</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '6px',
                      background: '#F5F7FA',
                      fontSize: '14px'
                    }}>
                      <div>
                        <strong>Local Hardware</strong>
                        <div style={{ fontSize: '12px', color: '#666666' }}>2026-08-12 • Supplies</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#F0FFF4', color: '#276749' }}>Cash Wallet</span>
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
        <section id="features" style={{ padding: '100px 0', backgroundColor: '#F5F7FA' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '36px', color: '#121F3E', fontWeight: 700 }}>
                Enterprise Intelligence for Your Google Ecosystem
              </h2>
              <p style={{ color: '#666666', fontSize: '18px', marginTop: '12px' }}>
                Hover over any card below to view detailed specifications.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              marginBottom: '32px'
            }}>
              {[
                { icon: '👁️', title: '100% Verification Review', desc: 'Never worry about misread digits. Our human-in-the-loop preview screen ensures every vendor, tax rate, and total is verified before writing to your ledger.' },
                { icon: '💳', title: 'Card & Cash Auto-Matching', desc: 'Recognizes payment accounts based on the last 4 digits of card numbers on receipts. Automatically logs cash purchases into physical cash wallets.' },
                { icon: '📁', title: 'Structured Drive Folders', desc: 'Automatically files original receipt photos into organized folders (Transaction Record > 2026 > 08 - August) with standardized audit file names.' },
                { icon: '🔄', title: 'Recurring Payments', desc: 'Automate monthly subscriptions and fixed billing schedules, forecasting your upcoming recurring expenses directly in your sheets.' },
                { icon: '✍️', title: 'Manual Data Entry', desc: 'Directly log cash transactions, unique invoices, or manual incomes without needing an image capture or receipt upload.' },
                { icon: '📈', title: 'Account Overview Dashboard', desc: 'Get high-level visibility into net balances, active subscriptions, pending audit files, and visual expense category breakdowns.' }
              ].map((feat, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    padding: '40px 32px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(0, 143, 165, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#008FA5',
                    fontSize: '24px',
                    marginBottom: '24px'
                  }}>
                    {feat.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: '#121F3E', fontWeight: 700, marginBottom: '12px' }}>
                    {feat.title}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '15px', margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              ))}

              <div style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                padding: '40px 32px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(0, 143, 165, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#008FA5',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    📁
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', color: '#121F3E', fontWeight: 700, marginBottom: '6px' }}>
                      CSV Log Export & Import
                    </h3>
                    <p style={{ color: '#666666', fontSize: '15px', margin: 0 }}>
                      Bulk transfer records between local files and your active ledger with simple one-click CSV export and smart merge utilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROADMAP BANNER */}
            <div 
              onClick={openLoginModal}
              style={{
                background: 'linear-gradient(135deg, #121F3E 0%, #1A2B52 100%)',
                color: '#FFFFFF',
                padding: '36px 40px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(18, 31, 62, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '24px' }}>🚀</span>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", color: '#FFFFFF', fontSize: '22px', margin: 0 }}>
                    Many more features will be added as we develop further
                  </h3>
                </div>
                <p style={{ color: '#A0AEC0', fontSize: '15px', margin: 0 }}>
                  Explore our active product roadmap, upcoming multi-currency converters, accountant portals, and submit feedback.
                </p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button style={{
                  backgroundColor: '#008FA5',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  padding: '10px 22px',
                  borderRadius: '6px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none'
                }}>
                  View Roadmap →
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" style={{ background: '#FFFFFF', padding: '100px 0', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '36px', color: '#121F3E', fontWeight: 700 }}>
                Four Simple Steps to Automated Bookkeeping
              </h2>
              <p style={{ color: '#666666', fontSize: '18px', marginTop: '12px' }}>
                Hover over any step below to view details.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              marginTop: '40px'
            }}>
              {[
                { num: '1', title: 'Capture Receipt', desc: 'Snap a photo on mobile or batch-upload invoices in your browser.' },
                { num: '2', title: 'AI Parsing', desc: 'Vision AI extracts line items, totals, dates, and card metadata instantly.' },
                { num: '3', title: 'Verify & Confirm', desc: 'Quick 2-second visual check to ensure 100% spreadsheet accuracy.' },
                { num: '4', title: 'Sync', desc: 'Export your transaction data directly to Google Sheets with a single click, complete with custom color-coded tags and direct Google Drive links to proof of transaction.' }
              ].map((step, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#F5F7FA',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    textAlign: 'center',
                    padding: '32px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#121F3E',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    margin: '0 auto 20px auto',
                    border: '3px solid #008FA5'
                  }}>
                    {step.num}
                  </div>
                  <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', color: '#121F3E', marginBottom: '10px' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
          <div id="get-started" style={{
            background: 'linear-gradient(135deg, #008FA5 0%, #121F3E 100%)',
            color: '#FFFFFF',
            padding: '80px 0',
            textAlign: 'center',
            borderRadius: '20px',
            marginBottom: '-60px',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 20px 40px rgba(0, 143, 165, 0.3)'
          }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '36px', marginBottom: '16px' }}>
              Take Control of Your Business Finances Today
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
              Connect your Google Drive in under 60 seconds. No credit card required.
            </p>
            <button 
              onClick={openLoginModal}
              style={{
                backgroundColor: '#121F3E',
                color: '#FFFFFF',
                padding: '10px 22px',
                borderRadius: '6px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              Connect Google Sheets Now
            </button>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div style={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(18, 31, 62, 0.75)',
          zIndex: 200,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '420px',
            padding: '36px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <img src="Heading.png" alt="SmartAI Logo" style={{ height: '40px', width: 'auto', margin: '0 auto 16px auto', display: 'block' }} />
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", color: '#121F3E' }}>Sign In to SmartAI</h3>
            <p style={{ fontSize: '14px', color: '#666666', marginTop: '6px' }}>
              Authenticate with Google to grant permission to write to your Drive & Sheets.
            </p>
            
            <button 
              onClick={simulateLogin}
              style={{
                width: '100%',
                background: '#121F3E',
                color: 'white',
                padding: '14px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: 'none',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(18, 31, 62, 0.2)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In with Google
            </button>
            
            <button 
              onClick={closeLoginModal}
              style={{
                marginTop: '16px',
                background: 'transparent',
                color: '#666666',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#121F3E', color: '#FFFFFF', padding: '120px 0 40px 0', fontSize: '14px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(3, 1fr)',
            gap: '40px',
            marginBottom: '60px'
          }}>
            <div>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img src="Heading.png" alt="SmartAI Bookkeeping App Logo" style={{ height: '44px', width: 'auto', display: 'block' }} />
              </div>
              <p style={{ color: '#A0AEC0', maxWidth: '300px', margin: 0 }}>
                Automated receipt scanning, document vision, and ledger organization for freelancers and small businesses.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Google Sheets Sync', 'Card Matching', 'Drive Filing', 'Dashboard Insights'] },
              { title: 'Resources', links: ['Documentation', 'Google OAuth Security', 'API Status'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Google API Disclosure'] }
            ].map((col, idx) => (
              <div key={idx}>
                <h5 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', marginBottom: '20px', color: '#008FA5' }}>
                  {col.title}
                </h5>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0 }}>
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href="#" style={{ color: '#A0AEC0', textDecoration: 'none', transition: 'color 0.2s' }}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
            textAlign: 'center',
            color: '#A0AEC0'
          }}>
            © 2026 SmartAI Bookkeeping App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}