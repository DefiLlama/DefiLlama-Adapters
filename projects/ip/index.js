const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { lendingMarket } = require('../helper/methodologies');

const vaultSummaryAbi = 'function vaultSummaries(uint96 start, uint96 stop) view returns (tuple(uint96 id, uint192 borrowingPower, uint192 vaultLiability, address[] tokenAddresses, uint256[] tokenBalances)[])'

async function getVaultData(api, vaultController) {
  const cappedTokens = {}
  let pullMoreTokens = true
  let enabledTokenIndex = 0
  const batchSize = 10
  const allTokens = []
  do {
    let calls = []
    for (let i = 0; i < 10; i++) {
      calls.push(enabledTokenIndex + i)
    }
    enabledTokenIndex += batchSize
    const tokens = await api.multiCall({ abi: 'function _enabledTokens(uint256) view returns (address)', calls, permitFailure: true, target: vaultController })
    allTokens.push(...tokens.filter(i => i))
    pullMoreTokens = !tokens.some(token => !token)
  } while (pullMoreTokens)

  const uTokens = await api.multiCall({ abi: 'address:_underlying', calls: allTokens, permitFailure: true, })
  uTokens.forEach((token, i) => {
    if (!token) return;
    cappedTokens[allTokens[i].toLowerCase()] = token
  })

  const count = await api.call({ abi: " function vaultsMinted() view returns (uint96)", target: vaultController })
  const calls = []
  for (let i = 1; i <= count; i++)
    calls.push({ params: [i, i] })

  const vaults = (await api.multiCall({ abi: vaultSummaryAbi, target: vaultController, calls, permitFailure: true })).filter(i => i).flat()

  return { cappedTokens, vaults }
}

async function eth_tvl(api) {
  const VaultController = "0x4aaE9823Fb4C70490F1d802fC697F3ffF8D5CbE3"

  const { cappedTokens, vaults } = await getVaultData(api, VaultController)

  vaults.map(vault => {
    vault.tokenAddresses.map((token, i) => {
      token = cappedTokens[token.toLowerCase()] ?? token
      api.add(token, vault.tokenBalances[i])
    })
  })

  //get reserves
  return sumTokens2({ api, owner: '0x2A54bA2964C8Cd459Dc568853F79813a60761B58', tokens: [ADDRESSES.ethereum.USDC] })
}

async function op_tvl(api) {
  //get reserves
  const USDI = "0x889be273BE5F75a177f9a1D00d84D607d75fB4e1"
  await api.sumTokens({ owner: USDI, tokens: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE] })

  //get collaterals
  const positionWrapper = "0x7131FF92a3604966d7D96CCc9d596F7e9435195c".toLowerCase()
  const VaultController = "0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85"
  const { cappedTokens, vaults } = await getVaultData(api, VaultController)

  vaults.map(vault => {
    vault.tokenAddresses.map((token, i) => {
      const bal = vault.tokenBalances[i]
      if (+bal === 0) return;
      token = cappedTokens[token.toLowerCase()] ?? token
      token = token.toLowerCase()
      if (token === ADDRESSES.optimism.WBTC.toLowerCase()) {
        //scale for wbtc decimals
        api.add(token, bal / 1e10)
      } else if (token === positionWrapper) {
        //total is already in usd 1e18 terms, add as DAI, as this is a stablecoin at 1e18
        api.add(ADDRESSES.optimism.DAI, bal)
      } else {
        api.add(token, bal)
      }
    })
  })
}

module.exports = {
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
