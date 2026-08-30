import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds, Center, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function ModelLoader() {
    const { scene } = useGLTF('/assets/model.glb');
    return <primitive object={scene} />;
}

export default function Viewer() {
    return (
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />

            <Suspense fallback={null}>
                <Bounds fit clip observe margin={1.2}>
                    <Center>
                        <ModelLoader />
                    </Center>
                </Bounds>
            </Suspense>

            <gridHelper args={[20, 20]} />
            <OrbitControls makeDefault />
        </Canvas>
    );
}
