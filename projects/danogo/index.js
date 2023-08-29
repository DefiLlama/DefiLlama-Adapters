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

const fetchAssetValue = async (assetIds) => {
  const gatewayResponse = await postURL(`${DANOGO_GATEWAY_ENDPOINT}/cardano-asset-value`, { assetIds: assetIds});
  return gatewayResponse.data.data.assetValues
    .map((asset) => Number(BigInt(asset.adaValue) * BigInt(100) / BigInt(ADA_TO_LOVELACE)) / 100)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

const fetch = async () => {
  const smartContracts = await fetchSmartContractAddresses();
  
  const smartContractsUtxos = await Promise.all(smartContracts.map((address) => {
    return fetchSmartContractUTXOs(address)
  }));

  let assetIds = [];
  let totalValueLocked = 0;
  smartContractsUtxos.forEach(async (smUtxos) => {
    smUtxos.forEach((utxo) => {
      totalValueLocked += utxo.value.coins / ADA_TO_LOVELACE;
      Object.keys(utxo.value.assets).forEach((assetId) => {
        assetIds.push(assetId);
      })
    })
  });

  const totalAssetsValues = await fetchAssetValue(assetIds);
  totalValueLocked += totalAssetsValues;

  return { cardano: totalValueLocked };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl: fetch
  },
}
  