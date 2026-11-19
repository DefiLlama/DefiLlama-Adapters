const blake = require("blakejs")

function prepareExecCmd(pactCode, meta, networkId) {
  const cmdJSON = {
    networkId,
    payload: {
      exec: {
        data: {},
        code: pactCode
      }
    },
    signers: [],
    meta,
    nonce: JSON.stringify(new Date().toISOString())
  };
  const cmd = JSON.stringify(cmdJSON);
  const sigs = attachSig(cmd);
  return mkSingleCmd(sigs, cmd);
}

/**
 * Makes a single command given signed data.
 * @param sigs {array} - array of signature objects, see 'sign'
 * @param cmd {string} - stringified JSON blob used to create hash
 * @return valid Pact API command for send or local use.
 */
function mkSingleCmd(sigs, cmd) {
  return {
    hash: sigs[0].hash,
    sigs: [],
    cmd
  };
}

function attachSig(msg) {
  var hshBin = hashBin(msg);
  var hsh = b64urlEncodeArr(hshBin);
  return [{ hash: hsh, sig: undefined }]
}


/**
 * Perform blake2b256 hashing.
 */
function hashBin(s) {
  return blake.blake2b(s, null, 32);
}

function b64urlEncodeArr(input) {
  return b64url.encode(uint8ArrayToStr(input));
}

function uint8ArrayToStr(a) {
  return String.fromCharCode.apply(null, new Uint16Array(a));
}

const b64url = (function () {

  'use strict';

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error();
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  function base64UrlEncode(input) {
    var str = String(input);
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      // str.charAt (idx | 0) || (map = '=', idx % 1);
      str.charAt(idx | 0);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  function base64UrlDecode(input) {
    var str = (String(input)).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
    if (str.length % 4 === 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = str.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  }

  return { encode: base64UrlEncode, decode: base64UrlDecode };

})()

module.exports = {
  prepareExecCmd
}