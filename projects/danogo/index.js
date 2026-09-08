const { PromisePool } = require('@supercharge/promise-pool');
const { get } = require('../helper/http');

const DANOGO_GATEWAY_ENDPOINT = 'https://danogo-gateway.tekoapis.com/api/v1'
const KUPO_ENDPOINT = 'https://kupo.tekoapis.com/matches'
const DECODED_PREFIX_LENGTH = 2;
const REQUEST_TIMEOUT = 30000;
// same dust threshold as helper/chain/cardano.js: drops the bond receipt NFTs held in the contracts
const MIN_ASSET_QUANTITY = 10;

// bridged assets DefiLlama does not price under their cardano unit, priced via coingecko instead
const BRIDGED_TOKENS = {
  '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93555534443': { coingeckoId: 'usd-coin', decimals: 8 },
  '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93555534454': { coingeckoId: 'tether', decimals: 8 },
  '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935455448': { coingeckoId: 'ethereum', decimals: 8 },
  '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff935425443': { coingeckoId: 'bitcoin', decimals: 8 },
}

// Bech32 character set
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
  const x = ALPHABET.charAt(z);
  ALPHABET_MAP[x] = z;
}

function convert(data, inBits, outBits, pad) {
  let value = 0;
  let bits = 0;
  const maxV = (1 << outBits) - 1;
  const result = [];

  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i];
    bits += inBits;

    while (bits >= outBits) {
      bits -= outBits;
      result.push((value >> bits) & maxV);
    }
  }

  if (pad) {
    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV);
    }
  } else {
    if (bits >= inBits) return 'Excess padding';
    if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
  }

  return result;
}

// returns the payment credential, so utxos sitting at the base address variants
// (same script, any stake key) are matched as well as the enterprise address
const bech32AddressToPaymentCredential = (address) => {
  // Don't allow mixed case
  const lowered = address.toLowerCase();
  if (address !== lowered) throw new Error('Mixed-case string');

  const split = lowered.lastIndexOf('1');
  if (split === -1) throw new Error('No separator character');
  if (split === 0) throw new Error('Missing prefix');

  const wordChars = lowered.slice(split + 1);
  if (wordChars.length < 6) throw new Error('Data too short');

  // Convert characters to 5-bit integers
  const words = [];
  for (let i = 0; i < wordChars.length - 6; ++i) {
    const c = wordChars.charAt(i);
    const v = ALPHABET_MAP[c];
    if (v === undefined) throw new Error('Unknown character ' + c);
    words.push(v);
  }

  // Convert from 5-bit to 8-bit
  const decoded = convert(words, 5, 8, false);
  if (!Array.isArray(decoded)) throw new Error(decoded);

  return Buffer.from(decoded).toString('hex').substring(DECODED_PREFIX_LENGTH);
};

const fetchSmartContractAddresses = async () => {
  const { data: { addresses } } = await get(`${DANOGO_GATEWAY_ENDPOINT}/smartcontract-addresses`, { timeout: REQUEST_TIMEOUT });
  return addresses.map(bech32AddressToPaymentCredential);
}

const fetchSmartContractUTXOs = async (paymentCredential) => {
  return get(`${KUPO_ENDPOINT}/${paymentCredential}/*?unspent`, { timeout: REQUEST_TIMEOUT });
}

async function tvl(api) {
  const paymentCredentials = await fetchSmartContractAddresses();

  const { results, errors } = await PromisePool
    .withConcurrency(5)
    .for(paymentCredentials)
    .process(fetchSmartContractUTXOs);

  if (errors.length) throw errors[0];

  results.flat().forEach((utxo) => {
    api.add('lovelace', utxo.value.coins);

    Object.entries(utxo.value.assets ?? {}).forEach(([asset, quantity]) => {
      if (+quantity < MIN_ASSET_QUANTITY) return;
      // kupo returns `policyId.assetNameHex`, defillama prices the concatenated unit
      const unit = asset.replace('.', '');
      const bridged = BRIDGED_TOKENS[unit];
      if (bridged) api.add(bridged.coingeckoId, quantity / 10 ** bridged.decimals, { skipChain: true });
      else api.add(unit, quantity);
    });
  });
}

module.exports = {
  timetravel: false,
  methodology: 'Sums the ADA and native assets sitting in the unspent utxos of Danogo smart contracts. Contract addresses come from the Danogo gateway, utxos are read from Kupo by payment credential, and every asset is priced by DefiLlama.',
  cardano: {
    tvl
  },
}
