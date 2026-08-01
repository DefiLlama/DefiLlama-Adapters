const { getConfig } = require("../helper/cache");
const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program, } = require("@project-serum/anchor");


async function tvl(api) {

 /*  const provider = getProvider(api.chain)
  const programId = 'sooGfQwJ6enHfLTPfasFZtFR7DgobkJD77maDNEqGkD'
  const idl = await Program.fetchIdl(programId, provider)
  const program = new Program(idl, programId, provider)
  const data = await program.account.poolState.all()
  const tokenAccounts = data.map(({ account: { token0Vault, token1Vault }}) => ([token0Vault, token1Vault,])).flat()
  return sumTokens2({ tokenAccounts, api, }) */
  const { data} = await getConfig('solar-studios-tvl', 'https://api.solarstudios.co/pools/info/list?poolType=all&poolSortField=liquidity&sortType=desc&pageSize=1000&page=1')
  const tokensAndOwners = []
  data.data.map(i => {
    tokensAndOwners.push([i.mintA.address, i.id])
    tokensAndOwners.push([i.mintB.address, i.id])
  })
  return sumTokens2({ tokensAndOwners, api, })
}

module.exports = {
  timetravel: false,
  eclipse: { tvl, },
}
