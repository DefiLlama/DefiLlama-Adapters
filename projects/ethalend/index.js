const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { getConfig } = require('../helper/cache')
const sdk = require('@defillama/sdk')

const { gql, request } = require('graphql-request')
const { default: BigNumber } = require('bignumber.js')
const { getBlock } = require('../helper/http')

/*
const vaults = [
    "0x4e5b645B69e873295511C6cA5B8951c3ff4F74F4",
    "0xb56AAb9696B95a75A6edD5435bc9dCC4b07403b0",
    "0x8dE8637412e70916Ee2CAA3b62C569d9A88391A3",
    "0xa5eefafa4f5cd64e3f6e97f6fa1301434d544775",
    "0x04D5bc0fdD251484A7a2224cEE818C7ce2412dbc",
    "0xF125B8d7D0DCCbb810c9187e6361804B895C91B5",
]
*/
const curvePool = "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171"

const globalDataQuery = gql`
  query($block: Int) {
    globalDatas(first: 100, 
        block: { number: $block }
    ) {
      symbol
      address
      type
      totalUnderlying
      totalVolumeUSD
    }
  }
`;

async function polygonTvl(_, _block, cb) {
  const block = await getBlock(_, 'polygon', cb)
  return tvl('polygon', block, '137')
}

async function avaxTvl(_, _block, cb) {
  const block = await getBlock(_, 'avax', cb)
  return tvl('avax', block, '43114')
}

async function tvl(chain, block, chainId) {
  const balances = {}
  if (chain === 'polygon') {
    const globalData = (await request(sdk.graph.modifyEndpoint('3fJ6wwsbCeMUrsohMRsmzgzrWwRMWnEac8neYkYQuJaz'), globalDataQuery, { block: block - 100 })).globalDatas
    await Promise.all(globalData.filter(v => v.type === "lending").map(async v => {
      if (v.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        v.address = ADDRESSES.polygon.WMATIC_2
      }
      const decimals = await sdk.api.erc20.decimals(v.address, chain)
      sdk.util.sumSingleBalance(balances, chain + ':' + v.address, BigNumber(v.totalUnderlying).times(10 ** decimals.output).toFixed(0))
    }))
  }
  let vaults = (await getConfig('ethalend', "https://ethalend.com/vaults/vaultInfo")).data.filter(i => i.chainId === chainId).map(v => v.strategyAddress).filter(i => i)
  vaults = Array.from(new Set(vaults)) // remove duplicates
  const [underlyings, totals] = await Promise.all([abi.underlying, abi.calcTotalValue].map(abi => sdk.api.abi.multiCall({
    abi,
    block,
    chain,
    permitFailure: true,
    calls: vaults.map(v => ({ target: v }))
  })))
  const lpPositions = []
  for (let i = 0; i < vaults.length; i++) {
    const underlying = underlyings.output[i].output
    const total = totals.output[i].output
    if (underlying === curvePool) {
      sdk.util.sumSingleBalance(balances, "polygon:0x2e1ad108ff1d8c782fcbbb89aad783ac49586756", total)
    } else {
      if (!underlying) continue;
      if (underlying.toLowerCase() === '0xe7CEA2F6d7b120174BF3A9Bc98efaF1fF72C997d'.toLowerCase()) {
        sdk.util.sumSingleBalance(balances, "polygon:" + underlying, total)
        continue;
      }
      lpPositions.push({
        token: underlying,
        balance: total
      })
    }
  }
  await unwrapUniswapLPs(balances, lpPositions, block, chain, addr => `${chain}:${addr}`)
  return balances
}

module.exports = {
  polygon: {
    tvl: polygonTvl,
    staking: staking("0x85e6A965950ACa02fdf680d4b087DdD64DF28a81", "0x59e9261255644c411afdd00bd89162d09d862e38", "polygon", "0x59e9261255644c411afdd00bd89162d09d862e38"),
    pool2: pool2("0x2f4de75a8e591cbd4d2c0d3aee7c36fe62a64f79", "0xb417da294ae7c5cbd9176d1a7a0c7d7364ae1c4e", "polygon",
      addr => addr.toLowerCase() === "0x59e9261255644c411afdd00bd89162d09d862e38" ? "0x59e9261255644c411afdd00bd89162d09d862e38" : `polygon:${addr}`)
  },
  avax: {
    tvl: avaxTvl,
  }
}