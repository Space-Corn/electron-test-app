import React, { useState } from 'react';

const App = () => {
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleSelectFile = async () => {
    // We will hook this up to the Main process soon!
    console.log("Button clicked - looking for a file...");
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
        <div style={{ border: '1px dashed #ccc', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [ Data Visualization will go here ]
        </div>
      </section>
    </div>
  );
};

export default App;