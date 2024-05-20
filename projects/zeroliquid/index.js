const { staking } = require('../helper/staking')

async function tvl(api) {
  const vault = '0x0246e28C6B161764492E54CBF852e28A4DA2D672'
  const tokens = await api.call({ abi: 'address[]:getSupportedYieldTokens', target: vault })
  return api.sumTokens({ owner: vault, tokens, })
}

module.exports = {
  methodology: 'Value of LSD tokens in the vault',
  ethereum: {
    tvl,
    staking: staking("0xb9b2d7a712402acb37a97f0ea6356ff271e065e2", '0xb0ed33f79d89541dfdcb04a8f04bc2c6be025ecc')
  }
};

