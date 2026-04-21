import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import PreferencesView from './components/PreferencesView';


const Root = () => {
  // Check the "Hash" in the URL
  // If Electron loads the window with #/preferences, show the settings
  const isPreferences = window.location.hash === '#/preferences';

  return isPreferences ? <PreferencesView /> : <App />;
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<Root />);
} else {
  console.error("Could not find root element to mount React!");
}

const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);


