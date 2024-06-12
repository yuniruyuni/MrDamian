import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

const App: React.FC = () => {
  const [clips, setClips] = React.useState("loading...");
  React.useEffect( () => {
    window.clips.onSetClips((val: string) => {
      console.log("set-clips was called.");
      setClips(val);
    });
    console.log("set-clips was registered.");
  });

  return <div>{clips}</div>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
