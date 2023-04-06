const sdk = require('@defillama/sdk');

const SmartYield = require('./abis/SmartYield.js');

exports.poolByProvider = async (chain, provider) => {
  const pool = (
    await sdk.api.abi.call({
      abi: SmartYield.find((i) => i.name === 'poolByProvider'),
      chain: chain.name,
      target: chain.address,
      params: [provider],
    })
  ).output;

  return pool;
};
