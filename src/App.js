import { useEffect, useRef, useState } from "react";
import * as THREE from "three"; 
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import player_model from "./assets/scene.glb"
import './App.css';

function App() {

  const refCanvas = useRef(null)
  const [isAnimating, setAnimating] = useState(true)
  const controls = useRef(null)
  const loader = new GLTFLoader();  
  let model;
  
  useEffect(() => {
    let width = refCanvas.current.clientWidth
    let height = refCanvas.current.clientHeight
    let frameId

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    const cube = new THREE.Mesh(geometry, material)

    camera.position.z = 4
    scene.add(cube)
    renderer.setClearColor('#000000')
    renderer.setSize(width, height)
    loader.load(player_model, obj => {
      model = obj.scene;

      model.traverse( object => {
        if(object.type === 'Mesh') {
          object.material.wireframe = true;
        }
      })
      
      scene.add(obj.scene);
    }, undefined, err => console.error(err));

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		hemiLight.position.set( 0, 20, 0 );
		scene.add( hemiLight );

    const renderScene = () => {
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      width = refCanvas.current.clientWidth
      height = refCanvas.current.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderScene()
    }
    
    const animate = () => {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01

      renderScene()
      frameId = window.requestAnimationFrame(animate)
    }

    const start = () => {
      if (!frameId) {
        frameId = requestAnimationFrame(animate)
      }
    }

    const stop = () => {
      cancelAnimationFrame(frameId)
      frameId = null
    }

    refCanvas.current.appendChild(renderer.domElement)
    window.addEventListener('resize', handleResize)
    start()

    controls.current = { start, stop }
    
    return () => {
      stop()
      window.removeEventListener('resize', handleResize)
      refCanvas.current.removeChild(renderer.domElement)

      scene.remove(cube)
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <div className="App">
      <div style={{height: '100%'}} ref={refCanvas}/>
    </div>
  );
}

export default App;
