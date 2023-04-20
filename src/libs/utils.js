export function parseUrlEncoded (data) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (key) {
            params.append(key, data[key]);
        }
    }
    return params;
}
