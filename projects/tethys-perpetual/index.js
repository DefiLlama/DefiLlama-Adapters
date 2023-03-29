const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

module.exports = {
  metis:{
    staking: staking('0xA3c1694EfCd4389Ce652D521d2be28c912250a53', '0x69fdb77064ec5c84FA2F21072973eB28441F43F3'),
    tvl: gmxExports({ vault: '0xD2032462fd8A45C4BE8F5b90DE25eE3631ec1c2C', })
  }
};
