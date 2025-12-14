function hash(text) {
    const encoder = new TextEncoder();
    let data = encoder.encode(text);
    const padLen = 8 - (data.length % 8);
    let padded = new Uint8Array(data.length + padLen);
    padded.set(data);
    for (let i = data.length; i < padded.length; i++) {
        padded[i] = 0;
    }

    let H = new Uint8Array(8);
    const rc5 = new RC5();

    for (let i = 0; i < padded.length; i += 8) {
        let block = padded.slice(i, i + 8);
        let key = new Uint8Array(16);
        key.set(H);
        key.set(H, 8);
        let encoded = rc5.encodeForHash(block, key);
        let newH = new Uint8Array(8);
        for (let j = 0; j < 8; j++) {
            newH[j] = encoded[j] ^ block[j];
        }

        H = newH;
    }

    return Array.from(H).map(b => b.toString(16).padStart(2, '0')).join('');
}
