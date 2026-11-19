const { trySumTokens } = require("../helper/chain/cardano");
const { get } = require("../helper/http");
const poolAddressesURL = "https://surflending.org/api/getPoolAddresses";

// --- minimal bech32 encoder (BIP173) ---
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values) {
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= GENERATOR[i];
  }
  return chk >>> 0;
}

function hrpExpand(hrp) {
  const out = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >>> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

function toWords(bytes) {
  const words = [];
  let acc = 0, bits = 0;
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      words.push((acc >>> bits) & 31);
    }
  }
  if (bits > 0) words.push((acc << (5 - bits)) & 31);
  return words;
}

function bech32Encode(hrp, bytes) {
  const words = toWords(bytes);
  const mod = polymod([...hrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = [];
  for (let i = 0; i < 6; i++) checksum.push((mod >>> (5 * (5 - i))) & 31);
  return hrp + "1" + [...words, ...checksum].map((w) => CHARSET[w]).join("");
}

// Build a Shelley bech32 address from { networkId, paymentCredential, stakingCredential }
function credentialsToAddress(addr) {
  if (typeof addr === "string") return addr;
  const { networkId, paymentCredential, stakingCredential } = addr;
  const isScript = (c) => c._tag === "ScriptHash";
  let type;
  if (stakingCredential) type = (isScript(paymentCredential) ? 1 : 0) | (isScript(stakingCredential) ? 2 : 0);
  else type = isScript(paymentCredential) ? 7 : 6;
  const header = (type << 4) | (networkId & 0xf);
  const bytes = [header, ...Buffer.from(paymentCredential.hash, "hex")];
  if (stakingCredential) bytes.push(...Buffer.from(stakingCredential.hash, "hex"));
  return bech32Encode(networkId === 1 ? "addr" : "addr_test", bytes);
}

async function tvl() {
  const { poolAddresses } = await get(poolAddressesURL);
  const owners = Object.values(poolAddresses).flatMap((entry) => [
    credentialsToAddress(entry.poolAddress),
    credentialsToAddress(entry.vaultUTxOsAddress),
  ]);
  return trySumTokens({ owners });
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
};
