
import React from 'react';
import type { LiquidConfig } from '../types';

interface AfterEffectsProps {
    config: LiquidConfig;
    showGrid?: boolean;
    children: React.ReactNode;
}

const NoiseOverlay: React.FC<{ intensity: number }> = ({ intensity }) => (
    <div
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        style={{
            opacity: intensity,
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>')`,
        }}
    />
);

export const AfterEffects: React.FC<AfterEffectsProps> = ({ config, showGrid = false, children }) => {
    const { chromaticAberration, grain } = config;
    
    return (
        <div className="relative w-full h-full" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <filter id="chromatic-aberration">
                        <feColorMatrix in="SourceGraphic" type="matrix" result="red"
                            values={`1 0 0 0 0
                                     0 0 0 0 0
                                     0 0 0 0 0
                                     0 0 0 1 0`} />
                        <feOffset in="red" dx={-chromaticAberration * 20} dy="0" result="red-shifted" />

                        <feColorMatrix in="SourceGraphic" type="matrix" result="green"
                            values={`0 0 0 0 0
                                     0 1 0 0 0
                                     0 0 0 0 0
                                     0 0 0 1 0`} />
                        <feOffset in="green" dx="0" dy="0" result="green-shifted" />

                        <feColorMatrix in="SourceGraphic" type="matrix" result="blue"
                            values={`0 0 0 0 0
                                     0 0 0 0 0
                                     0 0 1 0 0
                                     0 0 0 1 0`} />
                        <feOffset in="blue" dx={chromaticAberration * 20} dy="0" result="blue-shifted" />
                        
                        <feBlend in="red-shifted" in2="green-shifted" mode="screen" result="blend1" />
                        <feBlend in="blend1" in2="blue-shifted" mode="screen" />
                    </filter>
                </defs>
            </svg>
            <div 
                className="w-full h-full" 
                style={{ filter: chromaticAberration > 0 ? 'url(#chromatic-aberration)' : 'none' }}
            >
                {children}
            </div>
            {/* Optional non-blocking grid overlay */}
            {showGrid && (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
                        backgroundImage:
                          'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 32px),\
                           repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 32px)'
                    }}
                />
            )}
            {grain > 0 && <NoiseOverlay intensity={grain} />}
        </div>
    );
};
