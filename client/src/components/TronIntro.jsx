import { useEffect, useRef, useState } from 'react';
import './TronIntro.css';

const TronIntro = ({ onIntroComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Start video immediately (muted - browsers allow this)
    const startVideo = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = true; // Video stays muted
          await videoRef.current.play();
          console.log('🎬 Video started automatically (muted)');
        } catch (error) {
          console.error('Video autoplay failed:', error);
        }
      }
    };

    // Preload and prepare audio (but don't play it yet)
    const prepareAudio = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 2; // Set to 5-second mark
        audioRef.current.volume = 0;
        audioRef.current.loop = true;
        audioRef.current.muted = false;
        setAudioReady(true);
        console.log('🎵 Audio prepared and ready');
      }
    };

    startVideo();
    prepareAudio();

    // Hide welcome text after 3 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => {
      clearTimeout(welcomeTimer);
    };
  }, []);

  // Function to start audio (will be called after user interaction)
  const startAudio = () => {
    if (audioRef.current && audioReady) {
      try {
        audioRef.current.play().then(() => {
          console.log('🎵 Audio started successfully');
        }).catch(error => {
          console.error('Audio play failed:', error);
        });
      } catch (error) {
        console.error('Audio play error:', error);
      }
    }
  };

  const handleVideoEnd = () => {
    startTransition();
  };

  const startTransition = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onIntroComplete();
      }, 500);
    }, 1000);
  };

  // Auto-skip after 20 seconds max (fallback)
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (isVisible && !isTransitioning) {
        console.log('Safety timer - skipping intro');
        startTransition();
      }
    }, 20000);

    return () => clearTimeout(safetyTimer);
  }, [isVisible, isTransitioning]);

  // Add a subtle interaction prompt that starts audio when clicked
  useEffect(() => {
    const handleFirstInteraction = () => {
      startAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Listen for any user interaction to start audio
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [audioReady]);

  if (!isVisible) return null;

  return (
    <div className={`tron-intro ${isTransitioning ? 'fade-out' : ''}`}>
      {/* Background Video - Starts automatically (muted) */}
      <video
        ref={videoRef}
        className="intro-video"
        muted={true}
        onEnded={handleVideoEnd}
        playsInline
        preload="auto"
        autoPlay
      >
        <source src="/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Daft Punk Audio - Ready to play on user interaction */}
      <audio
        ref={audioRef}
        loop={true}
        preload="auto"
      >
        <source src="/End of Line (From TRON Legacy_Score) - Daft Punk.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Welcome Text - Appears then disappears */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <h1 className="welcome-title">WELCOME TO HACKTRACK</h1>
            <div className="welcome-subtitle">ENTER THE GRID</div>
          </div>
        </div>
      )}

  

      {/* Subtle interaction hint */}
      {audioReady && (
        <div className="interaction-hint">
          <div className="hint-pulse"></div>
          <span>Click anywhere for sound</span>
        </div>
      )}
    </div>
  );
};

export default TronIntro;