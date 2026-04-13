import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// This looks for the <div id="root"></div> we put in index.html
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Could not find root element to mount React!");
}
