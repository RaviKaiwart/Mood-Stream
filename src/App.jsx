import { useState, useRef, useEffect } from 'react';
import { Camera, Music, Video, Smile, Frown, Zap, Coffee, AlertCircle, RefreshCw, Pause, Play, VideoOff, Sparkles } from 'lucide-react';
import './App.css';
import { useEmotionAnalyzer } from './hooks/useEmotion';

const MOOD_MAPPINGS = {
  Happy: {
    genre: 'Trending Pop Hits (Global & Hindi)',
    color: '#f59e0b',
    icon: Smile,
    spotifyPlaylists: ['0dBhCz84CQZMAXStgbabg2', '6dSz0AWxkgBfhlNBFyzqFf', '0Z7za9pQFEaGBVYTnvJMi1'],
    youtubeVideos: ['PLRiKb0palFbaJWmf4ylXFGBycHDkpSv_L']
  },
  Sad: {
    genre: 'Romantic & Emotional Hindi/English',
    color: '#3b82f6',
    icon: Frown,
    spotifyPlaylists: ['1saCqPsl314giXN0GLWgLj', '7cHWpjlm7bWzOSAsLSxz7h'],
    youtubeVideos: ['oafxkMv4xnc', 'tNc2coVC2aw', '55c6IlV7BEo', 'go-j1EpaGVo', '9T-Zbxg9X_4', 'AKH6ZNSnWOA', 'AX6OrbgS8lI', '-BJt4fCAtZE', 'N1pzk3LTOJo', '8of5w7RgcTc', 'LmBsyzzX5aA', 'i52TYO13Nyg', '5GCfYLguTIs', 'j18MRhEfmPk', '-2RAq5o5pwc', '1DXUV84tu4s', 'IltsOcCj1Ak', 'Gz38Yj09k3A', 'LV_wiOhO40Q', 'a9Hxkc9YxGE', 'NVMa86cxU-k', '1poXN3jF3Bw', 'cW8VLC9nnTo', 'hLQl3WQQoQ0', 'Etkd-07gnxM']
  },
  Angry: {
    genre: 'Intense Viral Phonk / Hard Hitting',
    color: '#ef4444',
    icon: Zap,
    spotifyPlaylists: ['0H4EzBQzYwYtrYXwQ8G25h', '2GtqIMAM4q2mq1R2bxgzUn', '4zZpffTnguBELBde2Ar30Z'],
    youtubeVideos: ['xR3V5Ow2dTI', 'j2zxCw3voU8', '4tywp83zkmk', 'I1nX5EuvwzE', 'd2ofxg8pHfQ', 'gP4k_iruyAM', '6RrEQJNZwPQ', '0pWsCiBvLOk', '0mCVpUDCkEk', 'RLhuPD2ASKE', 'IAvw60x0Kn4', '1w7OgIMMRc4', 'GX9x62kFsVU']
  },
  Surprised: {
    genre: 'Upbeat Dance Reels / Transitions',
    color: '#8b5cf6',
    icon: AlertCircle,
    spotifyPlaylists: ['1saCqPsl314giXN0GLWgLj', '6dSz0AWxkgBfhlNBFyzqFf'],
    youtubeVideos: ['YykjpeuMNEk', 'GX9x62kFsVU', 'To4SWGZkEPk', 'lTRiuFIWV54']
  },
  Neutral: {
    genre: 'Viral Lofi & Chill Mashups',
    color: '#9ca3af',
    icon: Coffee,
    spotifyPlaylists: ['0Z7za9pQFEaGBVYTnvJMi1', '1saCqPsl314giXN0GLWgLj'],
    youtubeVideos: ['PLRiKb0palFbYdTtVJ4j7sn0bivJHM_Mlg']
  },
  Disgusted: {
    genre: 'Workout / High Energy Viral',
    color: '#10b981',
    icon: RefreshCw,
    spotifyPlaylists: ['4zZpffTnguBELBde2Ar30Z', '2GtqIMAM4q2mq1R2bxgzUn'],
    youtubeVideos: ['WRS9cpOMYv0', '1w7OgIMMRc4', 'xR3V5Ow2dTI']
  },
  Fearful: {
    genre: 'Eerie / Atmospheric Viral Audio',
    color: '#6366f1',
    icon: AlertCircle,
    spotifyPlaylists: ['0H4EzBQzYwYtrYXwQ8G25h'],
    youtubeVideos: ['5qap5aO4i9A', 'GX9x62kFsVU', 'oafxkMv4xnc']
  }
};

function App() {
  const { videoRef, canvasRef, mood, isModelLoaded, isCameraOn, setIsCameraOn, isPaused, setIsPaused, error } = useEmotionAnalyzer();
  const [currentSpotifyId, setCurrentSpotifyId] = useState('');
  const [currentYoutubeId, setCurrentYoutubeId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Helper to pick a random ID that is different from the current one
  const getRandomId = (currentId, idArray) => {
    if (idArray.length <= 1) return idArray[0];
    let newId = currentId;
    while (newId === currentId) {
      newId = idArray[Math.floor(Math.random() * idArray.length)];
    }
    return newId;
  };

  const refreshSongs = () => {
    const mapping = MOOD_MAPPINGS[mood] || MOOD_MAPPINGS['Neutral'];
    setCurrentSpotifyId(prev => getRandomId(prev, mapping.spotifyPlaylists));
    setCurrentYoutubeId(prev => getRandomId(prev, mapping.youtubeVideos));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (mood) {
      refreshSongs();
    }
  }, [mood]);

  const currentMapping = MOOD_MAPPINGS[mood] || MOOD_MAPPINGS['Neutral'];
  const MoodIcon = currentMapping.icon;

  const spotifyUrl = `https://open.spotify.com/embed/playlist/${currentSpotifyId}?utm_source=generator&theme=0`;

  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <Music className="logo-icon" />
          <h1>Mood<span className="heading-gradient">Stream</span></h1>
        </div>
        <div className="mood-badge">
          <div className={`status-dot ${isModelLoaded ? 'active' : ''}`}></div>
          {isModelLoaded ? 'AI Ready' : 'Loading AI...'}
        </div>
      </header>

      <main className="main-layout">
        {/* Left Column: Webcam & AI */}
        <section className="glass-panel">
          <h2><Camera size={20} style={{ display: 'inline', marginRight: '8px' }} /> Emotion Analyzer</h2>

    <div className="webcam-wrapper">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="webcam-video"
              style={{ display: isCameraOn ? 'block' : 'none' }}
            />
            {isCameraOn && (
              <canvas
                ref={canvasRef}
                className="webcam-canvas"
              />
            )}

            {isCameraOn && (
              <div className="controls-bar">
                <button
                  className="control-btn"
                  onClick={() => setIsCameraOn(false)}
                  title="Turn Camera Off"
                >
                  <VideoOff />
                </button>

                <button
                  className={`control-btn ${isPaused ? 'off' : ''}`}
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? "Resume Analysis" : "Pause Analysis"}
                >
                  {isPaused ? <Play fill="white" /> : <Pause fill="white" />}
                </button>
              </div>
            )}

            {!isCameraOn && (
              <div className="webcam-overlay" style={{ background: 'rgba(0,0,0,0.85)' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '50%', marginBottom: '1rem' }}>
                  <Camera size={64} opacity={0.3} color="var(--accent-color)" />
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '1rem' }}>Camera is Ready</p>
                {error ? (
                  <p style={{ color: '#ef4444', textAlign: 'center', maxWidth: '80%' }}>{error}</p>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => setIsCameraOn(true)}
                    disabled={!isModelLoaded}
                    style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: '999px' }}
                  >
                    <Sparkles size={24} /> Get Started
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Current Detected Mood</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: currentMapping.color }}>
              <MoodIcon size={32} />
              <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{mood}</h3>
            </div>

            <div style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
              <button
                className="btn-secondary"
                onClick={refreshSongs}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '999px', opacity: 0.7 }}
              >
                <RefreshCw size={14} /> Shuffle Song
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Playlists */}
        <section className="players-grid">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2><Music size={20} style={{ display: 'inline', marginRight: '8px', color: '#1db954' }} /> Spotify Playlist</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vibe: {currentMapping.genre}</span>
            </div>
            <div className="player-container">
              <iframe
                src={spotifyUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: 'var(--radius-md)' }}
              ></iframe>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2><Video size={20} style={{ display: 'inline', marginRight: '8px', color: '#ff0000' }} /> YouTube Recommendations</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vibe: {currentMapping.genre}</span>
            </div>
            <div className="player-container" style={{ aspectRatio: '16/9' }} key={refreshKey}>
              <iframe
                width="100%"
                height="100%"
                src={currentYoutubeId.startsWith('PL')
                  ? `https://www.youtube.com/embed/videoseries?list=${currentYoutubeId}&autoplay=1&rel=0`
                  : `https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&rel=0`
                }
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
