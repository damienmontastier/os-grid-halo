uniform vec3  uFresnelColor, uRimBiasDir, uBaseColor;
uniform float uFresnelAmt, uFresnelOffset, uFresnelIntensity;
uniform float uEllipseMajor, uEllipseMinor; // NEW
uniform float uNoiseScale, uNoiseStrength;

varying vec3 vWorldPos, vWorldNormal, vViewDir, vObjPos;

// noise compact
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float noise(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float n000=hash(i+vec3(0,0,0)), n100=hash(i+vec3(1,0,0));
  float n010=hash(i+vec3(0,1,0)), n110=hash(i+vec3(1,1,0));
  float n001=hash(i+vec3(0,0,1)), n101=hash(i+vec3(1,0,1));
  float n011=hash(i+vec3(0,1,1)), n111=hash(i+vec3(1,1,1));
  float nx00=mix(n000,n100,f.x), nx10=mix(n010,n110,f.x);
  float nx01=mix(n001,n101,f.x), nx11=mix(n011,n111,f.x);
  float nxy0=mix(nx00,nx10,f.y), nxy1=mix(nx01,nx11,f.y);
  return mix(nxy0,nxy1,f.z);
}
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<2;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }

void main(){
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(vViewDir);

  // --- Base Fresnel (isotrope)
  float nv = 1.0 - dot(N, V);

  // --- Orthonormal basis in view-plane
  vec3 Vn = V;
  vec3 U = uRimBiasDir - Vn * dot(uRimBiasDir, Vn);   // proj du bias dans le plan ⟂ vue
  U = normalize( length(U) < 1e-4 ? normalize(cross(Vn, vec3(0.0,1.0,0.0))) : U );
  vec3 W = normalize(cross(Vn, U));                   // second axe du plan

  // Direction tangentielle du point (dans le plan de vue)
  vec3 T = N - Vn * dot(N, Vn);
  vec3 Tn = normalize( length(T) < 1e-4 ? U : T );

  // coords sur les deux axes
  float u = dot(Tn, U);
  float w = dot(Tn, W);

  // --- Ellipse réelle : scale différent sur les 2 axes
  // (clamp pour éviter des extrêmes)
  float a = clamp(uEllipseMajor, 0.2, 2.0);
  float b = clamp(uEllipseMinor, 0.2, 2.0);
  float anis = sqrt((u*u)/(a*a + 1e-5) + (w*w)/(b*b + 1e-5)); // >0
  anis = clamp(anis, 0.4, 2.5);

  // Skew optionnel le long du grand axe
  float nvWarp = nv * anis;

  // --- Noise en espace OBJET (ne glisse pas)
  float rimNoise = (fbm(vObjPos * uNoiseScale) - 0.5) * uNoiseStrength;

  float rim = smoothstep(
    uFresnelOffset,
    uFresnelOffset + uFresnelAmt,
    nvWarp + rimNoise
  );

    vec3 rimCol = uFresnelColor * rim * uFresnelIntensity; // diffuse “plate” (non-éclairée) contrôlée par ta baseColor
    vec3 base = uBaseColor; // baseColor du matériau
    vec3 rgb = mix(base, rimCol, rim);
    csm_DiffuseColor = vec4(rgb, rim);
}
