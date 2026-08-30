import { Canvas, useLoader, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Bounds, Center, useGLTF, Html, Line } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three-stdlib';
import { useStore } from '../store/useStore';

function ModelLoader() {
    const { scene } = useGLTF('/assets/model.glb');
    const displayMode = useStore((state) => state.displayMode);
    const confidenceThreshold = useStore((state) => state.confidenceThreshold);
    const setStats = useStore((state) => state.setStats);
    const showMesh = useStore((state) => state.showMesh);
    
    // Measure Mode State
    const isMeasureMode = useStore((state) => state.isMeasureMode);
    const measurePoints = useStore((state) => state.measurePoints);
    const setMeasurePoints = useStore((state) => state.setMeasurePoints);

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

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (!isMeasureMode) return;
        
        e.stopPropagation(); // Prevent other interactions
        
        const point: [number, number, number] = [e.point.x, e.point.y, e.point.z];
        
        if (measurePoints.length === 0 || measurePoints.length === 2) {
            // First click (or reset after two points)
            setMeasurePoints([point]);
        } else if (measurePoints.length === 1) {
            // Second click
            setMeasurePoints([...measurePoints, point]);
        }
    };

    return <primitive object={scene} visible={showMesh} onPointerDown={handlePointerDown} />;
}

function PointCloudLoader() {
    const geometry = useLoader(PLYLoader, '/assets/cloud.ply');
    const displayMode = useStore((state) => state.displayMode);
    const confidenceThreshold = useStore((state) => state.confidenceThreshold);
    const showPointCloud = useStore((state) => state.showPointCloud);
    
    // Subsample geometry if > 1M points
    const sampledGeometry = useMemo(() => {
        if (!geometry) return null;
        let finalGeo = geometry;
        const maxPoints = 1000000;
        if (geometry.attributes.position && geometry.attributes.position.count > maxPoints) {
            console.warn(`Point cloud has ${geometry.attributes.position.count} points. Subsampling to ${maxPoints}...`);
            const count = geometry.attributes.position.count;
            const stride = Math.ceil(count / maxPoints);
            
            const newPos = [];
            const newCol = [];
            const posAttr = geometry.attributes.position;
            const colAttr = geometry.attributes.color;
            
            for (let i = 0; i < count; i += stride) {
                newPos.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
                if (colAttr) {
                    newCol.push(colAttr.getX(i), colAttr.getY(i), colAttr.getZ(i));
                }
            }
            
            finalGeo = new THREE.BufferGeometry();
            finalGeo.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
            if (colAttr) {
                finalGeo.setAttribute('color', new THREE.Float32BufferAttribute(newCol, 3));
            }
        }
        return finalGeo;
    }, [geometry]);

    const materialRef = useRef<THREE.PointsMaterial>(null);

    useEffect(() => {
        if (materialRef.current) {
            const customUniforms = {
                uDisplayMode: { value: displayMode },
                uConfidenceThreshold: { value: confidenceThreshold }
            };

            materialRef.current.userData.uniforms = customUniforms;

            materialRef.current.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
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
            materialRef.current.needsUpdate = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sampledGeometry]);

    useEffect(() => {
        if (materialRef.current && materialRef.current.userData.uniforms) {
            materialRef.current.userData.uniforms.uDisplayMode.value = displayMode;
            materialRef.current.userData.uniforms.uConfidenceThreshold.value = confidenceThreshold;
        }
    }, [displayMode, confidenceThreshold]);

    if (!sampledGeometry) return null;

    return (
        <points visible={showPointCloud} geometry={sampledGeometry}>
            <pointsMaterial ref={materialRef} size={0.05} vertexColors={true} />
        </points>
    );
}

function MeasureTool() {
    const measurePoints = useStore((state) => state.measurePoints);
    const globalScaleFactor = useStore((state) => state.globalScaleFactor);
    const isMeasureMode = useStore((state) => state.isMeasureMode);

    if (!isMeasureMode || measurePoints.length === 0) return null;

    const p1 = new THREE.Vector3(...measurePoints[0]);
    let p2: THREE.Vector3 | null = null;
    let distance = 0;
    let midpoint = new THREE.Vector3();

    if (measurePoints.length === 2) {
        p2 = new THREE.Vector3(...measurePoints[1]);
        distance = p1.distanceTo(p2) * globalScaleFactor;
        midpoint = p1.clone().lerp(p2, 0.5);
    }

    return (
        <group>
            {/* Marker 1 */}
            <mesh position={p1}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="orange" depthTest={false} />
            </mesh>

            {/* Marker 2 & Line & Label */}
            {p2 && (
                <>
                    <mesh position={p2}>
                        <sphereGeometry args={[0.05, 16, 16]} />
                        <meshBasicMaterial color="orange" depthTest={false} />
                    </mesh>

                    <Line
                        points={[p1, p2]}
                        color="orange"
                        lineWidth={3}
                        depthTest={false}
                    />

                    <Html position={midpoint} center zIndexRange={[100, 0]}>
                        <div className="bg-gray-900/90 text-white px-3 py-1.5 rounded-lg border border-orange-500/50 shadow-lg font-mono text-sm whitespace-nowrap backdrop-blur-sm pointer-events-none transform -translate-y-6">
                            {distance.toFixed(2)} m
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
}

export default function Viewer() {
    const showGrid = useStore((state) => state.showGrid);
    const isMeasureMode = useStore((state) => state.isMeasureMode);
    const setIsMeasureMode = useStore((state) => state.setIsMeasureMode);
    const setGlobalScaleFactor = useStore((state) => state.setGlobalScaleFactor);

    // Escape Key Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMeasureMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsMeasureMode]);

    // Fetch scale factor from manifest
    useEffect(() => {
        fetch('/assets/viewer_manifest.json')
            .then(res => res.json())
            .then(data => {
                if (data.global_scale_factor) {
                    setGlobalScaleFactor(data.global_scale_factor);
                }
            })
            .catch(err => console.error("Error loading manifest for scale factor:", err));
    }, [setGlobalScaleFactor]);

    return (
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }} style={{ cursor: isMeasureMode ? 'crosshair' : 'auto' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />

            <Suspense fallback={null}>
                <Bounds fit clip observe margin={1.2}>
                    <Center>
                        <ModelLoader />
                        <PointCloudLoader />
                        <MeasureTool />
                    </Center>
                </Bounds>
            </Suspense>

            {showGrid && <gridHelper args={[20, 20]} />}
            {/* Disable OrbitControls when picking points to prevent dragging the camera */}
            <OrbitControls makeDefault enabled={!isMeasureMode} />
        </Canvas>
    );
}
