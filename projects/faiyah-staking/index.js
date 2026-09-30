const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

const FACTORY = '0x95c8853e6bD1DBCE2428Aa6953eb7680261F22fe'
const XEF = '0x80252C2D06bbd85699c555fc3633D5B8eE67C9AD'

// A same-token pool holds its reward bucket next to the principal and can pay rewards out of
// principal when the bucket runs dry, so count what the pool holds, capped at what users staked.
const held = (bal, staked) => (BigInt(bal) < BigInt(staked) ? bal : staked)

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:idCounter', itemAbi: 'function allPools(uint256) view returns (address)', target: FACTORY })
  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: pools })
  const staked = await api.multiCall({ abi: 'uint256:totalStaked', calls: pools })

  const native = pools.filter((_, i) => tokens[i] === nullAddress)
  const { output: nativeBals } = await sdk.api.eth.getBalances({ targets: native, chain: api.chain, block: api.block })
  const erc20Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map((p, i) => ({ target: tokens[i], params: p })).filter(({ target }) => target !== nullAddress) })

  let n = 0, e = 0
  pools.forEach((_, i) => {
    const token = tokens[i]
    const amount = held(token === nullAddress ? nativeBals[n++].balance : erc20Bals[e++], staked[i])
    if (token.toLowerCase() === XEF.toLowerCase()) api.addCGToken('xeffy', Number(amount) / 1e18)
    else api.add(token, amount)
  })
}

module.exports = {
  methodology:
    'Sums every token users have staked in the staking pools on Xphere. Each pool counts the lesser of its token balance and its recorded stake, which leaves out the reward funds an admin deposits and any principal already paid out as rewards.',
  start: '2026-04-24',
  xp: { tvl },
}
