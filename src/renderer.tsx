import React from 'react';
import { createRoot, Root as ReactRootType } from 'react-dom/client'; // Import the type here
import App from './App';
import PreferencesView from './components/PreferencesView';

const RootComponent = () => {
  const isPreferences = window.location.hash === '#/preferences';
  return isPreferences ? <PreferencesView /> : <App />;
};

const container = document.getElementById('root');

if (container) {
  // Use the type we just imported to tell TS what this is
  let root = (container as any)._reactRoot as ReactRootType;

  if (!root) {
    root = createRoot(container);
    (container as any)._reactRoot = root;
  }

  root.render(<RootComponent />);
}
