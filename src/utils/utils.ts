// utils.ts
export const getToken = () =>
    document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");

export const host = "192.168.1.157";
