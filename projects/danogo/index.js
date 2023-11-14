const { fetchURL, postURL } = require('../helper/utils');
const bech32 = require('bech32');

const DANOGO_GATEWAY_ENDPOINT = 'https://danogo-gateway.tekoapis.com/api/v1'
const KUPO_ENDPOINT = 'https://kupo.tekoapis.com/matches'
const DECODED_PREFIX_LENGTH = 2;
const ADA_TO_LOVELACE = 1000000;

const bech32AddressToHexString = (address) => {
  let decodeResult = bech32.decode(address);
  const dataBytes = bech32.fromWords(decodeResult.words);
  return Buffer.from(dataBytes).toString('hex').substring(DECODED_PREFIX_LENGTH);
}

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
    const assetValue = Number(BigInt(asset.adaValue) * BigInt(100) / BigInt(ADA_TO_LOVELACE)) / 100;
    totalAssetsValue += assetValue * assetsInfo[asset.assetId];
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
  