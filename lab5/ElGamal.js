class ElGamal {
    constructor() {
        this.p = 257n;
        this.g = 3n;
    }

    generateKeys() {
        const x = 102n;
        const y = modPow(this.g, x, this.p);
        return {
            publicKey: { y: y.toString(), p: this.p.toString(), g: this.g.toString() },
            privateKey: x.toString()
        };
    }

    encode(M) {
        const m = BigInt(M);
        if (m < 0n || m >= this.p) {
            throw new Error(`M=${m} должно быть < ${this.p - 1n}`);
        }
        const y = BigInt(this.publicKey.y);
        const p = this.p;
        const g = this.g;
        let k = 178n;
        const a = modPow(g, k, p);
        const b = (modPow(y, k, p) * m) % p;
        return { a: a.toString(), b: b.toString() };
    }

    decode(ciphertext) {
        const { a, b } = ciphertext;
        const A = BigInt(a), B = BigInt(b);
        const x = BigInt(this.privateKey);
        const p = this.p;
        const a_x = modPow(A, x, p);
        const inv = modInverse(a_x, p);
        const M = (B * inv) % p;
        return M.toString();
    }

    setPublicKey(key) {
        this.publicKey = { y: BigInt(key.y), p: BigInt(key.p), g: BigInt(key.g) };
    }

    setPrivateKey(key) {
        this.privateKey = BigInt(key);
    }

    encodeText(text) {
        const bytes = new TextEncoder().encode(text);
        const blocks = Array.from(bytes, byte => {
            const { a, b } = this.encode(byte.toString());
            return `${a}:${b}`;
        });
        return blocks.join(';');
    }

    decodeText(encodedString) {
        if (!encodedString) return '';
        const blocks = encodedString.split(';').filter(Boolean);
        const bytes = blocks.map(pair => {
            const [aStr, bStr] = pair.split(':');
            if (!aStr || !bStr) throw new Error('Некорректный формат шифротекста');
            const M_str = this.decode({ a: aStr, b: bStr });
            return Number(M_str);
        });
        return new TextDecoder().decode(new Uint8Array(bytes));
    }
}

function modPow(base, exp, mod) {
    if (mod === 1n) return 0n;
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        exp = exp >> 1n;
        base = (base * base) % mod;
    }
    return result;
}

function gcd(a, b) {
    a = BigInt(a); b = BigInt(b);
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function modInverse(a, m) {
    a = BigInt(a); m = BigInt(m);
    let [oldR, r] = [a, m];
    let [oldS, s] = [1n, 0n];

    while (r !== 0n) {
        const q = oldR / r;
        [oldR, r] = [r, oldR - q * r];
        [oldS, s] = [s, oldS - q * s];
    }

    if (oldR > 1n) throw new Error('Обратный элемент не существует');
    if (oldS < 0n) oldS += m;
    return oldS;
}

function stringToBigInt(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let num = 0n;
    for (let byte of bytes) {
        num = (num << 8n) | BigInt(byte);
    }
    return num;
}

function bigIntToString(num) {
    if (num === 0n) return '';
    const bytes = [];
    let n = num;
    while (n > 0n) {
        bytes.unshift(Number(n & 0xFFn));
        n >>= 8n;
    }
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(bytes));
}