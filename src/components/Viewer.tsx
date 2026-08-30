import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds, Center, useGLTF } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

function ModelLoader() {
    const { scene } = useGLTF('/assets/model.glb');
    const displayMode = useStore((state) => state.displayMode);
    const confidenceThreshold = useStore((state) => state.confidenceThreshold);
    const setStats = useStore((state) => state.setStats);

    useEffect(() => {
        let totalVertices = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Calculate stats from vertex colors
                if (child.geometry && child.geometry.attributes.color) {
                    const colorAttr = child.geometry.attributes.color;
                    for (let i = 0; i < colorAttr.count; i++) {
                        const r = colorAttr.getX(i); // Red channel is stored as X
                        if (r >= 0.7) highCount++;
                        else if (r >= 0.3) mediumCount++;
                        else lowCount++;
                        totalVertices++;
                    }
                }

                if (child.material) {
                    // Clone material to avoid modifying the cached GLTF material directly
                    child.material = child.material.clone();
                    child.material.vertexColors = true;

                    const customUniforms = {
                        uDisplayMode: { value: displayMode },
                        uConfidenceThreshold: { value: confidenceThreshold }
                    };

                    child.material.userData.uniforms = customUniforms;

                    child.material.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
                        shader.uniforms.uDisplayMode = customUniforms.uDisplayMode;
                        shader.uniforms.uConfidenceThreshold = customUniforms.uConfidenceThreshold;

                        shader.fragmentShader = shader.fragmentShader.replace(
                            '#include <common>',
                            `
                            #include <common>
                            uniform int uDisplayMode;
                            uniform float uConfidenceThreshold;
                            `
                        );

                        shader.fragmentShader = shader.fragmentShader.replace(
                            '#include <color_fragment>',
                            `
                            #ifdef USE_COLOR
                                float confidence = vColor.r;

                                if (uDisplayMode == 2 && confidence < uConfidenceThreshold) {
                                    discard;
                                }

                                if (uDisplayMode == 1) {
                                    vec3 c1 = vec3(1.0, 0.0, 0.0);
                                    vec3 c2 = vec3(1.0, 0.75, 0.0);
                                    vec3 c3 = vec3(0.0, 1.0, 0.2);
                                    
                                    float t1 = smoothstep(0.0, 0.5, confidence);
                                    float t2 = smoothstep(0.5, 1.0, confidence);
                                    
                                    vec3 heatmapColor = mix(mix(c1, c2, t1), c3, t2);
                                    diffuseColor.rgb = heatmapColor;
                                }
                            #endif
                            `
                        );
                    };
                    child.material.needsUpdate = true;
                }
            }
        });

        if (totalVertices > 0) {
            setStats({
                high: (highCount / totalVertices) * 100,
                medium: (mediumCount / totalVertices) * 100,
                low: (lowCount / totalVertices) * 100
            });
        }
    // We only want to run this once when the scene loads to inject the shader and calculate stats
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene]);

    // Update uniforms directly when state changes (avoiding material recompilation)
    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && child.material.userData.uniforms) {
                child.material.userData.uniforms.uDisplayMode.value = displayMode;
                child.material.userData.uniforms.uConfidenceThreshold.value = confidenceThreshold;
            }
        });
    }, [displayMode, confidenceThreshold, scene]);

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
