varying vec3 vWorldPos, vWorldNormal, vViewDir, vObjPos;

void main() {
  #ifdef USE_INSTANCING
    mat4 IM = instanceMatrix;
  #else
    mat4 IM = mat4(1.0);
  #endif

  mat4 M  = modelMatrix * IM;
  vec4 wp = M * vec4(position, 1.0);

  vObjPos      = position;
  vWorldPos    = wp.xyz;
  vWorldNormal = normalize(mat3(M) * normal);
  vViewDir     = normalize(cameraPosition - vWorldPos);
}
