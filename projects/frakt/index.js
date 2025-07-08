const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, sumTokens2, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const { getConfig } = require('../helper/cache')

let data

async function getData() {
  if (!data) data = getAllData()
  return data


  async function getAllData() {
    const programId = 'A66HabVL3DzNzeJgcHYtRRNW1ZRMKwBfrdSR4kLsZ9DJ'
    const provider = getProvider()
    const idl = await getConfig('frakt-idl', 'https://raw.githubusercontent.com/frakt-solana/frakt-sdk/master/src/loans/idl/nft_lending_v2.json')
    const program = new Program(idl, programId, provider)
    const pbPools = await program.account.priceBasedLiquidityPool.all()
    const liquidityPools = await program.account.liquidityPool.all()
    const solOwners = [...liquidityPools.map(i => i.account.liqOwner), ...pbPools.map(i => i.account.liqOwner)].map(i => i.toString())
    const poolsTVL = (await sumTokens2({ solOwners }))['solana:' + ADDRESSES.solana.SOL] ?? 0
    const loans = await program.account.loan.all()

    const loanSum = loans.filter(i => i.account.loanStatus.activated).reduce((a, i) => a + +i.account.originalPrice, 0)
    const lpStaked = liquidityPools.reduce((a, i) => a + +i.account.amountOfStaked, 0)
    const pbLPStaked = pbPools.reduce((a, i) => a + +i.account.amountOfStaked, 0)

    const tvl = loanSum + poolsTVL
    const borrowed = lpStaked + pbLPStaked - poolsTVL
    return { tvl, borrowed }
  }
}

const tvl = async () => {
  return { ['solana:' + ADDRESSES.solana.SOL]: (await getData()).tvl }
};

const borrowed = async () => {
  return { ['solana:' + ADDRESSES.solana.SOL]: (await getData()).borrowed }
}

module.exports = {
  timetravel: false,
  methodology: 'Tvl is sum of sol in pools not yet lent out + value of locked NFTs',
  solana: {
    tvl,
    borrowed,
  }
};
