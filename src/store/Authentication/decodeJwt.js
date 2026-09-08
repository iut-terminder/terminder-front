// JWT payload is base64url + UTF-8. Native atob() only accepts standard
// base64 (no "-" / "_") and does not decode Persian/Unicode names.
export function decodeJwtPayload(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid token');
    }

    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) {
        throw new Error('Invalid token');
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
}
