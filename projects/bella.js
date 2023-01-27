
const sdk = require('@defillama/sdk')
const { sumTokens } = require('./helper/unwrapLPs')
const bVaultAbi = require('./config/bella/abis/bVault')

const bVaults = {
  bUsdt: { address: '0x2c23276107b45E64c8c59482f4a24f4f2E568ea6', },
  bUsdc: { address: '0x8016907D54eD8BCf5da100c4D0EB434C0185dC0E', },
  bArpa: { address: '0x750d30A8259E63eD72a075f5b6630f08ce7996d0', },
  bWbtc: { address: '0x3fb6b07d77dace1BA6B5f6Ab1d8668643d15a2CC', },
  bHbtc: { address: '0x8D9A39706d3B66446a298f1ae735730257Ec6108', },
  // bBusd: { address: '0x378388aa69f3032FA46150221210C7FA70A35153', },  // according to the team this is deprecated
}

const uniswapV2Pools = {
  belUsdt: { address: '0xf0d1109e723cb06e400e2e57d0b6c7c32bedf61a', owner: '0x6731a6a2586a0d555dcff7eb4d8fb7444bdfde2a' },
  belEth: { address: '0x9e98deac1a416c9ce3c892bd8eef586f1291ca35', owner: '0x994be2994471d5ef93c600cf78c2752c5e96f5a7' },
  arpaUsdt: { address: '0x9F624b25991b99D7b14d6740A9D581DD77980808', owner: '0xc935285b0d88069305431dace0c3c01d7e793d84' },
}

async function tvl(ts, block) {
  const tokenCalls = Object.values(bVaults).map(a => ({ target: a.address }))

  const { output: tokenResponse } = await sdk.api.abi.multiCall({
    block, calls: tokenCalls, abi: bVaultAbi.token
  })

  const { output: underlyingBalances } = await sdk.api.abi.multiCall({
    block, calls: tokenCalls, abi: bVaultAbi.underlyingBalance
  })

  const balances = {}
  tokenResponse.forEach(({ input, output }, i) => {
    sdk.util.sumSingleBalance(balances, output, underlyingBalances[i].output || 0)
  })
  return balances
}

async function pool2(ts, block) {
  const toa = []
  Object.values(uniswapV2Pools).forEach(({ address, owner }) => toa.push([address, owner]))
  return sumTokens({}, toa, block,)
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
  },
}

