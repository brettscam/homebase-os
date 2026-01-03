import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  Maximize2,
  Eye,
  Move,
  X
} from 'lucide-react';

export default function HouseModel3D({ onRoomClick, darkMode }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationIdRef = useRef(null);
  const hoveredObjectRef = useRef(null);
  
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Room definitions with colors and positions
  const rooms = {
    kitchen: {
      name: 'Kitchen',
      color: 0x2563eb,
      hoverColor: 0x3b82f6,
      position: { x: -8, z: -8 },
      size: { width: 6, depth: 6, height: 3 },
      section: 'spaces',
      description: '16\' 4" × 18\' 2"'
    },
    livingRoom: {
      name: 'Living Room',
      color: 0x10b981,
      hoverColor: 0x34d399,
      position: { x: 0, z: -8 },
      size: { width: 8, depth: 6, height: 3 },
      section: 'spaces',
      description: 'Main living area'
    },
    masterBedroom: {
      name: 'Master Bedroom',
      color: 0x8b5cf6,
      hoverColor: 0xa78bfa,
      position: { x: 8, z: -8 },
      size: { width: 6, depth: 6, height: 3 },
      section: 'spaces',
      description: 'Primary suite'
    },
    garage: {
      name: 'Garage',
      color: 0x64748b,
      hoverColor: 0x94a3b8,
      position: { x: -8, z: 2 },
      size: { width: 6, depth: 6, height: 3 },
      section: 'mechanical',
      description: 'Two-car garage'
    },
    dining: {
      name: 'Dining Room',
      color: 0xf59e0b,
      hoverColor: 0xfbbf24,
      position: { x: 0, z: 2 },
      size: { width: 6, depth: 6, height: 3 },
      section: 'spaces',
      description: 'Formal dining'
    },
    bedroom2: {
      name: 'Bedroom 2',
      color: 0xec4899,
      hoverColor: 0xf472b6,
      position: { x: 8, z: 2 },
      size: { width: 5, depth: 5, height: 3 },
      section: 'spaces',
      description: 'Guest bedroom'
    },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkMode ? 0x0f172a : 0xf9f9f9);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: darkMode ? 0x1e293b : 0xe5e7eb,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, darkMode ? 0x334155 : 0xd1d5db, darkMode ? 0x1e293b : 0xe5e7eb);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Create house structure
    const houseGroup = new THREE.Group();
    
    // Create rooms
    Object.entries(rooms).forEach(([key, room]) => {
      const roomGeometry = new THREE.BoxGeometry(
        room.size.width,
        room.size.height,
        room.size.depth
      );
      
      const roomMaterial = new THREE.MeshStandardMaterial({
        color: room.color,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      
      const roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
      roomMesh.position.set(
        room.position.x,
        room.size.height / 2,
        room.position.z
      );
      roomMesh.castShadow = true;
      roomMesh.receiveShadow = true;
      roomMesh.userData = { roomKey: key, roomData: room };
      
      // Add edges
      const edges = new THREE.EdgesGeometry(roomGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: darkMode ? 0xffffff : 0x111827,
        linewidth: 2,
        transparent: true,
        opacity: 0.3
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      roomMesh.add(wireframe);
      
      houseGroup.add(roomMesh);

      // Add room label (floating text plane)
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      context.fillStyle = darkMode ? '#1e293b' : '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = 'bold 48px Inter, sans-serif';
      context.fillStyle = darkMode ? '#ffffff' : '#111827';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(room.name, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const labelGeometry = new THREE.PlaneGeometry(4, 1);
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.position.set(
        room.position.x,
        room.size.height + 1,
        room.position.z
      );
      labelMesh.lookAt(camera.position);
      houseGroup.add(labelMesh);
    });

    // Add exterior walls outline
    const wallMaterial = new THREE.LineBasicMaterial({ 
      color: darkMode ? 0x475569 : 0x6b7280,
      linewidth: 3
    });
    
    const points = [
      new THREE.Vector3(-11, 0, -11),
      new THREE.Vector3(11, 0, -11),
      new THREE.Vector3(11, 0, 5),
      new THREE.Vector3(-11, 0, 5),
      new THREE.Vector3(-11, 0, -11),
    ];
    
    const wallGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const wallLine = new THREE.Line(wallGeometry, wallMaterial);
    houseGroup.add(wallLine);

    scene.add(houseGroup);

    // Simple orbit controls (manual implementation)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    const controls = {
      rotate: (deltaX, deltaY) => {
        rotation.y += deltaX * 0.005;
        rotation.x += deltaY * 0.005;
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
        
        const radius = 35;
        camera.position.x = radius * Math.cos(rotation.x) * Math.sin(rotation.y);
        camera.position.y = radius * Math.sin(rotation.x) + 15;
        camera.position.z = radius * Math.cos(rotation.x) * Math.cos(rotation.y);
        camera.lookAt(0, 2, 0);
      },
      zoom: (delta) => {
        const zoomSpeed = 2;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, delta * zoomSpeed);
      },
      reset: () => {
        rotation = { x: 0.4, y: 0.8 };
        controls.rotate(0, 0);
      }
    };

    controlsRef.current = controls;

    // Mouse events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (event) => {
      if (event.target.tagName === 'CANVAS') {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
    };

    const onMouseMove = (event) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        controls.rotate(deltaX, deltaY);
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      } else {
        // Hover detection
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(houseGroup.children, true);
        
        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData.roomKey) {
            document.body.style.cursor = 'pointer';
            
            if (hoveredObjectRef.current !== object) {
              if (hoveredObjectRef.current && hoveredObjectRef.current.material) {
                const roomData = hoveredObjectRef.current.userData.roomData;
                hoveredObjectRef.current.material.color.setHex(roomData.color);
                hoveredObjectRef.current.material.opacity = 0.85;
              }
              
              hoveredObjectRef.current = object;
              const roomData = object.userData.roomData;
              object.material.color.setHex(roomData.hoverColor);
              object.material.opacity = 1;
              setHoveredRoom(roomData);
            }
          }
        } else {
          document.body.style.cursor = 'default';
          if (hoveredObjectRef.current && hoveredObjectRef.current.material) {
            const roomData = hoveredObjectRef.current.userData.roomData;
            hoveredObjectRef.current.material.color.setHex(roomData.color);
            hoveredObjectRef.current.material.opacity = 0.85;
            hoveredObjectRef.current = null;
          }
          setHoveredRoom(null);
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (event) => {
      if (!containerRef.current || isDragging) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(houseGroup.children, true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.roomKey) {
          const roomData = object.userData.roomData;
          setSelectedRoom(roomData);
          if (onRoomClick) {
            onRoomClick(roomData);
          }
        }
      }
    };

    const onWheel = (event) => {
      event.preventDefault();
      controls.zoom(event.deltaY > 0 ? -1 : 1);
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    containerRef.current.addEventListener('click', onClick);
    containerRef.current.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let autoRotateAngle = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (isRotating) {
        autoRotateAngle += 0.003;
        houseGroup.rotation.y = autoRotateAngle;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Initial rotation setup
    rotation = { x: 0.4, y: 0.8 };
    controls.rotate(0, 0);

    // Cleanup
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', onClick);
        containerRef.current.removeEventListener('wheel', onWheel);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      document.body.style.cursor = 'default';
    };
  }, [darkMode, isRotating, onRoomClick]);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.zoom(1);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.zoom(-1);
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className={`p-3 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg hover:scale-110 transition-transform`}
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className={`p-3 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg hover:scale-110 transition-transform`}
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className={`p-3 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg hover:scale-110 transition-transform`}
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-3 ${isRotating ? 'bg-blue-600' : darkMode ? 'bg-slate-800' : 'bg-white'} ${isRotating ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'} rounded-xl shadow-lg hover:scale-110 transition-transform`}
          title="Auto Rotate"
        >
          <RotateCcw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute bottom-4 left-4 ${darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-gray-200'} backdrop-blur-sm border rounded-2xl p-4 max-w-xs`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Interactive 3D View
              </h3>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className={`text-xs space-y-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            <li className="flex items-center gap-2">
              <Move className="w-3 h-3" />
              <span>Drag to rotate view</span>
            </li>
            <li className="flex items-center gap-2">
              <Maximize2 className="w-3 h-3" />
              <span>Scroll to zoom</span>
            </li>
            <li className="flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span>Click rooms for details</span>
            </li>
          </ul>
        </motion.div>
      )}

      {!showInfo && (
        <button
          onClick={() => setShowInfo(true)}
          className={`absolute bottom-4 left-4 p-3 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg hover:scale-110 transition-transform`}
          title="Show Info"
        >
          <Info className="w-5 h-5" />
        </button>
      )}

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute top-4 left-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl shadow-lg p-4 pointer-events-none`}
          >
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              {hoveredRoom.name}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {hoveredRoom.description}
            </p>
            <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-2`}>
              Click to view specifications
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Room Detail */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`absolute top-4 right-20 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-xl p-5 max-w-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRoom.name}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {selectedRoom.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => onRoomClick && onRoomClick(selectedRoom)}
              className={`w-full py-2 px-4 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl text-sm font-medium transition-colors`}
            >
              View Full Specifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}