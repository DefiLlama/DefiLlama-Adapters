const { getProvider, getSolBalances, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const { sliceIntoChunks, } = require('../helper/utils')
const { get, } = require('../helper/http')

let data

async function getData() {
  if (!data) data = getAllData()
  return data


  async function getAllData() {
    const programId = 'A66HabVL3DzNzeJgcHYtRRNW1ZRMKwBfrdSR4kLsZ9DJ'
    const provider = getProvider()
    const idl = await get('https://raw.githubusercontent.com/frakt-solana/frakt-sdk/master/src/loans/idl/nft_lending_v2.json')
    const program = new Program(idl, programId, provider)
    const pbPools = await program.account.priceBasedLiquidityPool.all()
    const liquidityPools = await program.account.liquidityPool.all()
    const solOwners = [...liquidityPools.map(i => i.account.liqOwner), ...pbPools.map(i => i.account.liqOwner)].map(i => i.toString())
    const poolsTVL = await getSolBalances(solOwners)
    const loans = await program.account.loan.all()

    const loanSum = loans.filter(i => i.account.loanStatus.activated).reduce((a, i) => a + +i.account.originalPrice, 0) / 1e9
    const lpStaked = liquidityPools.reduce((a, i) => a + +i.account.amountOfStaked, 0) / 1e9
    const pbLPStaked = pbPools.reduce((a, i) => a + +i.account.amountOfStaked, 0) / 1e9

    const tvl = loanSum + poolsTVL
    const borrowed = lpStaked + pbLPStaked - poolsTVL
    return { tvl, borrowed }
  }
}

const tvl = async () => {
  return { solana: (await getData()).tvl }
};

const borrowed = async () => {
  return { solana: (await getData()).borrowed }
}

module.exports = {
  timetravel: false,
  methodology: 'Tvl is sum of sol in pools not yet lent out + value of locked NFTs',
  solana: {
    tvl,
    borrowed,
  }
};
