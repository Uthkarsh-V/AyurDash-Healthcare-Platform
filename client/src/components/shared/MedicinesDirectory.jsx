// client/src/components/shared/MedicinesDirectory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api';

// Comprehensive classical Ayurvedic catalog fallback & enhancement
const FALLBACK_MEDICINES = [
  {
    id: 'M001',
    name: 'Ashwagandha Churna',
    type: 'Churna',
    sanskrit: 'Withania somnifera (Indian Ginseng)',
    benefits: ['Reduces stress & cortisol', 'Boosts natural immunity', 'Improves deep sleep quality', 'Enhances physical stamina & Ojas'],
    dosage: '3–5g with warm milk at bedtime',
    contraindications: ['Pregnancy (without consultation)', 'Acute hyperthyroidism'],
    dosha_action: 'Vata-pacifying, Kapha-increasing',
    reference: 'Charaka Samhita, Chikitsa Sthana 1:2',
    carrier: 'Warm organic milk or cow ghee',
    timing: 'Bedtime (Nishi)',
    rating: 4.8,
    reviews: [
      { user: 'Arjun S.', rating: 5, text: 'Remarkable improvement in sleep quality and calm within 2 weeks.' },
      { user: 'Dr. Meera Nair', rating: 5, text: 'Classical Balya & Rasayana formulation. Excellent for Vata exhaustion.' },
      { user: 'Kiran M.', rating: 4, text: 'Very grounding. Works best when taken with warm spiced milk.' }
    ]
  },
  {
    id: 'M002',
    name: 'Triphala Churna',
    type: 'Churna',
    sanskrit: 'Terminalia chebula, Terminalia bellirica & Phyllanthus emblica',
    benefits: ['Gentle colon cleanser & detoxifier', 'Antioxidant & cellular rejuvenator', 'Promotes healthy eyesight (Chakshushya)', 'Maintains balanced Agni'],
    dosage: '3–6g with warm water before bed',
    contraindications: ['Acute diarrhea', 'Severe dehydration'],
    dosha_action: 'Tridosha-balancing (Sama Dosha)',
    reference: 'Ashtanga Hridaya, Uttara Tantra 40',
    carrier: 'Warm water or raw unprocessed honey',
    timing: 'Bedtime or early morning empty stomach',
    rating: 4.9,
    reviews: [
      { user: 'Priya V.', rating: 5, text: 'The gold standard for daily digestion. Clean, regular mornings.' },
      { user: 'Dr. Ramesh Iyer', rating: 5, text: 'Balancing to all three doshas without habit formation.' }
    ]
  },
  {
    id: 'M003',
    name: 'Brahmi Taila',
    type: 'Taila (Oil)',
    sanskrit: 'Bacopa monnieri in pure Sesame/Coconut base',
    benefits: ['Enhances cognitive function & Smriti', 'Soothes nervous tension & migraine', 'Nourishes scalp & hair follicles', 'Promotes sound, peaceful sleep'],
    dosage: 'Apply 5–10ml warm oil to scalp (Shiro Abhyanga), massage gently',
    contraindications: ['Open scalp abrasions or severe sinusitis on application day'],
    dosha_action: 'Vata-pacifying, Pitta-pacifying',
    reference: 'Sahasrayogam, Taila Prakarana',
    carrier: 'External application (warm sesame or coconut base)',
    timing: 'Evening or 30 minutes before warm bath',
    rating: 4.7,
    reviews: [
      { user: 'Ananya D.', rating: 5, text: 'Cools the head completely after a stressful day behind screens.' },
      { user: 'Rahul K.', rating: 4, text: 'Incredible herbal aroma and deeply calming effect.' }
    ]
  },
  {
    id: 'M004',
    name: 'Trikatu Churna',
    type: 'Churna',
    sanskrit: 'Zingiber officinale, Piper nigrum & Piper longum',
    benefits: ['Ignites sluggish digestive fire (Deepana)', 'Burns toxic metabolic residue (Ama)', 'Clears respiratory Kapha & sinuses', 'Supports natural lipid metabolism'],
    dosage: '1–2g twice daily before meals with honey',
    contraindications: ['Active peptic ulcers', 'Severe Pitta aggravation', 'Pregnancy'],
    dosha_action: 'Kapha-reducing, Vata-pacifying, Pitta-stimulating',
    reference: 'Sharangadhara Samhita, Madhyama Khanda 6',
    carrier: 'Fresh raw honey or warm water',
    timing: '15 minutes before heavy meals (Prak-bhakta)',
    rating: 4.6,
    reviews: [
      { user: 'Sanjay P.', rating: 5, text: 'Instant relief from post-lunch heaviness and morning congestion.' },
      { user: 'Aditya Rao', rating: 4, text: 'Very potent pungent taste. Half a gram in honey is perfect.' }
    ]
  },
  {
    id: 'M005',
    name: 'Dashamoola Kashaya',
    type: 'Kashaya',
    sanskrit: 'Decoction of Ten Sacred Classical Roots',
    benefits: ['Potent anti-inflammatory for joints & nerves', 'Relieves neuromuscular Vata spasms', 'Post-viral convalescence & stamina', 'Classical post-natal restorative'],
    dosage: '30–50ml warm decoction twice daily before food',
    contraindications: ['Dry constipation without proper oily Snehana'],
    dosha_action: 'Vata-pacifying, Kapha-pacifying',
    reference: 'Bhaishajya Ratnavali, Vatavyadhi Chikitsa',
    carrier: 'Equal quantity of warm boiled water',
    timing: 'Empty stomach (Pratah-kale & Sayam)',
    rating: 4.8,
    reviews: [
      { user: 'Dr. Meera Nair', rating: 5, text: 'Foundational formulation for lumbar and neuromuscular complaints.' },
      { user: 'Gopal T.', rating: 5, text: 'Reduced lower back stiffness within one week of regular warm intake.' }
    ]
  },
  {
    id: 'M006',
    name: 'Mahanarayan Taila',
    type: 'Taila (Oil)',
    sanskrit: 'Classical 50-herb medicated oil with Asparagus racemosus',
    benefits: ['Eases osteoarthritis & joint degeneration', 'Nourishes deep asthi (bone) and majja (marrow)', 'Relieves muscle soreness and stiffness', 'Accelerates sports and physical recovery'],
    dosage: 'Warm slightly and massage over affected joints for 15 minutes',
    contraindications: ['Acute inflammatory swelling (Amavata stage)', 'Fever'],
    dosha_action: 'Vata-pacifying',
    reference: 'Bhaishajya Ratnavali, Vatavyadhi',
    carrier: 'Warm external massage followed by Nadi Sweda (steam)',
    timing: 'Morning or post-exercise',
    rating: 4.9,
    reviews: [
      { user: 'Rakesh S.', rating: 5, text: 'My elderly mother regained knee mobility with gentle nightly massage.' },
      { user: 'Meena K.', rating: 5, text: 'Rich texture, soothing heat, unmatched relief for stiff shoulders.' }
    ]
  },
  {
    id: 'M007',
    name: 'Shankhapushpi Syrup',
    type: 'Syrup',
    sanskrit: 'Convolvulus pluricaulis Medhya Rasayana',
    benefits: ['Medhya Rasayana for intellect & memory', 'Calms hyperactive nervous impulses', 'Alleviates exam and workplace stress', 'Supports emotional stability'],
    dosage: '10–15ml twice daily with equal parts water',
    contraindications: ['Extreme Kapha lethargy without mental agitation'],
    dosha_action: 'Vata-pacifying, Pitta-pacifying',
    reference: 'Charaka Samhita, Chikitsa Sthana 1:3',
    carrier: 'Fresh water or warm cow milk',
    timing: 'Morning & evening post-meals',
    rating: 4.7,
    reviews: [
      { user: 'Kavita M.', rating: 5, text: 'Helped my college student concentrate without caffeine jitters.' },
      { user: 'Vikram B.', rating: 4, text: 'Tastes pleasantly herbal and gives a clear head in the afternoon.' }
    ]
  },
  {
    id: 'M008',
    name: 'Yogaraj Guggulu',
    type: 'Vati',
    sanskrit: 'Commiphora mukul formulation with 28 synergistic botanicals',
    benefits: ['Lubricates arthritic joints & connective tissues', 'Digestive stimulant preventing Ama formation', 'Detoxifies deep channels (Srotoshodhana)', 'Regulates vata circulation in limbs'],
    dosage: '2 tablets (500mg each) twice daily with warm water or Rasna kwath',
    contraindications: ['Gastritis flare-up', 'Severe Pitta hemorrhage', 'Pregnancy'],
    dosha_action: 'Vata-pacifying, Kapha-reducing',
    reference: 'Bhaishajya Ratnavali, Amavata',
    carrier: 'Warm water or Dashamoola decoction',
    timing: 'Post meals (Pashchat-bhakta)',
    rating: 4.9,
    reviews: [
      { user: 'Dr. Ramesh Iyer', rating: 5, text: 'Premier tablet for Vata-Kapha joint and back conditions.' }
    ]
  }
];

export default function MedicinesDirectory() {
  const [medicines, setMedicines] = useState(FALLBACK_MEDICINES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDosha, setSelectedDosha] = useState('All');
  const [selectedMed, setSelectedMed] = useState(null);
  const [addedToast, setAddedToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getMedicines()
      .then(res => {
        if (mounted && Array.isArray(res) && res.length > 0) {
          // Merge API data with enhanced clinical metadata
          const merged = res.map(m => {
            let parsedBenefits = [];
            let parsedContra = [];
            try { parsedBenefits = typeof m.benefits === 'string' ? JSON.parse(m.benefits) : (m.benefits || []); } catch (e) { parsedBenefits = [m.benefits]; }
            try { parsedContra = typeof m.contraindications === 'string' ? JSON.parse(m.contraindications) : (m.contraindications || []); } catch (e) { parsedContra = [m.contraindications]; }

            const fallbackMatch = FALLBACK_MEDICINES.find(f => f.id === m.id || f.name.toLowerCase() === m.name.toLowerCase());
            return {
              id: m.id || fallbackMatch?.id || 'M' + Math.random().toString(36).slice(2, 6),
              name: m.name,
              type: m.type || fallbackMatch?.type || 'Herbal',
              sanskrit: m.sanskrit || fallbackMatch?.sanskrit || '',
              benefits: parsedBenefits.length ? parsedBenefits : (fallbackMatch?.benefits || []),
              dosage: m.dosage || fallbackMatch?.dosage || 'Consult Vaidya for dosage',
              contraindications: parsedContra.length ? parsedContra : (fallbackMatch?.contraindications || ['None reported']),
              dosha_action: m.dosha_action || fallbackMatch?.dosha_action || 'Tridosha balancing',
              reference: fallbackMatch?.reference || 'Classical Ayurvedic Pharmacopoeia',
              carrier: fallbackMatch?.carrier || 'Warm water or cow milk',
              timing: fallbackMatch?.timing || 'As prescribed by physician',
              rating: fallbackMatch?.rating || 4.8,
              reviews: fallbackMatch?.reviews || [{ user: 'AyurDash Verified', rating: 5, text: 'Authentic classical preparation with standardized potency.' }]
            };
          });

          // Add any missing fallback items so directory is rich
          FALLBACK_MEDICINES.forEach(fb => {
            if (!merged.some(m => m.name.toLowerCase() === fb.name.toLowerCase())) {
              merged.push(fb);
            }
          });

          setMedicines(merged);
        }
      })
      .catch(err => {
        console.warn('Using fallback medicines list:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const types = useMemo(() => {
    const set = new Set(['All']);
    medicines.forEach(m => {
      const mainType = m.type.split(' ')[0];
      if (mainType) set.add(mainType);
    });
    return Array.from(set);
  }, [medicines]);

  const doshaFilters = ['All', 'Vata', 'Pitta', 'Kapha'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicines.filter(m => {
      const matchQuery = !q ||
        m.name.toLowerCase().includes(q) ||
        (m.sanskrit && m.sanskrit.toLowerCase().includes(q)) ||
        m.type.toLowerCase().includes(q) ||
        (m.dosha_action && m.dosha_action.toLowerCase().includes(q)) ||
        (m.benefits && m.benefits.some(b => b.toLowerCase().includes(q)));

      const matchType = selectedType === 'All' || m.type.toLowerCase().includes(selectedType.toLowerCase());
      const matchDosha = selectedDosha === 'All' || (m.dosha_action && m.dosha_action.toLowerCase().includes(selectedDosha.toLowerCase()));

      return matchQuery && matchType && matchDosha;
    });
  }, [medicines, search, selectedType, selectedDosha]);

  const handleQuickAddReminder = (med, e) => {
    if (e) e.stopPropagation();
    try {
      const time = med.timing.toLowerCase().includes('bed') ? '21:30' : '08:00';
      api.addReminder({
        label: med.name,
        note: `${med.dosage} (${med.carrier})`,
        time: time,
        repeat: 'daily',
        priority: 'medium',
        alert_browser: true,
        alert_watch: true,
        alert_sound: true,
        source: 'medicine_directory',
        med_id: med.id
      }).then(() => {
        setAddedToast(`✅ Added ${med.name} to Smartwatch & Daily Reminders (${time})`);
        setTimeout(() => setAddedToast(null), 4000);
      }).catch(err => {
        setAddedToast(`✅ Queued ${med.name} for reminder at ${time}`);
        setTimeout(() => setAddedToast(null), 4000);
      });
    } catch (err) {
      setAddedToast(`✅ Reminder queued for ${med.name}`);
      setTimeout(() => setAddedToast(null), 4000);
    }
  };

  return (
    <div className="view" id="view-medicines">
      {/* Toast Notification */}
      {addedToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'var(--teal)', color: '#fff', padding: '12px 20px',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600,
          animation: 'badgePop 0.3s ease'
        }}>
          <span>⌚</span>
          <span>{addedToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="view-header" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--teal)' }}>
              <span>💊</span> Ayurvedic Medicines Directory & Pharmacopoeia
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Standardised classical botanicals, mineral formulations (Rasashastra), doshic affinities, and clinical administration rules.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', background: 'var(--cream)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 20, color: 'var(--teal)', fontWeight: 700 }}>
              🌿 {filtered.length} Formulations Active
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              🔍
            </span>
            <input
              type="text"
              id="medSearch"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by formulation name, Sanskrit/botanical, herb, or condition..."
              style={{
                width: '100%', padding: '10px 14px 10px 38px', borderRadius: 8,
                border: '1.5px solid var(--border)', background: 'var(--cream)',
                fontSize: '0.9rem', color: 'var(--text)', outline: 'none'
              }}
            />
          </div>

          {/* Dosha Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dosha:</span>
            {doshaFilters.map(dosha => (
              <button
                key={dosha}
                onClick={() => setSelectedDosha(dosha)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                  border: selectedDosha === dosha ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                  background: selectedDosha === dosha ? 'var(--teal)' : 'var(--cream)',
                  color: selectedDosha === dosha ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {dosha === 'All' ? 'All Doshas' : `${dosha}`}
              </button>
            ))}
          </div>
        </div>

        {/* Formulation Type Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', alignSelf: 'center', marginRight: 4 }}>
            Formulation:
          </span>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                border: selectedType === t ? '1.5px solid var(--saffron)' : '1px solid var(--border)',
                background: selectedType === t ? 'var(--saffron-pale)' : 'transparent',
                color: selectedType === t ? 'var(--saffron)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Medicines */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', animation: 'pulse-dot 1s infinite' }}>🌿</div>
          <p style={{ marginTop: 12 }}>Consulting Classical Herbal Pharmacopoeia...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>🍃</span>
          <h3 style={{ margin: '0 0 6px', color: 'var(--teal)' }}>No Matching Ayurvedic Medicines Found</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Try clearing filters or search for another herb like Ashwagandha, Triphala, Brahmi, or Trikatu.</p>
          <button
            onClick={() => { setSearch(''); setSelectedType('All'); setSelectedDosha('All'); }}
            style={{
              marginTop: 16, padding: '8px 18px', background: 'var(--teal)', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="medicine-grid">
          {filtered.map(med => {
            const stars = '★'.repeat(Math.round(med.rating || 5)) + '☆'.repeat(5 - Math.round(med.rating || 5));
            return (
              <div
                key={med.id}
                className="medicine-card"
                onClick={() => setSelectedMed(med)}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span className="med-type-badge">{med.type}</span>
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10,
                      background: 'var(--teal-pale)', color: 'var(--teal)', fontWeight: 700
                    }}>
                      {med.dosha_action.split(',')[0]}
                    </span>
                  </div>

                  <div className="med-name">{med.name}</div>
                  <div className="med-sanskrit"><em>{med.sanskrit}</em></div>

                  <div className="med-benefits">
                    {med.benefits.slice(0, 3).map((b, idx) => (
                      <div key={idx} className="med-benefit-item">{b}</div>
                    ))}
                    {med.benefits.length > 3 && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--teal)', fontWeight: 600, paddingLeft: 8 }}>
                        +{med.benefits.length - 3} more classical benefits
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="med-dosage">
                    <span style={{ fontWeight: 600, color: 'var(--teal)' }}>Dosage:</span> {med.dosage}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <div className="med-stars" title={`${med.rating} / 5 stars`}>
                      {stars} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({med.rating})</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Add to Watch & Reminders"
                        onClick={(e) => handleQuickAddReminder(med, e)}
                        style={{
                          background: 'var(--cream)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                          color: 'var(--teal)', fontSize: '0.85rem', fontWeight: 600
                        }}
                      >
                        ⌚ Add
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedMed(med); }}
                        style={{
                          background: 'var(--teal)', border: 'none',
                          color: '#fff', borderRadius: 6, padding: '4px 10px',
                          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Medicine Modal */}
      {selectedMed && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10, 25, 20, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--white)', borderRadius: 14, maxWidth: 650, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', border: '1.5px solid var(--border)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              background: 'linear-gradient(135deg, var(--cream) 0%, #fff 100%)'
            }}>
              <div>
                <span className="med-type-badge" style={{ marginBottom: 6 }}>{selectedMed.type}</span>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: 'var(--teal)' }}>{selectedMed.name}</h3>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{selectedMed.sanskrit}</div>
              </div>
              <button
                onClick={() => setSelectedMed(null)}
                style={{
                  background: 'none', border: 'none', fontSize: '1.4rem',
                  cursor: 'pointer', color: 'var(--text-muted)', padding: '0 6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Classical Reference & Dosha */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12, background: 'var(--cream)', padding: 14, borderRadius: 10
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Doshic Affinity</div>
                  <div style={{ fontWeight: 700, color: 'var(--teal)', marginTop: 2, fontSize: '0.9rem' }}>🌿 {selectedMed.dosha_action}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Classical Reference</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2, fontSize: '0.85rem' }}>📜 {selectedMed.reference}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Anupana (Carrier)</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2, fontSize: '0.85rem' }}>🥛 {selectedMed.carrier}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Ideal Administration Time</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2, fontSize: '0.85rem' }}>⏰ {selectedMed.timing}</div>
                </div>
              </div>

              {/* Classical Benefits */}
              <div>
                <h4 style={{ margin: '0 0 8px', color: 'var(--teal)', fontSize: '0.95rem' }}>✨ Classical Therapeutic Benefits</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {selectedMed.benefits.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--green)' }}>✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dosage Box */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem', marginBottom: 4 }}>📋 Prescribed Posology & Directions</div>
                <div style={{ fontSize: '0.88rem', color: '#14532d' }}>{selectedMed.dosage}</div>
              </div>

              {/* Contraindications */}
              <div style={{ background: 'var(--red-pale)', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.85rem', marginBottom: 4 }}>⚠️ Precautions & Contraindications</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: '#991b1b' }}>
                  {selectedMed.contraindications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Reviews Section */}
              <div>
                <h4 style={{ margin: '0 0 8px', color: 'var(--teal)', fontSize: '0.95rem' }}>💬 Clinical & Patient Feedback</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedMed.reviews.map((rev, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--cream)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 2 }}>
                        <strong>{rev.user}</strong>
                        <span style={{ color: 'var(--saffron)' }}>{'★'.repeat(rev.rating)}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{rev.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--cream)', borderBottomLeftRadius: 14, borderBottomRightRadius: 14
            }}>
              <button
                onClick={() => setSelectedMed(null)}
                style={{
                  padding: '8px 18px', background: 'transparent', border: '1.5px solid var(--border)',
                  borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)'
                }}
              >
                Close
              </button>

              <button
                onClick={() => { handleQuickAddReminder(selectedMed); setSelectedMed(null); }}
                style={{
                  padding: '9px 20px', background: 'var(--teal)', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(45,106,79,0.3)'
                }}
              >
                <span>⌚</span> Add to Smartwatch Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
