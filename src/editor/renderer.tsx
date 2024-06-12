import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

const App: React.FC = () => {
  const [clips, setClips] = React.useState("loading...");
  React.useEffect( () => {
    window.editor.onSetClips((val: string) => {
      console.log("set-clips was called.");
      setClips(val);
    });
    console.log("set-clips was registered.");
  });

  return <div>
    <button onClick={() => window.editor.twitchLoginClick()}>
      Login with Twitch
    </button>
    {clips}
    </div>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
