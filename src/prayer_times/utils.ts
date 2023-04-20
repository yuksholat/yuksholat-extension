export function parseUrlEncoded (data: Record<string, any>) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (key) {
            params.append(key, data[key]);
        }
    }
    return params;
}
