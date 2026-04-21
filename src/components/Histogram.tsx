import React from 'react';
import { calculateDailyResourceTotals } from '../services/resourceCalculator';
import { calculateWeeklyResourceTotals } from '../services/resourceCalculator'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

//keep this here for now, move and update
const getResourceColor = (resId: string): string => {
  const colors: { [key: string]: string } = {
    '500.07.OSM': '#007bff',
    '500.07.PMO': '#28a745',
    '500.07.PSF': '#ffc107',
    '500.07.ELE': '#6c757d',
    '500.07.PIP': '#13BDBD'
  };
  // Return a mapped color, or a random-ish one based on the string if not found
  return colors[resId] || `hsl(${resId.length * 40}, 70%, 50%)`;
};


// We define what the Histogram needs to function, basic data for now from resourceCalculator
interface HistogramProps {
    data: any[];
    weekEndingDay: number;
}
const BAR_WIDTH = 60; // Fixed width for readability

const Histogram: React.FC<HistogramProps> = ({ data, weekEndingDay }) => {
  const dailyData = calculateDailyResourceTotals(data);

  //we can put conditional logic in here later, if we add a control to view histogram by day, week, month etc.
  const stats = calculateWeeklyResourceTotals( dailyData, weekEndingDay);

  const chartData = stats.map(s => ({
    name: s.week,
    ...s.breakdown 
  }));
  
  const allResources = Array.from(
    new Set(stats.flatMap(s => Object.keys(s.breakdown)))
  ).sort();
  
  return (
    <div style={{ display: 'flex', width: '100%', height: '350px', background: '#fff' }}>
      
      {/* YOUR CUSTOM LEGEND (Keep it! It looks better than the default one) */}
      <div style={{ width: '100px', padding: '15px', borderRight: '1px solid #ddd', flexShrink: 0 }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Resources</h4>
        {allResources.map(resId => (
          <div key={resId} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '11px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: getResourceColor(resId), marginRight: '8px' }} />
            {resId}
          </div>
        ))}
      </div>

      {/* RECHARTS AREA */}
      <div style={{ flex: 1, padding: '10px', overflowX: 'auto' }}>
        {/* We set a fixed width based on data length to force the horizontal scroll */}
        <div style={{ width: stats.length * 70, height: '330px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} tickMargin={10} />
              <YAxis fontSize={10} />
              <Tooltip 
                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              
              {allResources.map(resId => (
                <Bar 
                  key={resId} 
                  dataKey={resId} 
                  stackId="a" // This makes it "Stacked"
                  fill={getResourceColor(resId)} 
                  barSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Histogram;