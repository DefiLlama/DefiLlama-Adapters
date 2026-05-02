const { PublicKey } = require("@solana/web3.js");
const { Program, } = require("@project-serum/anchor");
const sdk = require('@defillama/sdk')

const { getProvider, } = require("../helper/solana");

async function tvl() {
  const balances = {}

  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const provider = getProvider();
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const allQuaries = await quarryProgram.account.quarry.all()
  allQuaries.forEach(({account: i}) =>  {
    const amount = +i.totalTokensDeposited
    if (amount < 1e6) return;
    sdk.util.sumSingleBalance(balances,i.tokenMintKey.toString(),amount, 'solana')
  })
  return balances
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology:
    "TVL counts deposits made to Quarry Protocol. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl },
  hallmarks: [
    ['2022-10-11', "Mango Markets Hack"],
  ],
};
