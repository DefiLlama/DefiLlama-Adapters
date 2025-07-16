const ADDRESSES = require('../helper/coreAssets.json')

const PACTTokenAddress = "0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58"
const CELOTokenAddress = ADDRESSES.celo.CELO
const ARITokenAddress = "0x20677d4f3d0F08e735aB512393524A3CfCEb250C"

const pactDelegatorContract = "0x8f8BB984e652Cb8D0aa7C9D6712Ec2020EB1BAb4"

async function treasury(api) {
  return api.sumTokens({
    tokensAndOwners: [[CELOTokenAddress, pactDelegatorContract], [ARITokenAddress, pactDelegatorContract]],
  })
}

async function staking(api) {
  return api.sumTokens({
    tokensAndOwners: [[PACTTokenAddress, pactDelegatorContract]],
  })
}

module.exports = {
  celo: {
    // treasury,
    staking,
    tvl: () => ({})
  }
}
