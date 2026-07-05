import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { LineChart, BarChart, DonutChart } from '../components/SVGChart';

export const Reports = () => {
  const { alerts } = useContext(AppContext);
  const [reportRange, setReportRange] = useState('Weekly'); // 'Daily', 'Weekly', 'Monthly'

  // Compute metric averages
  const totalAlerts = alerts.length;
  
  // High Risk count
  const highRiskAlerts = alerts.filter(a => a.riskLevel === 'High').length;

  // 1. Incident Categories breakdown (for Donut Chart)
  const categoriesMap = {
    'Eyes Closed (Micro-sleep)': 0,
    'Frequent Yawning': 0,
    'Distracted (Eyes Off Road)': 0,
  };

  alerts.forEach(a => {
    // Normalise key grouping
    if (a.alertType.includes('Closed') || a.alertType.includes('Micro-sleep')) {
      categoriesMap['Eyes Closed (Micro-sleep)']++;
    } else if (a.alertType.includes('Yawn') || a.alertType.includes('Yawning')) {
      categoriesMap['Frequent Yawning']++;
    } else {
      categoriesMap['Distracted (Eyes Off Road)']++;
    }
  });

  // Map to Donut structure
  const donutData = [
    { label: 'Micro-sleep', value: categoriesMap['Eyes Closed (Micro-sleep)'], color: 'var(--danger)' },
    { label: 'Yawning/Fatigue', value: categoriesMap['Frequent Yawning'], color: 'var(--warning)' },
    { label: 'Distracted', value: categoriesMap['Distracted (Eyes Off Road)'], color: 'var(--secondary)' }
  ];

  // 2. Line Chart ranges (Trends)
  let lineData = [];
  let lineLabels = [];
  let rangeSubtitle = '';

  if (reportRange === 'Daily') {
    lineLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    // Distribute today's alerts across hours
    const todayAlerts = alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString());
    lineData = [0, 0, 0, 0, 0, 0, 0];
    todayAlerts.forEach(a => {
      const hour = new Date(a.timestamp).getHours();
      if (hour >= 8 && hour < 10) lineData[0]++;
      else if (hour >= 10 && hour < 12) lineData[1]++;
      else if (hour >= 12 && hour < 14) lineData[2]++;
      else if (hour >= 14 && hour < 16) lineData[3]++;
      else if (hour >= 16 && hour < 18) lineData[4]++;
      else if (hour >= 18 && hour < 20) lineData[5]++;
      else if (hour >= 20) lineData[6]++;
    });
    rangeSubtitle = 'Hourly distribution of your alerts today';
  } else if (reportRange === 'Weekly') {
    // Dynamically query alerts over last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      lineLabels.push(label);
      
      const count = alerts.filter(a => {
        return new Date(a.timestamp).toDateString() === d.toDateString();
      }).length;
      lineData.push(count);
    }
    rangeSubtitle = 'Your daily alert volume over the past 7 days';
  } else {
    // Monthly statistics grouped by weeks
    lineLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    lineData = [
      alerts.filter(a => {
        const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo >= 21 && daysAgo < 28;
      }).length,
      alerts.filter(a => {
        const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo >= 14 && daysAgo < 21;
      }).length,
      alerts.filter(a => {
        const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo >= 7 && daysAgo < 14;
      }).length,
      alerts.filter(a => {
        const daysAgo = (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo < 7;
      }).length
    ];
    rangeSubtitle = 'Your weekly alert volume over the past month';
  }

  // 3. Time of Day breakdown (for Bar Chart)
  const timeLabels = ['Morning (6a-12p)', 'Afternoon (12p-6p)', 'Evening (6p-12a)', 'Night (12a-6a)'];
  const timeData = [0, 0, 0, 0];
  alerts.forEach(a => {
    const hour = new Date(a.timestamp).getHours();
    if (hour >= 6 && hour < 12) timeData[0]++;
    else if (hour >= 12 && hour < 18) timeData[1]++;
    else if (hour >= 18) timeData[2]++;
    else timeData[3]++;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Safety Reports & Analytics</h1>
          <p style={styles.subtitle}>Review your personal driving safety trends over time.</p>
        </div>
        
        {/* Toggle Range */}
        <div style={styles.toggleGroup}>
          {['Daily', 'Weekly', 'Monthly'].map(range => (
            <button
              key={range}
              style={{
                ...styles.toggleBtn,
                backgroundColor: reportRange === range ? 'var(--primary)' : '#ffffff',
                color: reportRange === range ? '#ffffff' : 'var(--text-main)',
                borderColor: reportRange === range ? 'var(--primary)' : 'var(--border)'
              }}
              onClick={() => setReportRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Lifetime Alerts</span>
          <span style={styles.summaryValue}>{totalAlerts}</span>
          <span style={styles.summarySub}>Logged safety violations</span>
        </div>
        <div className="card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>High Risk Alert Ratio</span>
          <span style={styles.summaryValue}>
            {totalAlerts > 0 
              ? `${Math.round((highRiskAlerts / totalAlerts) * 100)}%` 
              : '0%'}
          </span>
          <span style={styles.summarySub}>Severe micro-sleep events</span>
        </div>
        <div className="card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Most Common Issue</span>
          <span style={{
            ...styles.summaryValue,
            fontSize: '1.25rem',
            paddingTop: '0.35rem'
          }}>
            {donutData.sort((a,b) => b.value - a.value)[0].value > 0 ? donutData[0].label : 'None'}
          </span>
          <span style={styles.summarySub}>
            Primary alert category
          </span>
        </div>
        <div className="card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Safety Trend Rating</span>
          <span style={{ ...styles.summaryValue, color: 'var(--success)' }}>
            {totalAlerts === 0 ? '100%' : `${Math.max(60, 100 - (totalAlerts * 2))}%`}
          </span>
          <span style={styles.summarySub}>Overall driver alertness score</span>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Trend Area Chart (Span 2) */}
        <div className="card" style={styles.gridCol2}>
          <h3 className="card-title">Personal Alert Trend</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>{rangeSubtitle}</p>
          <div style={styles.chartWrapper}>
            <LineChart data={lineData} labels={lineLabels} />
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="card">
          <h3 className="card-title">Incident Types</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>Proportion of your drowsiness indicators</p>
          <div style={styles.chartWrapper}>
            <DonutChart data={donutData} />
          </div>
        </div>
      </div>

      {/* Driver Comparisons Bar Chart */}
      <div className="card">
        <h3 className="card-title">Alerts by Time of Day</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
          Breakdown showing when you are most likely to experience fatigue while driving.
        </p>
        <div style={styles.chartWrapper}>
          <BarChart data={timeData} labels={timeLabels} color="var(--primary)" />
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-sub)',
    marginTop: '0.25rem'
  },
  toggleGroup: {
    display: 'flex',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '2px',
    boxShadow: 'var(--card-shadow)'
  },
  toggleBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid transparent',
    transition: 'all 0.15s',
    cursor: 'pointer'
  },
  summaryCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px',
    borderRadius: '12px'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-sub)',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  summaryValue: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    margin: '0.5rem 0'
  },
  summarySub: {
    fontSize: '0.8rem',
    color: 'var(--text-sub)',
    fontWeight: '500'
  },
  gridCol2: {
    gridColumn: 'span 2'
  },
  chartWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '1rem 0'
  }
};
