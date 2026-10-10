import React, { useEffect } from 'react';

export const SplashAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    // The animation takes about 2.8s in total. 3000ms gives it time to finish and a slight pause.
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center overflow-hidden z-50">
      <style>
        {`
          .canvas-container {
              position: relative;
              width: 1920px;
              height: 1080px;
              max-width: 100%;
              max-height: 100vh;
              aspect-ratio: 16 / 9;
              background-color: #000000;
          }

          .anim-svg {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
          }
          
          .silver-stroke {
              fill: none;
              stroke: #F4F4F5;
              stroke-width: 14;
              stroke-linecap: round;
              stroke-linejoin: round;
          }

          /* 0.3s - 1.0s | Shackle Formation */
          .shackle {
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              animation: draw-line 0.7s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s forwards;
          }

          /* 1.0s - 1.7s | Document Body Construction */
          .doc-body {
              stroke-dasharray: 1400;
              stroke-dashoffset: 1400;
              animation: draw-line 0.7s cubic-bezier(0.4, 0.0, 0.2, 1) 1.0s forwards;
          }

          /* 1.7s - 2.1s | Document Details */
          .doc-line { opacity: 0; }
          .doc-line-1 { animation: fade-in 0.2s ease-out 1.7s forwards; }
          .doc-line-2 { animation: fade-in 0.2s ease-out 1.8s forwards; }
          .doc-line-3 { animation: fade-in 0.2s ease-out 1.9s forwards; }

          /* 2.1s - 2.5s | Teal Completion */
          .teal-corner {
              fill: #20C9B0;
              opacity: 0;
              animation: fade-in 0.4s ease-out 2.1s forwards;
          }

          /* 2.1s - 2.8s | Bolder, Aesthetic Soft-Wipe Reveal */
          .wordmark {
              position: absolute;
              bottom: 16%;
              left: 50%;
              padding-left: 14px; 
              transform: translateX(-50%);
              font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 54px;
              font-weight: 600; 
              letter-spacing: 14px;
              color: #F4F4F5;
              
              background: linear-gradient(90deg, #F4F4F5 0%, #F4F4F5 45%, rgba(244,244,245,0) 55%, rgba(244,244,245,0) 100%);
              background-size: 300% 100%;
              background-position: 100% 0%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              
              opacity: 0;
              animation: 
                  drift-up 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 2.1s forwards,
                  wipe-text 0.7s cubic-bezier(0.3, 0.0, 0.2, 1) 2.1s forwards;
          }

          @keyframes draw-line {
              to { stroke-dashoffset: 0; }
          }
          
          @keyframes fade-in {
              to { opacity: 1; }
          }

          @keyframes drift-up {
              from { opacity: 0; bottom: 14%; }
              to { opacity: 1; bottom: 16%; }
          }

          @keyframes wipe-text {
              to { background-position: 0% 0%; }
          }
        `}
      </style>
      <div className="canvas-container">
          <svg className="anim-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
              <path className="silver-stroke doc-body" 
                    d="M 820 400 H 1100 V 680 H 1000 V 780 H 820 Z" />
              
              <path className="silver-stroke shackle" 
                    d="M 880 400 V 320 A 80 80 0 0 1 1040 320 V 400" />
              
              <path className="silver-stroke doc-line doc-line-1" d="M 880 500 H 1040" />
              <path className="silver-stroke doc-line doc-line-2" d="M 880 580 H 1040" />
              <path className="silver-stroke doc-line doc-line-3" d="M 880 660 H 980" />
              
              <path className="teal-corner" 
                    d="M 1100 680 L 1000 780 V 680 Z" />
          </svg>

          <div className="wordmark">ForenCrypt</div>
      </div>
    </div>
  );
};
