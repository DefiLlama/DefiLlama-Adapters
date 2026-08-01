const ADDRESSES = require('../helper/coreAssets.json')

const POT_OWNERS = [
  '0xEe6f49Dc2f1D0d9567dDd3FD6D77D8F7edfe7379', // Yeet v1 Game
  '0x9B84297A081903e79f7b449a5239244abEbBEbd5', // Yeet v1 Lottery
  '0xF6977c3D5154Aa4510B16267761Da16fE6bb05e4', // BGT Auction Game
  '0xd05A807eDD9710e9064BC2535995C4a9d2332B8c', // PrizeManager
]

const TRIFECTA_VAULT = '0xD3908dA797eCeC7ea0fBfbacF3118302E215556c'

async function tvl(api) {
  await api.sumTokens({
    owners: POT_OWNERS,
    tokens: [ADDRESSES.null, ADDRESSES.berachain.WBERA],
  })
}
async function pool2(api) {
  // Trifecta deposits its LP into an external strategy, so balanceOf(vault) reads 0.
  const lpToken = await api.call({ target: TRIFECTA_VAULT, abi: 'address:asset' })
  const lpHeld = await api.call({ target: TRIFECTA_VAULT, abi: 'uint256:totalAssets' })
  if (lpHeld > 0) {
    const [token0, token1, lpSupply, underlying] = await Promise.all([
      api.call({ target: lpToken, abi: 'address:token0' }),
      api.call({ target: lpToken, abi: 'address:token1' }),
      api.call({ target: lpToken, abi: 'erc20:totalSupply' }),
      api.call({
        target: lpToken,
        abi: 'function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)',
      }),
    ])
    const supply = BigInt(lpSupply)
    if (supply === 0n) return
    const held = BigInt(lpHeld)
    const share = (n) => (BigInt(n) * held) / supply
    api.add(token0, share(underlying.amount0Current))
    api.add(token1, share(underlying.amount1Current))
  }
}

module.exports = {
  berachain: { tvl, pool2 },
}
