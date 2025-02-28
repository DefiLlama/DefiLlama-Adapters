const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

module.exports = {
  polygon:{
    staking: staking('0xa326cF15E65FDEA84E63506ed56c122bC9E9A4BE', '0x0709E962221dd8AC9eC5c56f85ef789D3C1b9776'),
    tvl: gmxExports({ vault: '0x0e1D69B5888a0411Fe0A05a5A4d2ACED4305f67c', })
  },
  zeta: {
    staking:  staking( '0xb1ADD1d94Bc7f05C5AefCFCA2558AD0ae49D269b', "0xb36377f643f67e5f9775f62b624e8907c214de3c"),
    tvl: gmxExports({ vault: '0x0523f9FCa4c42A205dA7d57E9E7E65EeEE990d64', })
  }
};
