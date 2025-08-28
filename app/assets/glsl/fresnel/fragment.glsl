uniform vec3  uFresnelColor, uRimBiasDir, uBaseColor;
uniform float uFresnelAmt, uFresnelOffset, uFresnelIntensity;
uniform float uEllipseMajor, uEllipseMinor;
uniform float uNoiseScale, uNoiseStrength;

varying vec3 vWorldPos, vWorldNormal, vViewDir, vObjPos;

// --- noise
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float noise(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float n000=hash(i+vec3(0,0,0)), n100=hash(i+vec3(1,0,0));
  float n010=hash(i+vec3(0,1,0)), n110=hash(i+vec3(1,1,0));
  float n001=hash(i+vec3(0,0,1)), n101=hash(i+vec3(1,0,1));
  float n011=hash(i+vec3(0,1,1)), n111=hash(i+vec3(1,1,1));
  float nx00=mix(n000,n100,f.x), nx10=mix(n010,n110,f.x);
  float nx01=mix(n001,n101,f.x), nx11=mix(n011,n111,f.x);
  return mix(mix(nx00,nx10,f.y), mix(nx01,nx11,f.y), f.z);
}
float fbm2(vec3 p){ return 0.5*noise(p) + 0.25*noise(p*2.0); }

// --- safe normalize util
vec3 safeNormalize(vec3 v, vec3 fallback){
  return normalize(length(v) < 1e-4 ? fallback : v);
}

void main(){
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);

  float nv = 1.0 - dot(N, V);

  // basis
  vec3 U = uRimBiasDir - V * dot(uRimBiasDir, V);
  U = safeNormalize(U, cross(V, vec3(0.0,1.0,0.0)));
  vec3 W = normalize(cross(V, U));

  // tangent direction
  vec3 T = N - V * dot(N, V);
  vec3 Tn = safeNormalize(T, U);

  // ellipse
  float a = clamp(uEllipseMajor, 0.2, 2.0);
  float b = clamp(uEllipseMinor, 0.2, 2.0);
  float anis = sqrt((dot(Tn,U)*dot(Tn,U))/(a*a+1e-5) + (dot(Tn,W)*dot(Tn,W))/(b*b+1e-5));
  anis = clamp(anis, 0.4, 2.5);

  float nvWarp = nv * anis;

  // noise
  float rimNoise = (fbm2(vObjPos * uNoiseScale) - 0.5) * uNoiseStrength;

  // fresnel rim
  float rim = smoothstep(uFresnelOffset, uFresnelOffset + uFresnelAmt, nvWarp + rimNoise);

  vec3 rgb = uBaseColor * (1.0 - rim) + uFresnelColor * rim * uFresnelIntensity;
  csm_DiffuseColor = vec4(rgb, rim);
}
