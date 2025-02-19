const ADDRESSES = require('../helper/coreAssets.json');
const { getLogs } = require('../helper/cache/getLogs');
const SMART_VAULT_MANAGER_EUR_ADDRESS = '0xba169cceCCF7aC51dA223e04654Cf16ef41A68CC';
const SMART_VAULT_MANAGER_USD_ADDRESS = '0x496aB4A155C8fE359Cd28d43650fAFA0A35322Fb';
const { sumTokens2 } = require('../helper/unwrapLPs');
const { default: BigNumber } = require('bignumber.js');
const START_TS = 1693206000;

const abis = {
  events: {
    vaultDeployed: 'event VaultDeployed(address indexed vaultAddress, address indexed owner, address vaultType, uint256 tokenId)'
  },
  functions: {
    token0: {"inputs": [],"name": "token0","outputs": [{"internalType": "contract IERC20","name": "","type": "address"}],"stateMutability": "view","type": "function"},
    token1: {"inputs": [],"name": "token1","outputs": [{"internalType": "contract IERC20","name": "","type": "address"}],"stateMutability": "view","type": "function"},
    getTotalAmounts: {"inputs": [],"name": "getTotalAmounts","outputs": [{"internalType": "uint256","name": "total0","type": "uint256"},{"internalType": "uint256","name": "total1","type": "uint256"}],"stateMutability": "view","type": "function"}
  }
}

const tokens = [
  ADDRESSES.null,
  ADDRESSES.arbitrum.WETH,
  ADDRESSES.arbitrum.WBTC,
  ADDRESSES.arbitrum.ARB,
  ADDRESSES.arbitrum.LINK,
  ADDRESSES.arbitrum.GMX,
  '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429',
  '0x3082CC23568eA640225c2467653dB90e9250AaA0',
  '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
  '0x52ee1FFBA696c5E9b0Bc177A9f8a3098420EA691',
  '0x6B7635b7d2E85188dB41C3c05B1efa87B143fcE8',
  '0xfA392dbefd2d5ec891eF5aEB87397A89843a8260',
  '0xF08BDBC590C59cb7B27A8D224E419ef058952b5f',
  '0x2BCBDD577616357464CFe307Bc67F9e820A66e80',
  '0x547a116a2622876ce1c8d19d41c683c8f7bec5c0'
]

const gammaVaults = [
  '0x52ee1FFBA696c5E9b0Bc177A9f8a3098420EA691',
  '0x6B7635b7d2E85188dB41C3c05B1efa87B143fcE8',
  '0xfA392dbefd2d5ec891eF5aEB87397A89843a8260',
  '0xF08BDBC590C59cb7B27A8D224E419ef058952b5f',
  '0x2BCBDD577616357464CFe307Bc67F9e820A66e80',
  '0x547a116a2622876ce1c8d19d41c683c8f7bec5c0'
]

async function getOwners(api) {
  const vaultEvents = [
    ... await getLogs({
      target: SMART_VAULT_MANAGER_EUR_ADDRESS,
      topic: 'VaultDeployed(address,address,address,uint256)',
      eventAbi: abis.events.vaultDeployed,
      fromBlock: 117059962,
      api
    }),
    ... await getLogs({
      target: SMART_VAULT_MANAGER_USD_ADDRESS,
      topic: 'VaultDeployed(address,address,address,uint256)',
      eventAbi: abis.events.vaultDeployed,
      fromBlock: 263697792,
      api
    })
  ];

  return vaultEvents.map(event => event.args.vaultAddress);
}

async function getUnderlyingTokensForGamma(sums, api) {
  for (let i = 0; i < gammaVaults.length; i++) {
    const gammaVaultAddress = gammaVaults[i]
    if (sums[`arbitrum:${gammaVaultAddress.toLowerCase()}`]) {
      const token0 = await api.call({
        target: gammaVaultAddress,
        abi: abis.functions.token0
      });
      const token1 = await api.call({
        target: gammaVaultAddress,
        abi: abis.functions.token1
      })
      const totalSupply = await api.call({
        target: gammaVaultAddress,
        abi: 'erc20:totalSupply'
      })
      const totalAmounts = await api.call({
        target: gammaVaultAddress,
        abi: abis.functions.getTotalAmounts
      })
      const underlying0 = BigNumber(totalAmounts.total0).multipliedBy(sums[`arbitrum:${gammaVaultAddress.toLowerCase()}`]).dividedToIntegerBy(totalSupply);
      const underlying1 = BigNumber(totalAmounts.total1).multipliedBy(sums[`arbitrum:${gammaVaultAddress.toLowerCase()}`]).dividedToIntegerBy(totalSupply);
      sums[`arbitrum:${token0.toLowerCase()}`] = sums[`arbitrum:${token0.toLowerCase()}`] ?
        BigNumber(sums[`arbitrum:${token0.toLowerCase()}`]).plus(underlying0).toString() :
        underlying0.toString();
      sums[`arbitrum:${token1.toLowerCase()}`] = sums[`arbitrum:${token1.toLowerCase()}`] ?
        BigNumber(sums[`arbitrum:${token1.toLowerCase()}`]).plus(underlying1).toString() :
        underlying1.toString();
      delete sums[`arbitrum:${gammaVaultAddress.toLowerCase()}`];
    }
    console.log(sums);
  }
  return sums;
}

async function collateralAndLockedCollateral(api) {
  const owners = await getOwners(api);
  const sum = await getUnderlyingTokensForGamma(await sumTokens2({ owners, tokens, api}), api);
  return sum;
}

module.exports = {
  methodology: 'counts the aggregated assets locked in The Standard Smart Vaults.',
  start: START_TS,
  arbitrum: {
    tvl: async (api) => {
      return collateralAndLockedCollateral(api)
    }
  }
};