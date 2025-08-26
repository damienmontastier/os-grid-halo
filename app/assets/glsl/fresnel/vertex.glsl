varying vec2 vUv;

out vec3 vView;
out vec3 vNormal;

void main() {
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);

    vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);

    vView = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
