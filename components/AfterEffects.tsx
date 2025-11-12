
import React from 'react';
import type { LiquidConfig } from '../types';

interface AfterEffectsProps {
    config: LiquidConfig;
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

export const AfterEffects: React.FC<AfterEffectsProps> = ({ config, children }) => {
    const { chromaticAberration, grain, bloom } = config;
    const brightness = config.sceneBrightness ?? 1.0;

    // Resize flash and splat flicker state
    const [flashAlpha, setFlashAlpha] = React.useState(0);
    const [flickerAlpha, setFlickerAlpha] = React.useState(0);

    React.useEffect(() => {
        const onResize = () => {
            if (!config.flashOnResize) return;
            setFlashAlpha(prev => Math.max(prev, config.flashIntensity ?? 0.15));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [config.flashOnResize, config.flashIntensity]);

    React.useEffect(() => {
        // Hook into splat events for flicker
        (window as any).__onSplat = () => {
            if (!config.flickerEnabled) return;
            setFlickerAlpha(prev => Math.max(prev, config.flickerIntensity ?? 0.2));
        };
        return () => {
            delete (window as any).__onSplat;
        };
    }, [config.flickerEnabled, config.flickerIntensity]);

    React.useEffect(() => {
        let raf: number;
        const animate = () => {
            // Exponential decay for flash and flicker
            const decay = (value: number, rate: number) => Math.max(0, value - rate);
            setFlashAlpha(a => decay(a, (config.flashIntensity ?? 0.15) / ((config.flashDurationMs ?? 300) / 60)));
            setFlickerAlpha(a => decay(a, 0.06 + Math.random() * 0.08));
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [config.flashIntensity, config.flashDurationMs]);
    
    const overlayAlpha = Math.max(0, Math.min(1, flashAlpha + flickerAlpha));

    return (
        <div className="relative w-full h-full">
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    {/* Bloom/Glow Filter */}
                    <filter id="bloom-effect">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={bloom * 10} result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${bloom * 2} 0" result="glow" />
                        <feBlend in="SourceGraphic" in2="glow" mode="screen" />
                    </filter>
                    
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
                style={{ 
                    filter: [
                        `brightness(${brightness})`,
                        bloom > 0 ? 'url(#bloom-effect)' : '',
                        chromaticAberration > 0 ? 'url(#chromatic-aberration)' : ''
                    ].filter(Boolean).join(' ')
                }}
            >
                {children}
            </div>
            {grain > 0 && <NoiseOverlay intensity={grain} />}
            {/* Light overlay for flash/flicker */}
            {overlayAlpha > 0 && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,1), rgba(255,255,255,0))',
                        mixBlendMode: 'screen' as any,
                        opacity: overlayAlpha,
                        transition: 'opacity 60ms linear',
                    }}
                />
            )}
        </div>
    );
};
