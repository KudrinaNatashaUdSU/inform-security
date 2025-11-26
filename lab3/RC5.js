class RC5 {
    constructor() {
        this.r = 12;
        this.w = 32;
        this.b = 16;
        this.u = this.w / 8;
        this.t = 2 * (this.r + 1);
        this.P32 = 0xB7E15163;
        this.Q32 = 0x9E3779B9;
    }

    leftShift(x, y) {
        y %= 32;
        return ((x << y) | (x >>> (32 - y))) >>> 0;
    }

    rightShift(x, y) {
        y %= 32;
        return ((x >>> y) | (x << (32 - y))) >>> 0;
    }

    expandKey(key) {
        const L = new Uint32Array(Math.ceil(this.b / this.u));
        const keyU8 = new Uint8Array(key);

        for (let i = 0; i < this.b; i++) {
            L[Math.floor(i / this.u)] |= (keyU8[i] << (8 * (i % this.u))) >>> 0;
        }

        const S = new Uint32Array(this.t);
        S[0] = this.P32;
        for (let i = 1; i < this.t; i++) {
            S[i] = (S[i - 1] + this.Q32) >>> 0;
        }

        let i = 0, j = 0;
        const v = 3 * Math.max(this.t, L.length);
        let A = 0, B = 0;

        for (let k = 0; k < v; k++) {
            A = S[i] = this.leftShift((S[i] + A + B) >>> 0, 3);
            B = L[j] = this.leftShift((L[j] + A + B) >>> 0, (A + B) % 32);
            i = (i + 1) % this.t;
            j = (j + 1) % L.length;
        }

        return S;
    }

    encodeBlock(A, B, S) {
        A = (A + S[0]) >>> 0;
        B = (B + S[1]) >>> 0;

        for (let i = 1; i <= this.r; i++) {
            A = (this.leftShift(A ^ B, B) + S[2 * i]) >>> 0;
            B = (this.leftShift(B ^ A, A) + S[2 * i + 1]) >>> 0;
        }

        return [A, B];
    }

    decodeBlock(A, B, S) {
        for (let i = this.r; i >= 1; i--) {
            B = this.rightShift(B - S[2 * i + 1], A) ^ A;
            A = this.rightShift(A - S[2 * i], B) ^ B;
        }

        B = (B - S[1]) >>> 0;
        A = (A - S[0]) >>> 0;

        return [A, B];
    }

    pad(data) {
        const padLen = 8 - (data.length % 8);
        const padded = new Uint8Array(data.length + padLen);
        padded.set(data);
        for (let i = data.length; i < padded.length; i++) {
            padded[i] = padLen;
        }
        return padded;
    }

    unpad(data) {
        const padLen = data[data.length - 1];
        if (padLen < 1 || padLen > 8) throw new Error('Некорректный паддинг');
        for (let i = data.length - padLen; i < data.length; i++) {
            if (data[i] !== padLen) throw new Error('Некорректный паддинг');
        }
        return data.slice(0, data.length - padLen);
    }

    randomKey() {
        let array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return String.fromCharCode(...array);
    }

    encodeForStreamCipher(text, key) {
        const S = this.expandKey(key);

        let A = (text[0] | (text[1] << 8) | (text[2] << 16) | (text[3] << 24)) >>> 0;
        let B = (text[4] | (text[5] << 8) | (text[6] << 16) | (text[7] << 24)) >>> 0;

        A = (A + S[0]) >>> 0;
        B = (B + S[1]) >>> 0;

        for (let i = 1; i <= this.r; i++) {
            A = (this.leftShift(A ^ B, B) + S[2 * i]) >>> 0;
            B = (this.leftShift(B ^ A, A) + S[2 * i + 1]) >>> 0;
        }

        let result = new Uint8Array(8);
        result[0] = A & 0xff;
        result[1] = (A >>> 8) & 0xff;
        result[2] = (A >>> 16) & 0xff;
        result[3] = (A >>> 24) & 0xff;
        result[4] = B & 0xff;
        result[5] = (B >>> 8) & 0xff;
        result[6] = (B >>> 16) & 0xff;
        result[7] = (B >>> 24) & 0xff;
        return result;
    }

    encode(text, key) {
        const encoder = new TextEncoder();
        const plaintext = encoder.encode(text);
        const padded = this.pad(plaintext);
        const S = this.expandKey(key);

        const ciphertext = new Uint8Array(padded.length);
        const view = new DataView(ciphertext.buffer);

        for (let i = 0; i < padded.length; i += 8) {
            const A = (padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24)) >>> 0;
            const B = (padded[i + 4] | (padded[i + 5] << 8) | (padded[i + 6] << 16) | (padded[i + 7] << 24)) >>> 0;

            const [A2, B2] = this.encodeBlock(A, B, S);

            view.setUint32(i, A2, true);
            view.setUint32(i + 4, B2, true);
        }

        return btoa(String.fromCharCode(...ciphertext));
    }

    decode(ciphertextBase64, key) {
        const binary = atob(ciphertextBase64);
        const data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            data[i] = binary.charCodeAt(i);
        }

        if (data.length % 8 !== 0) throw new Error('Некорректная длина шифра');
        const S = this.expandKey(key);

        const plaintext = new Uint8Array(data.length);
        const view = new DataView(data.buffer);

        for (let i = 0; i < data.length; i += 8) {
            const A = view.getUint32(i, true);
            const B = view.getUint32(i + 4, true);

            const [A2, B2] = this.decodeBlock(A, B, S);

            plaintext[i] = A2 & 0xff;
            plaintext[i + 1] = (A2 >>> 8) & 0xff;
            plaintext[i + 2] = (A2 >>> 16) & 0xff;
            plaintext[i + 3] = (A2 >>> 24) & 0xff;
            plaintext[i + 4] = B2 & 0xff;
            plaintext[i + 5] = (B2 >>> 8) & 0xff;
            plaintext[i + 6] = (B2 >>> 16) & 0xff;
            plaintext[i + 7] = (B2 >>> 24) & 0xff;
        }

        const unpadded = this.unpad(plaintext);
        const decoder = new TextDecoder();
        return decoder.decode(unpadded);
    }
}