class StreamCipherWithRC5 {
    generateKeystream(rc5, len, key) {
        const stream = new Uint8Array(len);
        let pos = 0;
        let counter = 0n;

        while (pos < len) {
            const ctrBlock = new Uint8Array(8);
            new DataView(ctrBlock.buffer).setBigUint64(0, counter, true); 

            const gammaBlock = rc5.encodeForStreamCipher(ctrBlock, key);

            const take = Math.min(8, len - pos);
            stream.set(gammaBlock.subarray(0, take), pos);
            pos += take;
            counter++;
        }
        return stream;
    }

    encode(text, key) {
        const rc5 = new RC5();
        const encoder = new TextEncoder();
        const pt = encoder.encode(text);
        const gamma = this.generateKeystream(rc5, pt.length, key);

        const ct = new Uint8Array(pt.length);
        for (let i = 0; i < pt.length; i++) {
            ct[i] = pt[i] ^ gamma[i];
        }
        return btoa(String.fromCharCode(...ct));
    }

    decode(text, key) {
        const rc5 = new RC5();
        const binary = atob(text);
        const ct = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            ct[i] = binary.charCodeAt(i);
        }

        const gamma = this.generateKeystream(rc5, ct.length, key);
        const pt = new Uint8Array(ct.length);
        for (let i = 0; i < ct.length; i++) {
            pt[i] = ct[i] ^ gamma[i];
        }

        const decoder = new TextDecoder();
        return decoder.decode(pt);
    }
}