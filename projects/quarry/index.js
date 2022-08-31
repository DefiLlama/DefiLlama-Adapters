const { sliceIntoChunks, log } = require("../helper/utils");
const { PublicKey } = require("@solana/web3.js");
const { BorshAccountsCoder, } = require("@project-serum/anchor");
const { Program, } = require("@project-serum/anchor");
const { getMSolLPTokens, MSOL_LP_MINT } = require("./msolLP");
const sdk = require('@defillama/sdk')

const { getMultipleAccountBuffers, getConnection, getSaberPools, getQuarryData, getProvider, } = require("../helper/solana");

async function tvl() {
  // a mapping of coin name to coin amount
  const tvlResult = {};

  // this is a mapping of token mint to list of quarries
  // more details: https://github.com/QuarryProtocol/rewarder-list
  const { quarriesByStakedMint, coingeckoIDs,
  } = await getQuarryData();
  const saberPools = await getSaberPools()

  // const connection = getConnection();
  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const provider = getProvider();
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const allQuaries = await quarryProgram.account.quarry.all()
  const quaryMapping = {}
  allQuaries.forEach(i => quaryMapping[i.publicKey.toString()] = i)
  // const coder = new BorshAccountsCoder(QuarryMineIDL);
  let i = 0
  log('total', Object.keys(quarriesByStakedMint).length)
  const quarriies = []

  for (const [stakedMint, quarryKeys] of Object.entries(quarriesByStakedMint)) {
    const coingeckoID = coingeckoIDs[stakedMint];
    const saberPool = coingeckoID
      ? null
      : saberPools.find((p) => p.lpMint === stakedMint);
    const isMsolSolLP = stakedMint === MSOL_LP_MINT.toString();

    if (!coingeckoID && !saberPool && !isMsolSolLP) {
      // we can't price this asset, so don't bother fetching anything
      continue;
    }

    if (saberPool) {
      quarriies.push(...quarryKeys)
      continue;
    }

    const quarries = quarryKeys.map(i => quaryMapping[i].account)
    
    const totalTokens = quarries.reduce(
      (sum, q) =>
        sum +
        parseFloat(q.totalTokensDeposited.toString()) /
        10 ** q.tokenMintDecimals,
      0
    );

    if (coingeckoID) {
      if (!tvlResult[coingeckoID]) {
        tvlResult[coingeckoID] = totalTokens;
      } else {
        tvlResult[coingeckoID] += totalTokens;
      }
    } else if (isMsolSolLP) {
      const msolTVL = await getMSolLPTokens(totalTokens);
      for (const [tokenId, amount] of Object.entries(msolTVL)) {
        if (!tvlResult[tokenId]) {
          tvlResult[tokenId] = amount;
        } else {
          tvlResult[tokenId] += amount;
        }
      }
    }

    // sleep to avoid rate limiting issues
    log('done', ++i)
    // await sleep(1200);
  }

  const balances = tvlResult
  const quaryData = quarriies.map(i => quaryMapping[i].account)
  const quarryDataKeyed = {}
  quaryData.forEach((data, i) => {
    if (!data) return;
    quarryDataKeyed[quarriies[i]] = {
      quarry: data,
      tokenAmount: data.totalTokensDeposited / (10 ** data.tokenMintDecimals),
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
  Object.keys(quarryDataKeyed).forEach(key => {
    if (!quarryDataKeyed[key].saberPool) delete quarryDataKeyed[key]
  })
  Object.values(quarryDataKeyed).forEach(quarry => addQuarryBalance(dataCache, balances, quarry))

  return balances;
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
  methodology:
    "TVL counts deposits made to Quarry Protocol. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl },
};
