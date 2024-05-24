const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const {lendingMarket} = require('../helper/methodologies')

const VaultController = "0x4aaE9823Fb4C70490F1d802fC697F3ffF8D5CbE3"

const vaultSummaryAbi = 'function vaultSummaries(uint96 start, uint96 stop) view returns (tuple(uint96 id, uint192 borrowingPower, uint192 vaultLiability, address[] tokenAddresses, uint256[] tokenBalances)[])'

const cappedTokens = {
  "0x5aC39Ed42e14Cf330A864d7D1B82690B4D1B9E61": {
    address: ADDRESSES.ethereum.MATIC,
    symbol: 'MATIC',
  },
  "0xfb42f5AFb722d2b01548F77C31AC05bf80e03381": {
    address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    symbol: 'ENS',
  },
  "0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85": {
    address: '0xba100000625a3754423978a60c9317c58a424e3d',
    symbol: 'BAL',
  },
  "0xd3bd7a8777c042De830965de1C1BCC9784135DD2": {
    address: ADDRESSES.ethereum.AAVE,
    symbol: 'AAVE',
  },
  "0x7C1Caa71943Ef43e9b203B02678000755a4eCdE9": {
    address: ADDRESSES.ethereum.LIDO,
    symbol: 'LDO',
  },
  "0xDDB3BCFe0304C970E263bf1366db8ed4DE0e357a": {
    address: '0x92d6c1e31e14520e676a687f0a93788b716beff5',
    symbol: 'DYDX',
  },
  "0x9d878eC06F628e883D2F9F1D793adbcfd52822A8": {
    address: ADDRESSES.ethereum.CRV,
    symbol: 'CRV',
  },
  "0x64eA012919FD9e53bDcCDc0Fc89201F484731f41": {
    address: ADDRESSES.ethereum.RETH,
    symbol: 'rETH',
  },
  "0x99bd1f28a5A7feCbE39a53463a916794Be798FC3": {
    address: ADDRESSES.ethereum.cbETH,
    symbol: 'cbETH',
  },
}

async function tvl(api) {
  const balances = {}
  const count = await api.call({  abi: " function vaultsMinted() view returns (uint96)", target: VaultController })
  const calls = []
  for (let i = 1; i <= count; i++) 
    calls.push({ params: [i, i]})

  const vaults = (await api.multiCall({  abi: vaultSummaryAbi, target: VaultController, calls, permitFailure: true })).filter(i => i).flat()

  vaults.map(vault => {
    vault.tokenAddresses.map((token, i) => {
      token = cappedTokens[token]?.address || token
      sdk.util.sumSingleBalance(balances,token,vault.tokenBalances[i])
    })
  })

  return sumTokens2({ api, balances, owner: '0x2A54bA2964C8Cd459Dc568853F79813a60761B58', tokens: [ADDRESSES.ethereum.USDC]})
}

module.exports = {
  start: 14962974,
  ethereum: {
    tvl,
  },
  methodology: `${lendingMarket}.
  For Interest Protocol, TVL is Reserve + Total Collateral Value
  Reserve is found through calling USDC.getBalances(USDI)
  Balances are found through VaultController.vaultSummaries(1,VaultController.vaultsMinted())
  Capped tokens converted 1:1 to underlying
  `
};
