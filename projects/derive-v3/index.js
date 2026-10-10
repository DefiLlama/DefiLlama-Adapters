const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

// Derive v3: zk exchange settled on Ethereum L1. All user collateral is custodied in SPOT_VAULT.
// https://docs.derive.xyz/getting-started/contracts
const SPOT_VAULT = '0x2e7dF4fAf35a1599979C7E764444e112d936ec42'
const DRV = '0xB1D1eae60EEA9525032a6DCb4c1CE336a1dE71BE'

// Bridged (LayerZero OFT) / custody-wrapped tokens on L1 with no price feed -> canonical asset
// https://docs.derive.xyz/getting-started/custom-bridges
const TOKEN_MAP = {
  '0x0762365e088fb8d285b295d782bb7b23690713e2': 'hyperliquid:' + ADDRESSES.hyperliquid.WHYPE, // HYPE OFT
  '0xb5ead284cd00fd0eb37e84327a4ee781172a07d6': 'solana:So11111111111111111111111111111111111111112', // SOL OFT
  '0xc2908db337aa16fb22b01bd4e8ff91460b23ff4b': 'solana:J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', // jitoSOL OFT
  '0x2e3023ca882ee359ebfa69b740be318df1b5cd7c': 'ethereum:' + ADDRESSES.ethereum.cbBTC, // cbBTC OFT from Base
  '0x13fd17b60735be034b874e31ef4aed2cd613c9f9': 'flare:0xAd552A648C74D49E10027AB8a618A3ad4901c5bE', // FXRP OFT
  '0x1ebb06ae854f186030a80bb7b3e73d5f22240fd6': 'ethereum:' + ADDRESSES.ethereum.USDC, // Strands.DACAP.BitGo.USDC
  '0xee70394909906e9b5fe6d19d16b8c07058b06d74': 'ethereum:' + ADDRESSES.ethereum.USDT, // Strands.DACAP.BitGo.USDT
}

async function tvl(api) {
  const universes = await getConfig('derive-v3/collaterals', 'https://api.derive.xyz/v3/public/get_risk_universes')
  const tokens = new Set()
  for (const u of universes.result) for (const m of u.managers) for (const c of m.collaterals)
    if (c.erc20?.underlying_erc20) tokens.add(c.erc20.underlying_erc20.toLowerCase())
  tokens.delete(DRV.toLowerCase())
  const list = [...tokens]
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: list.map(t => ({ target: t, params: SPOT_VAULT })) })
  list.forEach((t, i) => api.add(TOKEN_MAP[t] ?? t, bals[i], { skipChain: !!TOKEN_MAP[t] }))
}

module.exports = {
  methodology: 'Sum of all supported collateral tokens held in the Derive v3 SPOT_VAULT contract on Ethereum. DRV (own token) is excluded.',
  hallmarks: [['2026-10-08', 'V3 launch: migration from Derive Chain to Ethereum L1']],
  ethereum: { tvl },
}
