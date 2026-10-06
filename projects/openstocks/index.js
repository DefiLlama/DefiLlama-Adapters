// OpenStocks issues oTokens on BNB Chain: permissioned, compliance-gated ERC20s
// giving economic exposure to private company share prices. Each oToken trades
// against USDT in a single PancakeSwap Infinity CL pool, which is the only
// on-chain price source for it.

// https://developer.pancakeswap.finance/contracts/infinity/resources/addresses
const CL_POOL_MANAGER = '0xa0ffb9c1ce1fe56963b0321b32e7a0302114058b'
const USDT = '0x55d398326f99059ff775485246999027b3197955'

const markets = [
  { symbol: 'oANTHROPIC', token: '0x24B518b332543a4E1C3649d063daB199d103760a', pool: '0xa0058e0f2f734561379692044ecbba3547d3fc8299285efb3a313921e7d05078' },
  { symbol: 'oFIGUREAI', token: '0xF9D15fA2adF7942610E8A416363e037859F99E92', pool: '0x005b2ca8ea5cd31b9fafc63fbf3b99a40bfa131b6be2d5d0d1e4e584bec7225a' },
  { symbol: 'oNEURALINK', token: '0xFb7F44e71D03adf619BeA2055437eC6453AB2552', pool: '0x423492b90116195e068e5b9b60e9cfef2773eb6fd5cbd8d4fcefbee60c0c49f2' },
  { symbol: 'oANDURIL', token: '0x5dcb20b5B75110B5F28387D8D3Bdd727a43310d5', pool: '0xcc3f8e13449f66a01e84d9ae8d4387bc840891fccb563b075c5e6a53cbba1d8c' },
]

// oTokens sitting in the issuer multisig are minted but not yet issued
const issuer = '0xd5c0d2fb74cb4b902f9bf08b8065f5ddce9d4dc1'

const slot0Abi = 'function getSlot0(bytes32 id) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'

async function tvl(api) {
  const tokens = markets.map(i => i.token)

  const [supplies, unissued, slot0s] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: tokens }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(target => ({ target, params: issuer })) }),
    api.multiCall({ abi: slot0Abi, target: CL_POOL_MANAGER, calls: markets.map(i => i.pool) }),
  ])

  markets.forEach((market, i) => {
    const circulating = (+supplies[i] - +unissued[i]) / 1e18
    if (!circulating) return

    // Infinity sorts pool currencies by address. oTokens and USDT both use 18 decimals,
    // so no decimal scaling is needed and the raw ratio is already the price in USDT.
    const price = (Number(slot0s[i].sqrtPriceX96) / 2 ** 96) ** 2
    const priceInUsdt = market.token.toLowerCase() < USDT ? price : 1 / price

    api.addUSDValue(circulating * priceInUsdt)
  })
}

module.exports = {
  methodology:
    'TVL is the circulating supply of each OpenStocks oToken on BNB Chain, valued at the price of its PancakeSwap Infinity oToken/USDT pool. Supply is read from each token contract and the price from the pool manager\'s getSlot0, so both inputs are on-chain. oTokens held by the issuer multisig have been minted but not yet issued and are excluded.',
  // TVL is reported as a USD value derived from the pool price, not as USDT actually held
  misrepresentedTokens: true,
  bsc: { tvl },
}
