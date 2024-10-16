const SUPR = '0x3390108E913824B8eaD638444cc52B9aBdF63798'
const ROLLUX_SUPR_STAKING = '0x400aDCba906EA6E87FEC276f0E0C0857F71A85F2'

async function staking(api) {
  const bal = await api.call({ abi: 'erc20:totalSupply', target: ROLLUX_SUPR_STAKING })
  api.add(SUPR, bal)
}

module.exports = {
  rollux: {
    tvl: () => ({}),
    staking,
  },
}