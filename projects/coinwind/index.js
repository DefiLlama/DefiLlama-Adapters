const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const abi = require('./abi.json');
const { getChainTransform } = require('../helper/portedTokens')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const ETH_POOL = "0x8ddc12f593F1c92122D5dda9244b5e749cBFB2e4"

const BSC_POOL = "0x6bA7d75eC6576F88a10bE832C56F0F27DC040dDD"
const BSC_POOL_LP = "0xAdA5598d0E19B4d3C64585b4135c5860d4A0881F"
const BSC_POOL_DAO = "0x4711D9b50353fa9Ff424ceCa47959dCF02b3725A"

const HECO_POOL = "0xAba48B3fF86645ca417f79215DbdA39B5b7cF6b5"
const HECO_POOL_LP = "0x94ad8542f3F1bBb6D0dFa4B91589a264FF9b0056"
const HECO_POOL_DAO = "0x031026064e8f0702a91318e660796139A69Cb89b"

const ethTvl = async (timestamp, ethBlock, { ethereum: block }) => {
  let chain = "ethereum"
  const transformAddress = await getChainTransform(chain)
  let balances = {}
  let pool = ETH_POOL
  await addPool(chain, block, pool, balances, transformAddress, abi['ethPoolInfo'])
  return unwrapLPsAuto({ balances, block, chain, transformAddress, });
};

const bscTvl = async (timestamp, ethBlock, { bsc: block }) => {
  let chain = "bsc"
  const transformAddress = await getChainTransform(chain)
  let balances = {}
  let pool = BSC_POOL
  await addPool(chain, block, pool, balances, transformAddress)
  pool = BSC_POOL_LP
  await addPool(chain, block, pool, balances, transformAddress)
  return unwrapLPsAuto({ balances, block, chain, transformAddress, });
};

const hecoTvl = async (timestamp, ethBlock, { heco: block }) => {
  let chain = "heco"
  const transformAddress = await getChainTransform(chain)
  let balances = {}
  let pool = HECO_POOL
  await addPool(chain, block, pool, balances, transformAddress)
  pool = HECO_POOL_LP
  await addPool(chain, block, pool, balances, transformAddress)
  return unwrapLPsAuto({ balances, block, chain, transformAddress, });
};

async function addPool(chain, block, pool, balances, transformAddress, poolInfo = abi['poolInfo']) {
  const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output
  const calls = []
  for (let index = 0; index < poolLength; index++)  calls.push({ params: [index]})
  const { output: data } = await sdk.api.abi.multiCall({
    target: pool,
    abi: poolInfo,
    calls: calls,
    chain, block,
  })

  data.forEach(i => sdk.util.sumSingleBalance(balances, transformAddress(i.output.token), i.output.totalAmount))
}

module.exports = {
  methodology: 'TVL counts deposits made to Lossless single asset pools on Ethereum, Heco and Binance Smart Chain and to the various LP farms available on Heco and BSC.',
  ethereum: { tvl: ethTvl },
  bsc: {
    staking: staking(BSC_POOL_DAO, "0x422e3af98bc1de5a1838be31a56f75db4ad43730"),
    pool2: pool2(BSC_POOL_DAO, "0xf16d5142086dbf7723b0a57b8d96979810e47448"),
    tvl: bscTvl
  },
  heco: {
    staking: staking(HECO_POOL_DAO, "0x80861a817106665bca173db6ac2ab628a738c737"),
    pool2: pool2(HECO_POOL_DAO, "0x3f57530bdba9bcd703c8ba75c57cf7de52014036"),
    tvl: hecoTvl
  },
};
