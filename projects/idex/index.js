const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2 } = require("../helper/unwrapLPs")
const { getConfig } = require('../helper/cache')

const IDEX_ETHEREUM_CUSTODY_CONTRACT = "0xE5c405C5578d84c5231D3a9a29Ef4374423fA0c2";
const IDEX_POLYGON_CUSTODY_CONTRACT = "0x3bcc4eca0a40358558ca8d1bcd2d1dbde63eb468";

async function tvl(api) {
  const chain = api.chain
  let tokens = [ADDRESSES.null]
  let owner

  switch (chain) {
    case 'polygon':
      const assets = await getConfig('idex/polygon', 'https://api-matic.idex.io/v1/assets')
      assets.forEach(t => tokens.push(t.contractAddress))
      owner = IDEX_POLYGON_CUSTODY_CONTRACT
      break;
    case 'ethereum':
      owner = IDEX_ETHEREUM_CUSTODY_CONTRACT
      break;
    default:
      throw new Error('Unknown chain ' + chain);
  }

  return sumTokens2({ api, tokens, owner, fetchCoValentTokens: chain === 'ethereum' })
}

module.exports = {
  ethereum: { tvl, },
  polygon: { tvl, },
};
