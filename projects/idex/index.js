const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

const { covalentGetTokens, get } = require("../helper/http")
const { sumTokens2 } = require("../helper/unwrapLPs")
const { getConfig } = require('../helper/cache')

const IDEX_ETHEREUM_CUSTODY_CONTRACT = "0xE5c405C5578d84c5231D3a9a29Ef4374423fA0c2";
const IDEX_POLYGON_CUSTODY_CONTRACT = "0x3bcc4eca0a40358558ca8d1bcd2d1dbde63eb468";

/*==================================================
  TVL
  ==================================================*/

async function tvl(_timestamp, block, chain) {
  let tokens = [ADDRESSES.null]
  let owner

  switch (chain) {
    case 'polygon':
      const assets = await getConfig('idex/polygon','https://api-matic.idex.io/v1/assets')
      assets.forEach(t => tokens.push(t.contractAddress))
      owner = IDEX_POLYGON_CUSTODY_CONTRACT
      break;
    case 'ethereum':
      owner = IDEX_ETHEREUM_CUSTODY_CONTRACT
      const ethAssets = await covalentGetTokens(owner)
      ethAssets
        .filter(t => t !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' && t !== '0x7b0c06043468469967dba22d1af33d77d44056c8')
        .forEach(t => tokens.push(t))
      break;
    default:
      throw new Error('Unknown chain ' + chain);
  }

  const res = await sumTokens2({ chain, block, tokens, owner })
  return res
}

/*==================================================
  Exports
  ==================================================*/

const ethereumTvl = (_timestamp, block, chainBlocks) => tvl(_timestamp, block, 'ethereum')
const polygonTvl = (_timestamp, block, chainBlocks) => tvl(_timestamp, chainBlocks.polygon, 'polygon')

module.exports = {
  ethereum: {
    start: 1603166400,
    tvl: ethereumTvl,
  },
  polygon: {
    start: 1638316800,
    tvl: polygonTvl,
  },
};
