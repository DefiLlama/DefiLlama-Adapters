(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_abool2",
    ()=>_abool2,
    "_abytes2",
    ()=>_abytes2,
    "_validateObject",
    ()=>_validateObject,
    "aInRange",
    ()=>aInRange,
    "abool",
    ()=>abool,
    "asciiToBytes",
    ()=>asciiToBytes,
    "bitGet",
    ()=>bitGet,
    "bitLen",
    ()=>bitLen,
    "bitMask",
    ()=>bitMask,
    "bitSet",
    ()=>bitSet,
    "bytesToNumberBE",
    ()=>bytesToNumberBE,
    "bytesToNumberLE",
    ()=>bytesToNumberLE,
    "copyBytes",
    ()=>copyBytes,
    "createHmacDrbg",
    ()=>createHmacDrbg,
    "ensureBytes",
    ()=>ensureBytes,
    "equalBytes",
    ()=>equalBytes,
    "hexToNumber",
    ()=>hexToNumber,
    "inRange",
    ()=>inRange,
    "isHash",
    ()=>isHash,
    "memoized",
    ()=>memoized,
    "notImplemented",
    ()=>notImplemented,
    "numberToBytesBE",
    ()=>numberToBytesBE,
    "numberToBytesLE",
    ()=>numberToBytesLE,
    "numberToHexUnpadded",
    ()=>numberToHexUnpadded,
    "numberToVarBytesBE",
    ()=>numberToVarBytesBE,
    "validateObject",
    ()=>validateObject
]);
/**
 * Hex, bytes and number utilities.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
;
;
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
function abool(title, value) {
    if (typeof value !== 'boolean') throw new Error(title + ' boolean expected, got ' + value);
}
function _abool2(value, title = '') {
    if (typeof value !== 'boolean') {
        const prefix = title && `"${title}"`;
        throw new Error(prefix + 'expected boolean, got type=' + typeof value);
    }
    return value;
}
function _abytes2(value, length, title = '') {
    const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"])(value);
    const len = value?.length;
    const needsLen = length !== undefined;
    if (!bytes || needsLen && len !== length) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length}` : '';
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(prefix + 'expected Uint8Array' + ofLen + ', got ' + got);
    }
    return value;
}
function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? '0' + hex : hex;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex);
    return hex === '' ? _0n : BigInt('0x' + hex); // Big Endian
}
function bytesToNumberBE(bytes) {
    return hexToNumber((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(bytes));
}
function bytesToNumberLE(bytes) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abytes"])(bytes);
    return hexToNumber((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"])(n.toString(16).padStart(len * 2, '0'));
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
}
function numberToVarBytesBE(n) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"])(numberToHexUnpadded(n));
}
function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === 'string') {
        try {
            res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"])(hex);
        } catch (e) {
            throw new Error(title + ' must be hex string or Uint8Array, cause: ' + e);
        }
    } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"])(hex)) {
        // Uint8Array.from() instead of hash.slice() because node.js Buffer
        // is instance of Uint8Array, and its slice() creates **mutable** copy
        res = Uint8Array.from(hex);
    } else {
        throw new Error(title + ' must be hex string or Uint8Array');
    }
    const len = res.length;
    if (typeof expectedLength === 'number' && len !== expectedLength) throw new Error(title + ' of length ' + expectedLength + ' expected, got ' + len);
    return res;
}
function equalBytes(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for(let i = 0; i < a.length; i++)diff |= a[i] ^ b[i];
    return diff === 0;
}
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
function asciiToBytes(ascii) {
    return Uint8Array.from(ascii, (c, i)=>{
        const charCode = c.charCodeAt(0);
        if (c.length !== 1 || charCode > 127) {
            throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
        }
        return charCode;
    });
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */ // export const utf8ToBytes: typeof utf8ToBytes_ = utf8ToBytes_;
/**
 * Converts bytes to string using UTF8 encoding.
 * @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
 */ // export const bytesToUtf8: typeof bytesToUtf8_ = bytesToUtf8_;
// Is positive bigint
const isPosBig = (n)=>typeof n === 'bigint' && _0n <= n;
function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
    // Why min <= n < max and not a (min < n < max) OR b (min <= n <= max)?
    // consider P=256n, min=0n, max=P
    // - a for min=0 would require -1:          `inRange('x', x, -1n, P)`
    // - b would commonly require subtraction:  `inRange('x', x, 0n, P - 1n)`
    // - our way is the cleanest:               `inRange('x', x, 0n, P)
    if (!inRange(n, min, max)) throw new Error('expected valid ' + title + ': ' + min + ' <= n < ' + max + ', got ' + n);
}
function bitLen(n) {
    let len;
    for(len = 0; n > _0n; n >>= _1n, len += 1);
    return len;
}
function bitGet(n, pos) {
    return n >> BigInt(pos) & _1n;
}
function bitSet(n, pos, value) {
    return n | (value ? _1n : _0n) << BigInt(pos);
}
const bitMask = (n)=>(_1n << BigInt(n)) - _1n;
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== 'number' || hashLen < 2) throw new Error('hashLen must be a number');
    if (typeof qByteLen !== 'number' || qByteLen < 2) throw new Error('qByteLen must be a number');
    if (typeof hmacFn !== 'function') throw new Error('hmacFn must be a function');
    // Step B, Step C: set hashLen to 8*ceil(hlen/8)
    const u8n = (len)=>new Uint8Array(len); // creates Uint8Array
    const u8of = (byte)=>Uint8Array.of(byte); // another shortcut
    let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
    let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
    let i = 0; // Iterations counter, will throw when over 1000
    const reset = ()=>{
        v.fill(1);
        k.fill(0);
        i = 0;
    };
    const h = (...b)=>hmacFn(k, v, ...b); // hmac(k)(v, ...values)
    const reseed = (seed = u8n(0))=>{
        // HMAC-DRBG reseed() function. Steps D-G
        k = h(u8of(0x00), seed); // k = hmac(k || v || 0x00 || seed)
        v = h(); // v = hmac(k || v)
        if (seed.length === 0) return;
        k = h(u8of(0x01), seed); // k = hmac(k || v || 0x01 || seed)
        v = h(); // v = hmac(k || v)
    };
    const gen = ()=>{
        // HMAC-DRBG generate() function
        if (i++ >= 1000) throw new Error('drbg: tried 1000 values');
        let len = 0;
        const out = [];
        while(len < qByteLen){
            v = h();
            const sl = v.slice();
            out.push(sl);
            len += v.length;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(...out);
    };
    const genUntil = (seed, pred)=>{
        reset();
        reseed(seed); // Steps D-G
        let res = undefined; // Step H: grind until k is in [1..n-1]
        while(!(res = pred(gen())))reseed();
        reset();
        return res;
    };
    return genUntil;
}
// Validating curves and fields
const validatorFns = {
    bigint: (val)=>typeof val === 'bigint',
    function: (val)=>typeof val === 'function',
    boolean: (val)=>typeof val === 'boolean',
    string: (val)=>typeof val === 'string',
    stringOrUint8Array: (val)=>typeof val === 'string' || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"])(val),
    isSafeInteger: (val)=>Number.isSafeInteger(val),
    array: (val)=>Array.isArray(val),
    field: (val, object)=>object.Fp.isValid(val),
    hash: (val)=>typeof val === 'function' && Number.isSafeInteger(val.outputLen)
};
function validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional)=>{
        const checkVal = validatorFns[type];
        if (typeof checkVal !== 'function') throw new Error('invalid validator function');
        const val = object[fieldName];
        if (isOptional && val === undefined) return;
        if (!checkVal(val, object)) {
            throw new Error('param ' + String(fieldName) + ' is invalid. Expected ' + type + ', got ' + val);
        }
    };
    for (const [fieldName, type] of Object.entries(validators))checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))checkField(fieldName, type, true);
    return object;
}
function isHash(val) {
    return typeof val === 'function' && Number.isSafeInteger(val.outputLen);
}
function _validateObject(object, fields, optFields = {}) {
    if (!object || typeof object !== 'object') throw new Error('expected valid options object');
    function checkField(fieldName, expectedType, isOpt) {
        const val = object[fieldName];
        if (isOpt && val === undefined) return;
        const current = typeof val;
        if (current !== expectedType || val === null) throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    Object.entries(fields).forEach(([k, v])=>checkField(k, v, false));
    Object.entries(optFields).forEach(([k, v])=>checkField(k, v, true));
}
const notImplemented = ()=>{
    throw new Error('not implemented');
};
function memoized(fn) {
    const map = new WeakMap();
    return (arg, ...args)=>{
        const val = map.get(arg);
        if (val !== undefined) return val;
        const computed = fn(arg, ...args);
        map.set(arg, computed);
        return computed;
    };
} //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aInRange",
    ()=>aInRange,
    "abool",
    ()=>abool,
    "abytes",
    ()=>abytes,
    "anumber",
    ()=>anumber,
    "asciiToBytes",
    ()=>asciiToBytes,
    "bitGet",
    ()=>bitGet,
    "bitLen",
    ()=>bitLen,
    "bitMask",
    ()=>bitMask,
    "bitSet",
    ()=>bitSet,
    "bytesToHex",
    ()=>bytesToHex,
    "bytesToNumberBE",
    ()=>bytesToNumberBE,
    "bytesToNumberLE",
    ()=>bytesToNumberLE,
    "bytesToUtf8",
    ()=>bytesToUtf8,
    "concatBytes",
    ()=>concatBytes,
    "copyBytes",
    ()=>copyBytes,
    "createHmacDrbg",
    ()=>createHmacDrbg,
    "ensureBytes",
    ()=>ensureBytes,
    "equalBytes",
    ()=>equalBytes,
    "hexToBytes",
    ()=>hexToBytes,
    "hexToNumber",
    ()=>hexToNumber,
    "inRange",
    ()=>inRange,
    "isBytes",
    ()=>isBytes,
    "isHash",
    ()=>isHash,
    "memoized",
    ()=>memoized,
    "notImplemented",
    ()=>notImplemented,
    "numberToBytesBE",
    ()=>numberToBytesBE,
    "numberToBytesLE",
    ()=>numberToBytesLE,
    "numberToHexUnpadded",
    ()=>numberToHexUnpadded,
    "numberToVarBytesBE",
    ()=>numberToVarBytesBE,
    "randomBytes",
    ()=>randomBytes,
    "utf8ToBytes",
    ()=>utf8ToBytes,
    "validateObject",
    ()=>validateObject
]);
/**
 * Deprecated module: moved from curves/abstract/utils.js to curves/utils.js
 * @module
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
;
const abytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abytes"];
const anumber = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["anumber"];
const bytesToHex = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"];
const bytesToUtf8 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToUtf8"];
const concatBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"];
const hexToBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"];
const isBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"];
const randomBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomBytes"];
const utf8ToBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"];
const abool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["abool"];
const numberToHexUnpadded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToHexUnpadded"];
const hexToNumber = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hexToNumber"];
const bytesToNumberBE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"];
const bytesToNumberLE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberLE"];
const numberToBytesBE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesBE"];
const numberToBytesLE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesLE"];
const numberToVarBytesBE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToVarBytesBE"];
const ensureBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"];
const equalBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["equalBytes"];
const copyBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["copyBytes"];
const asciiToBytes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asciiToBytes"];
const inRange = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["inRange"];
const aInRange = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["aInRange"];
const bitLen = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitLen"];
const bitGet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitGet"];
const bitSet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitSet"];
const bitMask = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"];
const createHmacDrbg = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createHmacDrbg"];
const notImplemented = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["notImplemented"];
const memoized = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["memoized"];
const validateObject = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateObject"];
const isHash = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isHash"]; //# sourceMappingURL=utils.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Field",
    ()=>Field,
    "FpDiv",
    ()=>FpDiv,
    "FpInvertBatch",
    ()=>FpInvertBatch,
    "FpIsSquare",
    ()=>FpIsSquare,
    "FpLegendre",
    ()=>FpLegendre,
    "FpPow",
    ()=>FpPow,
    "FpSqrt",
    ()=>FpSqrt,
    "FpSqrtEven",
    ()=>FpSqrtEven,
    "FpSqrtOdd",
    ()=>FpSqrtOdd,
    "getFieldBytesLength",
    ()=>getFieldBytesLength,
    "getMinHashLength",
    ()=>getMinHashLength,
    "hashToPrivateScalar",
    ()=>hashToPrivateScalar,
    "invert",
    ()=>invert,
    "isNegativeLE",
    ()=>isNegativeLE,
    "mapHashToField",
    ()=>mapHashToField,
    "mod",
    ()=>mod,
    "nLength",
    ()=>nLength,
    "pow",
    ()=>pow,
    "pow2",
    ()=>pow2,
    "tonelliShanks",
    ()=>tonelliShanks,
    "validateField",
    ()=>validateField
]);
/**
 * Utils for modular division and fields.
 * Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
 * There is no division: it is replaced by modular multiplicative inverse.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
;
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
// prettier-ignore
const _4n = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7);
// prettier-ignore
const _8n = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
    const result = a % b;
    return result >= _0n ? result : b + result;
}
function pow(num, power, modulo) {
    return FpPow(Field(modulo), num, power);
}
function pow2(x, power, modulo) {
    let res = x;
    while(power-- > _0n){
        res *= res;
        res %= modulo;
    }
    return res;
}
function invert(number, modulo) {
    if (number === _0n) throw new Error('invert: expected non-zero number');
    if (modulo <= _0n) throw new Error('invert: expected positive modulus, got ' + modulo);
    // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.
    let a = mod(number, modulo);
    let b = modulo;
    // prettier-ignore
    let x = _0n, y = _1n, u = _1n, v = _0n;
    while(a !== _0n){
        // JIT applies optimization if those two lines follow each other
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        // prettier-ignore
        b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n) throw new Error('invert: does not exist');
    return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n)) throw new Error('Cannot find square root');
}
// Not all roots are possible! Example which will throw:
// const NUM =
// n = 72057594037927816n;
// Fp = Field(BigInt('0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab'));
function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n) / _4n;
    const root = Fp.pow(n, p1div4);
    assertIsSquare(Fp, root, n);
    return root;
}
function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    assertIsSquare(Fp, root, n);
    return root;
}
// Based on RFC9380, Kong algorithm
// prettier-ignore
function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE)); //  1. c1 = sqrt(-1) in F, i.e., (c1^2) == -1 in F
    const c2 = tn(Fp_, c1); //  2. c2 = sqrt(c1) in F, i.e., (c2^2) == c1 in F
    const c3 = tn(Fp_, Fp_.neg(c1)); //  3. c3 = sqrt(-c1) in F, i.e., (c3^2) == -c1 in F
    const c4 = (P + _7n) / _16n; //  4. c4 = (q + 7) / 16        # Integer arithmetic
    return (Fp, n)=>{
        let tv1 = Fp.pow(n, c4); //  1. tv1 = x^c4
        let tv2 = Fp.mul(tv1, c1); //  2. tv2 = c1 * tv1
        const tv3 = Fp.mul(tv1, c2); //  3. tv3 = c2 * tv1
        const tv4 = Fp.mul(tv1, c3); //  4. tv4 = c3 * tv1
        const e1 = Fp.eql(Fp.sqr(tv2), n); //  5.  e1 = (tv2^2) == x
        const e2 = Fp.eql(Fp.sqr(tv3), n); //  6.  e2 = (tv3^2) == x
        tv1 = Fp.cmov(tv1, tv2, e1); //  7. tv1 = CMOV(tv1, tv2, e1)  # Select tv2 if (tv2^2) == x
        tv2 = Fp.cmov(tv4, tv3, e2); //  8. tv2 = CMOV(tv4, tv3, e2)  # Select tv3 if (tv3^2) == x
        const e3 = Fp.eql(Fp.sqr(tv2), n); //  9.  e3 = (tv2^2) == x
        const root = Fp.cmov(tv1, tv2, e3); // 10.  z = CMOV(tv1, tv2, e3)   # Select sqrt from tv1 & tv2
        assertIsSquare(Fp, root, n);
        return root;
    };
}
function tonelliShanks(P) {
    // Initialization (precomputation).
    // Caching initialization could boost perf by 7%.
    if (P < _3n) throw new Error('sqrt is not defined for small field');
    // Factor P - 1 = Q * 2^S, where Q is odd
    let Q = P - _1n;
    let S = 0;
    while(Q % _2n === _0n){
        Q /= _2n;
        S++;
    }
    // Find the first quadratic non-residue Z >= 2
    let Z = _2n;
    const _Fp = Field(P);
    while(FpLegendre(_Fp, Z) === 1){
        // Basic primality test for P. After x iterations, chance of
        // not finding quadratic non-residue is 2^x, so 2^1000.
        if (Z++ > 1000) throw new Error('Cannot find square root: probably non-prime P');
    }
    // Fast-path; usually done before Z, but we do "primality test".
    if (S === 1) return sqrt3mod4;
    // Slow-path
    // TODO: test on Fp2 and others
    let cc = _Fp.pow(Z, Q); // c = z^Q
    const Q1div2 = (Q + _1n) / _2n;
    return function tonelliSlow(Fp, n) {
        if (Fp.is0(n)) return n;
        // Check if n is a quadratic residue using Legendre symbol
        if (FpLegendre(Fp, n) !== 1) throw new Error('Cannot find square root');
        // Initialize variables for the main loop
        let M = S;
        let c = Fp.mul(Fp.ONE, cc); // c = z^Q, move cc from field _Fp into field Fp
        let t = Fp.pow(n, Q); // t = n^Q, first guess at the fudge factor
        let R = Fp.pow(n, Q1div2); // R = n^((Q+1)/2), first guess at the square root
        // Main loop
        // while t != 1
        while(!Fp.eql(t, Fp.ONE)){
            if (Fp.is0(t)) return Fp.ZERO; // if t=0 return R=0
            let i = 1;
            // Find the smallest i >= 1 such that t^(2^i) ≡ 1 (mod P)
            let t_tmp = Fp.sqr(t); // t^(2^1)
            while(!Fp.eql(t_tmp, Fp.ONE)){
                i++;
                t_tmp = Fp.sqr(t_tmp); // t^(2^2)...
                if (i === M) throw new Error('Cannot find square root');
            }
            // Calculate the exponent for b: 2^(M - i - 1)
            const exponent = _1n << BigInt(M - i - 1); // bigint is important
            const b = Fp.pow(c, exponent); // b = 2^(M - i - 1)
            // Update variables
            M = i;
            c = Fp.sqr(b); // c = b^2
            t = Fp.mul(t, c); // t = (t * b^2)
            R = Fp.mul(R, b); // R = R*b
        }
        return R;
    };
}
function FpSqrt(P) {
    // P ≡ 3 (mod 4) => √n = n^((P+1)/4)
    if (P % _4n === _3n) return sqrt3mod4;
    // P ≡ 5 (mod 8) => Atkin algorithm, page 10 of https://eprint.iacr.org/2012/685.pdf
    if (P % _8n === _5n) return sqrt5mod8;
    // P ≡ 9 (mod 16) => Kong algorithm, page 11 of https://eprint.iacr.org/2012/685.pdf (algorithm 4)
    if (P % _16n === _9n) return sqrt9mod16(P);
    // Tonelli-Shanks algorithm
    return tonelliShanks(P);
}
const isNegativeLE = (num, modulo)=>(mod(num, modulo) & _1n) === _1n;
// prettier-ignore
const FIELD_FIELDS = [
    'create',
    'isValid',
    'is0',
    'neg',
    'inv',
    'sqrt',
    'sqr',
    'eql',
    'add',
    'sub',
    'mul',
    'pow',
    'div',
    'addN',
    'subN',
    'mulN',
    'sqrN'
];
function validateField(field) {
    const initial = {
        ORDER: 'bigint',
        MASK: 'bigint',
        BYTES: 'number',
        BITS: 'number'
    };
    const opts = FIELD_FIELDS.reduce((map, val)=>{
        map[val] = 'function';
        return map;
    }, initial);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_validateObject"])(field, opts);
    // const max = 16384;
    // if (field.BYTES < 1 || field.BYTES > max) throw new Error('invalid field');
    // if (field.BITS < 1 || field.BITS > 8 * max) throw new Error('invalid field');
    return field;
}
function FpPow(Fp, num, power) {
    if (power < _0n) throw new Error('invalid exponent, negatives unsupported');
    if (power === _0n) return Fp.ONE;
    if (power === _1n) return num;
    let p = Fp.ONE;
    let d = num;
    while(power > _0n){
        if (power & _1n) p = Fp.mul(p, d);
        d = Fp.sqr(d);
        power >>= _1n;
    }
    return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : undefined);
    // Walk from first to last, multiply them by each other MOD p
    const multipliedAcc = nums.reduce((acc, num, i)=>{
        if (Fp.is0(num)) return acc;
        inverted[i] = acc;
        return Fp.mul(acc, num);
    }, Fp.ONE);
    // Invert last element
    const invertedAcc = Fp.inv(multipliedAcc);
    // Walk from last to first, multiply them by inverted each other MOD p
    nums.reduceRight((acc, num, i)=>{
        if (Fp.is0(num)) return acc;
        inverted[i] = Fp.mul(acc, inverted[i]);
        return Fp.mul(acc, num);
    }, invertedAcc);
    return inverted;
}
function FpDiv(Fp, lhs, rhs) {
    return Fp.mul(lhs, typeof rhs === 'bigint' ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
}
function FpLegendre(Fp, n) {
    // We can use 3rd argument as optional cache of this value
    // but seems unneeded for now. The operation is very fast.
    const p1mod2 = (Fp.ORDER - _1n) / _2n;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no) throw new Error('invalid Legendre symbol result');
    return yes ? 1 : zero ? 0 : -1;
}
function FpIsSquare(Fp, n) {
    const l = FpLegendre(Fp, n);
    return l === 1;
}
function nLength(n, nBitLength) {
    // Bit size, byte size of CURVE.n
    if (nBitLength !== undefined) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["anumber"])(nBitLength);
    const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return {
        nBitLength: _nBitLength,
        nByteLength
    };
}
function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
    if (ORDER <= _0n) throw new Error('invalid field: expected ORDER > 0, got ' + ORDER);
    let _nbitLength = undefined;
    let _sqrt = undefined;
    let modFromBytes = false;
    let allowedLengths = undefined;
    if (typeof bitLenOrOpts === 'object' && bitLenOrOpts != null) {
        if (opts.sqrt || isLE) throw new Error('cannot specify opts in two arguments');
        const _opts = bitLenOrOpts;
        if (_opts.BITS) _nbitLength = _opts.BITS;
        if (_opts.sqrt) _sqrt = _opts.sqrt;
        if (typeof _opts.isLE === 'boolean') isLE = _opts.isLE;
        if (typeof _opts.modFromBytes === 'boolean') modFromBytes = _opts.modFromBytes;
        allowedLengths = _opts.allowedLengths;
    } else {
        if (typeof bitLenOrOpts === 'number') _nbitLength = bitLenOrOpts;
        if (opts.sqrt) _sqrt = opts.sqrt;
    }
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
    if (BYTES > 2048) throw new Error('invalid field: expected ORDER of <= 2048 bytes');
    let sqrtP; // cached sqrtP
    const f = Object.freeze({
        ORDER,
        isLE,
        BITS,
        BYTES,
        MASK: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(BITS),
        ZERO: _0n,
        ONE: _1n,
        allowedLengths: allowedLengths,
        create: (num)=>mod(num, ORDER),
        isValid: (num)=>{
            if (typeof num !== 'bigint') throw new Error('invalid field element: expected bigint, got ' + typeof num);
            return _0n <= num && num < ORDER; // 0 is valid element, but it's not invertible
        },
        is0: (num)=>num === _0n,
        // is valid and invertible
        isValidNot0: (num)=>!f.is0(num) && f.isValid(num),
        isOdd: (num)=>(num & _1n) === _1n,
        neg: (num)=>mod(-num, ORDER),
        eql: (lhs, rhs)=>lhs === rhs,
        sqr: (num)=>mod(num * num, ORDER),
        add: (lhs, rhs)=>mod(lhs + rhs, ORDER),
        sub: (lhs, rhs)=>mod(lhs - rhs, ORDER),
        mul: (lhs, rhs)=>mod(lhs * rhs, ORDER),
        pow: (num, power)=>FpPow(f, num, power),
        div: (lhs, rhs)=>mod(lhs * invert(rhs, ORDER), ORDER),
        // Same as above, but doesn't normalize
        sqrN: (num)=>num * num,
        addN: (lhs, rhs)=>lhs + rhs,
        subN: (lhs, rhs)=>lhs - rhs,
        mulN: (lhs, rhs)=>lhs * rhs,
        inv: (num)=>invert(num, ORDER),
        sqrt: _sqrt || ((n)=>{
            if (!sqrtP) sqrtP = FpSqrt(ORDER);
            return sqrtP(f, n);
        }),
        toBytes: (num)=>isLE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesLE"])(num, BYTES) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesBE"])(num, BYTES),
        fromBytes: (bytes, skipValidation = true)=>{
            if (allowedLengths) {
                if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
                    throw new Error('Field.fromBytes: expected ' + allowedLengths + ' bytes, got ' + bytes.length);
                }
                const padded = new Uint8Array(BYTES);
                // isLE add 0 to right, !isLE to the left.
                padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
                bytes = padded;
            }
            if (bytes.length !== BYTES) throw new Error('Field.fromBytes: expected ' + BYTES + ' bytes, got ' + bytes.length);
            let scalar = isLE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberLE"])(bytes) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"])(bytes);
            if (modFromBytes) scalar = mod(scalar, ORDER);
            if (!skipValidation) {
                if (!f.isValid(scalar)) throw new Error('invalid field element: outside of range 0..ORDER');
            }
            // NOTE: we don't validate scalar here, please use isValid. This done such way because some
            // protocol may allow non-reduced scalar that reduced later or changed some other way.
            return scalar;
        },
        // TODO: we don't need it here, move out to separate fn
        invertBatch: (lst)=>FpInvertBatch(f, lst),
        // We can't move this out because Fp6, Fp12 implement it
        // and it's unclear what to return in there.
        cmov: (a, b, c)=>c ? b : a
    });
    return Object.freeze(f);
}
function FpSqrtOdd(Fp, elm) {
    if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? root : Fp.neg(root);
}
function FpSqrtEven(Fp, elm) {
    if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? Fp.neg(root) : root;
}
function hashToPrivateScalar(hash, groupOrder, isLE = false) {
    hash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('privateHash', hash);
    const hashLen = hash.length;
    const minLen = nLength(groupOrder).nByteLength + 8;
    if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error('hashToPrivateScalar: expected ' + minLen + '-1024 bytes of input, got ' + hashLen);
    const num = isLE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberLE"])(hash) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"])(hash);
    return mod(num, groupOrder - _1n) + _1n;
}
function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== 'bigint') throw new Error('field order must be bigint');
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
    if (len < 16 || len < minLen || len > 1024) throw new Error('expected ' + minLen + '-1024 bytes of input, got ' + len);
    const num = isLE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberLE"])(key) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"])(key);
    // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
    const reduced = mod(num, fieldOrder - _1n) + _1n;
    return isLE ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesLE"])(reduced, fieldLen) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesBE"])(reduced, fieldLen);
} //# sourceMappingURL=modular.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/curve.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_createCurveFields",
    ()=>_createCurveFields,
    "mulEndoUnsafe",
    ()=>mulEndoUnsafe,
    "negateCt",
    ()=>negateCt,
    "normalizeZ",
    ()=>normalizeZ,
    "pippenger",
    ()=>pippenger,
    "precomputeMSMUnsafe",
    ()=>precomputeMSMUnsafe,
    "validateBasic",
    ()=>validateBasic,
    "wNAF",
    ()=>wNAF
]);
/**
 * Methods for elliptic curve multiplication by scalars.
 * Contains wNAF, pippenger.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)");
;
;
const _0n = BigInt(0);
const _1n = BigInt(1);
function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
}
function normalizeZ(c, points) {
    const invertedZs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FpInvertBatch"])(c.Fp, points.map((p)=>p.Z));
    return points.map((p, i)=>c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits) throw new Error('invalid window size, expected [1..' + bits + '], got W=' + W);
}
function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1; // W=8 33. Not 32, because we skip zero
    const windowSize = 2 ** (W - 1); // W=8 128. Not 256, because we skip zero
    const maxNumber = 2 ** W; // W=8 256
    const mask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(W); // W=8 255 == mask 0b11111111
    const shiftBy = BigInt(W); // W=8 8
    return {
        windows,
        windowSize,
        mask,
        maxNumber,
        shiftBy
    };
}
function calcOffsets(n, window, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask); // extract W bits.
    let nextN = n >> shiftBy; // shift number by W bits.
    // What actually happens here:
    // const highestBit = Number(mask ^ (mask >> 1n));
    // let wbits2 = wbits - 1; // skip zero
    // if (wbits2 & highestBit) { wbits2 ^= Number(mask); // (~);
    // split if bits > max: +224 => 256-32
    if (wbits > windowSize) {
        // we skip zero, which means instead of `>= size-1`, we do `> size`
        wbits -= maxNumber; // -32, can be maxNumber - wbits, but then we need to set isNeg here.
        nextN += _1n; // +256 (carry)
    }
    const offsetStart = window * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1; // -1 because we skip zero
    const isZero = wbits === 0; // is current window slice a 0?
    const isNeg = wbits < 0; // is current window slice negative?
    const isNegF = window % 2 !== 0; // fake random statement for noise
    const offsetF = offsetStart; // fake offset for noise
    return {
        nextN,
        offset,
        isZero,
        isNeg,
        isNegF,
        offsetF
    };
}
function validateMSMPoints(points, c) {
    if (!Array.isArray(points)) throw new Error('array expected');
    points.forEach((p, i)=>{
        if (!(p instanceof c)) throw new Error('invalid point at index ' + i);
    });
}
function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars)) throw new Error('array of scalars expected');
    scalars.forEach((s, i)=>{
        if (!field.isValid(s)) throw new Error('invalid scalar at index ' + i);
    });
}
// Since points in different groups cannot be equal (different object constructor),
// we can have single place to store precomputes.
// Allows to make points frozen / immutable.
const pointPrecomputes = new WeakMap();
const pointWindowSizes = new WeakMap();
function getW(P) {
    // To disable precomputes:
    // return 1;
    return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
    if (n !== _0n) throw new Error('invalid wNAF');
}
class wNAF {
    // Parametrized with a given Point class (not individual point)
    constructor(Point, bits){
        this.BASE = Point.BASE;
        this.ZERO = Point.ZERO;
        this.Fn = Point.Fn;
        this.bits = bits;
    }
    // non-const time multiplication ladder
    _unsafeLadder(elm, n, p = this.ZERO) {
        let d = elm;
        while(n > _0n){
            if (n & _1n) p = p.add(d);
            d = d.double();
            n >>= _1n;
        }
        return p;
    }
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param point Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */ precomputeWindow(point, W) {
        const { windows, windowSize } = calcWOpts(W, this.bits);
        const points = [];
        let p = point;
        let base = p;
        for(let window = 0; window < windows; window++){
            base = p;
            points.push(base);
            // i=1, bc we skip 0
            for(let i = 1; i < windowSize; i++){
                base = base.add(p);
                points.push(base);
            }
            p = base.double();
        }
        return points;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */ wNAF(W, precomputes, n) {
        // Scalar should be smaller than field order
        if (!this.Fn.isValid(n)) throw new Error('invalid scalar');
        // Accumulators
        let p = this.ZERO;
        let f = this.BASE;
        // This code was first written with assumption that 'f' and 'p' will never be infinity point:
        // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
        // there is negate now: it is possible that negated element from low value
        // would be the same as high element, which will create carry into next window.
        // It's not obvious how this can fail, but still worth investigating later.
        const wo = calcWOpts(W, this.bits);
        for(let window = 0; window < wo.windows; window++){
            // (n === _0n) is handled and not early-exited. isEven and offsetF are used for noise
            const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
            n = nextN;
            if (isZero) {
                // bits are 0: add garbage to fake point
                // Important part for const-time getPublicKey: add random "noise" point to f.
                f = f.add(negateCt(isNegF, precomputes[offsetF]));
            } else {
                // bits are 1: add to result point
                p = p.add(negateCt(isNeg, precomputes[offset]));
            }
        }
        assert0(n);
        // Return both real and fake points: JIT won't eliminate f.
        // At this point there is a way to F be infinity-point even if p is not,
        // which makes it less const-time: around 1 bigint multiply.
        return {
            p,
            f
        };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */ wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for(let window = 0; window < wo.windows; window++){
            if (n === _0n) break; // Early-exit, skip 0 value
            const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
            n = nextN;
            if (isZero) {
                continue;
            } else {
                const item = precomputes[offset];
                acc = acc.add(isNeg ? item.negate() : item); // Re-using acc allows to save adds in MSM
            }
        }
        assert0(n);
        return acc;
    }
    getPrecomputes(W, point, transform) {
        // Calculate precomputes on a first run, reuse them after
        let comp = pointPrecomputes.get(point);
        if (!comp) {
            comp = this.precomputeWindow(point, W);
            if (W !== 1) {
                // Doing transform outside of if brings 15% perf hit
                if (typeof transform === 'function') comp = transform(comp);
                pointPrecomputes.set(point, comp);
            }
        }
        return comp;
    }
    cached(point, scalar, transform) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
        const W = getW(point);
        if (W === 1) return this._unsafeLadder(point, scalar, prev); // For W=1 ladder is ~x2 faster
        return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(P, W) {
        validateW(W, this.bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
    }
    hasCache(elm) {
        return getW(elm) !== 1;
    }
}
function mulEndoUnsafe(Point, point, k1, k2) {
    let acc = point;
    let p1 = Point.ZERO;
    let p2 = Point.ZERO;
    while(k1 > _0n || k2 > _0n){
        if (k1 & _1n) p1 = p1.add(acc);
        if (k2 & _1n) p2 = p2.add(acc);
        acc = acc.double();
        k1 >>= _1n;
        k2 >>= _1n;
    }
    return {
        p1,
        p2
    };
}
function pippenger(c, fieldN, points, scalars) {
    // If we split scalars by some window (let's say 8 bits), every chunk will only
    // take 256 buckets even if there are 4096 scalars, also re-uses double.
    // TODO:
    // - https://eprint.iacr.org/2024/750.pdf
    // - https://tches.iacr.org/index.php/TCHES/article/view/10287
    // 0 is accepted in scalars
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength) throw new Error('arrays of points and scalars must have equal length');
    // if (plength === 0) throw new Error('array must be of length >= 2');
    const zero = c.ZERO;
    const wbits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitLen"])(BigInt(plength));
    let windowSize = 1; // bits
    if (wbits > 12) windowSize = wbits - 3;
    else if (wbits > 4) windowSize = wbits - 2;
    else if (wbits > 0) windowSize = 2;
    const MASK = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero); // +1 for zero array
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for(let i = lastBits; i >= 0; i -= windowSize){
        buckets.fill(zero);
        for(let j = 0; j < slength; j++){
            const scalar = scalars[j];
            const wbits = Number(scalar >> BigInt(i) & MASK);
            buckets[wbits] = buckets[wbits].add(points[j]);
        }
        let resI = zero; // not using this will do small speed-up, but will lose ct
        // Skip first bucket, because it is zero
        for(let j = buckets.length - 1, sumI = zero; j > 0; j--){
            sumI = sumI.add(buckets[j]);
            resI = resI.add(sumI);
        }
        sum = sum.add(resI);
        if (i !== 0) for(let j = 0; j < windowSize; j++)sum = sum.double();
    }
    return sum;
}
function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
    /**
     * Performance Analysis of Window-based Precomputation
     *
     * Base Case (256-bit scalar, 8-bit window):
     * - Standard precomputation requires:
     *   - 31 additions per scalar × 256 scalars = 7,936 ops
     *   - Plus 255 summary additions = 8,191 total ops
     *   Note: Summary additions can be optimized via accumulator
     *
     * Chunked Precomputation Analysis:
     * - Using 32 chunks requires:
     *   - 255 additions per chunk
     *   - 256 doublings
     *   - Total: (255 × 32) + 256 = 8,416 ops
     *
     * Memory Usage Comparison:
     * Window Size | Standard Points | Chunked Points
     * ------------|-----------------|---------------
     *     4-bit   |     520         |      15
     *     8-bit   |    4,224        |     255
     *    10-bit   |   13,824        |   1,023
     *    16-bit   |  557,056        |  65,535
     *
     * Key Advantages:
     * 1. Enables larger window sizes due to reduced memory overhead
     * 2. More efficient for smaller scalar counts:
     *    - 16 chunks: (16 × 255) + 256 = 4,336 ops
     *    - ~2x faster than standard 8,191 ops
     *
     * Limitations:
     * - Not suitable for plain precomputes (requires 256 constant doublings)
     * - Performance degrades with larger scalar counts:
     *   - Optimal for ~256 scalars
     *   - Less efficient for 4096+ scalars (Pippenger preferred)
     */ validateW(windowSize, fieldN.BITS);
    validateMSMPoints(points, c);
    const zero = c.ZERO;
    const tableSize = 2 ** windowSize - 1; // table size (without zero)
    const chunks = Math.ceil(fieldN.BITS / windowSize); // chunks of item
    const MASK = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(windowSize);
    const tables = points.map((p)=>{
        const res = [];
        for(let i = 0, acc = p; i < tableSize; i++){
            res.push(acc);
            acc = acc.add(p);
        }
        return res;
    });
    return (scalars)=>{
        validateMSMScalars(scalars, fieldN);
        if (scalars.length > points.length) throw new Error('array of scalars must be smaller than array of points');
        let res = zero;
        for(let i = 0; i < chunks; i++){
            // No need to double if accumulator is still zero.
            if (res !== zero) for(let j = 0; j < windowSize; j++)res = res.double();
            const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
            for(let j = 0; j < scalars.length; j++){
                const n = scalars[j];
                const curr = Number(n >> shiftBy & MASK);
                if (!curr) continue; // skip zero scalars chunks
                res = res.add(tables[j][curr - 1]);
            }
        }
        return res;
    };
}
function validateBasic(curve) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateField"])(curve.Fp);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateObject"])(curve, {
        n: 'bigint',
        h: 'bigint',
        Gx: 'field',
        Gy: 'field'
    }, {
        nBitLength: 'isSafeInteger',
        nByteLength: 'isSafeInteger'
    });
    // Set defaults
    return Object.freeze({
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nLength"])(curve.n, curve.nBitLength),
        ...curve,
        ...{
            p: curve.Fp.ORDER
        }
    });
}
function createField(order, field, isLE) {
    if (field) {
        if (field.ORDER !== order) throw new Error('Field.ORDER must match order: Fp == p, Fn == n');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateField"])(field);
        return field;
    } else {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(order, {
            isLE
        });
    }
}
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (FpFnLE === undefined) FpFnLE = type === 'edwards';
    if (!CURVE || typeof CURVE !== 'object') throw new Error(`expected valid ${type} CURVE object`);
    for (const p of [
        'p',
        'n',
        'h'
    ]){
        const val = CURVE[p];
        if (!(typeof val === 'bigint' && val > _0n)) throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === 'weierstrass' ? 'b' : 'd';
    const params = [
        'Gx',
        'Gy',
        'a',
        _b
    ];
    for (const p of params){
        // @ts-ignore
        if (!Fp.isValid(CURVE[p])) throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return {
        CURVE,
        Fp,
        Fn
    };
} //# sourceMappingURL=curve.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DER",
    ()=>DER,
    "DERErr",
    ()=>DERErr,
    "SWUFpSqrtRatio",
    ()=>SWUFpSqrtRatio,
    "_legacyHelperEquat",
    ()=>_legacyHelperEquat,
    "_normFnElement",
    ()=>_normFnElement,
    "_splitEndoScalar",
    ()=>_splitEndoScalar,
    "ecdh",
    ()=>ecdh,
    "ecdsa",
    ()=>ecdsa,
    "mapToCurveSimpleSWU",
    ()=>mapToCurveSimpleSWU,
    "weierstrass",
    ()=>weierstrass,
    "weierstrassN",
    ()=>weierstrassN,
    "weierstrassPoints",
    ()=>weierstrassPoints
]);
/**
 * Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
 *
 * ### Design rationale for types
 *
 * * Interaction between classes from different curves should fail:
 *   `k256.Point.BASE.add(p256.Point.BASE)`
 * * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
 * * Different calls of `curve()` would return different classes -
 *   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
 *   it won't affect others
 *
 * TypeScript can't infer types for classes created inside a function. Classes is one instance
 * of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
 * unique type for every function call.
 *
 * We can use generic types via some param, like curve opts, but that would:
 *     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
 *     which is hard to debug.
 *     2. Params can be generic and we can't enforce them to be constant value:
 *     if somebody creates curve from non-constant params,
 *     it would be allowed to interact with other curves with non-constant params
 *
 * @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$hmac$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/hmac.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/curve.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)");
;
;
;
;
;
// We construct basis in such way that den is always positive and equals n, but num sign depends on basis (not on secret value)
const divNearest = (num, den)=>(num + (num >= 0 ? den : -den) / _2n) / den;
function _splitEndoScalar(k, basis, n) {
    // Split scalar into two such that part is ~half bits: `abs(part) < sqrt(N)`
    // Since part can be negative, we need to do this on point.
    // TODO: verifyScalar function which consumes lambda
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    // |k1|/|k2| is < sqrt(N), but can be negative.
    // If we do `k1 mod N`, we'll get big scalar (`> sqrt(N)`): so, we do cheaper negation instead.
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n;
    const k2neg = k2 < _0n;
    if (k1neg) k1 = -k1;
    if (k2neg) k2 = -k2;
    // Double check that resulting scalar less than half bits of N: otherwise wNAF will fail.
    // This should only happen on wrong basises. Also, math inside is too complex and I don't trust it.
    const MAX_NUM = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(Math.ceil((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitLen"])(n) / 2)) + _1n; // Half bits of N
    if (k1 < _0n || k1 >= MAX_NUM || k2 < _0n || k2 >= MAX_NUM) {
        throw new Error('splitScalar (endomorphism): failed, k=' + k);
    }
    return {
        k1neg,
        k1,
        k2neg,
        k2
    };
}
function validateSigFormat(format) {
    if (![
        'compact',
        'recovered',
        'der'
    ].includes(format)) throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format;
}
function validateSigOpts(opts, def) {
    const optsn = {};
    for (let optName of Object.keys(def)){
        // @ts-ignore
        optsn[optName] = opts[optName] === undefined ? def[optName] : opts[optName];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abool2"])(optsn.lowS, 'lowS');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abool2"])(optsn.prehash, 'prehash');
    if (optsn.format !== undefined) validateSigFormat(optsn.format);
    return optsn;
}
class DERErr extends Error {
    constructor(m = ''){
        super(m);
    }
}
const DER = {
    // asn.1 DER encoding utils
    Err: DERErr,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
        encode: (tag, data)=>{
            const { Err: E } = DER;
            if (tag < 0 || tag > 256) throw new E('tlv.encode: wrong tag');
            if (data.length & 1) throw new E('tlv.encode: unpadded data');
            const dataLen = data.length / 2;
            const len = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToHexUnpadded"])(dataLen);
            if (len.length / 2 & 128) throw new E('tlv.encode: long form length too big');
            // length of length with long form flag
            const lenLen = dataLen > 127 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToHexUnpadded"])(len.length / 2 | 128) : '';
            const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToHexUnpadded"])(tag);
            return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode (tag, data) {
            const { Err: E } = DER;
            let pos = 0;
            if (tag < 0 || tag > 256) throw new E('tlv.encode: wrong tag');
            if (data.length < 2 || data[pos++] !== tag) throw new E('tlv.decode: wrong tlv');
            const first = data[pos++];
            const isLong = !!(first & 128); // First bit of first length byte is flag for short/long form
            let length = 0;
            if (!isLong) length = first;
            else {
                // Long form: [longFlag(1bit), lengthLength(7bit), length (BE)]
                const lenLen = first & 127;
                if (!lenLen) throw new E('tlv.decode(long): indefinite length not supported');
                if (lenLen > 4) throw new E('tlv.decode(long): byte length is too big'); // this will overflow u32 in js
                const lengthBytes = data.subarray(pos, pos + lenLen);
                if (lengthBytes.length !== lenLen) throw new E('tlv.decode: length bytes not complete');
                if (lengthBytes[0] === 0) throw new E('tlv.decode(long): zero leftmost byte');
                for (const b of lengthBytes)length = length << 8 | b;
                pos += lenLen;
                if (length < 128) throw new E('tlv.decode(long): not minimal encoding');
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length) throw new E('tlv.decode: wrong value length');
            return {
                v,
                l: data.subarray(pos + length)
            };
        }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
        encode (num) {
            const { Err: E } = DER;
            if (num < _0n) throw new E('integer: negative integers are not allowed');
            let hex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToHexUnpadded"])(num);
            // Pad with zero byte if negative flag is present
            if (Number.parseInt(hex[0], 16) & 0b1000) hex = '00' + hex;
            if (hex.length & 1) throw new E('unexpected DER parsing assertion: unpadded hex');
            return hex;
        },
        decode (data) {
            const { Err: E } = DER;
            if (data[0] & 128) throw new E('invalid signature integer: negative');
            if (data[0] === 0x00 && !(data[1] & 128)) throw new E('invalid signature integer: unnecessary leading zero');
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"])(data);
        }
    },
    toSig (hex) {
        // parse DER signature
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('signature', hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(0x30, data);
        if (seqLeftBytes.length) throw new E('invalid signature: left bytes after parsing');
        const { v: rBytes, l: rLeftBytes } = tlv.decode(0x02, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(0x02, rLeftBytes);
        if (sLeftBytes.length) throw new E('invalid signature: left bytes after parsing');
        return {
            r: int.decode(rBytes),
            s: int.decode(sBytes)
        };
    },
    hexFromSig (sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(0x02, int.encode(sig.r));
        const ss = tlv.encode(0x02, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(0x30, seq);
    }
};
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3), _4n = BigInt(4);
function _normFnElement(Fn, key) {
    const { BYTES: expected } = Fn;
    let num;
    if (typeof key === 'bigint') {
        num = key;
    } else {
        let bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('private key', key);
        try {
            num = Fn.fromBytes(bytes);
        } catch (error) {
            throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
        }
    }
    if (!Fn.isValidNot0(num)) throw new Error('invalid private key: out of range [1..N-1]');
    return num;
}
function weierstrassN(params, extraOpts = {}) {
    const validated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_createCurveFields"])('weierstrass', params, extraOpts);
    const { Fp, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_validateObject"])(extraOpts, {}, {
        allowInfinityPoint: 'boolean',
        clearCofactor: 'function',
        isTorsionFree: 'function',
        fromBytes: 'function',
        toBytes: 'function',
        endo: 'object',
        wrapPrivateKey: 'boolean'
    });
    const { endo } = extraOpts;
    if (endo) {
        // validateObject(endo, { beta: 'bigint', splitScalar: 'function' });
        if (!Fp.is0(CURVE.a) || typeof endo.beta !== 'bigint' || !Array.isArray(endo.basises)) {
            throw new Error('invalid endo: expected "beta": bigint and "basises": array');
        }
    }
    const lengths = getWLengths(Fp, Fn);
    function assertCompressionIsSupported() {
        if (!Fp.isOdd) throw new Error('compression is not supported: Field does not have .isOdd()');
    }
    // Implements IEEE P1363 point encoding
    function pointToBytes(_c, point, isCompressed) {
        const { x, y } = point.toAffine();
        const bx = Fp.toBytes(x);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abool2"])(isCompressed, 'isCompressed');
        if (isCompressed) {
            assertCompressionIsSupported();
            const hasEvenY = !Fp.isOdd(y);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(pprefix(hasEvenY), bx);
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(Uint8Array.of(0x04), bx, Fp.toBytes(y));
        }
    }
    function pointFromBytes(bytes) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(bytes, undefined, 'Point');
        const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths; // e.g. for 32-byte: 33, 65
        const length = bytes.length;
        const head = bytes[0];
        const tail = bytes.subarray(1);
        // No actual validation is done here: use .assertValidity()
        if (length === comp && (head === 0x02 || head === 0x03)) {
            const x = Fp.fromBytes(tail);
            if (!Fp.isValid(x)) throw new Error('bad point: is not on curve, wrong x');
            const y2 = weierstrassEquation(x); // y² = x³ + ax + b
            let y;
            try {
                y = Fp.sqrt(y2); // y = y² ^ (p+1)/4
            } catch (sqrtError) {
                const err = sqrtError instanceof Error ? ': ' + sqrtError.message : '';
                throw new Error('bad point: is not on curve, sqrt error' + err);
            }
            assertCompressionIsSupported();
            const isYOdd = Fp.isOdd(y); // (y & _1n) === _1n;
            const isHeadOdd = (head & 1) === 1; // ECDSA-specific
            if (isHeadOdd !== isYOdd) y = Fp.neg(y);
            return {
                x,
                y
            };
        } else if (length === uncomp && head === 0x04) {
            // TODO: more checks
            const L = Fp.BYTES;
            const x = Fp.fromBytes(tail.subarray(0, L));
            const y = Fp.fromBytes(tail.subarray(L, L * 2));
            if (!isValidXY(x, y)) throw new Error('bad point: is not on curve');
            return {
                x,
                y
            };
        } else {
            throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
        }
    }
    const encodePoint = extraOpts.toBytes || pointToBytes;
    const decodePoint = extraOpts.fromBytes || pointFromBytes;
    function weierstrassEquation(x) {
        const x2 = Fp.sqr(x); // x * x
        const x3 = Fp.mul(x2, x); // x² * x
        return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b); // x³ + a * x + b
    }
    // TODO: move top-level
    /** Checks whether equation holds for given x, y: y² == x³ + ax + b */ function isValidXY(x, y) {
        const left = Fp.sqr(y); // y²
        const right = weierstrassEquation(x); // x³ + ax + b
        return Fp.eql(left, right);
    }
    // Validate whether the passed curve params are valid.
    // Test 1: equation y² = x³ + ax + b should work for generator point.
    if (!isValidXY(CURVE.Gx, CURVE.Gy)) throw new Error('bad curve params: generator point');
    // Test 2: discriminant Δ part should be non-zero: 4a³ + 27b² != 0.
    // Guarantees curve is genus-1, smooth (non-singular).
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2))) throw new Error('bad curve params: a or b');
    /** Asserts coordinate is valid: 0 <= n < Fp.ORDER. */ function acoord(title, n, banZero = false) {
        if (!Fp.isValid(n) || banZero && Fp.is0(n)) throw new Error(`bad point coordinate ${title}`);
        return n;
    }
    function aprjpoint(other) {
        if (!(other instanceof Point)) throw new Error('ProjectivePoint expected');
    }
    function splitEndoScalarN(k) {
        if (!endo || !endo.basises) throw new Error('no endo');
        return _splitEndoScalar(k, endo.basises, Fn.ORDER);
    }
    // Memoized toAffine / validity check. They are heavy. Points are immutable.
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (X, Y, Z) ∋ (x=X/Z, y=Y/Z)
    const toAffineMemo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["memoized"])((p, iz)=>{
        const { X, Y, Z } = p;
        // Fast-path for normalized points
        if (Fp.eql(Z, Fp.ONE)) return {
            x: X,
            y: Y
        };
        const is0 = p.is0();
        // If invZ was 0, we return zero point. However we still want to execute
        // all operations, so we replace invZ with a random number, 1.
        if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(Z);
        const x = Fp.mul(X, iz);
        const y = Fp.mul(Y, iz);
        const zz = Fp.mul(Z, iz);
        if (is0) return {
            x: Fp.ZERO,
            y: Fp.ZERO
        };
        if (!Fp.eql(zz, Fp.ONE)) throw new Error('invZ was invalid');
        return {
            x,
            y
        };
    });
    // NOTE: on exception this will crash 'cached' and no value will be set.
    // Otherwise true will be return
    const assertValidMemo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["memoized"])((p)=>{
        if (p.is0()) {
            // (0, 1, 0) aka ZERO is invalid in most contexts.
            // In BLS, ZERO can be serialized, so we allow it.
            // (0, 0, 0) is invalid representation of ZERO.
            if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y)) return;
            throw new Error('bad point: ZERO');
        }
        // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`
        const { x, y } = p.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error('bad point: x or y not field elements');
        if (!isValidXY(x, y)) throw new Error('bad point: equation left != right');
        if (!p.isTorsionFree()) throw new Error('bad point: not in prime-order subgroup');
        return true;
    });
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
        k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
        k1p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["negateCt"])(k1neg, k1p);
        k2p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["negateCt"])(k2neg, k2p);
        return k1p.add(k2p);
    }
    /**
     * Projective Point works in 3d / projective (homogeneous) coordinates:(X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * Default Point works in 2d / affine coordinates: (x, y).
     * We're doing calculations in projective, because its operations don't require costly inversion.
     */ class Point {
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ constructor(X, Y, Z){
            this.X = acoord('x', X);
            this.Y = acoord('y', Y, true);
            this.Z = acoord('z', Z);
            Object.freeze(this);
        }
        static CURVE() {
            return CURVE;
        }
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ static fromAffine(p) {
            const { x, y } = p || {};
            if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error('invalid affine point');
            if (p instanceof Point) throw new Error('projective point not allowed');
            // (0, 0) would've produced (0, 0, 1) - instead, we need (0, 1, 0)
            if (Fp.is0(x) && Fp.is0(y)) return Point.ZERO;
            return new Point(x, y, Fp.ONE);
        }
        static fromBytes(bytes) {
            const P = Point.fromAffine(decodePoint((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(bytes, undefined, 'point')));
            P.assertValidity();
            return P;
        }
        static fromHex(hex) {
            return Point.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('pointHex', hex));
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        /**
         *
         * @param windowSize
         * @param isLazy true will defer table computation until the first multiplication
         * @returns
         */ precompute(windowSize = 8, isLazy = true) {
            wnaf.createCache(this, windowSize);
            if (!isLazy) this.multiply(_3n); // random number
            return this;
        }
        // TODO: return `this`
        /** A point on curve is valid if it conforms to equation. */ assertValidity() {
            assertValidMemo(this);
        }
        hasEvenY() {
            const { y } = this.toAffine();
            if (!Fp.isOdd) throw new Error("Field doesn't support isOdd");
            return !Fp.isOdd(y);
        }
        /** Compare one point to another. */ equals(other) {
            aprjpoint(other);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            const { X: X2, Y: Y2, Z: Z2 } = other;
            const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
            const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
            return U1 && U2;
        }
        /** Flips point to one corresponding to (x, -y) in Affine coordinates. */ negate() {
            return new Point(this.X, Fp.neg(this.Y), this.Z);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
            const { a, b } = CURVE;
            const b3 = Fp.mul(b, _3n);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            let t0 = Fp.mul(X1, X1); // step 1
            let t1 = Fp.mul(Y1, Y1);
            let t2 = Fp.mul(Z1, Z1);
            let t3 = Fp.mul(X1, Y1);
            t3 = Fp.add(t3, t3); // step 5
            Z3 = Fp.mul(X1, Z1);
            Z3 = Fp.add(Z3, Z3);
            X3 = Fp.mul(a, Z3);
            Y3 = Fp.mul(b3, t2);
            Y3 = Fp.add(X3, Y3); // step 10
            X3 = Fp.sub(t1, Y3);
            Y3 = Fp.add(t1, Y3);
            Y3 = Fp.mul(X3, Y3);
            X3 = Fp.mul(t3, X3);
            Z3 = Fp.mul(b3, Z3); // step 15
            t2 = Fp.mul(a, t2);
            t3 = Fp.sub(t0, t2);
            t3 = Fp.mul(a, t3);
            t3 = Fp.add(t3, Z3);
            Z3 = Fp.add(t0, t0); // step 20
            t0 = Fp.add(Z3, t0);
            t0 = Fp.add(t0, t2);
            t0 = Fp.mul(t0, t3);
            Y3 = Fp.add(Y3, t0);
            t2 = Fp.mul(Y1, Z1); // step 25
            t2 = Fp.add(t2, t2);
            t0 = Fp.mul(t2, t3);
            X3 = Fp.sub(X3, t0);
            Z3 = Fp.mul(t2, t1);
            Z3 = Fp.add(Z3, Z3); // step 30
            Z3 = Fp.add(Z3, Z3);
            return new Point(X3, Y3, Z3);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(other) {
            aprjpoint(other);
            const { X: X1, Y: Y1, Z: Z1 } = this;
            const { X: X2, Y: Y2, Z: Z2 } = other;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            const a = CURVE.a;
            const b3 = Fp.mul(CURVE.b, _3n);
            let t0 = Fp.mul(X1, X2); // step 1
            let t1 = Fp.mul(Y1, Y2);
            let t2 = Fp.mul(Z1, Z2);
            let t3 = Fp.add(X1, Y1);
            let t4 = Fp.add(X2, Y2); // step 5
            t3 = Fp.mul(t3, t4);
            t4 = Fp.add(t0, t1);
            t3 = Fp.sub(t3, t4);
            t4 = Fp.add(X1, Z1);
            let t5 = Fp.add(X2, Z2); // step 10
            t4 = Fp.mul(t4, t5);
            t5 = Fp.add(t0, t2);
            t4 = Fp.sub(t4, t5);
            t5 = Fp.add(Y1, Z1);
            X3 = Fp.add(Y2, Z2); // step 15
            t5 = Fp.mul(t5, X3);
            X3 = Fp.add(t1, t2);
            t5 = Fp.sub(t5, X3);
            Z3 = Fp.mul(a, t4);
            X3 = Fp.mul(b3, t2); // step 20
            Z3 = Fp.add(X3, Z3);
            X3 = Fp.sub(t1, Z3);
            Z3 = Fp.add(t1, Z3);
            Y3 = Fp.mul(X3, Z3);
            t1 = Fp.add(t0, t0); // step 25
            t1 = Fp.add(t1, t0);
            t2 = Fp.mul(a, t2);
            t4 = Fp.mul(b3, t4);
            t1 = Fp.add(t1, t2);
            t2 = Fp.sub(t0, t2); // step 30
            t2 = Fp.mul(a, t2);
            t4 = Fp.add(t4, t2);
            t0 = Fp.mul(t1, t4);
            Y3 = Fp.add(Y3, t0);
            t0 = Fp.mul(t5, t4); // step 35
            X3 = Fp.mul(t3, X3);
            X3 = Fp.sub(X3, t0);
            t0 = Fp.mul(t3, t1);
            Z3 = Fp.mul(t5, Z3);
            Z3 = Fp.add(Z3, t0); // step 40
            return new Point(X3, Y3, Z3);
        }
        subtract(other) {
            return this.add(other.negate());
        }
        is0() {
            return this.equals(Point.ZERO);
        }
        /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */ multiply(scalar) {
            const { endo } = extraOpts;
            if (!Fn.isValidNot0(scalar)) throw new Error('invalid scalar: out of range'); // 0 is invalid
            let point, fake; // Fake point is used to const-time mult
            const mul = (n)=>wnaf.cached(this, n, (p)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeZ"])(Point, p));
            /** See docs for {@link EndomorphismOpts} */ if (endo) {
                const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
                const { p: k1p, f: k1f } = mul(k1);
                const { p: k2p, f: k2f } = mul(k2);
                fake = k1f.add(k2f);
                point = finishEndo(endo.beta, k1p, k2p, k1neg, k2neg);
            } else {
                const { p, f } = mul(scalar);
                point = p;
                fake = f;
            }
            // Normalize `z` for both points, but return only real one
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeZ"])(Point, [
                point,
                fake
            ])[0];
        }
        /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed secret key e.g. sig verification, which works over *public* keys.
         */ multiplyUnsafe(sc) {
            const { endo } = extraOpts;
            const p = this;
            if (!Fn.isValid(sc)) throw new Error('invalid scalar: out of range'); // 0 is valid
            if (sc === _0n || p.is0()) return Point.ZERO;
            if (sc === _1n) return p; // fast-path
            if (wnaf.hasCache(this)) return this.multiply(sc);
            if (endo) {
                const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
                const { p1, p2 } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mulEndoUnsafe"])(Point, p, k1, k2); // 30% faster vs wnaf.unsafe
                return finishEndo(endo.beta, p1, p2, k1neg, k2neg);
            } else {
                return wnaf.unsafe(p, sc);
            }
        }
        multiplyAndAddUnsafe(Q, a, b) {
            const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
            return sum.is0() ? undefined : sum;
        }
        /**
         * Converts Projective point to affine (x, y) coordinates.
         * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
         */ toAffine(invertedZ) {
            return toAffineMemo(this, invertedZ);
        }
        /**
         * Checks whether Point is free of torsion elements (is in prime subgroup).
         * Always torsion-free for cofactor=1 curves.
         */ isTorsionFree() {
            const { isTorsionFree } = extraOpts;
            if (cofactor === _1n) return true;
            if (isTorsionFree) return isTorsionFree(Point, this);
            return wnaf.unsafe(this, CURVE_ORDER).is0();
        }
        clearCofactor() {
            const { clearCofactor } = extraOpts;
            if (cofactor === _1n) return this; // Fast-path
            if (clearCofactor) return clearCofactor(Point, this);
            return this.multiplyUnsafe(cofactor);
        }
        isSmallOrder() {
            // can we use this.clearCofactor()?
            return this.multiplyUnsafe(cofactor).is0();
        }
        toBytes(isCompressed = true) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abool2"])(isCompressed, 'isCompressed');
            this.assertValidity();
            return encodePoint(Point, this, isCompressed);
        }
        toHex(isCompressed = true) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(this.toBytes(isCompressed));
        }
        toString() {
            return `<Point ${this.is0() ? 'ZERO' : this.toHex()}>`;
        }
        // TODO: remove
        get px() {
            return this.X;
        }
        get py() {
            return this.X;
        }
        get pz() {
            return this.Z;
        }
        toRawBytes(isCompressed = true) {
            return this.toBytes(isCompressed);
        }
        _setWindowSize(windowSize) {
            this.precompute(windowSize);
        }
        static normalizeZ(points) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeZ"])(Point, points);
        }
        static msm(points, scalars) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pippenger"])(Point, Fn, points, scalars);
        }
        static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(_normFnElement(Fn, privateKey));
        }
    }
    // base / generator point
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    // zero / infinity / identity point
    Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO); // 0, 1, 0
    // math field
    Point.Fp = Fp;
    // scalar field
    Point.Fn = Fn;
    const bits = Fn.BITS;
    const wnaf = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wNAF"](Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
    Point.BASE.precompute(8); // Enable precomputes. Slows down first publicKey computation by 20ms.
    return Point;
}
// Points start with byte 0x02 when y is even; otherwise 0x03
function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 0x02 : 0x03);
}
function SWUFpSqrtRatio(Fp, Z) {
    // Generic implementation
    const q = Fp.ORDER;
    let l = _0n;
    for(let o = q - _1n; o % _2n === _0n; o /= _2n)l += _1n;
    const c1 = l; // 1. c1, the largest integer such that 2^c1 divides q - 1.
    // We need 2n ** c1 and 2n ** (c1-1). We can't use **; but we can use <<.
    // 2n ** c1 == 2n << (c1-1)
    const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
    const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
    const c2 = (q - _1n) / _2n_pow_c1; // 2. c2 = (q - 1) / (2^c1)  # Integer arithmetic
    const c3 = (c2 - _1n) / _2n; // 3. c3 = (c2 - 1) / 2            # Integer arithmetic
    const c4 = _2n_pow_c1 - _1n; // 4. c4 = 2^c1 - 1                # Integer arithmetic
    const c5 = _2n_pow_c1_1; // 5. c5 = 2^(c1 - 1)                  # Integer arithmetic
    const c6 = Fp.pow(Z, c2); // 6. c6 = Z^c2
    const c7 = Fp.pow(Z, (c2 + _1n) / _2n); // 7. c7 = Z^((c2 + 1) / 2)
    let sqrtRatio = (u, v)=>{
        let tv1 = c6; // 1. tv1 = c6
        let tv2 = Fp.pow(v, c4); // 2. tv2 = v^c4
        let tv3 = Fp.sqr(tv2); // 3. tv3 = tv2^2
        tv3 = Fp.mul(tv3, v); // 4. tv3 = tv3 * v
        let tv5 = Fp.mul(u, tv3); // 5. tv5 = u * tv3
        tv5 = Fp.pow(tv5, c3); // 6. tv5 = tv5^c3
        tv5 = Fp.mul(tv5, tv2); // 7. tv5 = tv5 * tv2
        tv2 = Fp.mul(tv5, v); // 8. tv2 = tv5 * v
        tv3 = Fp.mul(tv5, u); // 9. tv3 = tv5 * u
        let tv4 = Fp.mul(tv3, tv2); // 10. tv4 = tv3 * tv2
        tv5 = Fp.pow(tv4, c5); // 11. tv5 = tv4^c5
        let isQR = Fp.eql(tv5, Fp.ONE); // 12. isQR = tv5 == 1
        tv2 = Fp.mul(tv3, c7); // 13. tv2 = tv3 * c7
        tv5 = Fp.mul(tv4, tv1); // 14. tv5 = tv4 * tv1
        tv3 = Fp.cmov(tv2, tv3, isQR); // 15. tv3 = CMOV(tv2, tv3, isQR)
        tv4 = Fp.cmov(tv5, tv4, isQR); // 16. tv4 = CMOV(tv5, tv4, isQR)
        // 17. for i in (c1, c1 - 1, ..., 2):
        for(let i = c1; i > _1n; i--){
            let tv5 = i - _2n; // 18.    tv5 = i - 2
            tv5 = _2n << tv5 - _1n; // 19.    tv5 = 2^tv5
            let tvv5 = Fp.pow(tv4, tv5); // 20.    tv5 = tv4^tv5
            const e1 = Fp.eql(tvv5, Fp.ONE); // 21.    e1 = tv5 == 1
            tv2 = Fp.mul(tv3, tv1); // 22.    tv2 = tv3 * tv1
            tv1 = Fp.mul(tv1, tv1); // 23.    tv1 = tv1 * tv1
            tvv5 = Fp.mul(tv4, tv1); // 24.    tv5 = tv4 * tv1
            tv3 = Fp.cmov(tv2, tv3, e1); // 25.    tv3 = CMOV(tv2, tv3, e1)
            tv4 = Fp.cmov(tvv5, tv4, e1); // 26.    tv4 = CMOV(tv5, tv4, e1)
        }
        return {
            isValid: isQR,
            value: tv3
        };
    };
    if (Fp.ORDER % _4n === _3n) {
        // sqrt_ratio_3mod4(u, v)
        const c1 = (Fp.ORDER - _3n) / _4n; // 1. c1 = (q - 3) / 4     # Integer arithmetic
        const c2 = Fp.sqrt(Fp.neg(Z)); // 2. c2 = sqrt(-Z)
        sqrtRatio = (u, v)=>{
            let tv1 = Fp.sqr(v); // 1. tv1 = v^2
            const tv2 = Fp.mul(u, v); // 2. tv2 = u * v
            tv1 = Fp.mul(tv1, tv2); // 3. tv1 = tv1 * tv2
            let y1 = Fp.pow(tv1, c1); // 4. y1 = tv1^c1
            y1 = Fp.mul(y1, tv2); // 5. y1 = y1 * tv2
            const y2 = Fp.mul(y1, c2); // 6. y2 = y1 * c2
            const tv3 = Fp.mul(Fp.sqr(y1), v); // 7. tv3 = y1^2; 8. tv3 = tv3 * v
            const isQR = Fp.eql(tv3, u); // 9. isQR = tv3 == u
            let y = Fp.cmov(y2, y1, isQR); // 10. y = CMOV(y2, y1, isQR)
            return {
                isValid: isQR,
                value: y
            }; // 11. return (isQR, y) isQR ? y : y*c2
        };
    }
    // No curves uses that
    // if (Fp.ORDER % _8n === _5n) // sqrt_ratio_5mod8
    return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateField"])(Fp);
    const { A, B, Z } = opts;
    if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z)) throw new Error('mapToCurveSimpleSWU: invalid opts');
    const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
    if (!Fp.isOdd) throw new Error('Field does not have .isOdd()');
    // Input: u, an element of F.
    // Output: (x, y), a point on E.
    return (u)=>{
        // prettier-ignore
        let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
        tv1 = Fp.sqr(u); // 1.  tv1 = u^2
        tv1 = Fp.mul(tv1, Z); // 2.  tv1 = Z * tv1
        tv2 = Fp.sqr(tv1); // 3.  tv2 = tv1^2
        tv2 = Fp.add(tv2, tv1); // 4.  tv2 = tv2 + tv1
        tv3 = Fp.add(tv2, Fp.ONE); // 5.  tv3 = tv2 + 1
        tv3 = Fp.mul(tv3, B); // 6.  tv3 = B * tv3
        tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO)); // 7.  tv4 = CMOV(Z, -tv2, tv2 != 0)
        tv4 = Fp.mul(tv4, A); // 8.  tv4 = A * tv4
        tv2 = Fp.sqr(tv3); // 9.  tv2 = tv3^2
        tv6 = Fp.sqr(tv4); // 10. tv6 = tv4^2
        tv5 = Fp.mul(tv6, A); // 11. tv5 = A * tv6
        tv2 = Fp.add(tv2, tv5); // 12. tv2 = tv2 + tv5
        tv2 = Fp.mul(tv2, tv3); // 13. tv2 = tv2 * tv3
        tv6 = Fp.mul(tv6, tv4); // 14. tv6 = tv6 * tv4
        tv5 = Fp.mul(tv6, B); // 15. tv5 = B * tv6
        tv2 = Fp.add(tv2, tv5); // 16. tv2 = tv2 + tv5
        x = Fp.mul(tv1, tv3); // 17.   x = tv1 * tv3
        const { isValid, value } = sqrtRatio(tv2, tv6); // 18. (is_gx1_square, y1) = sqrt_ratio(tv2, tv6)
        y = Fp.mul(tv1, u); // 19.   y = tv1 * u  -> Z * u^3 * y1
        y = Fp.mul(y, value); // 20.   y = y * y1
        x = Fp.cmov(x, tv3, isValid); // 21.   x = CMOV(x, tv3, is_gx1_square)
        y = Fp.cmov(y, value, isValid); // 22.   y = CMOV(y, y1, is_gx1_square)
        const e1 = Fp.isOdd(u) === Fp.isOdd(y); // 23.  e1 = sgn0(u) == sgn0(y)
        y = Fp.cmov(Fp.neg(y), y, e1); // 24.   y = CMOV(-y, y, e1)
        const tv4_inv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FpInvertBatch"])(Fp, [
            tv4
        ], true)[0];
        x = Fp.mul(x, tv4_inv); // 25.   x = x / tv4
        return {
            x,
            y
        };
    };
}
function getWLengths(Fp, Fn) {
    return {
        secretKey: Fn.BYTES,
        publicKey: 1 + Fp.BYTES,
        publicKeyUncompressed: 1 + 2 * Fp.BYTES,
        publicKeyHasPrefix: true,
        signature: 2 * Fn.BYTES
    };
}
function ecdh(Point, ecdhOpts = {}) {
    const { Fn } = Point;
    const randomBytes_ = ecdhOpts.randomBytes || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomBytes"];
    const lengths = Object.assign(getWLengths(Point.Fp, Fn), {
        seed: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMinHashLength"])(Fn.ORDER)
    });
    function isValidSecretKey(secretKey) {
        try {
            return !!_normFnElement(Fn, secretKey);
        } catch (error) {
            return false;
        }
    }
    function isValidPublicKey(publicKey, isCompressed) {
        const { publicKey: comp, publicKeyUncompressed } = lengths;
        try {
            const l = publicKey.length;
            if (isCompressed === true && l !== comp) return false;
            if (isCompressed === false && l !== publicKeyUncompressed) return false;
            return !!Point.fromBytes(publicKey);
        } catch (error) {
            return false;
        }
    }
    /**
     * Produces cryptographically secure secret key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */ function randomSecretKey(seed = randomBytes_(lengths.seed)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapHashToField"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(seed, lengths.seed, 'seed'), Fn.ORDER);
    }
    /**
     * Computes public key for a secret key. Checks for validity of the secret key.
     * @param isCompressed whether to return compact (default), or full key
     * @returns Public key, full when isCompressed=false; short when isCompressed=true
     */ function getPublicKey(secretKey, isCompressed = true) {
        return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
    }
    function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return {
            secretKey,
            publicKey: getPublicKey(secretKey)
        };
    }
    /**
     * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
     */ function isProbPub(item) {
        if (typeof item === 'bigint') return false;
        if (item instanceof Point) return true;
        const { secretKey, publicKey, publicKeyUncompressed } = lengths;
        if (Fn.allowedLengths || secretKey === publicKey) return undefined;
        const l = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('key', item).length;
        return l === publicKey || l === publicKeyUncompressed;
    }
    /**
     * ECDH (Elliptic Curve Diffie Hellman).
     * Computes shared public key from secret key A and public key B.
     * Checks: 1) secret key validity 2) shared key is on-curve.
     * Does NOT hash the result.
     * @param isCompressed whether to return compact (default), or full key
     * @returns shared public key
     */ function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
        if (isProbPub(secretKeyA) === true) throw new Error('first arg must be private key');
        if (isProbPub(publicKeyB) === false) throw new Error('second arg must be public key');
        const s = _normFnElement(Fn, secretKeyA);
        const b = Point.fromHex(publicKeyB); // checks for being on-curve
        return b.multiply(s).toBytes(isCompressed);
    }
    const utils = {
        isValidSecretKey,
        isValidPublicKey,
        randomSecretKey,
        // TODO: remove
        isValidPrivateKey: isValidSecretKey,
        randomPrivateKey: randomSecretKey,
        normPrivateKeyToScalar: (key)=>_normFnElement(Fn, key),
        precompute (windowSize = 8, point = Point.BASE) {
            return point.precompute(windowSize, false);
        }
    };
    return Object.freeze({
        getPublicKey,
        getSharedSecret,
        keygen,
        Point,
        utils,
        lengths
    });
}
function ecdsa(Point, hash, ecdsaOpts = {}) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ahash"])(hash);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_validateObject"])(ecdsaOpts, {}, {
        hmac: 'function',
        lowS: 'boolean',
        randomBytes: 'function',
        bits2int: 'function',
        bits2int_modN: 'function'
    });
    const randomBytes = ecdsaOpts.randomBytes || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomBytes"];
    const hmac = ecdsaOpts.hmac || ((key, ...msgs)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$hmac$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hmac"])(hash, key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(...msgs)));
    const { Fp, Fn } = Point;
    const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
    const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
    const defaultSigOpts = {
        prehash: false,
        lowS: typeof ecdsaOpts.lowS === 'boolean' ? ecdsaOpts.lowS : false,
        format: undefined,
        extraEntropy: false
    };
    const defaultSigOpts_format = 'compact';
    function isBiggerThanHalfOrder(number) {
        const HALF = CURVE_ORDER >> _1n;
        return number > HALF;
    }
    function validateRS(title, num) {
        if (!Fn.isValidNot0(num)) throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
        return num;
    }
    function validateSigLength(bytes, format) {
        validateSigFormat(format);
        const size = lengths.signature;
        const sizer = format === 'compact' ? size : format === 'recovered' ? size + 1 : undefined;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(bytes, sizer, `${format} signature`);
    }
    /**
     * ECDSA signature with its (r, s) properties. Supports compact, recovered & DER representations.
     */ class Signature {
        constructor(r, s, recovery){
            this.r = validateRS('r', r); // r in [1..N-1];
            this.s = validateRS('s', s); // s in [1..N-1];
            if (recovery != null) this.recovery = recovery;
            Object.freeze(this);
        }
        static fromBytes(bytes, format = defaultSigOpts_format) {
            validateSigLength(bytes, format);
            let recid;
            if (format === 'der') {
                const { r, s } = DER.toSig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(bytes));
                return new Signature(r, s);
            }
            if (format === 'recovered') {
                recid = bytes[0];
                format = 'compact';
                bytes = bytes.subarray(1);
            }
            const L = Fn.BYTES;
            const r = bytes.subarray(0, L);
            const s = bytes.subarray(L, L * 2);
            return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
        }
        static fromHex(hex, format) {
            return this.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"])(hex), format);
        }
        addRecoveryBit(recovery) {
            return new Signature(this.r, this.s, recovery);
        }
        recoverPublicKey(messageHash) {
            const FIELD_ORDER = Fp.ORDER;
            const { r, s, recovery: rec } = this;
            if (rec == null || ![
                0,
                1,
                2,
                3
            ].includes(rec)) throw new Error('recovery id invalid');
            // ECDSA recovery is hard for cofactor > 1 curves.
            // In sign, `r = q.x mod n`, and here we recover q.x from r.
            // While recovering q.x >= n, we need to add r+n for cofactor=1 curves.
            // However, for cofactor>1, r+n may not get q.x:
            // r+n*i would need to be done instead where i is unknown.
            // To easily get i, we either need to:
            // a. increase amount of valid recid values (4, 5...); OR
            // b. prohibit non-prime-order signatures (recid > 1).
            const hasCofactor = CURVE_ORDER * _2n < FIELD_ORDER;
            if (hasCofactor && rec > 1) throw new Error('recovery id is ambiguous for h>1 curve');
            const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
            if (!Fp.isValid(radj)) throw new Error('recovery id 2 or 3 invalid');
            const x = Fp.toBytes(radj);
            const R = Point.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(pprefix((rec & 1) === 0), x));
            const ir = Fn.inv(radj); // r^-1
            const h = bits2int_modN((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('msgHash', messageHash)); // Truncate hash
            const u1 = Fn.create(-h * ir); // -hr^-1
            const u2 = Fn.create(s * ir); // sr^-1
            // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1). unsafe is fine: there is no private data.
            const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
            if (Q.is0()) throw new Error('point at infinify');
            Q.assertValidity();
            return Q;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
            return isBiggerThanHalfOrder(this.s);
        }
        toBytes(format = defaultSigOpts_format) {
            validateSigFormat(format);
            if (format === 'der') return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hexToBytes"])(DER.hexFromSig(this));
            const r = Fn.toBytes(this.r);
            const s = Fn.toBytes(this.s);
            if (format === 'recovered') {
                if (this.recovery == null) throw new Error('recovery bit must be present');
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(Uint8Array.of(this.recovery), r, s);
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(r, s);
        }
        toHex(format) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(this.toBytes(format));
        }
        // TODO: remove
        assertValidity() {}
        static fromCompact(hex) {
            return Signature.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('sig', hex), 'compact');
        }
        static fromDER(hex) {
            return Signature.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('sig', hex), 'der');
        }
        normalizeS() {
            return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
        }
        toDERRawBytes() {
            return this.toBytes('der');
        }
        toDERHex() {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(this.toBytes('der'));
        }
        toCompactRawBytes() {
            return this.toBytes('compact');
        }
        toCompactHex() {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bytesToHex"])(this.toBytes('compact'));
        }
    }
    // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
    // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
    // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
    // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors
    const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
        // Our custom check "just in case", for protection against DoS
        if (bytes.length > 8192) throw new Error('input is too large');
        // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
        // for some cases, since bytes.length * 8 is not actual bitLength.
        const num = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"])(bytes); // check for == u8 done here
        const delta = bytes.length * 8 - fnBits; // truncate to nBitLength leftmost bits
        return delta > 0 ? num >> BigInt(delta) : num;
    };
    const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
        return Fn.create(bits2int(bytes)); // can't use bytesToNumberBE here
    };
    // Pads output with zero as per spec
    const ORDER_MASK = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bitMask"])(fnBits);
    /** Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`. */ function int2octets(num) {
        // IMPORTANT: the check ensures working for case `Fn.BYTES != Fn.BITS * 8`
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["aInRange"])('num < 2^' + fnBits, num, _0n, ORDER_MASK);
        return Fn.toBytes(num);
    }
    function validateMsgAndHash(message, prehash) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(message, undefined, 'message');
        return prehash ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_abytes2"])(hash(message), undefined, 'prehashed message') : message;
    }
    /**
     * Steps A, D of RFC6979 3.2.
     * Creates RFC6979 seed; converts msg/privKey to numbers.
     * Used only in sign, not in verify.
     *
     * Warning: we cannot assume here that message has same amount of bytes as curve order,
     * this will be invalid at least for P521. Also it can be bigger for P224 + SHA256.
     */ function prepSig(message, privateKey, opts) {
        if ([
            'recovered',
            'canonical'
        ].some((k)=>k in opts)) throw new Error('sign() legacy options not supported');
        const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash); // RFC6979 3.2 A: h1 = H(m)
        // We can't later call bits2octets, since nested bits2int is broken for curves
        // with fnBits % 8 !== 0. Because of that, we unwrap it here as int2octets call.
        // const bits2octets = (bits) => int2octets(bits2int_modN(bits))
        const h1int = bits2int_modN(message);
        const d = _normFnElement(Fn, privateKey); // validate secret key, convert to bigint
        const seedArgs = [
            int2octets(d),
            int2octets(h1int)
        ];
        // extraEntropy. RFC6979 3.6: additional k' (optional).
        if (extraEntropy != null && extraEntropy !== false) {
            // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
            // gen random bytes OR pass as-is
            const e = extraEntropy === true ? randomBytes(lengths.secretKey) : extraEntropy;
            seedArgs.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('extraEntropy', e)); // check for being bytes
        }
        const seed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(...seedArgs); // Step D of RFC6979 3.2
        const m = h1int; // NOTE: no need to call bits2int second time here, it is inside truncateHash!
        // Converts signature params into point w r/s, checks result for validity.
        // To transform k => Signature:
        // q = k⋅G
        // r = q.x mod n
        // s = k^-1(m + rd) mod n
        // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
        // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
        // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT
        function k2sig(kBytes) {
            // RFC 6979 Section 3.2, step 3: k = bits2int(T)
            // Important: all mod() calls here must be done over N
            const k = bits2int(kBytes); // mod n, not mod p
            if (!Fn.isValidNot0(k)) return; // Valid scalars (including k) must be in 1..N-1
            const ik = Fn.inv(k); // k^-1 mod n
            const q = Point.BASE.multiply(k).toAffine(); // q = k⋅G
            const r = Fn.create(q.x); // r = q.x mod n
            if (r === _0n) return;
            const s = Fn.create(ik * Fn.create(m + r * d)); // Not using blinding here, see comment above
            if (s === _0n) return;
            let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n); // recovery bit (2 or 3, when q.x > n)
            let normS = s;
            if (lowS && isBiggerThanHalfOrder(s)) {
                normS = Fn.neg(s); // if lowS was passed, ensure s is always
                recovery ^= 1; // // in the bottom half of N
            }
            return new Signature(r, normS, recovery); // use normS, not s
        }
        return {
            seed,
            k2sig
        };
    }
    /**
     * Signs message hash with a secret key.
     *
     * ```
     * sign(m, d) where
     *   k = rfc6979_hmac_drbg(m, d)
     *   (x, y) = G × k
     *   r = x mod n
     *   s = (m + dr) / k mod n
     * ```
     */ function sign(message, secretKey, opts = {}) {
        message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('message', message);
        const { seed, k2sig } = prepSig(message, secretKey, opts); // Steps A, D of RFC6979 3.2.
        const drbg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createHmacDrbg"])(hash.outputLen, Fn.BYTES, hmac);
        const sig = drbg(seed, k2sig); // Steps B, C, D, E, F, G
        return sig;
    }
    function tryParsingSig(sg) {
        // Try to deduce format
        let sig = undefined;
        const isHex = typeof sg === 'string' || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"])(sg);
        const isObj = !isHex && sg !== null && typeof sg === 'object' && typeof sg.r === 'bigint' && typeof sg.s === 'bigint';
        if (!isHex && !isObj) throw new Error('invalid signature, expected Uint8Array, hex string or Signature instance');
        if (isObj) {
            sig = new Signature(sg.r, sg.s);
        } else if (isHex) {
            try {
                sig = Signature.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('sig', sg), 'der');
            } catch (derError) {
                if (!(derError instanceof DER.Err)) throw derError;
            }
            if (!sig) {
                try {
                    sig = Signature.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('sig', sg), 'compact');
                } catch (error) {
                    return false;
                }
            }
        }
        if (!sig) return false;
        return sig;
    }
    /**
     * Verifies a signature against message and public key.
     * Rejects lowS signatures by default: see {@link ECDSAVerifyOpts}.
     * Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
     *
     * ```
     * verify(r, s, h, P) where
     *   u1 = hs^-1 mod n
     *   u2 = rs^-1 mod n
     *   R = u1⋅G + u2⋅P
     *   mod(R.x, n) == r
     * ```
     */ function verify(signature, message, publicKey, opts = {}) {
        const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
        publicKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('publicKey', publicKey);
        message = validateMsgAndHash((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('message', message), prehash);
        if ('strict' in opts) throw new Error('options.strict was renamed to lowS');
        const sig = format === undefined ? tryParsingSig(signature) : Signature.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('sig', signature), format);
        if (sig === false) return false;
        try {
            const P = Point.fromBytes(publicKey);
            if (lowS && sig.hasHighS()) return false;
            const { r, s } = sig;
            const h = bits2int_modN(message); // mod n, not mod p
            const is = Fn.inv(s); // s^-1 mod n
            const u1 = Fn.create(h * is); // u1 = hs^-1 mod n
            const u2 = Fn.create(r * is); // u2 = rs^-1 mod n
            const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2)); // u1⋅G + u2⋅P
            if (R.is0()) return false;
            const v = Fn.create(R.x); // v = r.x mod n
            return v === r;
        } catch (e) {
            return false;
        }
    }
    function recoverPublicKey(signature, message, opts = {}) {
        const { prehash } = validateSigOpts(opts, defaultSigOpts);
        message = validateMsgAndHash(message, prehash);
        return Signature.fromBytes(signature, 'recovered').recoverPublicKey(message).toBytes();
    }
    return Object.freeze({
        keygen,
        getPublicKey,
        getSharedSecret,
        utils,
        lengths,
        Point,
        sign,
        verify,
        recoverPublicKey,
        Signature,
        hash
    });
}
function weierstrassPoints(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    return _weierstrass_new_output_to_legacy(c, Point);
}
function _weierstrass_legacy_opts_to_new(c) {
    const CURVE = {
        a: c.a,
        b: c.b,
        p: c.Fp.ORDER,
        n: c.n,
        h: c.h,
        Gx: c.Gx,
        Gy: c.Gy
    };
    const Fp = c.Fp;
    let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l)=>Math.ceil(l / 2)))) : undefined;
    const Fn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(CURVE.n, {
        BITS: c.nBitLength,
        allowedLengths: allowedLengths,
        modFromBytes: c.wrapPrivateKey
    });
    const curveOpts = {
        Fp,
        Fn,
        allowInfinityPoint: c.allowInfinityPoint,
        endo: c.endo,
        isTorsionFree: c.isTorsionFree,
        clearCofactor: c.clearCofactor,
        fromBytes: c.fromBytes,
        toBytes: c.toBytes
    };
    return {
        CURVE,
        curveOpts
    };
}
function _ecdsa_legacy_opts_to_new(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const ecdsaOpts = {
        hmac: c.hmac,
        randomBytes: c.randomBytes,
        lowS: c.lowS,
        bits2int: c.bits2int,
        bits2int_modN: c.bits2int_modN
    };
    return {
        CURVE,
        curveOpts,
        hash: c.hash,
        ecdsaOpts
    };
}
function _legacyHelperEquat(Fp, a, b) {
    /**
     * y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
     * @returns y²
     */ function weierstrassEquation(x) {
        const x2 = Fp.sqr(x); // x * x
        const x3 = Fp.mul(x2, x); // x² * x
        return Fp.add(Fp.add(x3, Fp.mul(x, a)), b); // x³ + a * x + b
    }
    return weierstrassEquation;
}
function _weierstrass_new_output_to_legacy(c, Point) {
    const { Fp, Fn } = Point;
    function isWithinCurveOrder(num) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["inRange"])(num, _1n, Fn.ORDER);
    }
    const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
    return Object.assign({}, {
        CURVE: c,
        Point: Point,
        ProjectivePoint: Point,
        normPrivateKeyToScalar: (key)=>_normFnElement(Fn, key),
        weierstrassEquation,
        isWithinCurveOrder
    });
}
function _ecdsa_new_output_to_legacy(c, _ecdsa) {
    const Point = _ecdsa.Point;
    return Object.assign({}, _ecdsa, {
        ProjectivePoint: Point,
        CURVE: Object.assign({}, c, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nLength"])(Point.Fn.ORDER, Point.Fn.BITS))
    });
}
function weierstrass(c) {
    const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    const signs = ecdsa(Point, hash, ecdsaOpts);
    return _ecdsa_new_output_to_legacy(c, signs);
} //# sourceMappingURL=weierstrass.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createCurve",
    ()=>createCurve,
    "getHash",
    ()=>getHash
]);
/**
 * Utilities for short weierstrass curves, combined with noble-hashes.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js [app-client] (ecmascript)");
;
function getHash(hash) {
    return {
        hash
    };
}
function createCurve(curveDef, defHash) {
    const create = (hash)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["weierstrass"])({
            ...curveDef,
            hash: hash
        });
    return {
        ...create(defHash),
        create
    };
} //# sourceMappingURL=_shortw_utils.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/hash-to-curve.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_DST_scalar",
    ()=>_DST_scalar,
    "createHasher",
    ()=>createHasher,
    "expand_message_xmd",
    ()=>expand_message_xmd,
    "expand_message_xof",
    ()=>expand_message_xof,
    "hash_to_field",
    ()=>hash_to_field,
    "isogenyMap",
    ()=>isogenyMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)");
;
;
// Octet Stream to Integer. "spec" implementation of os2ip is 2.5x slower vs bytesToNumberBE.
const os2ip = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"];
// Integer to Octet Stream (numberToBytesBE)
function i2osp(value, length) {
    anum(value);
    anum(length);
    if (value < 0 || value >= 1 << 8 * length) throw new Error('invalid I2OSP input: ' + value);
    const res = Array.from({
        length
    }).fill(0);
    for(let i = length - 1; i >= 0; i--){
        res[i] = value & 0xff;
        value >>>= 8;
    }
    return new Uint8Array(res);
}
function strxor(a, b) {
    const arr = new Uint8Array(a.length);
    for(let i = 0; i < a.length; i++){
        arr[i] = a[i] ^ b[i];
    }
    return arr;
}
function anum(item) {
    if (!Number.isSafeInteger(item)) throw new Error('number expected');
}
function normDST(DST) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBytes"])(DST) && typeof DST !== 'string') throw new Error('DST must be Uint8Array or string');
    return typeof DST === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"])(DST) : DST;
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abytes"])(msg);
    anum(lenInBytes);
    DST = normDST(DST);
    // https://www.rfc-editor.org/rfc/rfc9380#section-5.3.3
    if (DST.length > 255) DST = H((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"])('H2C-OVERSIZE-DST-'), DST));
    const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
    const ell = Math.ceil(lenInBytes / b_in_bytes);
    if (lenInBytes > 65535 || ell > 255) throw new Error('expand_message_xmd: invalid lenInBytes');
    const DST_prime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(DST, i2osp(DST.length, 1));
    const Z_pad = i2osp(0, r_in_bytes);
    const l_i_b_str = i2osp(lenInBytes, 2); // len_in_bytes_str
    const b = new Array(ell);
    const b_0 = H((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
    b[0] = H((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(b_0, i2osp(1, 1), DST_prime));
    for(let i = 1; i <= ell; i++){
        const args = [
            strxor(b_0, b[i - 1]),
            i2osp(i + 1, 1),
            DST_prime
        ];
        b[i] = H((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(...args));
    }
    const pseudo_random_bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(...b);
    return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abytes"])(msg);
    anum(lenInBytes);
    DST = normDST(DST);
    // https://www.rfc-editor.org/rfc/rfc9380#section-5.3.3
    // DST = H('H2C-OVERSIZE-DST-' || a_very_long_DST, Math.ceil((lenInBytes * k) / 8));
    if (DST.length > 255) {
        const dkLen = Math.ceil(2 * k / 8);
        DST = H.create({
            dkLen
        }).update((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"])('H2C-OVERSIZE-DST-')).update(DST).digest();
    }
    if (lenInBytes > 65535 || DST.length > 255) throw new Error('expand_message_xof: invalid lenInBytes');
    return H.create({
        dkLen: lenInBytes
    }).update(msg).update(i2osp(lenInBytes, 2))// 2. DST_prime = DST || I2OSP(len(DST), 1)
    .update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_validateObject"])(options, {
        p: 'bigint',
        m: 'number',
        k: 'number',
        hash: 'function'
    });
    const { p, k, m, hash, expand, DST } = options;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isHash"])(options.hash)) throw new Error('expected valid hash');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["abytes"])(msg);
    anum(count);
    const log2p = p.toString(2).length;
    const L = Math.ceil((log2p + k) / 8); // section 5.1 of ietf draft link above
    const len_in_bytes = count * m * L;
    let prb; // pseudo_random_bytes
    if (expand === 'xmd') {
        prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
    } else if (expand === 'xof') {
        prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
    } else if (expand === '_internal_pass') {
        // for internal tests only
        prb = msg;
    } else {
        throw new Error('expand must be "xmd" or "xof"');
    }
    const u = new Array(count);
    for(let i = 0; i < count; i++){
        const e = new Array(m);
        for(let j = 0; j < m; j++){
            const elm_offset = L * (j + i * m);
            const tv = prb.subarray(elm_offset, elm_offset + L);
            e[j] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mod"])(os2ip(tv), p);
        }
        u[i] = e;
    }
    return u;
}
function isogenyMap(field, map) {
    // Make same order as in spec
    const coeff = map.map((i)=>Array.from(i).reverse());
    return (x, y)=>{
        const [xn, xd, yn, yd] = coeff.map((val)=>val.reduce((acc, i)=>field.add(field.mul(acc, x), i)));
        // 6.6.3
        // Exceptional cases of iso_map are inputs that cause the denominator of
        // either rational function to evaluate to zero; such cases MUST return
        // the identity point on E.
        const [xd_inv, yd_inv] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FpInvertBatch"])(field, [
            xd,
            yd
        ], true);
        x = field.mul(xn, xd_inv); // xNum / xDen
        y = field.mul(y, field.mul(yn, yd_inv)); // y * (yNum / yDev)
        return {
            x,
            y
        };
    };
}
const _DST_scalar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"])('HashToScalar-');
function createHasher(Point, mapToCurve, defaults) {
    if (typeof mapToCurve !== 'function') throw new Error('mapToCurve() must be defined');
    function map(num) {
        return Point.fromAffine(mapToCurve(num));
    }
    function clear(initial) {
        const P = initial.clearCofactor();
        if (P.equals(Point.ZERO)) return Point.ZERO; // zero will throw in assert
        P.assertValidity();
        return P;
    }
    return {
        defaults,
        hashToCurve (msg, options) {
            const opts = Object.assign({}, defaults, options);
            const u = hash_to_field(msg, 2, opts);
            const u0 = map(u[0]);
            const u1 = map(u[1]);
            return clear(u0.add(u1));
        },
        encodeToCurve (msg, options) {
            const optsDst = defaults.encodeDST ? {
                DST: defaults.encodeDST
            } : {};
            const opts = Object.assign({}, defaults, optsDst, options);
            const u = hash_to_field(msg, 1, opts);
            const u0 = map(u[0]);
            return clear(u0);
        },
        /** See {@link H2CHasher} */ mapToCurve (scalars) {
            if (!Array.isArray(scalars)) throw new Error('expected array of bigints');
            for (const i of scalars)if (typeof i !== 'bigint') throw new Error('expected array of bigints');
            return clear(map(scalars));
        },
        // hash_to_scalar can produce 0: https://www.rfc-editor.org/errata/eid8393
        // RFC 9380, draft-irtf-cfrg-bbs-signatures-08
        hashToScalar (msg, options) {
            // @ts-ignore
            const N = Point.Fn.ORDER;
            const opts = Object.assign({}, defaults, {
                p: N,
                m: 1,
                DST: _DST_scalar
            }, options);
            return hash_to_field(msg, 1, opts)[0][0];
        }
    };
} //# sourceMappingURL=hash-to-curve.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/secp256k1.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "encodeToCurve",
    ()=>encodeToCurve,
    "hashToCurve",
    ()=>hashToCurve,
    "schnorr",
    ()=>schnorr,
    "secp256k1",
    ()=>secp256k1,
    "secp256k1_hasher",
    ()=>secp256k1_hasher
]);
/**
 * SECG secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
 *
 * Belongs to Koblitz curves: it has efficiently-computable GLV endomorphism ψ,
 * check out {@link EndomorphismOpts}. Seems to be rigid (not backdoored).
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/sha2.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/hash-to-curve.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/utils.js [app-client] (ecmascript) <locals>");
;
;
;
;
;
;
;
// Seems like generator was produced from some seed:
// `Point.BASE.multiply(Point.Fn.inv(2n, N)).toAffine().x`
// // gives short x 0x3b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63n
const secp256k1_CURVE = {
    p: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
    n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'),
    Gy: BigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
};
const secp256k1_ENDO = {
    beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
    basises: [
        [
            BigInt('0x3086d221a7d46bcde86c90e49284eb15'),
            -BigInt('0xe4437ed6010e88286f547fa90abfe4c3')
        ],
        [
            BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8'),
            BigInt('0x3086d221a7d46bcde86c90e49284eb15')
        ]
    ]
};
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
/**
 * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
 * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
 */ function sqrtMod(y) {
    const P = secp256k1_CURVE.p;
    // prettier-ignore
    const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    // prettier-ignore
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P; // x^3, 11
    const b3 = b2 * b2 * y % P; // x^7
    const b6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b3, _3n, P) * b3 % P;
    const b9 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b6, _3n, P) * b3 % P;
    const b11 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b9, _2n, P) * b2 % P;
    const b22 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b11, _11n, P) * b11 % P;
    const b44 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b22, _22n, P) * b22 % P;
    const b88 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b44, _44n, P) * b44 % P;
    const b176 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b88, _88n, P) * b88 % P;
    const b220 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b176, _44n, P) * b44 % P;
    const b223 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b220, _3n, P) * b3 % P;
    const t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(b223, _23n, P) * b22 % P;
    const t2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(t1, _6n, P) * b2 % P;
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pow2"])(t2, _2n, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y)) throw new Error('Cannot find square root');
    return root;
}
const Fpk1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(secp256k1_CURVE.p, {
    sqrt: sqrtMod
});
const secp256k1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCurve"])({
    ...secp256k1_CURVE,
    Fp: Fpk1,
    lowS: true,
    endo: secp256k1_ENDO
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"]);
// Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */ const TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === undefined) {
        const tagH = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utf8ToBytes"])(tag));
        tagP = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(tagH, tagH);
        TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatBytes"])(tagP, ...messages));
}
// ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03
const pointToBytes = (point)=>point.toBytes(true).slice(1);
const Pointk1 = /* @__PURE__ */ (()=>secp256k1.Point)();
const hasEven = (y)=>y % _2n === _0n;
// Calculate point, scalar and bytes
function schnorrGetExtPubKey(priv) {
    const { Fn, BASE } = Pointk1;
    const d_ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_normFnElement"])(Fn, priv);
    const p = BASE.multiply(d_); // P = d'⋅G; 0 < d' < n check is done inside
    const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
    return {
        scalar,
        bytes: pointToBytes(p)
    };
}
/**
 * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
 * @returns valid point checked for being on-curve
 */ function lift_x(x) {
    const Fp = Fpk1;
    if (!Fp.isValidNot0(x)) throw new Error('invalid x: Fail if x ≥ p');
    const xx = Fp.create(x * x);
    const c = Fp.create(xx * x + BigInt(7)); // Let c = x³ + 7 mod p.
    let y = Fp.sqrt(c); // Let y = c^(p+1)/4 mod p. Same as sqrt().
    // Return the unique point P such that x(P) = x and
    // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.
    if (!hasEven(y)) y = Fp.neg(y);
    const p = Pointk1.fromAffine({
        x,
        y
    });
    p.assertValidity();
    return p;
}
const num = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"];
/**
 * Create tagged hash, convert it to bigint, reduce modulo-n.
 */ function challenge(...args) {
    return Pointk1.Fn.create(num(taggedHash('BIP0340/challenge', ...args)));
}
/**
 * Schnorr public key is just `x` coordinate of Point as per BIP340.
 */ function schnorrGetPublicKey(secretKey) {
    return schnorrGetExtPubKey(secretKey).bytes; // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
}
/**
 * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
 * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
 */ function schnorrSign(message, secretKey, auxRand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomBytes"])(32)) {
    const { Fn } = Pointk1;
    const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('message', message);
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey); // checks for isWithinCurveOrder
    const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('auxRand', auxRand, 32); // Auxiliary random data a: a 32-byte array
    const t = Fn.toBytes(d ^ num(taggedHash('BIP0340/aux', a))); // Let t be the byte-wise xor of bytes(d) and hash/aux(a)
    const rand = taggedHash('BIP0340/nonce', t, px, m); // Let rand = hash/nonce(t || bytes(P) || m)
    // Let k' = int(rand) mod n. Fail if k' = 0. Let R = k'⋅G
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(rand);
    const e = challenge(rx, px, m); // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.
    const sig = new Uint8Array(64); // Let sig = bytes(R) || bytes((k + ed) mod n).
    sig.set(rx, 0);
    sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
    // If Verify(bytes(P), m, sig) (see below) returns failure, abort
    if (!schnorrVerify(sig, m, px)) throw new Error('sign: Invalid signature produced');
    return sig;
}
/**
 * Verifies Schnorr signature.
 * Will swallow errors & return false except for initial type validation of arguments.
 */ function schnorrVerify(signature, message, publicKey) {
    const { Fn, BASE } = Pointk1;
    const sig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('signature', signature, 64);
    const m = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('message', message);
    const pub = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ensureBytes"])('publicKey', publicKey, 32);
    try {
        const P = lift_x(num(pub)); // P = lift_x(int(pk)); fail if that fails
        const r = num(sig.subarray(0, 32)); // Let r = int(sig[0:32]); fail if r ≥ p.
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["inRange"])(r, _1n, secp256k1_CURVE.p)) return false;
        const s = num(sig.subarray(32, 64)); // Let s = int(sig[32:64]); fail if s ≥ n.
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["inRange"])(s, _1n, secp256k1_CURVE.n)) return false;
        // int(challenge(bytes(r)||bytes(P)||m))%n
        const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
        // R = s⋅G - e⋅P, where -eP == (n-e)P
        const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
        const { x, y } = R.toAffine();
        // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
        if (R.is0() || !hasEven(y) || x !== r) return false;
        return true;
    } catch (error) {
        return false;
    }
}
const schnorr = /* @__PURE__ */ (()=>{
    const size = 32;
    const seedLength = 48;
    const randomSecretKey = (seed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["randomBytes"])(seedLength))=>{
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapHashToField"])(seed, secp256k1_CURVE.n);
    };
    // TODO: remove
    secp256k1.utils.randomSecretKey;
    function keygen(seed) {
        const secretKey = randomSecretKey(seed);
        return {
            secretKey,
            publicKey: schnorrGetPublicKey(secretKey)
        };
    }
    return {
        keygen,
        getPublicKey: schnorrGetPublicKey,
        sign: schnorrSign,
        verify: schnorrVerify,
        Point: Pointk1,
        utils: {
            randomSecretKey: randomSecretKey,
            randomPrivateKey: randomSecretKey,
            taggedHash,
            // TODO: remove
            lift_x,
            pointToBytes,
            numberToBytesBE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["numberToBytesBE"],
            bytesToNumberBE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["bytesToNumberBE"],
            mod: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mod"]
        },
        lengths: {
            secretKey: size,
            publicKey: size,
            publicKeyHasPrefix: false,
            signature: size * 2,
            seed: seedLength
        }
    };
})();
const isoMap = /* @__PURE__ */ (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isogenyMap"])(Fpk1, [
        // xNum
        [
            '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7',
            '0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581',
            '0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262',
            '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c'
        ],
        // xDen
        [
            '0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b',
            '0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14',
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        ],
        // yNum
        [
            '0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c',
            '0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3',
            '0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931',
            '0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84'
        ],
        // yDen
        [
            '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b',
            '0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573',
            '0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f',
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        ]
    ].map((i)=>i.map((j)=>BigInt(j)))))();
const mapSWU = /* @__PURE__ */ (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapToCurveSimpleSWU"])(Fpk1, {
        A: BigInt('0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533'),
        B: BigInt('1771'),
        Z: Fpk1.create(BigInt('-11'))
    }))();
const secp256k1_hasher = /* @__PURE__ */ (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHasher"])(secp256k1.Point, (scalars)=>{
        const { x, y } = mapSWU(Fpk1.create(scalars[0]));
        return isoMap(x, y);
    }, {
        DST: 'secp256k1_XMD:SHA-256_SSWU_RO_',
        encodeDST: 'secp256k1_XMD:SHA-256_SSWU_NU_',
        p: Fpk1.ORDER,
        m: 1,
        k: 128,
        expand: 'xmd',
        hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"]
    }))();
const hashToCurve = /* @__PURE__ */ (()=>secp256k1_hasher.hashToCurve)();
const encodeToCurve = /* @__PURE__ */ (()=>secp256k1_hasher.encodeToCurve)(); //# sourceMappingURL=secp256k1.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/nist.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "p256",
    ()=>p256,
    "p256_hasher",
    ()=>p256_hasher,
    "p384",
    ()=>p384,
    "p384_hasher",
    ()=>p384_hasher,
    "p521",
    ()=>p521,
    "p521_hasher",
    ()=>p521_hasher,
    "secp256r1",
    ()=>secp256r1,
    "secp384r1",
    ()=>secp384r1,
    "secp521r1",
    ()=>secp521r1
]);
/**
 * Internal module for NIST P256, P384, P521 curves.
 * Do not use for now.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/hashes/esm/sha2.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/_shortw_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/hash-to-curve.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/modular.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/abstract/weierstrass.js [app-client] (ecmascript)");
;
;
;
;
;
// p = 2n**224n * (2n**32n-1n) + 2n**192n + 2n**96n - 1n
// a = Fp256.create(BigInt('-3'));
const p256_CURVE = {
    p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
    n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
    h: BigInt(1),
    a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
    b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
    Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
    Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5')
};
// p = 2n**384n - 2n**128n - 2n**96n + 2n**32n - 1n
const p384_CURVE = {
    p: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff'),
    n: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973'),
    h: BigInt(1),
    a: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc'),
    b: BigInt('0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef'),
    Gx: BigInt('0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7'),
    Gy: BigInt('0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f')
};
// p = 2n**521n - 1n
const p521_CURVE = {
    p: BigInt('0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
    n: BigInt('0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409'),
    h: BigInt(1),
    a: BigInt('0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc'),
    b: BigInt('0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00'),
    Gx: BigInt('0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66'),
    Gy: BigInt('0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650')
};
const Fp256 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(p256_CURVE.p);
const Fp384 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(p384_CURVE.p);
const Fp521 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$modular$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"])(p521_CURVE.p);
function createSWU(Point, opts) {
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$weierstrass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapToCurveSimpleSWU"])(Point.Fp, opts);
    return (scalars)=>map(scalars[0]);
}
const p256 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCurve"])({
    ...p256_CURVE,
    Fp: Fp256,
    lowS: false
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"]);
const p256_hasher = /* @__PURE__ */ (()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHasher"])(p256.Point, createSWU(p256.Point, {
        A: p256_CURVE.a,
        B: p256_CURVE.b,
        Z: p256.Point.Fp.create(BigInt('-10'))
    }), {
        DST: 'P256_XMD:SHA-256_SSWU_RO_',
        encodeDST: 'P256_XMD:SHA-256_SSWU_NU_',
        p: p256_CURVE.p,
        m: 1,
        k: 128,
        expand: 'xmd',
        hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha256"]
    });
})();
const p384 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCurve"])({
    ...p384_CURVE,
    Fp: Fp384,
    lowS: false
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha384"]);
const p384_hasher = /* @__PURE__ */ (()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHasher"])(p384.Point, createSWU(p384.Point, {
        A: p384_CURVE.a,
        B: p384_CURVE.b,
        Z: p384.Point.Fp.create(BigInt('-12'))
    }), {
        DST: 'P384_XMD:SHA-384_SSWU_RO_',
        encodeDST: 'P384_XMD:SHA-384_SSWU_NU_',
        p: p384_CURVE.p,
        m: 1,
        k: 192,
        expand: 'xmd',
        hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha384"]
    });
})();
const p521 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$_shortw_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCurve"])({
    ...p521_CURVE,
    Fp: Fp521,
    lowS: false,
    allowedPrivateKeyLengths: [
        130,
        131,
        132
    ]
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha512"]);
const secp256r1 = p256;
const secp384r1 = p384;
const secp521r1 = p521;
const p521_hasher = /* @__PURE__ */ (()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$abstract$2f$hash$2d$to$2d$curve$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHasher"])(p521.Point, createSWU(p521.Point, {
        A: p521_CURVE.a,
        B: p521_CURVE.b,
        Z: p521.Point.Fp.create(BigInt('-4'))
    }), {
        DST: 'P521_XMD:SHA-512_SSWU_RO_',
        encodeDST: 'P521_XMD:SHA-512_SSWU_NU_',
        p: p521_CURVE.p,
        m: 1,
        k: 256,
        expand: 'xmd',
        hash: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$hashes$2f$esm$2f$sha2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sha512"]
    });
})(); // export const p521_oprf: OPRF = createORPF({
 //   name: 'P521-SHA512',
 //   Point: p521.Point,
 //   hash: sha512,
 //   hashToGroup: p521_hasher.hashToCurve,
 //   hashToScalar: p521_hasher.hashToScalar, // produces L=98 just like in RFC
 // });
 //# sourceMappingURL=nist.js.map
}),
"[project]/node_modules/ox/node_modules/@noble/curves/esm/p256.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * NIST secp256r1 aka p256.
 * @module
 */ /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ __turbopack_context__.s([
    "encodeToCurve",
    ()=>encodeToCurve,
    "hashToCurve",
    ()=>hashToCurve,
    "p256",
    ()=>p256,
    "secp256r1",
    ()=>secp256r1
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$nist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ox/node_modules/@noble/curves/esm/nist.js [app-client] (ecmascript)");
;
;
const p256 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$nist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["p256"];
const secp256r1 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$nist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["p256"];
const hashToCurve = /* @__PURE__ */ (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$nist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["p256_hasher"].hashToCurve)();
const encodeToCurve = /* @__PURE__ */ (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ox$2f$node_modules$2f40$noble$2f$curves$2f$esm$2f$nist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["p256_hasher"].encodeToCurve)(); //# sourceMappingURL=p256.js.map
}),
]);

//# sourceMappingURL=d9048_%40noble_curves_esm_3f1e1642._.js.map