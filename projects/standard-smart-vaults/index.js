const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const SMART_VAULT_MANAGER_ADDRESS = '0xba169cceCCF7aC51dA223e04654Cf16ef41A68CC'
const { sumTokens2 } = require('../helper/unwrapLPs')
const START_TS = 1693206000;

const tokens = [
  ADDRESSES.null,
  ADDRESSES.arbitrum.WBTC,
  ADDRESSES.arbitrum.ARB,
  ADDRESSES.arbitrum.LINK,
  ADDRESSES.arbitrum.GMX,
  '0x3082CC23568eA640225c2467653dB90e9250AaA0',
  '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429'
]

async function getOwners(api) {
  const vaultEvents = await getLogs({
    target: SMART_VAULT_MANAGER_ADDRESS,
    topic: 'VaultDeployed(address,address,address,uint256)',
    eventAbi: 'event VaultDeployed(address indexed vaultAddress, address indexed owner, address vaultType, uint256 tokenId)',
    fromBlock: 117059962,
    api
  });

  return vaultEvents.map(event => event.args.vaultAddress);
}

module.exports = {
  methodology: 'counts the aggregated assets locked in The Standard Smart Vaults.',
  start: START_TS,
  arbitrum: {
    tvl: async (api) => {
      return sumTokens2({ owners: await getOwners(api), tokens, api})
    }
  }
};