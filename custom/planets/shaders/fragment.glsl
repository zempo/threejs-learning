uniform sampler2D marsTexture;

// vertexUV
varying vec2 vUV;
// vector normalization
varying vec3 vNormal;

void main() {
    // slight tint to planet
    // gl_FragColor = vec4(vec3(0.2, 0, 0) + texture2D(marsTexture, vUV).xyz, 1.0);

    // Atmospheric intensity
    float intensity = 1.05 - dot(vNormal, vec3(0.0,0.0,1.0));
    vec3 atmosphere = vec3(0.5, 0.6, 1.0) * pow(intensity, 1.5);
    
    gl_FragColor = vec4(atmosphere + texture2D(marsTexture, vUV).xyz, 1.0);

}