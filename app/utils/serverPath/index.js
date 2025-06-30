// export const mainServerPath = (path) => (new URL(`http://192.168.0.198:8080${path}`).href); 
export const mainServerPath = (path) => (new URL(`https://api.brainbbox.com${path}`).href); 
// export default (path) => (new URL(`http://192.168.0.198:8080/admin/khata${path}`).href);
export default (path) => (new URL(`https://api.brainbbox.com/admin/khata${path}`).href);