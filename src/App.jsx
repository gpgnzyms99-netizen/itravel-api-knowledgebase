import React, { useState, useEffect } from 'react';
import { API_KNOWLEDGE_BASE, QUIZ_QUESTIONS } from './data/apiData';
import { Search, BookOpen, Award, Layers, ShieldCheck, Code, ArrowRight, CheckCircle, XCircle, Copy, Check, Lock, LogOut } from 'lucide-react';

// Amplitude Telemetry Tracking Helper
const trackTelemetry = (properties) => {
  const eventPayload = {
    event_type: 'UI_INTERACTION',
    timestamp: new Date().toISOString(),
    region_locale: 'en-US',
    ...properties
  };
  console.log('[Telemetry Amplitude Event]', eventPayload);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState('kb'); // 'kb' | 'quiz' | 'arch' | 'trade'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_KNOWLEDGE_BASE[0]);
  const [copiedField, setCopiedField] = useState(null);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Password Gate Check on Mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('itravel_kb_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Authorized Access Passcode
    if (passwordInput.trim() === 'itravel2026' || passwordInput.trim() === 'ttc2026') {
      setIsAuthenticated(true);
      localStorage.setItem('itravel_kb_authenticated', 'true');
      setPasswordError('');
      trackTelemetry({ block_type: 'AUTH', block_id: 'LOGIN', interaction_type: 'SUCCESS' });
    } else {
      setPasswordError('Invalid access passcode. Please try again.');
      trackTelemetry({ block_type: 'AUTH', block_id: 'LOGIN', interaction_type: 'FAILURE' });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('itravel_kb_authenticated');
    setPasswordInput('');
    trackTelemetry({ block_type: 'AUTH', block_id: 'LOGOUT', interaction_type: 'CLICK' });
  };

  // Categories
  const categories = ['ALL', 'Shopping & Search', 'Promotions & Pricing', 'Cabin Selection', 'Inventory Lock', 'Booking Creation', 'Servicing & Modification', 'Cancellation & Repricing'];

  // Filtered Endpoints
  const filteredEndpoints = API_KNOWLEDGE_BASE.filter(ep => {
    const matchesCategory = selectedCategory === 'ALL' || ep.lifecycle === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.endpointPath.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    trackTelemetry({ block_type: 'COPY_JSON', block_id: field, interaction_type: 'CLICK' });
  };

  const handleOptionSelect = (optionIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === QUIZ_QUESTIONS[quizIndex].correctAnswer;
    if (isCorrect) setScore(score + 1);

    trackTelemetry({
      block_type: 'QUIZ_QUESTION',
      block_id: `Q_${QUIZ_QUESTIONS[quizIndex].id}`,
      interaction_type: 'ANSWER_SELECT',
      is_correct: isCorrect
    });
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex(quizIndex + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizCompleted(false);
  };

  // Password Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--navy-900)', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-section)' }}>
          <div style={{ backgroundColor: 'var(--gold-500)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#fff' }}>
            <Lock size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '8px' }}>iTravel API Knowledge Base</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Protected Team Portal — Please enter the access passcode to continue.</p>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="password"
                placeholder="Enter Access Passcode"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-accordion)',
                  border: passwordError ? '2px solid #dc2626' : '1px solid var(--color-border-subtle)',
                  fontSize: '14px',
                  outline: 'none',
                  textAlign: 'center',
                  letterSpacing: '0.1em'
                }}
                autoFocus
              />
              {passwordError && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', fontWeight: '600' }}>{passwordError}</p>
              )}
            </div>

            <button type="submit" className="btn-accent" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '15px' }}>
              Unlock Knowledge Base
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header style={{ backgroundColor: 'var(--navy-900)', color: '#fff', padding: '16px 32px', borderBottom: '3px solid var(--gold-500)', boxShadow: 'var(--shadow-section)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: 'var(--gold-500)', padding: '8px', borderRadius: 'var(--radius-icon)', color: '#fff' }}>
                <Code size={24} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>iTravel Connect & Cruise API Knowledge Base</h1>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>Unified Technical Reference, OpenAPI Specifications, & Team Assessment Hub</p>
          </div>

          {/* Navigation Tabs & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <nav style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={activeTab === 'kb' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('kb'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'KB', interaction_type: 'CLICK' }); }}
              >
                <BookOpen size={16} /> API Catalog
              </button>
              <button 
                className={activeTab === 'quiz' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('quiz'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'QUIZ', interaction_type: 'CLICK' }); }}
              >
                <Award size={16} /> Team Quiz Hub
              </button>
              <button 
                className={activeTab === 'trade' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('trade'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'TRADE', interaction_type: 'CLICK' }); }}
              >
                <ShieldCheck size={16} /> Agency & Trade Rules
              </button>
              <button 
                className={activeTab === 'arch' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('arch'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'ARCH', interaction_type: 'CLICK' }); }}
              >
                <Layers size={16} /> V4 vs iTravel Arch
              </button>
            </nav>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--slate-400)',
                color: 'var(--slate-400)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-accordion)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}
              title="Lock Session"
            >
              <LogOut size={14} /> Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '24px auto', padding: '0 24px' }}>
        {activeTab === 'kb' && (
          <div>
            {/* Search and Filter Bar */}
            <div className="card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search endpoints by title, schema, field, error code, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 42px',
                      borderRadius: 'var(--radius-accordion)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); trackTelemetry({ block_type: 'CATEGORY_FILTER', block_id: cat, interaction_type: 'CLICK' }); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-icon)',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? 'var(--navy-900)' : '#e2e8f0',
                      color: selectedCategory === cat ? '#fff' : 'var(--slate-700)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Split View: Left List, Right Inspector */}
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
              {/* Left Column: Endpoint List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '750px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredEndpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className="card"
                    onClick={() => { setSelectedEndpoint(ep); trackTelemetry({ block_type: 'ENDPOINT_CARD', block_id: ep.id, interaction_type: 'SELECT' }); }}
                    style={{
                      padding: '16px',
                      cursor: 'pointer',
                      borderColor: selectedEndpoint?.id === ep.id ? 'var(--gold-500)' : 'var(--color-border-subtle)',
                      borderWidth: selectedEndpoint?.id === ep.id ? '2px' : '1px',
                      backgroundColor: selectedEndpoint?.id === ep.id ? '#fdfbf7' : '#fff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`badge badge-${ep.lifecycleBadge.toLowerCase()}`}>{ep.lifecycleBadge}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{ep.source}</span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '4px' }}>{ep.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{ep.displayName}</p>
                  </div>
                ))}
              </div>

              {/* Right Column: Deep Endpoint Inspector */}
              {selectedEndpoint && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid var(--color-border-subtle)', pb: '16px', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>{selectedEndpoint.method}</span>
                      <code style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy-900)' }}>{selectedEndpoint.endpointPath}</code>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '700', color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>Source: {selectedEndpoint.source}</span>
                    </div>
                    <h2 className="parent-title-dt" style={{ marginBottom: '8px' }}>{selectedEndpoint.displayName} ({selectedEndpoint.title})</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{selectedEndpoint.description}</p>
                  </div>

                  {/* Mandatory Headers */}
                  <div>
                    <h4 className="child-title-dt" style={{ marginBottom: '12px' }}>Mandatory Security & Channel Headers</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {selectedEndpoint.headers.map((h) => (
                        <div key={h.name} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)' }}>
                          <code style={{ fontWeight: '700', color: 'var(--navy-900)' }}>{h.name}</code>
                          <p style={{ fontSize: '11px', color: 'var(--slate-700)', margin: '4px 0 0 0' }}>{h.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Payloads */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 className="child-title-dt">Request Payload Example</h4>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleCopy(selectedEndpoint.requestPayload, 'req')}>
                        {copiedField === 'req' ? <Check size={14} /> : <Copy size={14} />} {copiedField === 'req' ? 'Copied' : 'Copy Payload'}
                      </button>
                    </div>
                    <pre>{selectedEndpoint.requestPayload}</pre>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 className="child-title-dt">Response Payload Example</h4>
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleCopy(selectedEndpoint.responsePayload, 'res')}>
                        {copiedField === 'res' ? <Check size={14} /> : <Copy size={14} />} {copiedField === 'res' ? 'Copied' : 'Copy Payload'}
                      </button>
                    </div>
                    <pre>{selectedEndpoint.responsePayload}</pre>
                  </div>

                  {/* V4 Comparison & Error Codes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
                    <div style={{ background: '#fefce8', padding: '14px', borderRadius: 'var(--radius-accordion)', border: '1px solid #fef08a' }}>
                      <h5 style={{ fontWeight: '700', color: '#854d0e', marginBottom: '4px' }}>V4 vs iTravel Architectural Difference</h5>
                      <p style={{ fontSize: '12px', color: '#713f12', margin: 0 }}>{selectedEndpoint.v4Comparison}</p>
                    </div>
                    <div style={{ background: '#fef2f2', padding: '14px', borderRadius: 'var(--radius-accordion)', border: '1px solid #fecaca' }}>
                      <h5 style={{ fontWeight: '700', color: '#991b1b', marginBottom: '4px' }}>Common Error Codes</h5>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {selectedEndpoint.errorCodes.map(err => (
                          <code key={err} style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{err}</code>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
            {!quizCompleted ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border-subtle)', pb: '12px', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy-900)' }}>Team Knowledge Quiz — Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--gold-500)' }}>Score: {score} / {quizIndex}</span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '20px' }}>
                  {QUIZ_QUESTIONS[quizIndex].question}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {QUIZ_QUESTIONS[quizIndex].options.map((option, idx) => {
                    let btnBg = '#f8fafc';
                    let btnBorder = 'var(--slate-200)';
                    let textColor = 'var(--navy-900)';

                    if (selectedOption !== null) {
                      if (idx === QUIZ_QUESTIONS[quizIndex].correctAnswer) {
                        btnBg = '#dcfce7';
                        btnBorder = '#16a34a';
                        textColor = '#14532d';
                      } else if (idx === selectedOption) {
                        btnBg = '#fee2e2';
                        btnBorder = '#dc2626';
                        textColor = '#7f1d1d';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-accordion)',
                          border: `2px solid ${btnBorder}`,
                          backgroundColor: btnBg,
                          color: textColor,
                          textAlign: 'left',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: selectedOption === null ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{option}</span>
                        {selectedOption !== null && idx === QUIZ_QUESTIONS[quizIndex].correctAnswer && <CheckCircle size={18} color="#16a34a" />}
                        {selectedOption !== null && idx === selectedOption && idx !== QUIZ_QUESTIONS[quizIndex].correctAnswer && <XCircle size={18} color="#dc2626" />}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: 'var(--radius-accordion)', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                    <h5 style={{ fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>Explanation</h5>
                    <p style={{ fontSize: '13px', color: '#0c4a6e', margin: 0 }}>{QUIZ_QUESTIONS[quizIndex].explanation}</p>
                  </div>
                )}

                {selectedOption !== null && (
                  <button className="btn-primary" onClick={handleNextQuiz} style={{ width: '100%', justifyContent: 'center' }}>
                    Next Question <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ backgroundColor: 'var(--gold-500)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#fff' }}>
                  <Award size={36} />
                </div>
                <h2 className="parent-title-dt" style={{ marginBottom: '8px' }}>Assessment Complete!</h2>
                <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>Your Score: <strong style={{ color: 'var(--navy-900)' }}>{score} out of {QUIZ_QUESTIONS.length}</strong> ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)</p>
                <button className="btn-accent" onClick={resetQuiz}>
                  Retake Assessment
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="parent-title-dt">Agency, Agent, Consortia & Commission Rules</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>How iTravel natively manages trade channels, parent/child agency networks, preferred consortia pricing, and commission settlement.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)' }}>
                <h3 className="child-title-dt" style={{ marginBottom: '8px' }}>Parent / Child Agency Hierarchy</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-700)' }}>Head-office parent agencies manage multiple child branches with consolidated credit limits, multi-market currency associations, and centralized billing statements.</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)' }}>
                <h3 className="child-title-dt" style={{ marginBottom: '8px' }}>Consortia Alliances</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-700)' }}>Agencies map directly to networks (Virtuoso, AAA, Signature, Ensemble, CLIA, ABTA). Consortia association triggers preferred pricing tiers and bonus overrides.</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)' }}>
                <h3 className="child-title-dt" style={{ marginBottom: '8px' }}>Commission Engine</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-700)' }}>Supports base + bonus commissions, FIT vs package commission variances, commission payout redirection (PayToSelf vs PayOutAgencyCode), and automated recalls on cancellations.</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)' }}>
                <h3 className="child-title-dt" style={{ marginBottom: '8px' }}>Gross vs Net Invoicing</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-700)' }}>NetPayApplicable = true allows agents to deduct commission at booking and pay net. NetPayApplicable = false requires gross collection with commission payout cycles.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 className="parent-title-dt">TravCorp V4 vs iTravel Architecture Matrix</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--navy-900)', color: '#fff' }}>
                  <th style={{ padding: '12px 16px', borderRadius: 'var(--radius-icon) 0 0 0' }}>Dimension</th>
                  <th style={{ padding: '12px 16px' }}>TravCorp V4 (Distribution API)</th>
                  <th style={{ padding: '12px 16px', borderRadius: '0 var(--radius-icon) 0 0' }}>iTravel Connect (IBS OMS)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Primary Abstraction</td>
                  <td style={{ padding: '12px 16px' }}>Touring product (brand, tour, option, departure)</td>
                  <td style={{ padding: '12px 16px' }}>Order Basket & Super PNR (multi-product bundle)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Search Architecture</td>
                  <td style={{ padding: '12px 16px' }}>Direct database reads against source</td>
                  <td style={{ padding: '12px 16px' }}>Cached Powershopping tier for sub-second search</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Concurrency & Locking</td>
                  <td style={{ padding: '12px 16px' }}>Scoped to single booking reference</td>
                  <td style={{ padding: '12px 16px' }}>Pessimistic freeze locks & 8 distinct booking states</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Strategic Position</td>
                  <td style={{ padding: '12px 16px' }}>Touring Product & Inventory Master</td>
                  <td style={{ padding: '12px 16px' }}>Basket Composition & Multi-Product Servicing Layer</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--navy-900)', color: 'var(--slate-400)', padding: '20px 32px', marginTop: 'auto', borderTop: '1px solid var(--navy-800)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <p>© 2026 The Travel Corporation (TTC) & IBS Software. Password Protected iTravel Knowledge Base.</p>
          <p>OpenAPI 3.0 Compliant | Amplitude Telemetry Active</p>
        </div>
      </footer>
    </div>
  );
}
