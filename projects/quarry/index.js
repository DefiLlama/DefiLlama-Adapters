const { sliceIntoChunks, log } = require("../helper/utils");
const { PublicKey } = require("@solana/web3.js");
const { Program, } = require("@project-serum/anchor");
const { getMSolLPTokens, MSOL_LP_MINT } = require("./msolLP");
const sdk = require('@defillama/sdk')

const { getMultipleAccountBuffers, getSaberPools, getQuarryData, getProvider, } = require("../helper/solana");

async function tvl() {
  // this is a mapping of token mint to list of quarries
  // more details: https://github.com/QuarryProtocol/rewarder-list
  const { quarriesByStakedMint,
  } = await getQuarryData();
  const saberPools = await getSaberPools()

  const quarryId = new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
  const provider = getProvider();
  const QuarryMineIDL = await Program.fetchIdl(quarryId, provider)
  const quarryProgram = new Program(QuarryMineIDL, quarryId, provider)
  const allQuaries = await quarryProgram.account.quarry.all()
  const quaryMapping = {}
  allQuaries.forEach(i => quaryMapping[i.publicKey.toString()] = i)
  log('total', Object.keys(quarriesByStakedMint).length)
  const quarriies = []
  const balances = {}

  for (const [stakedMint, quarryKeys] of Object.entries(quarriesByStakedMint)) {
    const saberPool = saberPools.find((p) => p.lpMint === stakedMint);
    const isMsolSolLP = stakedMint === MSOL_LP_MINT.toString();

    if (saberPool) {
      quarriies.push(...quarryKeys)
      continue;
    }

    const quarries = quarryKeys.map(i => quaryMapping[i].account)

    const totalTokens = quarries.reduce((sum, q) => sum + +q.totalTokensDeposited, 0);

    if (!isMsolSolLP) {
      sdk.util.sumSingleBalance(balances,'solana:'+stakedMint,totalTokens)
    } else if (isMsolSolLP) {
      const msolTVL = await getMSolLPTokens(totalTokens);
      for (const [tokenId, amount] of Object.entries(msolTVL)) {
        sdk.util.sumSingleBalance(balances,tokenId,amount)
      }
    }
  }

  const quaryData = quarriies.map(i => quaryMapping[i].account)
  const quarryDataKeyed = {}
  quaryData.forEach((data, i) => {
    if (!data) return;
    quarryDataKeyed[quarriies[i]] = {
      quarry: data,
      tokenAmount: data.totalTokensDeposited,
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

function addQuarryBalance(dataCache, balances = {}, { tokenAmount, stakedMint, saberPool: { reserveA, reserveB, tokenA, tokenB, } }) {
  const lpTokenTotalSupply = Number(dataCache[stakedMint].readBigUInt64LE(36));
  let poolShare = tokenAmount / lpTokenTotalSupply;

  const reserveAAmount = Number(dataCache[reserveA].readBigUInt64LE(64));
  const reserveBAmount = Number(dataCache[reserveB].readBigUInt64LE(64));
  sdk.util.sumSingleBalance(balances, 'solana:'+tokenA, poolShare * reserveAAmount)
  sdk.util.sumSingleBalance(balances, 'solana:'+tokenB, poolShare * reserveBAmount)
  return balances
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology:
    "TVL counts deposits made to Quarry Protocol. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl },
  hallmarks: [
    [1665521360, "Mango Markets Hack"],
  ],
};
