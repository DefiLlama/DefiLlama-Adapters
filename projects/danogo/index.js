const { fetchURL, postURL } = require('../helper/utils');

const DANOGO_GATEWAY_ENDPOINT = 'https://danogo-gateway.tekoapis.com/api/v1'
const KUPO_ENDPOINT = 'https://kupo.tekoapis.com/matches'
const DECODED_PREFIX_LENGTH = 2;
const ADA_TO_LOVELACE = 1000000;

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

const bech32AddressToHexString = (address) => {
  // Don't allow mixed case
  const lowered = address.toLowerCase();
  if (address !== lowered) throw new Error('Mixed-case string');

  const split = lowered.lastIndexOf('1');
  if (split === -1) throw new Error('No separator character');
  if (split === 0) throw new Error('Missing prefix');

  const prefix = lowered.slice(0, split);
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
  const smartContractResponse = await fetchURL(`${DANOGO_GATEWAY_ENDPOINT}/smartcontract-addresses`);
  return smartContractResponse.data.data.addresses.map((address) => bech32AddressToHexString(address));
}

const fetchSmartContractUTXOs = async (address) => {
  const kupoResponse = await fetchURL(`${KUPO_ENDPOINT}/${address}/*?unspent`);
  return kupoResponse.data;
}

const fetchAssetValue = async (assetsInfo) => {
  const assetIds = Object.keys(assetsInfo)
  let totalAssetsValue = 0;
  const gatewayResponse = await postURL(`${DANOGO_GATEWAY_ENDPOINT}/cardano-asset-value`, { assetIds: assetIds});
  gatewayResponse.data.data.assetValues.forEach((asset) => {
    let priceInLovelace = BigInt(0);
    if (asset.adaValue && BigInt(asset.adaValue) !== BigInt(0)) {
      priceInLovelace = BigInt(asset.adaValue) * BigInt(assetsInfo[asset.assetId]);
    } else if (
      asset.exchangeRateNum &&
      asset.exchangeRateDenom &&
      BigInt(asset.exchangeRateDenom) !== BigInt(0)
    ) {
      const price = Math.floor((Number(asset.exchangeRateNum) / Number(asset.exchangeRateDenom)) * Number(assetsInfo[asset.assetId]));
      priceInLovelace = BigInt(price);
    }

    const assetValue = Number(priceInLovelace * BigInt(100) / BigInt(ADA_TO_LOVELACE)) / 100;
    totalAssetsValue += assetValue;
  });
  return totalAssetsValue;
}

function mergeObjectsWithSum(target, ...sources) {
  for (const source of sources) {
      for (const key in source) {
          if (source.hasOwnProperty(key)) {
              if (key in target) {
                  target[key] += source[key];
              } else {
                  target[key] = source[key];
              }
          }
      }
  }
  return target;
}

const fetch = async () => {
  const smartContracts = await fetchSmartContractAddresses();
  
  const smartContractsUtxos = await Promise.all(smartContracts.map((address) => {
    return fetchSmartContractUTXOs(address)
  }));

  let assetInfos = {};
  let totalValueLocked = 0;
  smartContractsUtxos.forEach(async (smUtxos) => {
    smUtxos.forEach((utxo) => {
      totalValueLocked += utxo.value.coins / ADA_TO_LOVELACE;
      assetInfos = mergeObjectsWithSum(assetInfos, utxo.value.assets);
    })
  });

  const totalAssetsValues = await fetchAssetValue(assetInfos);
  totalValueLocked += totalAssetsValues;

  return { cardano: totalValueLocked };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl: fetch
  },
}
  