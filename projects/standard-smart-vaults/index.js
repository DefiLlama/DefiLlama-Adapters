const { ethers } = require('ethers');
const { getLogs } = require('../helper/cache/getLogs')
const SMART_VAULT_MANAGER_ADDRESS = '0xba169cceCCF7aC51dA223e04654Cf16ef41A68CC'
const { sumTokens2 } = require('../helper/unwrapLPs')
const START_TS = 1693206000;

const tokens = [
  ethers.constants.AddressZero,
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  '0x912CE59144191C1204E64559FE8253a0e49E6548',
  '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
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
    tvl: async (_, _1, _2, { api }) => {
      return sumTokens2({ owners: await getOwners(api), tokens, api})
    }
  }
};