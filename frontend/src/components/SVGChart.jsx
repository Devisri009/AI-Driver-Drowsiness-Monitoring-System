import React from 'react';

// Line Chart
export const LineChart = ({ data = [], labels = [] }) => {
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 5); // default minimum ceiling is 5

  // Calculate points
  const points = data.map((val, idx) => {
    const x = paddingLeft + (idx / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = points.length > 0
    ? `${points[0].x},${paddingTop + chartHeight} ` + polylinePoints + ` ${points[points.length - 1].x},${paddingTop + chartHeight}`
    : '';

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ minWidth: '400px' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeDasharray="3,3" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-sub)" fontWeight="500">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {points.length > 0 && (
          <polygon points={areaPoints} fill="url(#areaGrad)" />
        )}

        {/* Trend line */}
        {points.length > 0 && (
          <polyline points={polylinePoints} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-dot-group">
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="var(--primary)" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="8" fill="var(--primary)" opacity="0" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => { e.target.setAttribute('opacity', '0.2'); }}
              onMouseLeave={(e) => { e.target.setAttribute('opacity', '0'); }}
            >
              <title>{labels[idx]}: {p.val} alerts</title>
            </circle>
          </g>
        ))}

        {/* X Axis Labels */}
        {labels.map((lbl, idx) => {
          const x = paddingLeft + (idx / Math.max(labels.length - 1, 1)) * chartWidth;
          return (
            <text key={idx} x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-sub)" fontWeight="500">
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// Bar Chart
export const BarChart = ({ data = [], labels = [], color = 'var(--primary)' }) => {
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 5);
  const barWidth = Math.max(10, (chartWidth / data.length) * 0.5);
  const gap = (chartWidth / data.length) * 0.5;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ minWidth: '400px' }}>
        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border)" strokeDasharray="3,3" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-sub)" fontWeight="500">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((val, idx) => {
          const barHeight = (val / maxVal) * chartHeight;
          const x = paddingLeft + gap / 2 + idx * (barWidth + gap);
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={idx}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="3" ry="3" fill={color} style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.target.setAttribute('opacity', '0.8'); }}
                onMouseLeave={(e) => { e.target.setAttribute('opacity', '1'); }}
              >
                <title>{labels[idx]}: {val} alerts</title>
              </rect>
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-sub)" fontWeight="500">
                {labels[idx]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Donut Chart
export const DonutChart = ({ data = [] }) => {
  // data: [{ label: 'High', value: 10, color: 'red' }]
  const size = 200;
  const radius = 60;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  let accumulatedPercent = 0;

  return (
    <div style={styles.donutContainer}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="transparent" stroke="var(--border)" strokeWidth={strokeWidth} />
        
        {total > 0 && data.map((item, idx) => {
          const percent = item.value / total;
          const strokeDash = percent * circumference;
          const strokeOffset = circumference - (accumulatedPercent * circumference);
          accumulatedPercent += percent;

          return (
            <circle key={idx} cx={center} cy={center} r={radius} fill="transparent" stroke={item.color} strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset={strokeOffset}
              transform={`rotate(-90 ${center} ${center})`}
              strokeLinecap={percent > 0.05 ? 'round' : 'butt'}
            >
              <title>{item.label}: {item.value} ({Math.round(percent * 100)}%)</title>
            </circle>
          );
        })}

        {/* Middle text overlay */}
        <text x={center} y={center - 2} textAnchor="middle" fontSize="11" fill="var(--text-sub)" fontWeight="600">
          TOTAL LOGGED
        </text>
        <text x={center} y={center + 18} textAnchor="middle" fontSize="22" fill="var(--text-main)" fontWeight="800">
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div style={styles.legend}>
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: item.color }} />
              <span style={styles.legendLabel}>{item.label}</span>
              <span style={styles.legendVal}>{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  donutContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem'
  },
  legend: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.825rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'space-between',
    width: '100%'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  legendLabel: {
    flexGrow: 1,
    textAlign: 'left',
    color: 'var(--text-sub)',
    fontWeight: '500'
  },
  legendVal: {
    fontWeight: '700',
    color: 'var(--text-main)'
  }
};
