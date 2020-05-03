export function parseUrlEncoded (data) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (key) {
            params.append(key, encodeURI(data[key]));
        }
    }
    return params;
}

// export function formatCity(results) {
//     let index = 0;
//     for (const i in results) {
//         if (results[i].types && results[i].types[0] === "administrative_area_level_3") {
//             index = parseInt(i, 0);
//             break;
//         }
//     }
//
//     const path =  results[index].formatted_address.split(",").splice(0, 2).join(",");
//
//     return path;
// }
