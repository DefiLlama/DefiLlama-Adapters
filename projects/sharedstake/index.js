const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const sgtStakingPool = "0xc637dB981e417869814B2Ea2F1bD115d2D993597"
const sgt = "0x84810bcF08744d5862B8181f12d17bfd57d3b078"
const pool2StakingPool = "0x64A1DB33f68695df773924682D2EFb1161B329e8"
const sgtPool2Token = "0x3d07f6e1627DA96B8836190De64c1aED70e3FC55"

async function tvl(api) {
  const sgETH = '0x9e52db44d62a8c9762fa847bd2eba9d0585782d1'
  const supply= await api.call({  abi: 'erc20:totalSupply', target: sgETH})
  api.add(sgETH, supply)
  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl,
    pool2: pool2(pool2StakingPool, sgtPool2Token),
    staking: staking(sgtStakingPool, sgt)
  },
  hallmarks: [
    [Math.floor(new Date('2023-09-01')/1e3), 'Protocol was hacked for 102 ETH'],
  ],
}