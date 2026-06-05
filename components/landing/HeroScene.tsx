"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image, Float, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/landing/useScroll";

// Real real-estate photos (Unsplash CDN — CORS-enabled for WebGL textures).
// Swap these for your own project renders any time.
const PHOTOS: { url: string; pos: [number, number, number]; rot: [number, number, number]; scale: [number, number] }[] = [
  { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80", pos: [-2.3, 0.5, -0.6], rot: [0, 0.36, 0], scale: [1.5, 2.0] },
  { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", pos: [-0.75, -0.7, 0.35], rot: [0, 0.16, 0], scale: [1.45, 1.85] },
  { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80", pos: [0.95, 0.75, -0.2], rot: [0, -0.12, 0], scale: [1.55, 2.0] },
  { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80", pos: [2.35, -0.35, -0.7], rot: [0, -0.36, 0], scale: [1.45, 1.85] },
  { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80", pos: [0.35, -1.45, 0.6], rot: [0, 0.05, 0], scale: [1.25, 1.55] },
];

// Group that drifts/rotates with page scroll → the "3D follow" effect.
function ScrollRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  useEffect(() => {
    const onScroll = () => { scroll.current = window.scrollY; };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const s = scroll.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -s * 0.0006, 0.06);
    g.position.y = THREE.MathUtils.lerp(g.position.y, s * 0.0016, 0.06);
  });
  return <group ref={ref}>{children}</group>;
}

function Photos() {
  return (
    <>
      {PHOTOS.map((p, i) => (
        <Float key={i} speed={1.3} rotationIntensity={0.25} floatIntensity={0.55}>
          {/* colour plane behind = graceful shape if a texture is slow/blocked */}
          <mesh position={[p.pos[0], p.pos[1], p.pos[2] - 0.02]} rotation={p.rot}>
            <planeGeometry args={[p.scale[0], p.scale[1]]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <Image url={p.url} position={p.pos} rotation={p.rot} scale={p.scale as unknown as number} radius={0.12} transparent toneMapped={false} />
        </Float>
      ))}
    </>
  );
}

// CSS collage fallback (reduced-motion / no WebGL): same real photos, static.
function HeroFallback() {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-lg grid-cols-2 gap-3">
      {PHOTOS.slice(0, 4).map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={p.url} alt="Dự án BĐS" className={`h-full w-full rounded-xl border border-slate-800 object-cover ${i % 3 === 0 ? "row-span-2 h-full" : ""}`} />
      ))}
    </div>
  );
}

export function HeroScene() {
  const reduced = usePrefersReducedMotion();
  // Only mount the WebGL canvas on the client (three touches window/document);
  // SSR + reduced-motion show the static real-photo collage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (reduced || !mounted) return <HeroFallback />;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-amber-400/15 via-transparent to-yellow-600/10 blur-3xl" />
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, 2]} intensity={0.6} color="#38bdf8" />
        <Suspense fallback={null}>
          <PresentationControls global snap polar={[-0.18, 0.18]} azimuth={[-0.5, 0.5]}>
            <ScrollRig>
              <Photos />
            </ScrollRig>
          </PresentationControls>
        </Suspense>
      </Canvas>

      {/* Product tie-in chips over the photos */}
      <div className="pointer-events-none absolute left-2 top-6 flex items-center gap-1.5 rounded-full border border-amber-700/40 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-200 shadow-xl backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" /> Vành đai 3
      </div>
      <div className="pointer-events-none absolute bottom-8 right-2 flex items-center gap-1.5 rounded-full border border-amber-700/40 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-200 shadow-xl backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" /> Green Mark · Keppel
      </div>
    </div>
  );
}
