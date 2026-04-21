import React from 'react';

const PreferencesView = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', height: '100vh' }}>
      <h2>Histogram Preferences</h2>
      <p>Settings will go here soon!</p>
      <button onClick={() => window.close()}>Close Window</button>
    </div>
  );
};

export default PreferencesView;