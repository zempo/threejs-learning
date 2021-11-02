// vector normalization
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix * normal);
    // Note that you can therefore calculate the position of a vertex in the vertex shader by:
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}