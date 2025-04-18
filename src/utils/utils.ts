// utils.ts
export const getToken = () =>
    document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");

export const CONFIG = {
    host: '192.168.1.157',
    apiEndpoint: 'http://192.168.1.157:3001'
};
