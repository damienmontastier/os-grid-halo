varying vec2 vUv;

uniform vec3 uFresnelColor;
uniform vec3 uBaseColor;
uniform float uFresnelAmt;
uniform float uFresnelOffset;
uniform float uFresnelIntensity;
uniform float uFresnelAlpha;
uniform float uAlpha;

in vec3 vView;
in vec3 vNormal;

float lambertLighting(vec3 normal, vec3 viewDirection) {
    return max(dot(normal, viewDirection), 0.0);
}

float fresnelFunc(float amount, float offset, vec3 normal, vec3 view) {
    return offset + (1.0 - offset) * pow(1.0 - dot(normal, view), amount);
}

void main() {
    float fresnel = fresnelFunc(uFresnelAmt, uFresnelOffset, vNormal, vView);
    vec3 fresnelColor = (uFresnelColor * fresnel) * uFresnelIntensity;

    float diffuse = lambertLighting(vNormal, vView);
    vec3 diffuseColor = uBaseColor * diffuse;

    vec3 finalColor = mix(diffuseColor, fresnelColor, fresnel * uFresnelAlpha);

    float alpha = uAlpha > 0.5 ? fresnel : 1.0;

    gl_FragColor = uAlpha > 0.5 
        ? vec4(fresnelColor, fresnel) 
        : vec4(finalColor, 1.0);
}
