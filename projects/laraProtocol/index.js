
const { staking } = require('../helper/staking')

const LARA_ADDRESS = '0xE6A69cD4FF127ad8E53C21a593F7BaC4c608945e'
const LARA_STAKING_CONTRACT = '0x9B859bEc39B47C8d9C1459046a32d76B1A6883C1'
const STTARA_ADDRESS = '0x37Df886BE517F9c75b27Cb70dac0D61432C92FBE'

async function tvl(api) {
  const stTara = await api.call({ abi: 'erc20:totalSupply', target: STTARA_ADDRESS, })
  api.addGasToken(stTara);
}

module.exports = {
  tara: {
    tvl,
    staking: staking(LARA_STAKING_CONTRACT, LARA_ADDRESS)
  }
};