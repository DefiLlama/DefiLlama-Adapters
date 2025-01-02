const { Program, } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const arrowIDL = require("./arrowIDL.json");
const sdk = require('@defillama/sdk')
const { getProvider, } = require("../helper/solana");

async function tvl() {
  const arrowId = new PublicKey('ARoWLTBWoWrKMvxEiaE2EH9DrWyV7mLpKywGDWxBGeq9')
  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const provider = getProvider()
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const arrowProgram = new Program(arrowIDL, arrowId, provider)
  const balances = {}
  const arrows = (await arrowProgram.account.arrow.all()).filter(i => i.account.internalMiner.miner._bn > 0)
  const miners = arrows.map(i => i.account.internalMiner.miner.toString())
  const lpMints = arrows.map(i => i.account.vendorMiner.mint.toString())
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const quaryData = await quarryProgram.account.miner.fetchMultiple(miners)
  quaryData.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances,lpMints[i],+data.balance, 'solana')
  })
  return balances
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    'TVL counts LP token deposits made to Arrow Protocol. CoinGecko is used to find the price of tokens in USD, only the original "SOL" token price is used for all existing variations of the token.',
  solana: { tvl },
  hallmarks: [
    [1648080000, 'Cashio was hacked!'],
  ]
};
