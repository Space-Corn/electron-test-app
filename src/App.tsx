import React, { useState } from 'react';
import Papa from 'papaparse';

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const handleSelectFile = async () => {
    const result = await (window as any).electronAPI.openFile();
    
    if (result && result.content) {
      // result.content is the string we read in index.ts
      const parsed = Papa.parse(result.content, { 
        header: true,
        skipEmptyLines: true // This helps with those extra newlines at the end
      });
  
      setData(parsed.data);
      setFilePath(result.filePath);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Work Tool: Import & Adjust</h1>
      
      <section style={{ marginBottom: '20px' }}>
        <button onClick={handleSelectFile} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Select File
        </button>
        {filePath && <p>Selected: {filePath}</p>}
      </section>

      <hr />
      
      <section>
        <h3>Visual Representation</h3>
        <div style={{ border: '1px solid #ccc', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
          {data.length > 0 ? (
            <table>
              <thead>
                <tr>{Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}</tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, i) => (
                  <tr key={i}>{Object.values(row).map((val: any, j) => <td key={j}>{val}</td>)}</tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data imported yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;