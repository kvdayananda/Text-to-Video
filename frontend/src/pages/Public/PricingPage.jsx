import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStripeCheckout, createRazorpayOrder, confirmPayment } from '../../api/paymentApi';
import { me } from '../../api/authApi';
import './PricingPage.css';

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: 'Perfect for exploring AI video creation.',
    features: ['5 AI videos / mo', '720p HD resolution', 'Standard AI voices', '3 platform publishing', 'Community support'],
    cta: 'Get Started',
    popular: false,
    color: '#a0a0c0'
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 23,
    desc: 'Ideal for professional content creators and marketers.',
    features: ['100 AI videos / mo', '4K Ultra HD resolution', '500+ premium AI voices', 'All platforms publishing', 'Full SEO automation', 'Copyright scanner tool', 'Priority support'],
    cta: 'Start Free Trial',
    popular: true,
    color: 'var(--primary)'
  },
  {
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 79,
    desc: 'Tailored for agencies, businesses, and content teams.',
    features: ['Unlimited AI videos', '8K Cinematic rendering', 'Custom voice cloning & avatars', 'API access & webhooks', 'Team workspaces (5 users)', 'White-label distribution', 'Dedicated 24/7 account manager'],
    cta: 'Choose Enterprise',
    popular: false,
    color: 'var(--secondary)'
  }
];

const faqItems = [
  { q: 'What counts as an AI video export?', a: 'Every time you enter a prompt and complete a final render of a video, it counts as one AI video export. Draft renders and previewing scripts do not count toward your limit.' },
  { q: 'Is there a contract or commitment?', a: 'No, you can cancel or change your plan at any time. If you subscribe to an annual plan, you pay for the full year upfront with a 20% discount.' },
  { q: 'How does the copyright scanner guarantee safety?', a: 'We run real-time audio and frame fingerprint matching against major global copyright databases. While we flags 99% of matching claims before you publish.' },
  { q: 'Can I clone my own voice on the platform?', a: 'Yes! Our voice cloning feature is available on Pro and Enterprise plans. It takes just a 2-minute clean audio upload to clone your voice in high fidelity.' }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Checkout states
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState('stripe'); // stripe or razorpay
  
  // Checkout inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [upiId, setUpiId] = useState('');

  // Transaction processing states
  const [txnStep, setTxnStep] = useState(0); // 0 = idle, 1 = loading, 2 = success, 3 = error
  const [loaderMessage, setLoaderMessage] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Check login on load
  useEffect(() => {
    async function checkUser() {
      try {
        const u = await me();
        if (u && u.status === 'ok') {
          setUser(u.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }
    checkUser();
  }, []);

  const toggleBilling = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const handleCtaClick = (planName, e) => {
    if (planName === 'Free') {
      navigate('/register');
      return;
    }
    if (planName === 'Enterprise' && !user) {
      navigate('/contact');
      return;
    }
    
    // Check if logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Launch secure sandbox checkout
    setSelectedPlan(plans.find(p => p.name === planName));
    setCheckoutActive(true);
    setTxnStep(0);
  };

  const triggerMockPayment = async () => {
    if (!selectedPlan) return;
    setTxnStep(1);
    
    const steps = [
      'Contacting secure payment gateway API...',
      'Securing transaction authorization tokens...',
      'Processing payment credentials...',
      'Syncing active subscription to VisionForge database...'
    ];

    // Simulate multi-stage payment loading
    for (let i = 0; i < steps.length; i++) {
      setLoaderMessage(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const payload = {
        plan: selectedPlan.name,
        billingCycle,
        successUrl: window.location.origin + '/pricing',
        cancelUrl: window.location.origin + '/pricing'
      };

      // Call checkout session generator
      let checkoutRes;
      if (paymentProvider === 'stripe') {
        checkoutRes = await createStripeCheckout(payload);
      } else {
        checkoutRes = await createRazorpayOrder(payload);
      }

      const txnId = paymentProvider === 'stripe' ? checkoutRes.sessionId : checkoutRes.orderId;

      // Confirm payment update in database
      const confirmRes = await confirmPayment({
        plan: selectedPlan.name,
        billingCycle,
        provider: paymentProvider,
        transactionId: txnId
      });

      if (confirmRes.status === 'success') {
        setTransactionDetails({
          plan: selectedPlan.name,
          transactionId: txnId,
          renewDate: confirmRes.user.subscriptionRenewsAt,
          amount: selectedPlan.name === 'Pro' 
            ? (billingCycle === 'monthly' ? 29 : 23 * 12) 
            : (billingCycle === 'monthly' ? 99 : 79 * 12)
        });
        setTxnStep(2); // Success!
      } else {
        setTxnStep(3); // Error
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setTxnStep(3);
    }
  };

  return (
    <div className="pricing-page container">
      {/* Header */}
      <div className="pricing-header-section">
        <span className="pricing-badge">💎 PLANS FOR EVERYONE</span>
        <h1>Simple, Transparent <span className="text-gradient">Pricing</span></h1>
        <p>No hidden fees. Choose a plan that fits your creation workflow. Cancel anytime.</p>

        {/* Toggle */}
        <div className="billing-toggle-wrap">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
          <button className={`billing-toggle-btn ${billingCycle === 'yearly' ? 'yearly' : ''}`} onClick={toggleBilling} aria-label="Toggle billing cycle">
            <div className="billing-toggle-thumb" />
          </button>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>
            Yearly <span className="save-badge">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="pricing-grid">
        {plans.map((p, i) => {
          const price = billingCycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice;
          const isUserPlan = user && user.subscriptionPlan === p.name;
          
          return (
            <div className={`pricing-card glass-panel ${p.popular ? 'popular' : ''}`} key={i} style={{ '--plan-color': p.color }}>
              {p.popular && <div className="popular-ribbon">Most Popular</div>}
              <div className="plan-meta">
                <h2>{p.name}</h2>
                <p className="plan-desc">{p.desc}</p>
              </div>
              <div className="plan-price-block">
                <span className="dollar">$</span>
                <span className="price-number">{price}</span>
                <span className="price-period">/month</span>
                {billingCycle === 'yearly' && p.monthlyPrice > 0 && (
                  <div className="billed-yearly-hint">Billed annually (${price * 12}/yr)</div>
                )}
              </div>
              <ul className="plan-features-list">
                {p.features.map((f, j) => (
                  <li key={j}>
                    <span className="check-bullet">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              
              {isUserPlan ? (
                <div className="active-plan-indicator">✓ Your Current Plan</div>
              ) : (
                <button
                  onClick={(e) => handleCtaClick(p.name, e)}
                  className={`plan-cta-btn ${p.popular ? 'btn-primary' : 'btn-secondary'}`}
                  id={`pricing-page-cta-${p.name.toLowerCase()}`}
                >
                  {p.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="comparison-section glass-panel">
        <h2 className="comp-title">Compare Features</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly Videos</td>
                <td>5 videos</td>
                <td>100 videos</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Max Resolution</td>
                <td>720p HD</td>
                <td>4K Ultra HD</td>
                <td>8K Cinematic</td>
              </tr>
              <tr>
                <td>AI Voices</td>
                <td>Standard</td>
                <td>500+ Neural (Premium)</td>
                <td>Custom Voice Cloning</td>
              </tr>
              <tr>
                <td>Auto Publishing</td>
                <td>3 platforms</td>
                <td>All platforms</td>
                <td>All + Multi-Account</td>
              </tr>
              <tr>
                <td>Copyright Scanner</td>
                <td>✗ Not included</td>
                <td>✓ Included</td>
                <td>✓ Multi-scan + White-glove</td>
              </tr>
              <tr>
                <td>API Access</td>
                <td>✗ No</td>
                <td>✗ No</td>
                <td>✓ High-speed access</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>Community</td>
                <td>Priority Email</td>
                <td>Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`faq-card glass-panel ${openFaq === idx ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              id={`pricing-faq-${idx}`}
            >
              <div className="faq-q-row">
                <h3>{item.q}</h3>
                <span className="faq-chevron">{openFaq === idx ? '▲' : '▼'}</span>
              </div>
              {openFaq === idx && (
                <p className="faq-answer-block">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==================== INTERACTIVE CHECKOUT MODAL ==================== */}
      {checkoutActive && selectedPlan && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-container glass-panel animate-scale-up">
            
            {/* Close button */}
            {txnStep !== 1 && (
              <button className="checkout-close-btn" onClick={() => setCheckoutActive(false)}>×</button>
            )}

            {/* Step 0: Idle Input Form */}
            {txnStep === 0 && (
              <div className="checkout-layout">
                <div className="checkout-summary-column">
                  <h3>Order Summary</h3>
                  <div className="summary-plan-card">
                    <span className="summary-badge">{selectedPlan.name} Plan</span>
                    <div className="summary-price">
                      ${billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice}
                      <span className="sub-period">/month</span>
                    </div>
                    <p className="summary-cycle">Billed {billingCycle}ly</p>
                  </div>
                  
                  <div className="checkout-total-row">
                    <span>Total Due Now</span>
                    <span>
                      ${billingCycle === 'monthly' 
                        ? selectedPlan.monthlyPrice 
                        : selectedPlan.yearlyPrice * 12}
                    </span>
                  </div>
                  
                  <div className="sandbox-hint-badge">
                    🛡️ Secure Developer Sandbox Mode
                  </div>
                </div>

                <div className="checkout-payment-column">
                  <h3>Complete Your Subscription</h3>
                  <p className="column-desc">Secure gateways are pre-configured in sandbox test stages.</p>
                  
                  {/* Provider toggle tabs */}
                  <div className="provider-tabs">
                    <button 
                      className={`provider-tab stripe-tab ${paymentProvider === 'stripe' ? 'active' : ''}`}
                      onClick={() => setPaymentProvider('stripe')}
                    >
                      <span className="stripe-logo-symbol">💳</span> Stripe Pay
                    </button>
                    <button 
                      className={`provider-tab razorpay-tab ${paymentProvider === 'razorpay' ? 'active' : ''}`}
                      onClick={() => setPaymentProvider('razorpay')}
                    >
                      <span className="razorpay-logo-symbol">⚡</span> Razorpay
                    </button>
                  </div>

                  {/* Dynamic payment form panels */}
                  {paymentProvider === 'stripe' ? (
                    <div className="payment-form stripe-form">
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John Creator" 
                          value={cardName} 
                          onChange={e => setCardName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4242 4242 4242 4242 (Stripe Sandbox)" 
                          value={cardNumber} 
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiration</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            value={cardExpiry} 
                            onChange={e => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>CVC / CVV</label>
                          <input 
                            type="text" 
                            placeholder="123" 
                            value={cardCVC} 
                            onChange={e => setCardCVC(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-form razorpay-form">
                      <div className="upi-qr-display-box">
                        <div className="upi-pulsing-qr">
                          {/* Simulated UPI QR scanner */}
                          <div className="qr-scanner-line"></div>
                          <div className="qr-mock-image"></div>
                        </div>
                        <div className="upi-instruction">
                          <p>Scan QR code using GPay, PhonePe, or Paytm</p>
                          <span>or enter UPI ID below:</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>UPI ID (e.g. john@okhdfcbank)</label>
                        <input 
                          type="text" 
                          placeholder="username@upi" 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <button className="checkout-submit-btn premium-btn" onClick={triggerMockPayment}>
                    <span>🔒 Pay & Activate Subscription</span>
                  </button>
                  <p className="payment-security-assurance">Protected with AES 256-bit encryption protocols.</p>
                </div>
              </div>
            )}

            {/* Step 1: Secure Loader */}
            {txnStep === 1 && (
              <div className="checkout-loader-screen">
                <div className="secure-spinner-container">
                  <div className="loading-spinner"></div>
                  <div className="secure-lock-icon">🔒</div>
                </div>
                <h3>Securing Checkout Connection...</h3>
                <p className="loader-dynamic-msg">{loaderMessage}</p>
                <div className="loader-progress-bar-wrap">
                  <div className="loader-progress-bar-fill"></div>
                </div>
              </div>
            )}

            {/* Step 2: Success Screen */}
            {txnStep === 2 && transactionDetails && (
              <div className="checkout-success-screen text-center animate-fade-in">
                <div className="success-checkmark-bounce">
                  <span className="checkmark-glyph">✓</span>
                </div>
                <h2 className="success-header">Subscription Successful!</h2>
                <p className="success-subheader">Welcome to VisionForge AI <strong>{transactionDetails.plan}</strong>.</p>
                
                <div className="receipt-glass-box">
                  <div className="receipt-row">
                    <span>Transaction ID:</span>
                    <strong>{transactionDetails.transactionId}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Amount Billed:</span>
                    <strong>${transactionDetails.amount}.00</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Renewal Date:</span>
                    <strong>{transactionDetails.renewDate}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Status:</span>
                    <strong className="status-success-badge">Paid & Active</strong>
                  </div>
                </div>

                <div className="success-action-buttons">
                  <button 
                    className="success-cta-btn btn-primary" 
                    onClick={() => {
                      setCheckoutActive(false);
                      navigate('/dashboard');
                      window.location.reload();
                    }}
                  >
                    🚀 Enter Creator Studio
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Error Screen */}
            {txnStep === 3 && (
              <div className="checkout-error-screen text-center animate-fade-in">
                <span className="error-glyph">⚠️</span>
                <h2>Transaction Declined</h2>
                <p>Unable to finalize payment details. Please check your credentials or test with Stripe Sandbox values.</p>
                <button className="success-cta-btn btn-secondary" onClick={() => setTxnStep(0)}>
                  Try Payment Again
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
