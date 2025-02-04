function decodeI80F48FromHex(hex, fractionalBytes = 6, signChar = "") {
  // 1) Parse the hex as BigInt
  let value = BigInt(hex);

  // 2) Apply sign if needed
  if (signChar === "-") {
    value = -value;
  }

  // 3) Separate integer/fractional bits
  //    Typically I80F48 -> 48 fractional bits = 6 bytes * 8 bits/byte.
  const fractionBits = 8n * BigInt(fractionalBytes);

  // integerPart = value >> 48
  let integerPart = value >> fractionBits;

  // fractionalPart = value & ((1 << 48) - 1)
  let fractionalPart = value & ((1n << fractionBits) - 1n);

  // Remember if final result should be negative
  const isNegative = integerPart < 0n;
  if (isNegative) {
    integerPart = -integerPart;
    fractionalPart = -fractionalPart;
    // With two’s complement, you might have to do more nuance,
    // but typically I80F48 is stored as a signed 128-bit or so. 
    // For many Solana-based I80F48 implementations, the fractional portion
    // is treated as positive magnitude once you know the sign.
  }

  // 4) Convert integer part to decimal string
  const integerString = integerPart.toString(10);

  // 5) Convert fractional part to decimal string by repeated "multiply by 10, divide by 2^48"
  let fractionString = "";
  const denominator = 1n << fractionBits;

  // Ensure fractionalPart is positive for the loop
  if (fractionalPart < 0n) {
    fractionalPart = -fractionalPart;
  }

  while (fractionalPart !== 0n) {
    fractionalPart *= 10n;
    const digit = fractionalPart / denominator;
    fractionString += digit.toString(10);
    fractionalPart = fractionalPart % denominator;
  }

  // Combine integer + fractional
  let result = fractionString.length > 0
    ? integerString + "." + fractionString
    : integerString;

  // Re-apply negative if needed
  if (isNegative) {
    result = "-" + result;
  }

  return result;
}

// --------------------------------------------------------------------
// USAGE EXAMPLE:

// Suppose we have 16 bytes in I80F48 format, with 8 fractional bytes (48 bits).
// (Adjust fractionalBytes as needed for your situation.)
const I80F48_FRACTIONAL_BYTES = 6; // typical for "I80F48" = 48 fractional bits

function wrappedI80F48toBigNumber(wrapped) {
  const I80F48_TOTAL_BYTES = 16
  let bytesLE = wrapped;
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

  let hex = signChar + "0x" + bytesBE.map((v) => v.toString(16).padStart(2, "0")).join("");
  const decimalString = decodeI80F48FromHex(hex, 6)
  return decimalString.split(".")[0]

}

module.exports = wrappedI80F48toBigNumber
