const { sumTokens2, getProvider, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");

const GFX_TOKEN = 'GFX1ZjR2P15tmrSwow6FjyDYcEkoFb4p4gJCpLBjaxHD'

const programs = {
  SSL_PROGRAM_ID: 'GFXsSL5sSaDfNFQUYsHekbWBW1TsFdjDYzACh62tEHxn',
  GFX_CONTROLLER: '24dximAcSUp1aM3uyQ7Cdpsg128ZVpYRwJBz5k4P6HMc'
}

async function tvl() {
  // const { api } = arguments[3]
  // const provider = getProvider()
  // const idl = await Program.fetchIdl(programs.SSL_PROGRAM_ID, provider)
  // const program = new Program(idl, programs.SSL_PROGRAM_ID, provider)
  // // const data = await program.account.liquidityAccount.all()
  // const data = await program.account.poolRegistry.all()
  // data.forEach(({ account: { entries }}) => {
  //   entries.forEach(({ mint, totalLiquidityDeposits, }) => {
  //     api.add(mint.toString(), totalLiquidityDeposits.toString())
  //   })
  // })
  // return api.getBalances()
  return sumTokens2({ tokenAccounts: ["8cMk8SxSY6b3a4wGhEF5rgXfsmUuqwPqpqhkH7z1gvXZ","6hDS2kFxSJCHcgX3WYwPULzrQrhSSQWTVDfxAToLKsAv","HJuwvd1bBPWr1fV1EKNnzgR7Kn3znU2WzwiGphb8Mv92", "Af6DjX1eRjfmnF1Lfe99FTgLUMKTVrsyf7CY2Kx9kzbT", "DA2nEQnCZFGhAZSQ5jKUHL4REPG57ixEMeTQAfWuWmJX", "294A1PmDuLHrmgcPKHoQd9GgrJxQ6y2WkpPhSVgbkUoD"] })
}
async function staking() {
  return sumTokens2({ owner: programs.GFX_CONTROLLER, tokens: [GFX_TOKEN] })
}
module.exports = {
  timetravel: false,
  solana: {
    tvl, staking,
  },
}