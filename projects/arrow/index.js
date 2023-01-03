const { Program, BorshAccountsCoder, } = require("@project-serum/anchor");
const { sliceIntoChunks, } = require("../helper/utils");
const { PublicKey } = require("@solana/web3.js");
const arrowIDL = require("./arrowIDL.json");
const sdk = require('@defillama/sdk')
const { getMultipleAccountBuffers, getSaberPools, getProvider, } = require("../helper/solana");

async function tvl() {
  const arrowId = new PublicKey('ARoWLTBWoWrKMvxEiaE2EH9DrWyV7mLpKywGDWxBGeq9')
  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const provider = getProvider()
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const saberPools = await getSaberPools()
  const arrowProgram = new Program(arrowIDL, arrowId, provider)
  const balances = {}
  const arrows = (await arrowProgram.account.arrow.all()).filter(i => i.account.internalMiner.miner._bn > 0)
  const miners = arrows.map(i => i.account.internalMiner.miner.toString())
  const lpMints = arrows.map(i => i.account.vendorMiner.mint.toString())
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const quaryData = await quarryProgram.account.miner.fetchMultiple(miners)
  // return  {}
  // const coder = new BorshAccountsCoder(QuarryMineIDL);
  // const minersRaw = await connection.getMultipleAccountsInfo(
  //   miners.map((q) => new PublicKey(q))
  // );
  // const quaryData = minersRaw.map((q) =>
  //   coder.accountLayouts.get('Miner').decode(q.data)
  // );
  // const quaryData = await quarryProgram.account.miner.fetchMultiple(miners)
  const quarryDataKeyed = {}
  quaryData.forEach((data, i) => {
    if (!data) return;
    quarryDataKeyed[miners[i]] = {
      tokenAmount: data.balance,
    }
  })

  const dataKeys = []
  lpMints.forEach((lpMint, i) => {
    const saberPool = saberPools.find((p) => p.lpMint === lpMint)
    const miner = miners[i]
    if (!saberPool) return;
    if (!quarryDataKeyed[miner]) return;
    quarryDataKeyed[miner].saberPool = saberPool
    quarryDataKeyed[miner].stakedMint = lpMint
    dataKeys.push(lpMint, saberPool.reserveA, saberPool.reserveB)
  })

  const dataCache = {}
  for (const keys of sliceIntoChunks(dataKeys, 99)) {
    const res = await getMultipleAccountBuffers(keys)
    keys.forEach((key, i) => {
      dataCache[key] = res[i]
    })
  }
  Object.keys(quarryDataKeyed).forEach(key => {
    if (!quarryDataKeyed[key].saberPool) delete quarryDataKeyed[key]
  })
  Object.values(quarryDataKeyed).forEach(quarry => addQuarryBalance(dataCache, balances, quarry))

  return balances;
}

function addQuarryBalance(dataCache, balances = {}, { tokenAmount, stakedMint, saberPool: { reserveA, reserveB, tokenA, tokenB, } }) {
  const lpTokenTotalSupply = Number(dataCache[stakedMint].readBigUInt64LE(36));
  let poolShare = tokenAmount / lpTokenTotalSupply

  const reserveAAmount = Number(dataCache[reserveA].readBigUInt64LE(64));
  const reserveBAmount = Number(dataCache[reserveB].readBigUInt64LE(64));
  sdk.util.sumSingleBalance(balances, 'solana:'+tokenA, poolShare * reserveAAmount)
  sdk.util.sumSingleBalance(balances, 'solana:'+tokenB, poolShare * reserveBAmount)
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
