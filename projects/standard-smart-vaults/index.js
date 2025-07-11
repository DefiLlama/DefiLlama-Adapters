const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const SMART_VAULT_MANAGER_EUR_ADDRESS = '0xba169cceCCF7aC51dA223e04654Cf16ef41A68CC';
const SMART_VAULT_MANAGER_USD_ADDRESS = '0x496aB4A155C8fE359Cd28d43650fAFA0A35322Fb';
const { sumTokens2, unwrapHypervisorVaults } = require('../helper/unwrapLPs')
const START_TS = 1693206000;

const gammaVaults = [
  '0x52ee1FFBA696c5E9b0Bc177A9f8a3098420EA691',
  '0x6B7635b7d2E85188dB41C3c05B1efa87B143fcE8',
  '0xfA392dbefd2d5ec891eF5aEB87397A89843a8260',
  '0xF08BDBC590C59cb7B27A8D224E419ef058952b5f',
  '0x2BCBDD577616357464CFe307Bc67F9e820A66e80',
  '0x547a116a2622876ce1c8d19d41c683c8f7bec5c0',
  '0x95375694685E39997828Ed5B17f30f0A3eD90537',
  '0xa7fce463815f18dbe246152c5291b84db07c0bcd'
].map(i => i.toLowerCase());

const tokens = [
  ADDRESSES.null,
  ADDRESSES.arbitrum.WBTC,
  ADDRESSES.arbitrum.ARB,
  ADDRESSES.arbitrum.LINK,
  ADDRESSES.arbitrum.GMX,
  '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429',
  '0x3082CC23568eA640225c2467653dB90e9250AaA0',
  '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
  ADDRESSES.arbitrum.USDT,
  ADDRESSES.arbitrum.WSTETH,
  ...gammaVaults
]

async function getOwners(api) {
  const vaultEvents = [];
  for (const target of [SMART_VAULT_MANAGER_EUR_ADDRESS, SMART_VAULT_MANAGER_USD_ADDRESS]) {
    const logs = await getLogs({
      target,
      topic: 'VaultDeployed(address,address,address,uint256)',
      eventAbi: 'event VaultDeployed(address indexed vaultAddress, address indexed owner, address vaultType, uint256 tokenId)',
      fromBlock: 117059962,
      api,
    });
    vaultEvents.push(...logs);
  }

  return vaultEvents.map(event => event.args.vaultAddress);
}

module.exports = {
  methodology: 'counts the aggregated assets locked in The Standard Smart Vaults.',
  start: START_TS,
  arbitrum: {
    tvl: async (api) => {
      await sumTokens2({ owners: await getOwners(api), tokens, api })
      await unwrapHypervisorVaults({ api, lps: gammaVaults })
    }
  }
};