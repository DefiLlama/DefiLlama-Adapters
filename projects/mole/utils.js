
function asIntN(int, bits = 32) {
    return Number(BigInt.asIntN(bits, BigInt(int)));
}

function i32BitsToNumber(v) {
    return asIntN(BigInt(v), 32);
}

module.exports = {
    i32BitsToNumber,
}
