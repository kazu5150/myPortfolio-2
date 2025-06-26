"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface GlobeProps {
  onColorChange?: (color: { from: string; to: string }) => void
}

export default function Globe({ onColorChange }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Create starfield
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Create atmospheric glow
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 32, 32)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        glowColor: { value: new THREE.Color(0x3a86ff) },
      },
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)

    // Create wireframe globe
    const globeGeometry = new THREE.SphereGeometry(5, 32, 32)
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: 0x3a86ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    })
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 3)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)
    
    // Add another light from the opposite side
    const pointLight2 = new THREE.PointLight(0xffffff, 2.5)
    pointLight2.position.set(-10, -10, 10)
    scene.add(pointLight2)
    
    // Add a third light from the front
    const pointLight3 = new THREE.PointLight(0xffffff, 2)
    pointLight3.position.set(0, 0, 15)
    scene.add(pointLight3)

    // Camera position
    camera.position.z = 15

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = false

    // Animation variables
    const colors = [
      new THREE.Color(0x3a86ff), // Blue
      new THREE.Color(0x8338ec), // Purple
      new THREE.Color(0xff006e), // Pink
      new THREE.Color(0xfb5607), // Orange
      new THREE.Color(0xffbe0b), // Yellow
    ]
    let colorIndex = 0
    let nextColorIndex = 1
    let colorT = 0
    const colorTransitionSpeed = 0.003 // 少し速度を上げて滑らかに

    // Helper function to convert THREE.Color to hex string
    const colorToHex = (color: THREE.Color) => {
      return "#" + color.getHexString()
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)

      // Update color transition
      colorT += colorTransitionSpeed
      if (colorT >= 1) {
        colorT = 0
        colorIndex = nextColorIndex
        nextColorIndex = (nextColorIndex + 1) % colors.length
      }

      // Interpolate colors
      const currentColor = new THREE.Color()
      currentColor.lerpColors(colors[colorIndex], colors[nextColorIndex], colorT)

      // Apply color to materials
      globeMaterial.color = currentColor
      if (atmosphereMaterial.uniforms.glowColor) {
        atmosphereMaterial.uniforms.glowColor.value = currentColor
      }

      // Call the color change callback with gradient colors
      if (onColorChange) {
        // Create a smooth gradient transition
        const fromColor = new THREE.Color()
        const toColor = new THREE.Color()
        
        // Use smooth interpolation for gradient edges
        fromColor.lerpColors(colors[colorIndex], colors[nextColorIndex], colorT * 0.7)
        toColor.lerpColors(colors[colorIndex], colors[nextColorIndex], Math.min(1, colorT + 0.3))
        
        onColorChange({
          from: colorToHex(fromColor),
          to: colorToHex(toColor)
        })
      }

      // Rotate objects
      globe.rotation.y += 0.005
      atmosphere.rotation.y += 0.003
      stars.rotation.y += 0.0005

      // Update controls
      controls.update()

      // Render
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
      controls.dispose()
      renderer.dispose()
    }
  }, [onColorChange])

  return (
    <>
      <div ref={mountRef} className="fixed inset-0 z-0" />
      <div className="absolute bottom-4 right-4 bg-black/30 text-white text-sm px-3 py-1 rounded-full">
        Drag to explore
      </div>
    </>
  )
}