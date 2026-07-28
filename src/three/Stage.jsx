import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  AdaptiveDpr,
  Preload,
} from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import F1Car from './F1Car'
import GpBike from './GpBike'
import Wordmark from './Wordmark'
import CameraRig from './CameraRig'
import SafeEffects from './SafeEffects'
import { GARAGE } from './layout'
import { scrollState } from '../lib/scroll'

/**
 * A procedural studio: strip lights baked into a local cube map, so the
 * carbon fibre has something to reflect without downloading an HDRI.
 */
function Studio() {
  // Baked once. Re-rendering the cube map every frame costs six extra scene
  // passes and buys nothing here — the machines and camera supply the movement.
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#000000']} />
      {/* overhead softbox */}
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#ffffff"
        position={[0, 6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[12, 5, 1]}
      />
      {/* long side strips, the classic studio look */}
      <Lightformer
        form="rect"
        intensity={2.6}
        color="#cfd8ff"
        position={[7, 3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[16, 2.2, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#ffffff"
        position={[-7, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[16, 2.2, 1]}
      />
      {/* rosso kicker from behind */}
      <Lightformer
        form="rect"
        intensity={2.8}
        color="#ff2d16"
        position={[-3, 2, -9]}
        rotation={[0, 0, 0]}
        scale={[9, 3, 1]}
      />
      {/* cool fill from the front so the nose reads against the black */}
      <Lightformer
        form="rect"
        intensity={1.5}
        color="#8ea6ff"
        position={[3.5, 2.2, 9]}
        rotation={[0, Math.PI, 0]}
        scale={[8, 2.5, 1]}
      />
      <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 4, 8]} scale={4} />
    </Environment>
  )
}

/**
 * One lighting kit, dropped over a machine's parking space.
 *
 * A spotLight aims at its `target`, and that target defaults to a loose
 * Object3D sitting at the world origin — so a kit moved down the pit lane
 * would still be pointing back at the car. Each kit carries its own target
 * object inside the group instead.
 */
function Kit({ x = 0 }) {
  /** Parents the light's own target to itself, so it aims where the kit is. */
  const aimAtKit = (light) => {
    if (!light) return
    light.target.position.copy(light.position).negate().setY(0.6 - light.position.y)
    light.add(light.target)
  }

  return (
    <group position={[x, 0, 0]}>
      {/* No shadow maps: ContactShadows grounds a machine far more cheaply, and
          on a mirror-black floor a cast shadow would barely read anyway. */}
      <spotLight
        ref={aimAtKit}
        position={[6, 9, 7]}
        angle={0.42}
        penumbra={1}
        intensity={260}
        color="#ffffff"
      />
      <spotLight
        ref={aimAtKit}
        position={[-7, 4.5, -8]}
        angle={0.7}
        penumbra={1}
        intensity={180}
        color="#ff2d16"
      />
      <spotLight
        ref={aimAtKit}
        position={[8, 3, -6]}
        angle={0.7}
        penumbra={1}
        intensity={90}
        color="#9fb4ff"
      />
      {/* under-body bounce */}
      <pointLight position={[0, 0.35, 0]} intensity={6} distance={7} color="#ff3a1c" />
    </group>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GARAGE.gp.x / 2, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <MeshReflectorMaterial
        resolution={384}
        mixBlur={1}
        mixStrength={22}
        blur={[300, 80]}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        depthToBlurRatioBias={0.28}
        mirror={0}
        color="#06060a"
        metalness={0.72}
        roughness={0.88}
      />
    </mesh>
  )
}

/** Bloom that leans in when you scroll hard. */
function Effects() {
  const bloom = useRef()
  useFrame(() => {
    if (!bloom.current) return
    const v = Math.min(1, Math.abs(scrollState.velocity) / 60)
    bloom.current.intensity = 0.34 + v * 0.5
  })
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        ref={bloom}
        intensity={0.34}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0003, 0.00045]}
        radialModulation
        modulationOffset={0.4}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}

/** Dev-only handle so the scene can be inspected from the console. */
function DevProbe() {
  const { scene, camera, gl } = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__r3f = { scene, camera, gl, THREE }
  }, [scene, camera, gl])
  return null
}

export default function Stage({
  showCar,
  showBike,
  onCarIn,
  onContextLost,
  onContextRestored,
  // Hybrid-graphics machines sometimes refuse 'high-performance' outright and
  // hand back a perfectly usable integrated context instead — lib/webgl works
  // out which one this browser will actually give us.
  powerPreference = 'high-performance',
}) {
  return (
    <div className="stage">
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference,
          failIfMajorPerformanceCaveat: false,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [4, 1.2, 6], fov: 34, near: 0.1, far: 160 }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05

          // Two detailed models plus four render targets is enough to push a
          // tired GPU over its limit. Swallowing the event lets the browser
          // hand the context back instead of leaving a frozen frame on screen.
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            onContextLost?.()
          })
          gl.domElement.addEventListener('webglcontextrestored', () => {
            onContextRestored?.()
          })
        }}
      >
        <fog attach="fog" args={['#040405', 22, 74]} />
        <Suspense fallback={null}>
          <Studio />
          <ambientLight intensity={0.14} />
          <Kit x={GARAGE.f1.x} />
          <Kit x={GARAGE.gp.x} />

          {/* held back until lib/loader has each buffer cached, so the parser
              never races a second download of the same file */}
          {showCar && <F1Car onIn={onCarIn} />}
          {/* Its own boundary: parsing the bike re-suspends whatever Suspense
              it sits under, and R3F hides a suspended subtree — sharing the
              outer one would blink the car off screen mid-scroll. */}
          {showBike && (
            <Suspense fallback={null}>
              <GpBike />
            </Suspense>
          )}
          <Wordmark />

          <Floor />
          {/* One shadow pass wide enough to cover both parking spaces. A second
              pass over the bike alone looked marginally crisper and cost a
              whole extra render of the scene every frame. */}
          <ContactShadows
            position={[GARAGE.gp.x / 2, 0.012, 0]}
            opacity={0.85}
            scale={26}
            blur={2.6}
            far={5}
            resolution={640}
            color="#000000"
          />
          <Preload all />
        </Suspense>
        <CameraRig />
        <DevProbe />
        {!new URLSearchParams(location.search).has('nofx') && (
          <SafeEffects>
            <Effects />
          </SafeEffects>
        )}
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  )
}
