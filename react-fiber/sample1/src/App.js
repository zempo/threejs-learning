import { useRef } from 'react';
import {Canvas, useFrame} from '@react-three/fiber'
import {OrbitControls} from "@react-three/drei"
import './scss/global.scss';

const cube1 = {
  color: 0xadd8e6,
  pos: [0,1,0],
  args: [3,2,1]
}

const cube2 = {
  color: 0xff00ff,
  pos: [-2,1,-5],
  args: [1,1,1]
}

const cube3 = {
  color: 0xff00ff,
  pos: [5,1,-2],
  args: [1,1,1]
}

/**
 * useFrame() needs to be in its own component
 * 
 * So spinning gemetries should be separated
*/
const SpinningGeo = (props) => {
  const mesh1 = useRef()
  const {color, pos, args} = props.obj

  useFrame(() => (mesh1.current.rotation.x = mesh1.current.rotation.y += .01))

  return (
<>
    {/* OPTION 1 */}
    <mesh ref={mesh1} position={pos} castShadow>
    <boxBufferGeometry attach="geometry" args={args} />
    {/* <circleBufferGeometry attach="geometry" args={[1,200]} /> */}
    <meshStandardMaterial attach='material' color={color} />
  </mesh>
  </>
  )
}

const floorObj = {
  color: 0xf1f4f8,
  args: [100,100],
  rot: [-Math.PI / 2, 0, 0],
  pos: [0, -1, 0]
}

const FloorGeo = props => {
  const {args, rot, pos} = props.obj

  return (
    <>
      <mesh receiveShadow rotation={rot} position={pos}>
        <planeBufferGeometry attach='geometry' args={args} />
        <shadowMaterial attach='material' opacity={1} />
        {/* <meshStandardMaterial attach='material' color='yellow' /> */}
      </mesh>
    </>
  )
}


function App() {

  return (
    <>
    {/* Our main canvas goes here */}
    <Canvas colorManagement shadowMap camera={{position: [-5,2,10], fov: 60}}>
    <fog attach='fog' args={["white", 0, 40]} />
      <ambientLight intensity={.3} />
      <directionalLight
       castShadow
       position={[0,10,0]}
       intensity={1.5}
       shadow-mapSize-width={1024}
       shadow-mapSize-height={1024}
       shadow-camera-far={50}
       shadow-camera-left={-10}
       shadow-camera-right={10}
       shadow-camera-top={10}
       shadow-camera-bottom={-10}
       />
      <pointLight intensity={.5} position={[-10,0,-20]} />
      <pointLight intensity={1.5} position={[0,0,-10]} />
      <group position={[0,0,0]}>
      <SpinningGeo obj={cube1} />
      <SpinningGeo obj={cube2} />
      <SpinningGeo obj={cube3} /> 
      <FloorGeo obj={floorObj} />
      </group>
      <OrbitControls 
        enablePan={Boolean("Pan", true)}
        enableZoom={Boolean("Zoom", true)}
        enableRotate={Boolean("Rotate", true)}
      />
    </Canvas>
    </>
  );
}

export default App;
