import React, { useState, useEffect } from 'react';
import { API_KNOWLEDGE_BASE, QUIZ_QUESTIONS } from './data/apiData';
import { MULTI_MODAL_JOURNEYS, ELEVATE_REQUIREMENTS, BUSINESS_PERSONAS, OMS_ARCHITECTURE_TOPOLOGY, ARCHITECTURE_RISKS_QA } from './data/businessData';
import { Search, BookOpen, Award, Layers, ShieldCheck, Code, ArrowRight, CheckCircle, XCircle, Copy, Check, Lock, LogOut, Briefcase, Users, HelpCircle, Compass, CheckSquare, Server, Cpu, GitMerge, FileText, AlertTriangle } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('biz'); // Default to 'biz' for Business Audience! ('biz' | 'reqs' | 'kb' | 'quiz' | 'trade' | 'arch')
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_KNOWLEDGE_BASE[0]);
  const [copiedField, setCopiedField] = useState(null);

  // Business Guide Selected Journey Step
  const [selectedJourneyStep, setSelectedJourneyStep] = useState(MULTI_MODAL_JOURNEYS[0]);

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
            <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>Unified Multi-Modal Business Reference, High-Level Requirements Mapping, & OpenAPI Specs</p>
          </div>

          {/* Navigation Tabs & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <nav style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={activeTab === 'biz' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('biz'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'BIZ', interaction_type: 'CLICK' }); }}
              >
                <Briefcase size={16} /> Multi-Modal Journey
              </button>
              <button 
                className={activeTab === 'kb' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('kb'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'KB', interaction_type: 'CLICK' }); }}
              >
                <Code size={16} /> API Interactive Explorer
              </button>
              <button 
                className={activeTab === 'qa' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('qa'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'QA', interaction_type: 'CLICK' }); }}
              >
                <AlertTriangle size={16} /> Risks & Evidence Q&A
              </button>
              <button 
                className={activeTab === 'reqs' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('reqs'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'REQS', interaction_type: 'CLICK' }); }}
              >
                <CheckSquare size={16} /> Business Requirements Matrix
              </button>
              <button 
                className={activeTab === 'trade' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('trade'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'TRADE', interaction_type: 'CLICK' }); }}
              >
                <ShieldCheck size={16} /> Agency & Trade
              </button>
              <button 
                className={activeTab === 'arch' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('arch'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'ARCH', interaction_type: 'CLICK' }); }}
              >
                <Layers size={16} /> Technical Architecture
              </button>
              <button 
                className={activeTab === 'quiz' ? 'btn-accent' : 'btn-primary'}
                onClick={() => { setActiveTab('quiz'); trackTelemetry({ block_type: 'NAV_TAB', block_id: 'QUIZ', interaction_type: 'CLICK' }); }}
              >
                <Award size={16} /> Quiz
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
        
        {/* TAB 1: MULTI-MODAL BUSINESS JOURNEY (TOUR + CRUISE + RAIL) */}
        {activeTab === 'biz' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Executive Hero Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)', color: '#fff', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Compass size={28} color="var(--gold-500)" />
                <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.01em', margin: 0 }}>Multi-Modal Business Guide: Land Tour (V4 / Tropics) + River Cruise (iTravel)</h2>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--slate-200)', maxWidth: '950px', lineHeight: '1.6' }}>
                This multi-modal workflow demonstrates how The Travel Corporation (TTC) bundles <strong>Land Tours (pulled via TravCorp V4 from Tropics)</strong> with <strong>Uniworld River Cruises (via iTravel Connect /v7/rest Gateway)</strong> inside a unified <strong>Super PNR Shopping Cart</strong> to satisfy the 10 TTC Business Requirements.
              </p>
            </div>

            {/* Interactive End-to-End Multi-Modal Journey Stepper */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Compass size={22} color="var(--navy-900)" />
                <h3 className="parent-title-dt" style={{ margin: 0 }}>End-to-End Multi-Modal Customer Journey</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>Select any step in the multi-product booking lifecycle to see the exact V4 API calls, iTravel API calls, and Rules Engine validations triggered:</p>

              {/* Journey Steps Horizontal Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                {MULTI_MODAL_JOURNEYS.map((j) => (
                  <button
                    key={j.step}
                    onClick={() => { setSelectedJourneyStep(j); trackTelemetry({ block_type: 'JOURNEY_STEP', block_id: `STEP_${j.step}`, interaction_type: 'CLICK' }); }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-accordion)',
                      border: selectedJourneyStep.step === j.step ? '2px solid var(--gold-500)' : '1px solid var(--color-border-subtle)',
                      backgroundColor: selectedJourneyStep.step === j.step ? 'var(--navy-900)' : '#f8fafc',
                      color: selectedJourneyStep.step === j.step ? '#fff' : 'var(--navy-900)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '800', color: selectedJourneyStep.step === j.step ? 'var(--gold-500)' : 'var(--color-text-muted)', textTransform: 'uppercase' }}>Step {j.step}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{j.stageName.split('. ')[1]}</div>
                  </button>
                ))}
              </div>

              {/* Selected Journey Step Detail Box */}
              {selectedJourneyStep && (
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <span className="badge badge-shopping" style={{ background: 'var(--gold-500)', color: '#fff' }}>Step {selectedJourneyStep.step} of 7 — Multi-Modal Workflow</span>
                    <h2 className="parent-title-dt" style={{ marginTop: '8px' }}>{selectedJourneyStep.stageName} — {selectedJourneyStep.tagline}</h2>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--color-text-main)', margin: 0 }}>{selectedJourneyStep.description}</p>

                  <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 'var(--radius-accordion)', border: '1px solid #bbf7d0' }}>
                    <h5 style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>Commercial & Revenue Value</h5>
                    <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>{selectedJourneyStep.businessValue}</p>
                  </div>

                  <div>
                    <h4 className="child-title-dt" style={{ marginBottom: '12px' }}>API Orchestration & Rules Engine Mapping</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      
                      {/* UI Call */}
                      <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-tag)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', marginBottom: '4px' }}>Frontend UI → OMS Gateway</div>
                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 6px 0' }}>Single UI REST Call</h5>
                        <code style={{ fontSize: '12px', background: '#dcfce7', color: '#14532d', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>{selectedJourneyStep.uiCall}</code>
                      </div>

                      {/* V4 Land Tour Component */}
                      <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-tag)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>Land Tour Component (Tropics)</div>
                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 6px 0' }}>TravCorp V4 Adapter</h5>
                        <code style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>{selectedJourneyStep.v4Call}</code>
                      </div>

                      {/* iTravel River Cruise Component */}
                      <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-tag)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>River Cruise Component (Uniworld)</div>
                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 6px 0' }}>iTravel Connect Engine</h5>
                        <code style={{ fontSize: '12px', background: '#f3e8ff', color: '#6b21a8', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>{selectedJourneyStep.itravelCall}</code>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: BUSINESS HIGH-LEVEL REQUIREMENTS MATRIX */}
        {activeTab === 'reqs' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ backgroundColor: 'var(--gold-500)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>TTC Business Specification</span>
              <h2 className="parent-title-dt" style={{ marginTop: '8px' }}>High Level Requirements to API Call Mapping Matrix</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Explicit mapping between the 10 High-Level Requirements from the TTC Business specification and their corresponding iTravel Connect & TravCorp V4 API implementations.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ELEVATE_REQUIREMENTS.map((req) => (
                <div key={req.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 }}>{req.category}</h3>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: 'var(--radius-icon)' }}>Requirement #{req.id.split('_')[1]}</span>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--slate-800)', margin: 0, fontWeight: '500' }}>"{req.requirement}"</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                    <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase' }}>iTravel Connect Endpoint</div>
                      <code style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)', marginTop: '4px', display: 'block' }}>{req.itravelApi}</code>
                    </div>

                    <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>TravCorp V4 / Legacy Service</div>
                      <code style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)', marginTop: '4px', display: 'block' }}>{req.v4Api}</code>
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 'var(--radius-accordion)', border: '1px solid #bbf7d0' }}>
                    <h5 style={{ fontWeight: '700', color: '#166534', marginBottom: '2px', fontSize: '12px' }}>How It Works in Technical Practice:</h5>
                    <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>{req.howItWorks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL API CATALOG */}
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

        {/* TAB 4: QUIZ HUB */}
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

        {/* TAB 4: AGENCY, TRADE & COMMISSION HUB */}
        {activeTab === 'trade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Executive Hero Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)', color: '#fff', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <ShieldCheck size={28} color="var(--gold-500)" />
                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Agency Data Model, Commission Engine & Booking Channels</h2>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--slate-200)', maxWidth: '950px', lineHeight: '1.6', margin: 0 }}>
                Deep-dive into how The Travel Corporation (TTC) unifies travel agent identities across legacy systems (<strong>Tropics / V4</strong> and live <strong>Longitude</strong> — <em>note: iTravel Connect is contracted to replace Longitude by End of 2027</em>), executes multi-brand commission calculations, and enables bookings via both <strong>B2B Advisor UI Portals</strong> and <strong>Headless REST APIs</strong>.
              </p>
            </div>

            {/* OPEN ARCHITECTURAL QUESTION FOR TTC: AGENCY MASTERING AUTHORITY */}
            <div className="card" style={{ padding: '24px', background: '#fffbe3', border: '2px solid var(--gold-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <HelpCircle size={22} color="#b45309" />
                <h3 className="parent-title-dt" style={{ margin: 0, color: '#92400e' }}>Open Decision Point for TTC: Agency Mastering Authority</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#78350f', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                While <strong>iTravel Connect is contracted to replace Longitude by End of 2027</strong>, TTC must formally finalize which platform acts as the <strong>System of Record / Golden Master for Agency Accounts</strong>:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                
                {/* Option A: Salesforce Mastered */}
                <div style={{ background: '#fff', padding: '18px', borderRadius: 'var(--radius-card)', border: '1px solid #fde68a', boxShadow: 'var(--shadow-tag)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>Option A (Recommended for CRM Sync)</div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 6px 0' }}>Salesforce CRM / MDM as Golden Source</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--slate-700)', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                    Salesforce owns agency creation, validation, and consortia tier mapping. Salesforce CDC (Change Data Capture) / Outbound Webhooks sync updates directly down to <strong>iTravel Connect OMS</strong> and <strong>Tropics (V4)</strong>.
                  </p>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>✓ Pros: Single B2B CRM source of truth across sales reps and marketing.</div>
                </div>

                {/* Option B: iTravel Mastered */}
                <div style={{ background: '#fff', padding: '18px', borderRadius: 'var(--radius-card)', border: '1px solid #fde68a', boxShadow: 'var(--shadow-tag)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>Option B (OMS Native)</div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 6px 0' }}>iTravel Connect OMS as Golden Source</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--slate-700)', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                    iTravel directly masters agency account profiles, PCC logins, credit terms, and commission overrides, then pushes outbound events to Salesforce CRM.
                  </p>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#15803d' }}>✓ Pros: Native OMS enforcement of credit limits & agency booking permissions.</div>
                </div>

              </div>
            </div>

            {/* SECTION 1: AGENCY DATA MODEL & CROSS-SYSTEM ID RESOLUTION */}
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="var(--navy-900)" />
                <h3 className="parent-title-dt" style={{ margin: 0 }}>1. Agency Data Model & Cross-System ID Resolution</h3>
              </div>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                Legacy agency accounts in Tropics (e.g., <code>AG-101</code>) and Longitude are resolved into a canonical <code>BookingOwner</code> schema by translating records through the chosen Master authority (Salesforce MDM or iTravel OMS). <em>Note: iTravel Connect is contracted to replace Longitude by End of 2027.</em>
              </p>

              {/* Data Model Hierarchy Diagram Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', borderTop: '4px solid var(--navy-900)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold-500)', textTransform: 'uppercase', marginBottom: '4px' }}>Level 1: Network / Consortia</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 8px 0' }}>AgencyConsortium</h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0 }}>Consortia alliances (Virtuoso, AAA, Signature, Ensemble, CLIA). Defines top-level override benefits, preferred commission tiers, and co-op marketing agreements.</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', borderTop: '4px solid #0284c7' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>Level 2: Head Office / Branch</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 8px 0' }}>OrgUnitCode & RequestorID</h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0 }}>Maps the physical agency location or PCC (Pseudo City Code). Manages agency credit limits, currency settings, and consolidated monthly financial statements.</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', borderTop: '4px solid #7c3aed' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '4px' }}>Level 3: Individual Advisor</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 8px 0' }}>RequestingUserID</h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0 }}>Consultant-level identity tracking. Ties individual travel advisors to sales incentives, booking history, and Okta SSO JWT authentication claims.</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', borderTop: '4px solid #166534' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Level 4: Cross-System Translation</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 8px 0' }}>Master Resolution Layer</h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0 }}>Bi-directionally syncs agent records: <code>Tropics / Longitude ID</code> &lt;-&gt; <code>Okta User UUID</code> &lt;-&gt; <code>iTravel PCC</code> (Longitude replacement target: End 2027).</p>
                </div>

              </div>

              {/* JSON Payload Spec Box */}
              <div style={{ background: 'var(--navy-900)', padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--gold-500)', color: '#38bdf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gold-500)', textTransform: 'uppercase' }}>iTravel BookingOwner Canonical JSON Contract:</span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-400)' }}>POST /v7/rest/bookings</span>
                </div>
                <pre style={{ margin: 0, fontSize: '12px', overflowX: 'auto', lineHeight: '1.5' }}>{`{
  "BookingOwner": {
    "RequestorType": "AGENCY",
    "RequestorID": "PCC_NY_8842",       // Canonical Agency PCC / Account ID
    "RequestingUserID": "ADV_SMITH_99", // Consultant User ID (Okta Claims)
    "OrgUnitCode": "BRANCH_MANHATTAN", // Agency Branch Code
    "AgencyConsortium": "VIRTUOSO",    // Consortia Alliance (Triggers Perks)
    "PayToSelf": false,                // Pay commission to agency HQ vs consultant
    "PayOutAgencyCode": "HQ_GLOBAL_01",// Override payment target agency
    "NetPayApplicable": true,          // TRUE = Net Billing, FALSE = Gross Billing
    "channel": "B2B_PORTAL",
    "BusinessType": "RETAIL"
  }
}`}</pre>
              </div>
            </div>

            {/* SECTION 2: MULTI-PRODUCT COMMISSION CALCULATION ENGINE */}
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={22} color="var(--navy-900)" />
                <h3 className="parent-title-dt" style={{ margin: 0 }}>2. Multi-Product Commission Calculation Engine & Invoicing Modes</h3>
              </div>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                When a booking contains multiple products (e.g. 7-Day Swiss Tour + 7-Day Rhine River Cruise), iTravel OMS evaluates commission rules per line-item, factors in consortia bonuses, and supports both <strong>Gross Invoicing</strong> and <strong>Net Invoicing</strong>.
              </p>

              {/* Invoicing Comparison Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '2px solid #0284c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>MODE A: GROSS BILLING</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 10px 0' }}>NetPayApplicable = false</h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--slate-700)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    <li>Advisor collects <strong>Full Retail Price ($10,000)</strong> from the customer.</li>
                    <li>iTravel processes payment for full gross amount ($10,000) via credit card token.</li>
                    <li>iTravel generates a <strong>Commission Ledger Entry ($1,540)</strong> in the Super PNR.</li>
                    <li>Commission is paid out to the agency via monthly ACH / EFT batch cycle.</li>
                  </ul>
                  <div style={{ background: '#e0f2fe', padding: '10px 14px', borderRadius: 'var(--radius-accordion)', fontSize: '12px', fontWeight: '700', color: '#0369a1' }}>
                    Customer Charged: $10,000 | Payout to Agency: $1,540
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '2px solid #166534' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>MODE B: NET BILLING (DEDUCT AT SOURCE)</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 10px 0' }}>NetPayApplicable = true</h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--slate-700)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    <li>Advisor collects <strong>Full Retail Price ($10,000)</strong> from the customer directly.</li>
                    <li>Advisor retains earned commission ($1,540) in agency bank account immediately.</li>
                    <li>iTravel charges agency credit card or credit line for <strong>Net Amount ($8,460)</strong>.</li>
                    <li>Customer invoice still displays full retail price ($10,000) with zero commission disclosure.</li>
                  </ul>
                  <div style={{ background: '#dcfce7', padding: '10px 14px', borderRadius: 'var(--radius-accordion)', fontSize: '12px', fontWeight: '700', color: '#166534' }}>
                    Customer Charged: $10,000 | Remitted to iTravel: $8,460
                  </div>
                </div>

              </div>

              {/* Commission Calculation Breakdown Table */}
              <div style={{ background: '#fff', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-300)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy-900)', color: '#fff', padding: '14px 20px', fontSize: '14px', fontWeight: '700' }}>
                  Multi-Product Blended Commission Breakdown Example (Virtuoso Agency)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: 'var(--navy-900)' }}>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Line Item Product</th>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Source Backend</th>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Gross Price</th>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Base Rate</th>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Consortia Bonus</th>
                      <th style={{ padding: '10px 16px', borderBottom: '2px solid var(--slate-300)' }}>Total Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>Swiss Alps Land Tour</td>
                      <td style={{ padding: '12px 16px' }}><code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>Tropics / V4</code></td>
                      <td style={{ padding: '12px 16px' }}>$4,000</td>
                      <td style={{ padding: '12px 16px' }}>12% ($480)</td>
                      <td style={{ padding: '12px 16px', color: '#166534', fontWeight: '700' }}>+1% ($40)</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--navy-900)' }}>$520 (13.0%)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>Rhine River Cruise Suite</td>
                      <td style={{ padding: '12px 16px' }}><code style={{ background: '#f3e8ff', color: '#6b21a8', padding: '2px 6px', borderRadius: '4px' }}>Uniworld / iTravel</code></td>
                      <td style={{ padding: '12px 16px' }}>$6,000</td>
                      <td style={{ padding: '12px 16px' }}>15% ($900)</td>
                      <td style={{ padding: '12px 16px', color: '#166534', fontWeight: '700' }}>+2% ($120)</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--navy-900)' }}>$1,020 (17.0%)</td>
                    </tr>
                    <tr style={{ background: '#f0fdf4', fontWeight: '800' }}>
                      <td style={{ padding: '12px 16px', color: '#166534' }}>TOTAL BUNDLED PACKAGE</td>
                      <td style={{ padding: '12px 16px' }}>Super PNR Ledger</td>
                      <td style={{ padding: '12px 16px' }}>$10,000</td>
                      <td style={{ padding: '12px 16px' }}>$1,380</td>
                      <td style={{ padding: '12px 16px', color: '#166534' }}>+$160</td>
                      <td style={{ padding: '12px 16px', color: '#166534', fontSize: '14px' }}>$1,540 (15.4% Blended)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: BOOKING METHODS (UI PORTAL VS HEADLESS REST API) */}
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Code size={22} color="var(--navy-900)" />
                <h3 className="parent-title-dt" style={{ margin: 0 }}>3. Dual Booking Pathways: B2B Advisor UI vs Headless REST API</h3>
              </div>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                Bookings can be initiated either interactively by travel advisors through the <strong>B2B Trade Web Portal</strong> or headlessly via automated <strong>REST API integrations</strong> (GDS, Travelsets, external agency engines).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Pathway 1: UI Portal */}
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-300)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--navy-900)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>PATHWAY 1: B2B ADVISOR UI PORTAL</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0, lineHeight: '1.5' }}>
                    Designed for travel advisors, call center agents, and B2C web guests seeking a visual, step-by-step shopping experience.
                  </p>
                  
                  <div style={{ background: '#fff', padding: '14px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>1. Authentication:</strong> Advisor logs in via Okta / Salesforce SSO with single sign-on.</div>
                    <div><strong>2. Multi-Modal Search:</strong> Advisor selects Swiss Land Tour + Rhine Cruise in visual cart.</div>
                    <div><strong>3. Interactive Cabin Grid:</strong> Selects deck suites and hotel room categories.</div>
                    <div><strong>4. Transit Buffer Check:</strong> UI alerts advisor if transfer buffer is under 3 hours.</div>
                    <div><strong>5. Checkout & Payment:</strong> Enters customer card or selects Net Billing remittals.</div>
                    <div><strong>6. Instant Super PNR:</strong> Downloads single consolidated PDF guest invoice.</div>
                  </div>
                </div>

                {/* Pathway 2: Headless REST API */}
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-300)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--gold-500)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>PATHWAY 2: HEADLESS REST API</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', margin: 0, lineHeight: '1.5' }}>
                    Designed for high-throughput GDS connections, external agency booking engines, and partner integrations.
                  </p>
                  
                  <div style={{ background: '#fff', padding: '14px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>1. OAuth 2.0 Bearer Token:</strong> Call <code>POST /token</code> on dedicated Auth host to get 30-min JWT.</div>
                    <div><strong>2. Availability Search:</strong> Submit search payload to <code>POST /v7/rest/public-power-shopping/cruises/fetch</code>.</div>
                    <div><strong>3. Place Temporary Hold:</strong> Call <code>POST /v7/rest/public-be-cruise/cruises/{'{cruiseCode}'}/cabins/hold</code> (15-min TTL lock).</div>
                    <div><strong>4. Create Booking Order:</strong> Submit JSON to canonical Connect endpoint <code>POST /v7/rest/bookings</code> with full payload.</div>
                    <div><strong>5. Response Payload:</strong> Returns <code>SuperPNR</code>, Tropics <code>v4BookingRef</code>, and invoice URL.</div>
                    <div><strong>6. Webhook Notifications:</strong> Receives async updates via outbound webhook event bus.</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 5: TECHNICAL ARCHITECTURE & PROTOCOL TOPOLOGY */}
        {activeTab === 'arch' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Integration Architecture Topology Card */}
            <div className="card" style={{ padding: '24px', background: '#f8fafc', border: '2px solid var(--navy-900)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <GitMerge size={22} color="var(--navy-900)" />
                <h3 className="parent-title-dt" style={{ margin: 0 }}>{OMS_ARCHITECTURE_TOPOLOGY.title}</h3>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '16px' }}>{OMS_ARCHITECTURE_TOPOLOGY.subtitle}</p>

              <pre style={{ background: 'var(--navy-900)', color: '#38bdf8', padding: '20px', borderRadius: 'var(--radius-card)', fontSize: '12px', overflowX: 'auto', border: '1px solid var(--gold-500)' }}>
                {OMS_ARCHITECTURE_TOPOLOGY.diagram}
              </pre>

              <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-300)', marginTop: '16px' }}>
                <h4 className="child-title-dt" style={{ marginBottom: '10px', color: '#15803d' }}>Architectural Confirmation & Principles:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--slate-800)', margin: 0 }}>
                  {OMS_ARCHITECTURE_TOPOLOGY.keyTakeaways.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}><strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Platform Comparison Table */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ backgroundColor: 'var(--gold-500)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>Platform Naming & Roles</span>
                <h2 className="parent-title-dt" style={{ marginTop: '8px' }}>TravCorp V4 (Distribution API) vs iTravel Connect (IBS OMS)</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Comparison of ownership, primary domain, inventory backends, and integration responsibilities within TTC Business Architecture.</p>
              </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--navy-900)', color: '#fff' }}>
                  <th style={{ padding: '12px 16px', borderRadius: 'var(--radius-icon) 0 0 0', width: '22%' }}>Dimension</th>
                  <th style={{ padding: '12px 16px', width: '39%' }}>TravCorp V4 (Distribution API)</th>
                  <th style={{ padding: '12px 16px', borderRadius: '0 var(--radius-icon) 0 0', width: '39%' }}>iTravel Connect (IBS OMS)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Platform Owner / Provider</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0284c7' }}>The Travel Corporation (TTC Internal Tech)</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#7c3aed' }}>IBS Software (iTravel Product Suite)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Core System Role</td>
                  <td style={{ padding: '12px 16px' }}>Touring Product Distribution API & Inventory Gateway</td>
                  <td style={{ padding: '12px 16px' }}>Central Order Management System (OMS) & Gateway</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Primary Business Domains</td>
                  <td style={{ padding: '12px 16px' }}>Guided Land Tours (Trafalgar, Insight, Contiki, Costsaver)</td>
                  <td style={{ padding: '12px 16px' }}>Uniworld River Cruises & Multi-Modal Bundled Carts</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Backend Source Systems</td>
                  <td style={{ padding: '12px 16px' }}>Tropics (Guided Tour Booking Engine)</td>
                  <td style={{ padding: '12px 16px' }}>iTravel Cruise Engine v6.0 & Super PNR Master Store</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>UI Integration Topology</td>
                  <td style={{ padding: '12px 16px' }}>Invoked internally by iTravel OMS (Never called from UI)</td>
                  <td style={{ padding: '12px 16px' }}>Exposes single unified REST API Gateway directly to UI</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)', background: '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Primary Abstraction</td>
                  <td style={{ padding: '12px 16px' }}>Touring product (brand, tour, option, departure)</td>
                  <td style={{ padding: '12px 16px' }}>Multi-Product Order Basket & Super PNR</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--slate-200)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '700' }}>Key Responsibilities</td>
                  <td style={{ padding: '12px 16px' }}>Land tour departures, hotel allotments, optional experiences</td>
                  <td style={{ padding: '12px 16px' }}>Cruise cabin holds, transit buffer rules engine, unified guest invoice, net billing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* TAB 5: ARCHITECTURE & OPERATING MODEL RISKS Q&A EVIDENCE MATRIX */}
        {activeTab === 'qa' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.05em' }}>Business Operating Model Assessment</span>
              <h2 className="parent-title-dt" style={{ marginTop: '8px', color: 'var(--navy-900)' }}>Architecture & Operating Model Risks — Evidence & Solutions Matrix</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Technical API & POC evidence addressing the risk questions from the Third-Party Business Architecture Assessment.</p>
            </div>

            {/* EA Governance Banner */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-card)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HelpCircle size={24} color="#1d4ed8" />
              <div style={{ fontSize: '13.5px', color: 'var(--slate-800)', lineHeight: '1.5' }}>
                <strong>Governance Note:</strong> The technical responses below reflect the <strong>AI-Synthesized Architectural Assessment</strong> grounded in iTravel Cruise v6.0 contracts, TravCorp V4 APIs, and Business requirements.
                <br />
                <span style={{ color: '#1e40af', fontWeight: '700' }}>Status: AI Answer = YES | Final Confirmation (YES / NO) to be formally signed off by the TTC Enterprise Architecture (EA) Team.</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {ARCHITECTURE_RISKS_QA.map((cat, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-card)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-tag)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '2px solid var(--navy-900)', paddingBottom: '8px' }}>
                    <AlertTriangle size={20} color="#dc2626" />
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 }}>{cat.category}</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} style={{ background: '#fff', padding: '18px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: 0, flex: 1 }}>
                            "{item.question}"
                          </h4>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                            <CheckCircle size={14} color="#1d4ed8" />
                            AI Answer: YES <span style={{ fontSize: '11px', fontWeight: '600', color: '#3b82f6' }}>(To be confirmed by EA Team)</span>
                          </span>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 'var(--radius-accordion)', border: '1px solid #bbf7d0' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Technical Evidence & Solution:</div>
                          <p style={{ fontSize: '13px', color: '#14532d', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>{item.evidence}</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--slate-500)' }}>API / Contract Reference:</span>
                          <code style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{item.apiRef}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--navy-900)', color: 'var(--slate-400)', padding: '20px 32px', marginTop: 'auto', borderTop: '1px solid var(--navy-800)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <p>© 2026 The Travel Corporation (TTC) & IBS Software. Multi-Modal iTravel & V4 Knowledge Base.</p>
          <p>OpenAPI 3.0 Compliant | Amplitude Telemetry Active</p>
        </div>
      </footer>
    </div>
  );
}
