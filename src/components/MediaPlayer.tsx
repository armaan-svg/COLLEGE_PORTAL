import { useState } from 'react';
import { Play } from 'lucide-react';
import type { ApprovedVideo } from '../data/media';
import { Notice } from './UI';
export default function MediaPlayer({ video }: { video: ApprovedVideo }) {
  const [playing, setPlaying] = useState(false); const [failed, setFailed] = useState(false);
  const youtubeId = /^[a-zA-Z0-9_-]{11}$/.test(video.source) ? video.source : null;
  return <article className="panel video-card"><div className="video-container">{failed ? <Notice error>This media is currently unavailable.</Notice> : video.kind === 'local' ? <video controls preload="none" poster={video.poster} onError={() => setFailed(true)}><source src={video.source} /><p>Your browser cannot play this video.</p></video> : !youtubeId ? <Notice error>The approved video configuration needs a valid YouTube ID.</Notice> : playing ? <iframe title={video.title} src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button className="video-consent" onClick={() => setPlaying(true)}><Play size={34} /><span>Load video</span><small>Connects to YouTube only after you choose to play.</small></button>}</div><h3>{video.title}</h3><p>{video.description}</p></article>;
}
