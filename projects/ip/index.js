const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { lendingMarket } = require('../helper/methodologies');
const { eth } = require('@defillama/sdk/build/api');
const { ethereum } = require('../helper/whitelistedNfts');
const { default: BigNumber } = require('bignumber.js');


const vaultSummaryAbi = 'function vaultSummaries(uint96 start, uint96 stop) view returns (tuple(uint96 id, uint192 borrowingPower, uint192 vaultLiability, address[] tokenAddresses, uint256[] tokenBalances)[])'
const vaultAddrAbi = "function vaultAddress(uint96 id) view returns (address vaultAddress)"
const votingVaultAddrAbi = "function votingVaultAddress(uint96 id) view returns (address vaultAddress)"
const primaryReserveAbi = "function _reserve() view returns (uint256 reserve)"
const secondaryReserveAbi = "function _secondaryReserve() view returns (uint256 reserve)"


async function eth_tvl(api) {
  //get reserves
  const USDI = "0x2A54bA2964C8Cd459Dc568853F79813a60761B58"
  const primaryReserve = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.ethereum.USDC,
    params: [USDI]
  })
  await api.add(ADDRESSES.ethereum.USDC, primaryReserve)


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
    "0xe2C1d2E7aA4008081CAAFc350A040246b9EBB579": {
      address: ADDRESSES.ethereum.YFI,
      symbol: 'YFI',
    },
    "0x6b68C5708DAffD0393aCC6A8cc92f8C2146346Ae": {
      address: "0xD33526068D116cE69F19A9ee46F0bd304F21A51f",
      symbol: 'RPL',
    },
    "0xbb5578c08bC08c15AcE5cd09c6683CcCcB2A9148": {
      address: ADDRESSES.ethereum.MKR,
      symbol: 'MKR',
    },
    "0x739D346421a42beb13FD8D560dd2F42250d4Ac88": {
      address: "0xDcEe70654261AF21C44c093C300eD3Bb97b78192",
      symbol: 'WOETH',
    },
    "0xDdAD1d1127A7042F43CFC209b954cFc37F203897": {
      address: "0x06AF07097C9Eeb7fD685c692751D5C66dB49c215",
      symbol: "CHAI"
    },
    "0xDf623240ec300fD9e2B7780B34dC2F417c0Ab6D2": {
      address: "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
      symbol: "ZRX"
    }    
  }
  const VaultController = "0x4aaE9823Fb4C70490F1d802fC697F3ffF8D5CbE3"

  const balances = {}
  const count = await api.call({ abi: " function vaultsMinted() view returns (uint96)", target: VaultController })
  const calls = []
  for (let i = 1; i <= count; i++)
    calls.push({ params: [i, i] })

  const vaults = (await api.multiCall({ abi: vaultSummaryAbi, target: VaultController, calls, permitFailure: true })).filter(i => i).flat()

  vaults.map(vault => {
    vault.tokenAddresses.map((token, i) => {
      token = cappedTokens[token]?.address || token
      sdk.util.sumSingleBalance(balances, token, vault.tokenBalances[i])
    })
  })

  return sumTokens2({ api, balances, owner: '0x2A54bA2964C8Cd459Dc568853F79813a60761B58', tokens: [ADDRESSES.ethereum.USDC] })

  /**
  
   */
}

async function op_tvl(api) {
  //get reserves
  const USDI = "0x889be273BE5F75a177f9a1D00d84D607d75fB4e1"
  const primaryReserve = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.optimism.USDC,
    params: [USDI]
  })
  const secondaryReserve = await api.call({
    abi: 'erc20:balanceOf',
    target: ADDRESSES.optimism.USDC_CIRCLE,
    params: [USDI]
  })
  await api.add(ADDRESSES.optimism.USDC, primaryReserve)
  await api.add(ADDRESSES.optimism.USDC_CIRCLE, secondaryReserve)


  //get collaterals
  //9 enabled tokens, last index == 8
  //todo idx 6 - UNI POSITION
  const cappedTokens = {
    "0x696607447225f6690883e718fd0Db0Abaf36B6E2": {
      address: ADDRESSES.optimism.WETH_1,
      symbol: 'WETH',
    },
    "0x5a83002E6d8dF75c79ADe9c209F21C31B0AB14B2": {
      address: ADDRESSES.optimism.WBTC,
      symbol: 'WBTC',
    },
    "0xb549c8cc8011CA0d023A73DAD54d725125b25F31": {
      address: ADDRESSES.optimism.OP,
      symbol: 'OP',
    },
    "0xE1442bA08e330967Dab4fd4Fc173835e9730bff6": {
      address: ADDRESSES.optimism.WSTETH,
      symbol: 'WSTETH',
    },
    "0x399bA3957D0e5F6e62836506e760787FDDFb01c3": {
      address: "0x9Bcef72be871e61ED4fBbc7630889beE758eb81D",
      symbol: 'RETH',
    },
    "0x45b265c7919D7FD8a0D673D7ACaA8F5A7abb430D": {
      address: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
      symbol: 'SNX',
    },
    "0x625E7708f30cA75bfd92586e17077590C60eb4cD": {
      address: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      symbol: 'aOptUSDC',
    },
    "0x6F7A2f0d9DBd284E274f28a6Fa30e8760C25F9D2": {
      address: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      symbol: "aOptUSDC"
    }
  }
  const positionWrapper = "0x7131FF92a3604966d7D96CCc9d596F7e9435195c"
  const VaultController = "0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85"
  const count = await api.call({ abi: " function vaultsMinted() view returns (uint96)", target: VaultController })
  const balances = {}
  const calls = []
  for (let i = 1; i <= count; i++)
    calls.push({ params: [i, i] })

  const vaults = (await api.multiCall({ abi: vaultSummaryAbi, target: VaultController, calls, permitFailure: true })).filter(i => i).flat()

  vaults.map(vault => {
    vault.tokenAddresses.map((token, i) => {
      token = cappedTokens[token]?.address || token
      sdk.util.sumSingleBalance(balances, token, vault.tokenBalances[i])
    })
  })

  //add
  for (const [addr, total] of Object.entries(balances)) {
    if (addr == ADDRESSES.optimism.WBTC) {
      //scale for wbtc decimals
      const scaled = new BigNumber(total).div(new BigNumber("10000000000"))
      await api.add(addr, scaled.c[0])
    } else if (addr == positionWrapper) {
      //total is already in usd 1e18 terms, add as DAI, as this is a stablecoin at 1e18
      await api.add(ADDRESSES.optimism.DAI, total)
    } else {
      await api.add(addr, total)
    }
  }
}

//updated 6/25/2024
module.exports = {
  start: 14962974,
  ethereum: {
    tvl: eth_tvl
  },
  optimism: {
    tvl: op_tvl
  },
  methodology: `${lendingMarket}.
  For Interest Protocol, TVL is USDC Reserve + Total Deposited Collateral Value
  Reserve is the amount of USDC held by the USDI contract
  Balances are found through VaultController.vaultSummaries(1,VaultController.vaultsMinted())
  Capped tokens converted 1:1 to underlying
  Wrapped Uni V3 Positions as implemented report their values to Interest Protocol in USD terms * 1e18,
  as such, they are currently listed as DAI in the TVL calculation, 
  therefore DAI numbers in the TVL should be treated as Uniswap V3 position collateral value, as DAI is not otherwise listed on IP. 
  `
};
