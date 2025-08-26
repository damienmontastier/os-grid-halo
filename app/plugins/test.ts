export default defineNuxtPlugin((nuxtApp) => {

})

// export default ({app}, inject) => {
//     if (window.location.hostname === 'halloween24.jeanpaulgaultier.com') {
//         const script = document.createElement('script');
//         // script.src = 'https://dism-getsdk-prep.jeanpaulgaultier.com/get-sdk/ciam_v2_sdk/app/d7dae13e4ba303d65fbf0c24c2d957a5';
//         script.src = 'https://dism-getsdk.jeanpaulgaultier.com/get-sdk/ciam_v2_sdk/app/fe60f3d299ffd8ef897e90eb31ff9ef2';

//         script.onload = () => {
//             if (window.ciam) {
//                 console.log('SDK loaded successfully');
//             } else {
//                 console.error('Failed to load SDK');
//             }
//         };
//         document.head.appendChild(script);
//     }
// };
