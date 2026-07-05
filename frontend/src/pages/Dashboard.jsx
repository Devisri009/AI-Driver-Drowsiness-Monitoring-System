import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LineChart } from '../components/SVGChart';
import { Icons } from '../components/Icons';

export const Dashboard = () => {
  const { alerts, isMonitoring, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Today's alerts
  const todayAlerts = alerts.filter(a => {
    const alertDate = new Date(a.timestamp);
    return alertDate.toDateString() === new Date().toDateString();
  });
  
  const todayAlertCount = todayAlerts.length;

  // Last Detection Time
  const lastDetectionTime = alerts.length > 0 
    ? new Date(alerts[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No recent events';

  // Driver Safety Status & Risk Level
  let safetyStatus = 'SAFE';
  let safetyStatusIndicator = '🟢';
  let statusColor = 'var(--success)';
  let riskLevel = 'LOW';

  if (todayAlertCount > 5) {
    safetyStatus = 'DROWSINESS DETECTED';
    safetyStatusIndicator = '🔴';
    statusColor = 'var(--danger)';
    riskLevel = 'HIGH';
  } else if (todayAlertCount > 1) {
    safetyStatus = 'WARNING';
    safetyStatusIndicator = '🟠';
    statusColor = 'var(--warning)';
    riskLevel = 'MEDIUM';
  }

  // Last 7 days statistics for personal chart
  const getSevenDayStats = () => {
    const dates = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates.push(dateStr);
      
      const count = alerts.filter(a => {
        const alertDate = new Date(a.timestamp);
        return alertDate.toDateString() === d.toDateString();
      }).length;
      counts.push(count);
    }
    return { dates, counts };
  };

  const { dates, counts } = getSevenDayStats();

  const statusCards = [
    {
      title: 'Driver Status',
      value: safetyStatus,
      icon: <Icons.User size={24} color={statusColor} />,
      valueColor: statusColor,
      subtext: 'Current AI safety assessment'
    },
    {
      title: 'Monitoring Status',
      value: isMonitoring ? 'ACTIVE' : 'STANDBY',
      icon: <Icons.Eye size={24} color={isMonitoring ? 'var(--success)' : 'var(--text-sub)'} />,
      valueColor: isMonitoring ? 'var(--success)' : 'var(--text-sub)',
      subtext: isMonitoring ? 'Camera tracking enabled' : 'Camera is offline'
    },
    {
      title: 'Today\'s Alerts',
      value: todayAlertCount.toString(),
      icon: <Icons.Alerts size={24} color={todayAlertCount > 0 ? 'var(--warning)' : 'var(--success)'} />,
      valueColor: 'var(--text-main)',
      subtext: 'Fatigue events logged today'
    },
    {
      title: 'Last Detection',
      value: lastDetectionTime,
      icon: <Icons.Rest size={24} color="var(--primary)" />,
      valueColor: 'var(--text-main)',
      subtext: 'Time of last logged event'
    }
  ];

  const recommendations = [
    { text: 'Stay hydrated during long drives.', icon: <Icons.Water size={20} color="var(--primary)" /> },
    { text: 'Take short breaks every 2 hours.', icon: <Icons.Rest size={20} color="var(--primary)" /> },
    { text: 'Avoid driving when feeling excessively fatigued.', icon: <Icons.Warning size={20} color="var(--danger)" /> },
    { text: 'Keep the vehicle cabin well ventilated.', icon: <Icons.Check size={20} color="var(--success)" /> }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* 1. Hero Safety Banner */}
      <div style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <div style={styles.heroHeader}>
            <h1 style={styles.heroTitle}>Welcome back, {currentUser?.name?.split(' ')[0] || 'Driver'}</h1>
            <p style={styles.heroTagline}>AI Driver Safety Assistant</p>
          </div>
          
          <div style={styles.heroMetrics}>
            <div style={styles.heroMetric}>
              <span style={styles.heroMetricLabel}>Driver Status</span>
              <span style={{ ...styles.heroMetricValue, color: statusColor }}>
                {safetyStatusIndicator} {safetyStatus}
              </span>
            </div>
            <div style={styles.heroMetric}>
              <span style={styles.heroMetricLabel}>Monitoring</span>
              <span style={{ ...styles.heroMetricValue, color: isMonitoring ? 'var(--success)' : 'var(--text-main)' }}>
                {isMonitoring ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div style={styles.heroMetric}>
              <span style={styles.heroMetricLabel}>Risk Level</span>
              <span style={{ ...styles.heroMetricValue, color: statusColor }}>
                {riskLevel}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.heroActionArea}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/monitoring')} 
            style={styles.heroBtn}
          >
            <div style={styles.heroBtnIconWrapper}>
              <Icons.Monitor size={24} color="var(--primary)" />
            </div>
            <div style={styles.heroBtnText}>
              <span style={styles.heroBtnMain}>Start Monitoring</span>
              <span style={styles.heroBtnSub}>Activate AI Detection Camera</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Status Cards Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        {statusCards.map((card, i) => (
          <div key={i} className="card" style={styles.statusCard}>
            <div style={styles.cardIconBox}>
              {card.icon}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={{ ...styles.cardValue, color: card.valueColor }}>{card.value}</div>
              <div style={styles.cardSubtext}>{card.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-cols-2" style={{ alignItems: 'start' }}>
        {/* 3. Safety Recommendations Card */}
        <div className="card" style={styles.recommendationCard}>
          <div style={styles.cardHeader}>
            <Icons.Info size={24} color="var(--primary)" />
            <h3 style={styles.sectionTitle}>Safety Recommendations</h3>
          </div>
          <p style={styles.sectionDesc}>To maintain optimal alertness and road safety, please follow these guidelines:</p>
          
          <ul style={styles.recList}>
            {recommendations.map((rec, i) => (
              <li key={i} style={styles.recItem}>
                <div style={styles.recIconWrapper}>{rec.icon}</div>
                <span style={styles.recText}>{rec.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Drowsiness Events Chart */}
        <div className="card" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <Icons.Alerts size={24} color="var(--text-main)" />
            <h3 style={styles.sectionTitle}>Drowsiness Events - Last 7 Days</h3>
          </div>
          <p style={styles.sectionDesc}>A simple overview of your recent fatigue alerts.</p>
          
          <div style={styles.chartWrapper}>
            <LineChart data={counts} labels={dates} />
          </div>
        </div>
      </div>

    </div>
  );
};

const styles = {
  heroBanner: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    boxShadow: 'var(--card-shadow)',
    padding: '2.5rem',
    marginBottom: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    border: '1px solid var(--border)',
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    zIndex: 2
  },
  heroHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  heroTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  heroTagline: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  heroMetrics: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2.5rem'
  },
  heroMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  heroMetricLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-sub)',
    textTransform: 'uppercase'
  },
  heroMetricValue: {
    fontSize: '1.15rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  heroActionArea: {
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heroBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    paddingRight: '1.5rem',
    borderRadius: '12px',
    gap: '1rem',
    border: 'none',
    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  heroBtnIconWrapper: {
    backgroundColor: '#ffffff',
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroBtnText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  heroBtnMain: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff'
  },
  heroBtnSub: {
    fontSize: '0.8rem',
    color: 'var(--primary-light)',
    fontWeight: '500'
  },
  statusCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border)'
  },
  cardIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-sub)',
    marginBottom: '0.25rem'
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginBottom: '0.25rem'
  },
  cardSubtext: {
    fontSize: '0.8rem',
    color: 'var(--text-sub)'
  },
  recommendationCard: {
    padding: '1.75rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column'
  },
  chartCard: {
    padding: '1.75rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0
  },
  sectionDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-sub)',
    marginBottom: '1.5rem'
  },
  recList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  recItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--background)',
    borderRadius: '8px',
    border: '1px solid var(--border)'
  },
  recIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  recText: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-main)'
  },
  chartWrapper: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1rem'
  }
};
