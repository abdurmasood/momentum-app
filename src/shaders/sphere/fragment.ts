export const fragmentShader = `
uniform float u_intensity;
uniform float u_time;

varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  float distort = 2.0 * vDisplacement * u_intensity;

  // Calculate radial distance from center for smooth gradients
  float radialDist = length(vUv - 0.5) * 2.0;
  
  // Theme-coherent color palette from website design system
  vec3 colorCore = vec3(0.118, 0.227, 0.541);     // Deep navy #1e3a8a (blueDeep)
  vec3 colorMid = vec3(0.545, 0.373, 0.965);      // Violet #8b5cf6 (primary accent)
  vec3 colorOuter = vec3(0.957, 0.447, 0.714);    // Warm pink #f472b6 (complementary)
  
  // Create smooth color transitions
  vec3 color = mix(colorCore, colorMid, smoothstep(0.0, 0.6, radialDist));
  color = mix(color, colorOuter, smoothstep(0.4, 1.0, radialDist));
  
  // Apply organic distortion to color intensity
  color *= (1.0 - distort * 0.3);
  
  // Add subtle brightness variation based on displacement
  color += vec3(0.05, 0.03, 0.08) * abs(vDisplacement);
  
  // Fresnel rim lighting for sophisticated edge glow
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
  
  // Rim light color - subtle blue-violet from theme
  vec3 rimColor = vec3(0.376, 0.565, 0.965); // Bright blue #60a5fa
  color += rimColor * fresnel * 0.4;
  
  // Final alpha with subtle transparency for depth
  float alpha = 0.98 - fresnel * 0.1;
  
  gl_FragColor = vec4(color, alpha);
}
`