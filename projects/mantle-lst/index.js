// Mantle LSD: mETH (Mantle Staked Ether) + cmETH (Mantle Restaked ETH)
// mETH: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0
// cmETH: 0xE6829D9a7eE3040e1276Fa75293Bde931859e8fA
//
// Both are LST tokens pegged to ETH. TVL = totalSupply() * ETH price.
// Marked doublecounted because mETH/cmETH positions in Aave/Agni/MerchantMoe
// are already counted by those protocols.

const METH = '0xcDA86A272531e8640cD7F1a92c01839911B90bb0'
const CMETH = '0xE6829D9a7eE3040e1276Fa75293Bde931859e8fA'

async function tvl(api) {
  const [methSupply, cmethSupply] = await Promise.all([
    api.call({ abi: 'erc20:totalSupply', target: METH }),
    api.call({ abi: 'erc20:totalSupply', target: CMETH }),
  ])
  api.add(METH, methSupply)
  api.add(CMETH, cmethSupply)
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the total supply of mETH and cmETH on Mantle. ' +
    'Both are liquid staking tokens representing staked ETH. ' +
    'Tagged doublecounted to avoid overlap with Aave, Agni, Merchant Moe etc.',
  mantle: { tvl },
}
