import './index.css';

const clips = document.getElementById('clips');

window.clips.onSetClips((val: string) => {
  clips.innerText = val;
})
