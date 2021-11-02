// vector normalization
varying vec3 vNormal;

void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 2.0);
    // Note that you can therefore calculate the position of a vertex in the vertex shader by:
    // gl_FragColor = vec4(1, 0.38, 0.3, 0.84) * intensity;
    gl_FragColor = vec4(1, 0.3, 0.3, 1) * intensity;
} 