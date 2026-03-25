const ADDRESSES = require('../helper/coreAssets.json')

// stMANTRA Liquid Staking (ERC-4626 Vault) — also the stMANTRA token address
const STAKING_VAULT = '0x4131a80b67BE287627766B858C3C6d7f9e900324'

// Mantra EVM tokens not yet in DefiLlama's pricing DB — map via CoinGecko
const CG_TOKEN_MAPPING = {
  '0x3806640578b710d8480910bF51510bc538d2F51A': { coingeckoId: 'tether', decimals: 6 },  // USDT
}

// RFR Vaults (BoringVault / Arctic Architecture)
const RFR_VAULTS = [
  {
    // wmantraUSD Yield Vault
    boringVault: '0x320C6ebDd3e0c322AFb42D71d264a316fC81E13A',
    accountant: '0xcB6C931AC97Da626684B44af070465938eAE20b6',
  },
  // wmantraUSD Points Vault — add here once deployed
]

// LP CLM Vaults (QuickSwap concentrated liquidity)
const CLM_VAULTS = [
  '0x0E5bC115b49b11D5039F03A4A15C2bD9D677Fb50', // USDT/mantraUSD
  '0x794F0D4c8F62cc52A8Cd4f6838CF6B6121e5355A', // USDC/mantraUSD
  '0x70bDFBA8153765B5015Af9985FFf29dCB2acF383', // stMANTRA/wMANTRA
  '0x275B79aeAf304b6f12E83fAa0224c8C4DB2D2ac8', // mantraUSD/wMANTRA
  '0x97afC9C8c6aa39Ee98720022050c6CDF924cAfd5', // HYPE/wMANTRA
]

async function tvl(api) {
  // 1. stMANTRA Liquid Staking — totalAssets() returns total OM managed
  const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: STAKING_VAULT })
  api.add(ADDRESSES.mantra.wMANTRA, totalAssets)

  // 2. RFR Vaults — TVL = totalSupply * getRate / 10^decimals
  for (const { boringVault, accountant } of RFR_VAULTS) {
    const [totalSupply, rate, decimals] = await Promise.all([
      api.call({ abi: 'uint256:totalSupply', target: boringVault }),
      api.call({ abi: 'uint256:getRate', target: accountant }),
      api.call({ abi: 'uint8:decimals', target: boringVault }),
    ])
    const base = await api.call({ abi: 'address:base', target: accountant })
    const assets = BigInt(totalSupply) * BigInt(rate) / (10n ** BigInt(decimals))
    api.add(base, assets.toString())
  }

  // 3. LP CLM Vaults — balances() returns (amount0, amount1), wants() returns (token0, token1)
  const balances = await api.multiCall({ abi: 'function balances() view returns (uint256, uint256)', calls: CLM_VAULTS })
  const wants = await api.multiCall({ abi: 'function wants() view returns (address, address)', calls: CLM_VAULTS })

  for (let i = 0; i < CLM_VAULTS.length; i++) {
    const tokens = [wants[i][0], wants[i][1]]
    const bals = [balances[i][0], balances[i][1]]

    for (let j = 0; j < 2; j++) {
      if (tokens[j].toLowerCase() === STAKING_VAULT.toLowerCase()) {
        // Skip stMANTRA — its backing OM is already counted by totalAssets() above
        continue
      } else if (CG_TOKEN_MAPPING[tokens[j]]) {
        const { coingeckoId, decimals } = CG_TOKEN_MAPPING[tokens[j]]
        api.addCGToken(coingeckoId, Number(bals[j]) / (10 ** decimals))
      } else {
        api.add(tokens[j], bals[j])
      }
    }
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is calculated as the sum of: (1) total OM staked via stMANTRA liquid staking (totalAssets), (2) total assets in RFR wmantraUSD yield vaults (totalSupply * exchangeRate), and (3) token balances held in concentrated liquidity management vaults.',
  mantra: { tvl },
}
