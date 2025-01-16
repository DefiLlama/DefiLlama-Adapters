const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
const { staking } = require('../helper/staking')

const VAULT_ABI = {
  balance: "uint256:balance",
  want: "address:want",
}

const LP_ABI = {
  token0: "address:token0",
  token1: "address:token1",
  getReserves: "function getReserves() view returns (uint256 _reserve0, uint256 _reserve1, uint256)",
  totalSupply: "uint256:totalSupply",
}

const TOKEN_ABI = {
  decimals: "uint8:decimals",
}

async function fetchBeefyTVL(api) {
  const VAULTS = {
    'aerodrome-weth-klima': '0x1e96a15afb820d5EF58782fDf0f5A5DF027b3e38',
    'aerodrome-usdc-klima': '0x177ec2e92ed22c1efa964c2b46645172b06f3fe5',
    'aerodrome-cbbtc-klima': '0xC304af1A9a50ED2f9E904e8B2e576c3a593b4F88'
  }

  for (const [vaultId, vaultAddress] of Object.entries(VAULTS)) {
    // Get LP token address and balance from vault
    const [balance, lpToken] = await Promise.all([
      api.call({ target: vaultAddress, abi: VAULT_ABI.balance }),
      api.call({ target: vaultAddress, abi: VAULT_ABI.want })
    ])

    // Get LP token data
    const [token0, token1, reserves, totalSupply] = await Promise.all([
      api.call({ target: lpToken, abi: LP_ABI.token0 }),
      api.call({ target: lpToken, abi: LP_ABI.token1 }),
      api.call({ target: lpToken, abi: LP_ABI.getReserves }),
      api.call({ target: lpToken, abi: LP_ABI.totalSupply })
    ])

    // Get token decimals
    const [token0Decimals, token1Decimals] = await Promise.all([
      api.call({ target: token0, abi: TOKEN_ABI.decimals }),
      api.call({ target: token1, abi: TOKEN_ABI.decimals })
    ])

    // Ensure all values are BigInt
    const balanceBN = BigInt(balance.toString())
    const totalSupplyBN = BigInt(totalSupply.toString())
    const reserve0BN = BigInt(reserves[0].toString())
    const reserve1BN = BigInt(reserves[1].toString())

    // Calculate the vault's share of the LP pool
    const share = (balanceBN * BigInt(1e18)) / totalSupplyBN
    
    // Calculate token amounts with proper decimal handling
    const token0Amount = (reserve0BN * share) / BigInt(1e18)
    const token1Amount = (reserve1BN * share) / BigInt(1e18)

    // Add both tokens to TVL with their correct decimals
    api.add(token0, token0Amount, { skipDecimals: true, decimals: token0Decimals })
    api.add(token1, token1Amount, { skipDecimals: true, decimals: token1Decimals })
  }
}

module.exports = {
  methodology: "TVL counts the TCO2 tokens within the BCT pool on Polygon. On Base chain, TVL consists of liquidity pool deposits in the protocol's Beefy-based autocompounding vaults. Data is pulled from Beefy's API.",
  polygon: {
    tvl: async (api) => {
      // If the current block is earlier than the date BCT was transferred to KlimaDAO, return 0
      if (api.timestamp < 1709828986)  return {}
      const bctAddress = "0x2F800Db0fdb5223b3C3f354886d907A671414A7F"
      const supply = await api.call({ abi: 'erc20:totalSupply', target: bctAddress, })
      api.add(bctAddress, supply)      
    },
    staking: staking("0x25d28a24Ceb6F81015bB0b2007D795ACAc411b4d", "0x4e78011ce80ee02d2c3e649fb657e45898257815"),
  },
  base: {
    tvl: fetchBeefyTVL
  },
  hallmarks: [
    [1709828986, "BCT administrative control transferred to KlimaDAO"],
    [1732153403, "Autocompounder launched"],
  ]
};