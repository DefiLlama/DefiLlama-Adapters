// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

function fromBase64(base64String) {
  return Uint8Array.from(atob(base64String), (char) => char.charCodeAt(0));
}

const CHUNK_SIZE = 8192;

function toBase64(bytes) {
  // Special-case the simple case for speed's sake.
  if (bytes.length < CHUNK_SIZE) {
    return btoa(String.fromCharCode(...bytes));
  }

  let output = '';
  for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE);
    output += String.fromCharCode(...chunk);
  }

  return btoa(output);
}

module.exports = {
  fromBase64,
  toBase64
};