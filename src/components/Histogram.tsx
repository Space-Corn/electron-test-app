import React from 'react';

//We made a script.
// We define what the Histogram needs to function
interface HistogramProps {
    data: any[];
    weekEndingDay?: number; // 0 = Sun, 5 = Fri, etc.
  }

const getWeekIdentifier = (date: Date, weekEndingDay: number) => {
    const d = new Date(date);
    // Calculate how many days to add to get to the next 'weekEndingDay'
    const daysUntilEnd = (weekEndingDay - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + daysUntilEnd);
    return d.toISOString().split('T')[0];
  };

  const Histogram: React.FC<HistogramProps> = ({ data, weekEndingDay = 5 }) => {
    const getWeeklyStats = () => {
      const weeks: { [key: string]: number } = {};
  
      data.forEach((row, index) => {
        const start = new Date(row['ES_Date']);
        const end = new Date(row['EF_Date']);

        if (isNaN(start.getTime())) {
            console.warn(`Row ${index} has an invalid ES_Date:`, row['ES_Date']);
        }

        const totalHours = parseFloat(row['Res_Level'] || "0");
  
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && totalHours > 0) {
          // 1. Calculate Duration (Inclusive)
          const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const dailyRate = totalHours / duration;
  
          // 2. Distribute Daily
          for (let i = 0; i < duration; i++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + i);
            
            // 3. Determine which week this day falls into
            const weekKey = getWeekIdentifier(currentDay, weekEndingDay);
            weeks[weekKey] = (weeks[weekKey] || 0) + dailyRate;
          }
        }
      });
  
      return Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0]));
    };

  const stats = getWeeklyStats();

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', height: '100%' }}>
      <h3 style={{ marginTop: 0 }}>Weekly Hours Distribution</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '8px' }}>
        {stats.map(([week, hours]) => (
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