import React, { useState, useEffect, useLayoutEffect } from 'react';
import type { TourStep, Page } from '../types';
import { CloseIcon } from './icons';

interface TourGuideProps {
  isActive: boolean;
  onClose: () => void;
  steps: TourStep[];
  setCurrentPage: (page: Page) => void;
}

const TourGuide: React.FC<TourGuideProps> = ({ isActive, onClose, steps, setCurrentPage }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const currentStep = steps[currentStepIndex];

  const updateTargetRect = () => {
    if (!currentStep) return;
    const element = document.querySelector(currentStep.selector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
      setIsNavigating(false);
    } else {
        // Poll for the element to appear after navigation
        let attempts = 0;
        const interval = setInterval(() => {
            const el = document.querySelector(currentStep.selector);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
                setIsNavigating(false);
                clearInterval(interval);
            } else if (attempts > 20) { // Timeout after ~2 seconds
                console.warn(`Tour guide could not find element: ${currentStep.selector}`);
                clearInterval(interval);
                setIsNavigating(false); // Stop waiting
            }
            attempts++;
        }, 100);
    }
  };
  
  // Effect to handle step changes and navigation
  useEffect(() => {
    if (isActive && currentStep) {
      const currentPage = window.location.hash.substring(1).split('/')[0] || 'home';
      if (currentPage !== currentStep.page) {
        setIsNavigating(true);
        setTargetRect(null); // Clear old rect
        setCurrentPage(currentStep.page);
        window.location.hash = `#${currentStep.page}`;
        // The update will be triggered by the useLayoutEffect below
      } else {
        updateTargetRect();
      }
    }
  }, [isActive, currentStepIndex, currentStep]);
  
  // Effect to re-calculate rect after navigation or resize
  useLayoutEffect(() => {
    if (isActive && currentStep) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      return () => window.removeEventListener('resize', updateTargetRect);
    }
  }, [isActive, currentStep, window.location.hash]); // Rerun when hash changes

  if (!isActive || !currentStep || isNavigating) {
    return (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center text-white">
            Loading next step...
        </div>
    );
  }

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const popoverStyle: React.CSSProperties = {};
  if (targetRect) {
      const position = currentStep.position || 'bottom';
      const gap = 12;
      if (position === 'bottom') {
          popoverStyle.top = `${targetRect.bottom + gap}px`;
          popoverStyle.left = `${targetRect.left + targetRect.width / 2}px`;
          popoverStyle.transform = 'translateX(-50%)';
      } else if (position === 'top') {
          popoverStyle.top = `${targetRect.top - gap}px`;
          popoverStyle.left = `${targetRect.left + targetRect.width / 2}px`;
          popoverStyle.transform = 'translate(-50%, -100%)';
      } else if (position === 'left') {
          popoverStyle.top = `${targetRect.top + targetRect.height / 2}px`;
          popoverStyle.left = `${targetRect.left - gap}px`;
          popoverStyle.transform = 'translate(-100%, -50%)';
      } else if (position === 'right') {
          popoverStyle.top = `${targetRect.top + targetRect.height / 2}px`;
          popoverStyle.left = `${targetRect.right + gap}px`;
          popoverStyle.transform = 'translateY(-50%)';
      }
  }


  return (
    <div className="fixed inset-0 z-[9998]">
      {/* Overlay with hole */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.x - 4} 
                y={targetRect.y - 4} 
                width={targetRect.width + 8} 
                height={targetRect.height + 8} 
                rx="8" 
                fill="black" 
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect 
          x="0" y="0" width="100%" height="100%" 
          fill="black" opacity="0.6" 
          mask="url(#tour-mask)" 
          style={{ pointerEvents: 'auto' }}
          onClick={onClose}
        />
      </svg>
      
      {/* Popover */}
      {targetRect && (
          <div 
            className="absolute bg-[var(--popover-background-color)] p-4 rounded-lg shadow-2xl w-72 z-[9999] animate-fadeIn"
            style={popoverStyle}
          >
              <button onClick={onClose} className="absolute top-2 right-2 p-1 text-[var(--muted-foreground-color)] hover:text-[var(--foreground-color)]">
                  <CloseIcon className="w-5 h-5"/>
              </button>
              <h3 className="font-bold text-lg primary-text mb-2">{currentStep.title}</h3>
              <p className="text-sm text-[var(--muted-foreground-color)] mb-4">{currentStep.content}</p>
              
              <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--muted-foreground-color)]">
                      {currentStepIndex + 1} / {steps.length}
                  </span>
                  <div className="flex gap-2">
                      {currentStepIndex > 0 && <button onClick={goPrev} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-600 rounded-md">Prev</button>}
                      <button onClick={goNext} className="px-3 py-1 text-sm primary-bg text-white rounded-md">
                          {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TourGuide;
