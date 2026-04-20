import React from 'react';
import { calculateDailyResourceTotals } from '../services/resourceCalculator';
import { calculateWeeklyResourceTotals } from '../services/resourceCalculator'

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
  const allResources = Array.from(
    new Set(stats.flatMap(s => Object.keys(s.breakdown)))
  ).sort();

  const maxHours = Math.max(...stats.map(s => s.hours), 10);
  const yAxisTicks = [maxHours, maxHours * 0.75, maxHours * 0.5, maxHours * 0.25, 0];
  
  return (
    <div className="histogram-entire-wrapper" style={{ 
      display: 'flex', 
      height: '350px', // Increased height to accommodate horizontal scrollbar better
      width: '100%', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      background: '#fff'
    }}>
      
      {/* 1. THE LEGEND - Fixed width, will not shrink */}
      <div className="histogram-legend" style={{ 
        width: '180px', 
        flexShrink: 0, // CRITICAL: Prevents the legend from getting scrunched
        padding: '15px', 
        borderRight: '1px solid #ddd', 
        background: '#fcfcfc', 
        overflowY: 'auto' 
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Resources</h4>
        {allResources.map(resId => (
          <div key={resId} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '11px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: getResourceColor(resId), 
              marginRight: '8px', 
              flexShrink: 0 // Prevent the color box from scrunching too
            }} />
            <span style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>{resId}</span>
          </div>
        ))}
      </div>
  
      {/* 2. THE CHART + Y-AXIS WRAPPER */}
      <div className="chart-and-axis-container" style={{ 
        display: 'flex', 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden' // Prevents the main wrapper from scrolling
      }}>
        
        {/* Y-AXIS - Fixed inside this container */}
        <div className="y-axis" style={{ 
          width: '45px', 
          flexShrink: 0, // Keep axis width stable
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          padding: '20px 5px 45px 5px', 
          borderRight: '1px solid #eee', 
          background: '#fff', 
          zIndex: 10 
        }}>
          {yAxisTicks.map(tick => (
            <span key={tick} style={{ fontSize: '10px', color: '#888', textAlign: 'right' }}>
              {Math.round(tick)}h
            </span>
          ))}
        </div>
  
        {/* THE ACTUAL SCROLLABLE VIEWPORT */}
        <div className="chart-viewport" style={{ 
          flex: 1, 
          overflowX: 'auto', 
          paddingBottom: '15px' 
        }}>
          {/* THE CANVAS: This is where we put the solid X-Axis line */}
          <div className="chart-canvas" style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            height: '240px', 
            padding: '0 20px', 
            gap: '12px', 
            minWidth: 'max-content',
            // THIS IS YOUR NEW X-AXIS LINE:
            borderBottom: '2px solid #333' 
          }}>
            {stats.map(({ week, hours, breakdown }) => (
              <div className="bar-column" key={week} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '60px',
                flexShrink: 0,
                // We ensure the column allows the label to sit below the line
                position: 'relative' 
              }}>
                {/* THE BARS */}
                <div className="bar-stack" style={{ 
                  height: '180px', 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column-reverse', 
                  background: 'transparent'
                }}>
                  {Object.entries(breakdown).map(([resId, val]) => (
                    <div 
                      key={resId} 
                      style={{ 
                        height: `${(val / maxHours) * 100}%`, 
                        backgroundColor: getResourceColor(resId), 
                        width: '100%',
                        borderTop: '1px solid rgba(255,255,255,0.2)'
                      }} 
                    />
                  ))}
                </div>

                {/* THE DATE: Absolute positioning to sit below the canvas line */}
                <span style={{ 
                  position: 'absolute',
                  top: '185px', // Sits just below the 180px bars + the 2px line
                  fontSize: '10px', 
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  {week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Histogram;