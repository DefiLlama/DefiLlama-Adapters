const { getProvider,} = require('./helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { Program, } = require("@project-serum/anchor");

async function tvl_V2() {
  const balances = {}
  const quarryId = new PublicKey('0x3211d27a1A1B8E40C7974F6951935303e6e56DBE')
  const sunnyProgramId = new PublicKey('0x46531ea0E7cec64b14181d45F8C6798a1cE45da1')
  const provider = getProvider()
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const sunnyIDL = await Program.fetchIdl(sunnyProgramId, provider)
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const sunnyProgram = new Program(sunnyIDL, sunnyProgramId, provider)
  const pools = await sunnyProgram.account.pool.all()
  const quarries = pools.map(i => i.account.quarry)
  const quaryData = await quarryProgram.account.quarry.fetchMultiple(quarries)
  quaryData.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances,data.tokenMintKey.toString(),pools[i].account.totalVendorBalance, 'solana')
  })
  return balances
}

async function tvl_V1() {
  const balances = {}
  const sunnyProgramId = new PublicKey('0x46531ea0E7cec64b14181d45F8C6798a1cE45da1')
  const provider = getProvider()
  const sunnyOldIDL = await Program.fetchIdl(sunnyProgramId, provider)
  const sunnyProgram = new Program(sunnyOldIDL, sunnyProgramId, provider)
  const pools = await sunnyProgram.account.pool.all()
  pools.forEach((data, i) => {
    const lpMint = data.account.lpMint.toString()
    sdk.util.sumSingleBalance(balances,lpMint,data.account.totalLpTokenBalance, 'solana')
  })
  return balances
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  hallmarks: [
    ['2022-08-08', "Code refactor, fix tvl computation"],
  ],
  methodology:
    'TVL counts LP token deposits made to Sunny Aggregator. CoinGecko is used to find the price of tokens in USD, only the original "SOL" token price is used for all existing variations of the token.',
  solana: { tvl: sdk.util.sumChainTvls([tvl_V1, tvl_V2,]) },
};
