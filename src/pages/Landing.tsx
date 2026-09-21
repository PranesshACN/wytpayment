import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Key, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Lock,
  Cpu,
  Box
} from 'lucide-react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export const Landing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<'checkout' | 'sso' | 'analytics'>('checkout')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  // Refs for 3D smooth lerp animations
  const targetRotationYRef = useRef(0)
  const targetRotationXRef = useRef(0)
  const targetPosYRef = useRef(0)
  const targetScaleRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ---------------- THREE.JS SCENE SETUP ----------------
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    // ---------------- LIGHTING ----------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.5) // Indigo accent
    dirLight1.position.set(5, 8, 5)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.0) // Cyan accent
    dirLight2.position.set(-5, -5, 4)
    scene.add(dirLight2)

    const pointLight = new THREE.PointLight(0xa855f7, 3, 15) // Violet glow
    pointLight.position.set(0, 0, 3)
    scene.add(pointLight)

    // ---------------- 3D OBJECT GROUPS & FALLBACK GEOMETRY ----------------
    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // Glowing Wireframe Icosahedron Core
    const isoGeo = new THREE.IcosahedronGeometry(1.8, 2)
    const isoMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      wireframe: true,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x312e81,
      emissiveIntensity: 0.5
    })
    const isoMesh = new THREE.Mesh(isoGeo, isoMat)
    masterGroup.add(isoMesh)

    // Outer Torus Ring
    const torusGeo = new THREE.TorusGeometry(2.6, 0.08, 16, 100)
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x083344,
      emissiveIntensity: 0.4
    })
    const torusMesh = new THREE.Mesh(torusGeo, torusMat)
    torusMesh.rotation.x = Math.PI / 3
    masterGroup.add(torusMesh)

    // 3D Particle Starfield
    const particlesGeo = new THREE.BufferGeometry()
    const particleCount = 400
    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20
      posArray[i + 1] = (Math.random() - 0.5) * 20
      posArray[i + 2] = (Math.random() - 0.5) * 20
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const particleSystem = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particleSystem)

    // ---------------- GLTF / GLB MODEL LOADER ----------------
    let loadedModel: THREE.Group | null = null
    const loader = new GLTFLoader()

    loader.load(
      '/wytnet-3d-model.glb',
      (gltf) => {
        loadedModel = gltf.scene
        // Normalize size and center
        loadedModel.scale.set(1.5, 1.5, 1.5)
        loadedModel.position.set(0, 0, 0)

        // Custom metallic glass materials for loaded GLB
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x818cf8,
              metalness: 0.8,
              roughness: 0.2,
              wireframe: false
            })
          }
        })

        masterGroup.add(loadedModel)
      },
      undefined,
      () => {
        // Fallback procedural scene is already active
      }
    )

    // ---------------- SCROLL-DRIVEN 3D TRANSFORMATIONS ----------------
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1)
      setScrollProgress(Math.round(progress * 100))

      // 3D Object Scroll Flow Target Calculations
      targetRotationYRef.current = progress * Math.PI * 4 // 720 deg rotation
      targetRotationXRef.current = Math.sin(progress * Math.PI * 2) * 0.8
      targetPosYRef.current = Math.cos(progress * Math.PI * 2) * 0.5
      targetScaleRef.current = 1 + Math.sin(progress * Math.PI) * 0.4
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // ---------------- RESIZE LISTENER ----------------
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // ---------------- ANIMATION LOOP (60 FPS LERP) ----------------
    let animId: number
    const animate = () => {
      // Lerp smooth movement
      masterGroup.rotation.y += (targetRotationYRef.current - masterGroup.rotation.y) * 0.05 + 0.003
      masterGroup.rotation.x += (targetRotationXRef.current - masterGroup.rotation.x) * 0.05
      masterGroup.position.y += (targetPosYRef.current - masterGroup.position.y) * 0.05

      const currentScale = masterGroup.scale.x
      const nextScale = currentScale + (targetScaleRef.current - currentScale) * 0.05
      masterGroup.scale.set(nextScale, nextScale, nextScale)

      // Continuous subtle ambient float
      isoMesh.rotation.z += 0.005
      torusMesh.rotation.z -= 0.008
      particleSystem.rotation.y += 0.0005

      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* ---------------- FIXED 3D WEBGL CANVAS BACKGROUND ---------------- */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        {/* Futuristic Gradient & Grid Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/40 to-slate-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ---------------- NAVBAR ---------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                WytPayment
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-semibold">
                3D SaaS Infrastructure
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Live Demo</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#integration" className="hover:text-indigo-400 transition-colors">WhitePass SSO</a>
          </nav>

          {/* Action Controls & Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* 3D Flow Indicator */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-slate-900/90 border border-indigo-500/30 text-indigo-300 shadow-sm">
              <Box className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">3D Scroll Flow: {scrollProgress}%</span>
            </div>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative z-10 pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-lg shadow-indigo-950/50">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Next-Gen 3D Interactive Ecosystem</span>
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-md border border-indigo-500/30">
            WebGL Powered
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] max-w-5xl mx-auto">
          Scale Revenue Fast with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            Instant Payments & Unified SSO
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          WytPayment delivers enterprise subscription billing, Razorpay integration, and single sign-on via <strong className="text-indigo-400">WhitePass</strong> with real-time 3D telemetry.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500 hover:bg-slate-800/80 backdrop-blur-md transition-all flex items-center justify-center space-x-2"
          >
            <Box className="w-4 h-4 text-indigo-400" />
            <span>Explore 3D Simulator</span>
          </a>
        </div>

        {/* Live Scroll Hint */}
        <div className="mt-14 flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Scroll down to experience 3D object rotation & interactive flow</span>
        </div>

        {/* Floating Stat Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Platform Uptime', val: '99.99%', sub: 'SLA Guaranteed' },
            { label: 'Auth Latency', val: '< 45ms', sub: 'Global Edge SSO' },
            { label: 'Security Standard', val: 'PCI-DSS v4.0', sub: 'Bank-Grade Vault' },
            { label: 'Active SaaS Users', val: '100K+', sub: 'Global Developers' }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-left hover:border-indigo-500/40 transition-colors">
              <div className="text-2xl font-black text-white font-mono">{stat.val}</div>
              <div className="text-xs font-semibold text-indigo-400 mt-1">{stat.label}</div>
              <div className="text-[11px] text-slate-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 3D ECOSYSTEM FLOW SHOWCASE ---------------- */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
              3D Interactive Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Integrated Payment & SSO Ecosystem
            </h2>
            <p className="text-slate-300 text-base mt-3">
              As you navigate through your application, WytPayment seamlessly orchestrates identity verification, transaction security, and webhook callbacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-white">WhitePass Auth Stream</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized OAuth2 / OIDC token exchange enabling frictionless single sign-on across all developer platforms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-violet-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Automated Tier Billing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscription lifecycle management, automated plan upgrades/downgrades, and Razorpay payment processing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Real-Time Webhooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant database sync and automated event dispatching for subscription renewals and purchase events.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold mb-3">
            Core Architecture
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Need to Monetize Your Application
          </p>
          <p className="mt-4 text-slate-400 text-base">
            Engineered for developers who demand high reliability, instant webhook processing, and zero auth friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-indigo-500/50 hover:bg-slate-900/70 transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Key className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">WhitePass SSO Provider</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Enable effortless single sign-on across web and mobile platforms with OAuth2/OIDC standards and JWT token security.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-friction OAuth token exchange</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Centralized identity profile management</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-violet-500/50 hover:bg-slate-900/70 transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automated Subscriptions</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Flexible tier billing for Starter, Pro, and Enterprise tiers with instant payment status callbacks and invoice logs.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated upgrade & downgrade paths</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Razorpay & WhiteNet gateway sync</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-slate-900/70 transition-all duration-300 group shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Track MRR, subscriber growth, active sessions, and payment conversion rates directly from your unified admin dashboard.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Detailed transaction history & export</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live webhook dispatch monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- INTERACTIVE DEMO SIMULATOR ---------------- */}
      <section id="demo" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl shadow-indigo-950/50">
          
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider mb-1">
                <Cpu className="w-4 h-4" />
                <span>Live Interactive Component Demo</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Experience WytPayment in Action</h3>
            </div>

            {/* Tab Switches */}
            <div className="flex items-center p-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setActiveTab('checkout')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'checkout'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Checkout Flow
              </button>
              <button
                onClick={() => setActiveTab('sso')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'sso'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                WhitePass SSO
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                API Telemetry
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="pt-8">
            {activeTab === 'checkout' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    STATUS: SECURE 256-BIT SSL
                  </span>
                  <h4 className="text-3xl font-bold text-white">Seamless Checkout Gateways</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Users select their desired SaaS plan and are routed through zero-friction payment confirmation modal with instant token callback verification.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3 text-xs text-slate-300">
                      <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Supports UPI, Credit Cards, Net Banking & International Cards.</span>
                    </div>
                    <div className="flex items-start space-x-3 text-xs text-slate-300">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>Automated purchase record creation & immediate backend database sync.</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Card Visual */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400">ORDER #PAY-99214</span>
                    <span className="text-xs font-bold text-emerald-400">₹2,999 / mo</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Pro SaaS Developer Plan</div>
                      <div className="text-xs text-slate-400">Includes WhitePass SSO + Unlimited Webhooks</div>
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20">
                    Proceed to Pay (Simulated)
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'sso' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-md text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    OIDC / OAUTH 2.0 PROTOCOL
                  </span>
                  <h4 className="text-3xl font-bold text-white">Single Identity Across Ecosystems</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Users log in once via WhitePass and gain instant access across all authorized developer products and billing portals without re-authenticating.
                  </p>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
                    GET /oauth/token?client_id=wp_46b4... &grant_type=authorization_code
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h5 className="font-bold text-white text-base">WhitePass Unified Identity</h5>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Authorized session active for user@wytnet.com
                  </p>
                  <div className="flex justify-center space-x-2 pt-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-mono">JWT Token Active</span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-400 font-mono">Verified</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-mono">MONTHLY RECURRING (MRR)</div>
                    <div className="text-2xl font-bold text-white font-mono mt-1">₹4,85,000</div>
                    <div className="text-xs text-emerald-400 mt-1">↑ +24% this month</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-mono">SUCCESSFUL TRANSACTIONS</div>
                    <div className="text-2xl font-bold text-white font-mono mt-1">1,420</div>
                    <div className="text-xs text-emerald-400 mt-1">99.8% Success Rate</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-slate-400 font-mono">ACTIVE SSO SESSIONS</div>
                    <div className="text-2xl font-bold text-white font-mono mt-1">8,940</div>
                    <div className="text-xs text-indigo-400 mt-1">Live Connected Users</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING SECTION ---------------- */}
      <section id="pricing" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold mb-3">
            Transparent Plans
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Predictable Pricing for Growing SaaS Companies
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Starter Plan */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-sm font-bold text-slate-300 mb-2">Starter Developer</div>
              <div className="text-4xl font-extrabold text-white font-mono mb-4">
                ₹0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Perfect for side projects, testing, and initial WhitePass SSO integration.
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Up to 100 Active Users</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WhitePass Basic SSO Authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Community Discord Support</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center block transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/80 backdrop-blur-2xl flex flex-col justify-between shadow-2xl shadow-indigo-950/80 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-400 mb-2">Pro SaaS Business</div>
              <div className="text-4xl font-extrabold text-white font-mono mb-4">
                {billingCycle === 'monthly' ? '₹2,999' : '₹2,399'} <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
              <p className="text-slate-300 text-xs mb-6">
                Full-featured billing automation, Razorpay checkout, and advanced telemetry.
              </p>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited Active Users</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full WhitePass SSO Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated Payment Webhooks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>24/7 Priority Support</span>
                </li>
              </ul>
            </div>
            <Link
              to="/pricing"
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold text-center block shadow-lg shadow-indigo-600/30 transition-all"
            >
              Subscribe to Pro
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="text-sm font-bold text-slate-300 mb-2">Enterprise Custom</div>
              <div className="text-4xl font-extrabold text-white font-mono mb-4">
                Custom <span className="text-xs font-normal text-slate-400">/ quote</span>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Dedicated database instances, SLA guarantees, and custom SSO domain mapping.
              </p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated VPC Database Instance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>99.99% Guaranteed SLA</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Custom White-labeled SSO Portal</span>
                </li>
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center block transition-colors"
            >
              Contact Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- CTA FOOTER BANNER ---------------- */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-950 border border-indigo-500/40 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your SaaS Revenue?
            </h2>
            <p className="text-slate-300 text-base">
              Join thousands of developers using WytPayment and WhitePass SSO for instant subscription monetization.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-xl"
              >
                Create Account Now
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold bg-slate-900/80 text-white border border-slate-700 hover:border-slate-500 transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-200">WytPayment Platform</span>
            <span className="text-xs text-slate-500">© 2026 WytNet Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
            <Link to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
