import React, { useMemo} from "react";
import cloud1 from "../assets/Cloud1.svg";
import cloud2 from "../assets/Cloud2.svg";
import cloud3 from "../assets/Cloud3.svg";
import waveVideo from "../assets/wave2.webm";
export function Background() {

    const cloudAssets = [cloud1, cloud2, cloud3];
    const runtimeClouds = useMemo(() => {
        const maxCloudCount = 8;

        return Array.from({length: maxCloudCount}).map((_, index) => {
            const randomAsset = cloudAssets[Math.floor(Math.random() * cloudAssets.length)];
            const randomTop = Math.random() * 30; // Random top position between 0 and 40%
            
            const speeds = ['cloudSlow', 'cloudMedium', 'cloudFast'];
            const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];

            const randomDelay = index * -10;

            return {
                id: index,
                src: randomAsset,
                style: {
                    top: `${randomTop}%`,
                    animationDelay: `${randomDelay}s`,
                },
                className: `absolute right-0 pointer-events-none select-none opacity-40 w-36 ${randomSpeed}`
            };
        });

    }, []);

    const runtimeWaves = useMemo(() => {
        const rowConfigs = [
            { bottom: 50, visibleCount: 6, scale: 24, opacity: 0.10, speed: 'waveSlow', spacingVW: 45, spacingVertical: 3},
            { bottom: 40, visibleCount: 5, scale: 36, opacity: 0.15, speed: 'waveSlow', spacingVW: 45, spacingVertical: 5},
            { bottom: 30, visibleCount: 3, scale: 45, opacity: 0.2, speed: 'waveMedium', spacingVW: 55, spacingVertical: 7},
            { bottom: 20, visibleCount: 3, scale: 50, opacity: 0.25, speed: 'waveMedium', spacingVW: 65, spacingVertical: 10},
            { bottom: 10, visibleCount: 2, scale: 60, opacity: 0.3, speed: 'waveFast', spacingVW: 75, spacingVertical: 12 },
            { bottom: 0, visibleCount: 2, scale: 70, opacity: 0.3, speed: 'waveFast', spacingVW: 100, spacingVertical: 15 },
        ];

        return rowConfigs.flatMap((row, rowIndex) => {
            const instanceCount = row.visibleCount + 1; // Keep one incoming wave off-screen right.
            const startOffset = -row.spacingVW;

            return Array.from({ length: instanceCount }).map((_, slotIndex) => {
                // const left = startOffset + slotIndex * row.spacingVW;
                const animationDelay = -((slotIndex * 12) + (rowIndex * 5));

                return {
                    id: `${rowIndex}-${slotIndex}`,
                    wrapperStyle: {
                        left: `100vw`,
                        bottom: `${Math.random() * row.spacingVertical + row.bottom}%`,
                        // transform: `scale(${row.scale})`,
                        opacity: row.opacity,
                        zIndex: 10 + rowIndex,
                        width: `${row.scale}vw`,
                    },
                    videoStyle: {
                        animationDelay: `${animationDelay}s`,
                    },
                    className: `absolute right-0 pointer-events-none select-none mix-blend-screen ${row.speed}`,
                };
            });
        });
    }, []);
    
    return (
        <div className="fixed inset-0 z-0 bg-gradient-to-t from-sky-700 to-sky-400 w-full h-full overflow-hidden">
            {runtimeClouds.map(cloud => (
                <img 
                    key={cloud.id}
                    src={cloud.src}
                    alt="Cloud"
                    style={cloud.style}
                    className={cloud.className}
                />
            ))}

            {runtimeWaves.map(wave => (
                <div
                    key={wave.id}
                    className="absolute origin-bottom-left pointer-events-none"
                    style={wave.wrapperStyle}
                >
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        preload="metadata"
                        className={wave.className}
                        style={wave.videoStyle}
                    >
                        <source src={waveVideo} type="video/webm" />
                    </video>
                </div>
            ))}
        </div>
    );
}