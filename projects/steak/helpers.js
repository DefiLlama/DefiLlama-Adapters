function encodeBase64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

module.exports = { encodeBase64 };
