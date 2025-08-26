varying vec2 vUv;

out vec3 vView;
out vec3 vNormal;

void main() {
    mat4 worldMat = modelMatrix * instanceMatrix;
    vec4 worldPosition = worldMat * vec4(position, 1.0);

    vNormal = normalize(mat3(worldMat) * normal);

    vView = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
