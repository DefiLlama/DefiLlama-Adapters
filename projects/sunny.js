const { getProvider, getSaberPools, getQuarryData, getMultipleAccountBuffers, } = require('./helper/solana')
const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { Program, } = require("@project-serum/anchor");
const { sliceIntoChunks, } = require('./helper/utils')

async function tvl_V2() {
  const { quarriesByStakedMint, } = await getQuarryData();
  const saberPools = await getSaberPools()
  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const sunnyProgramId = new PublicKey('SPQR4kT3q2oUKEJes2L6NNSBCiPW9SfuhkuqC9bp6Sx')
  const provider = getProvider()
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const sunnyIDL = await Program.fetchIdl(sunnyProgramId, provider)
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const sunnyProgram = new Program(sunnyIDL, sunnyProgramId, provider)
  const pools = await sunnyProgram.account.pool.all()
  // const vaults = await sunnyProgram.account.vault.all()
  // const quarries = Object.values(poolQuarryMap1)
  const quarries = pools.map(i => i.account.quarry)
  const quaryData = await quarryProgram.account.quarry.fetchMultiple(quarries)
  const quarryDataKeyed = {}
  quaryData.forEach((data, i) => {
    if (!data) return;
    quarryDataKeyed[quarries[i]] = {
      quarry: data,
      tokenAmount: pools[i].account.totalVendorBalance / (10 ** data.tokenMintDecimals),
      decimals: data.tokenMintDecimals
    }
  })

  const dataKeys = []
  for (const [stakedMint, quarryKeys] of Object.entries(quarriesByStakedMint)) {
    const saberPool = saberPools.find((p) => p.lpMint === stakedMint)
    if (!saberPool) continue;
    quarryKeys.forEach(key => {
      if (!quarryDataKeyed[key]) return;
      quarryDataKeyed[key].saberPool = saberPool
      quarryDataKeyed[key].stakedMint = stakedMint
      dataKeys.push(stakedMint, saberPool.reserveA, saberPool.reserveB)
    })
  }
  const dataCache = {}
  for (const keys of sliceIntoChunks(dataKeys, 99)) {
    const res = await getMultipleAccountBuffers(keys)
    keys.forEach((key, i) => {
      dataCache[key] = res[i]
    })
  }
  const balances = {}
  Object.keys(quarryDataKeyed).forEach(key => {
    if (!quarryDataKeyed[key].saberPool) delete quarryDataKeyed[key]
  })
  Object.values(quarryDataKeyed).forEach(quarry => addQuarryBalance(dataCache, balances, quarry))
  return balances
}

async function tvl_V1() {
  const saberPools = await getSaberPools()
  const sunnyProgramId = new PublicKey('SSFNHWYFdELMTkWNdaPaZQuVL4d2RY7ykjGmeGkmKXW')
  const provider = getProvider()
  const sunnyOldIDL = await Program.fetchIdl(sunnyProgramId, provider)
  const sunnyProgram = new Program(sunnyOldIDL, sunnyProgramId, provider)
  const pools = await sunnyProgram.account.pool.all()
  const poolsDataKeyed = {}
  const dataKeys = []
  pools.forEach((data, i) => {
    if (!data) return;
    const lpMint = data.account.lpMint.toString()
    const saberPool = saberPools.find((p) => p.lpMint === lpMint)
    if (!saberPool) return;
    poolsDataKeyed[lpMint] = {
      pool: data,
      saberPool: saberPool,
      tokenAmount: data.account.totalLpTokenBalance,
      lpMint: lpMint,
      stakedMint: lpMint,
      notYetReduced: true,
    }
    dataKeys.push(lpMint, saberPool.reserveA, saberPool.reserveB)
  })

  const dataCache = {}
  for (const keys of sliceIntoChunks(dataKeys, 99)) {
    const res = await getMultipleAccountBuffers(keys)
    keys.forEach((key, i) => {
      dataCache[key] = res[i]
    })
  }
  const balances = {}
  Object.values(poolsDataKeyed).forEach(pool => addQuarryBalance(dataCache, balances, pool))
  return balances
}

function addQuarryBalance(dataCache, balances = {}, { notYetReduced, tokenAmount, stakedMint, saberPool: { reserveA, reserveB, tokenACoingecko, tokenBCoingecko, } }) {

  const decimals = dataCache[stakedMint].readUInt8(44);
  const divisor = 10 ** decimals;
  const lpTokenTotalSupply = Number(dataCache[stakedMint].readBigUInt64LE(36));
  let poolShare = (tokenAmount * divisor) / lpTokenTotalSupply;
  if (notYetReduced) poolShare /= divisor

  const reserveAAmount = Number(dataCache[reserveA].readBigUInt64LE(64)) / divisor;
  const reserveBAmount = Number(dataCache[reserveB].readBigUInt64LE(64)) / divisor;
  sdk.util.sumSingleBalance(balances, tokenACoingecko, poolShare * reserveAAmount)
  sdk.util.sumSingleBalance(balances, tokenBCoingecko, poolShare * reserveBAmount)
  return balances
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  hallmarks: [
    [1659975842, "Code refactor, fix tvl computation"],
  ],
  methodology:
    'TVL counts LP token deposits made to Sunny Aggregator. CoinGecko is used to find the price of tokens in USD, only the original "SOL" token price is used for all existing variations of the token.',
  solana: { tvl: sdk.util.sumChainTvls([tvl_V1, tvl_V2,]) },
};
