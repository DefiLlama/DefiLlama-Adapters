const I80F48_FRACTIONAL_BYTES = 6;
const I80F48_TOTAL_BYTES = 16;
const I80F48_DIVISOR = 2n ** BigInt(8 * I80F48_FRACTIONAL_BYTES);

function wrappedI80F48toNumber(wrapped) {
  let bytesLE = wrapped.value;
  if (bytesLE.length !== I80F48_TOTAL_BYTES) {
    throw new Error(`Expected a ${I80F48_TOTAL_BYTES}-byte buffer`);
  }

  let bytesBE = bytesLE.slice();
  bytesBE.reverse();

  let signChar = "";
  const msb = bytesBE[0];
  if (msb & 0x80) {
    signChar = "-";
    bytesBE = bytesBE.map((v) => ~v & 0xff);
  }

  let hex =
    signChar +
    "0x" +
    bytesBE.map((v) => v.toString(16).padStart(2, "0")).join("");
  
  // Convert hex to BigInt and divide by divisor
  let value = BigInt(hex);
  let decoded = value / I80F48_DIVISOR;
  let remainder = value % I80F48_DIVISOR;
  
  // Convert to string representation
  let valueStr = decoded.toString();
  
  // If there's a remainder, add decimal places
  if (remainder !== 0n) {
    // Convert remainder to decimal by multiplying by 10^6 and dividing by divisor
    const precision = 6; // 6 decimal places for precision
    const multiplier = 10n ** BigInt(precision);
    const decimalPart = (remainder * multiplier) / I80F48_DIVISOR;
    valueStr += "." + decimalPart.toString().padStart(precision, '0');
  }

  return Number(valueStr);
}


module.exports = {
  wrappedI80F48toNumber
}
