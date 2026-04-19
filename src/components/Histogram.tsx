import React from 'react';
import { calculateDailyResourceTotals } from '../services/resourceCalculator';
import { calculateWeeklyResourceTotals } from '../services/resourceCalculator'


// We define what the Histogram needs to function, basic data for now from resourceCalculator
interface HistogramProps {
    data: any[];
    weekEndingDay: number;
}

const Histogram: React.FC<HistogramProps> = ({ data, weekEndingDay }) => {
  const dailyData = calculateDailyResourceTotals(data);

  //we can put conditional logic in here later, if we add a control to view histogram by day, week, month etc.
  const stats = calculateWeeklyResourceTotals( dailyData, weekEndingDay);
  
  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', height: '100%' }}>
      <h3 style={{ marginTop: 0 }}>Weekly Hours Distribution</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px' }}>
        {stats.map(({week, hours}) => (
          <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              title={`Week Ending: ${week}\nTotal Hours: ${Math.round(hours)}`}
              style={{ 
                width: '100%', 
                height: `${Math.min(hours / 20, 100)}px`, // Use divisor to scale
                backgroundColor: '#007bff', 
                borderRadius: '2px',
                transition: 'height 0.3s ease' // Makes the bars "grow" when you import
              }} 
            />
            <span style={{ 
                fontSize: '10px', 
                marginTop: '8px', 
                transform: 'rotate(-45deg)', 
                whiteSpace: 'nowrap',
                display: 'inline-block' 
            }}>
                {week}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Histogram;