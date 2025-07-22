const { sumTokens2 } = require("../helper/unwrapLPs");
const { getTokenPrices } = require("../helper/unknownTokens");
const sdk = require('@defillama/sdk')

const abi = {
  gbtPrice: "uint256:currentPrice",
  deployLength: "function totalDeployed() view returns (uint256)",
  baseToken: "function BASE_TOKEN() view returns (address base_token)",
  deployInfo: "function deployInfo(uint256) view returns(address gbt, address gnft, address xgbt, bool allowed)"
}

const GumballFactoryContractArbitrum = '0xf5cfBaF55036264B902D9ae55A114d9A22c42750'

async function token0CallFn({ api, calls }) {
  return calls.map(i => ({
    input: i,
    output: i.target
  }))
}
async function token1CallFn({ api, calls }) {
  return api.multiCall({ abi: abi.baseToken, calls, withMetadata: true, })
}
async function reservesCallFn({ api, calls }) {
  const baseBals = await api.multiCall({ abi: 'uint256:baseBal', calls, })
  const gbtBals = await api.multiCall({ abi: 'uint256:gbtBal', calls, })
  return baseBals.map((val, i) => {
    const reserves = [gbtBals[i], val]
    reserves._reserve0 = reserves[0]
    reserves._reserve1 = reserves[1]
    return {
      input: calls[i],
      output: reserves,
    }
  })
}

async function tvl(api) {
  let items = await api.fetchList({ itemAbi: abi.deployInfo, lengthAbi: abi.deployLength, target: GumballFactoryContractArbitrum })
  items = items.filter(i => i.allowed)
  // let prices = await api.multiCall({ abi: abi.gbtPrice, calls: items.map(i => i.gbt) })
  let baseTokens = await api.multiCall({ abi: abi.baseToken, calls: items.map(i => i.gbt) })
  const lps = items.map(i => i.gbt)
  const nftCalls = items.map(i => ({ target: i.gnft, params: i.xgbt }))
  const { balances, updateBalances, } = await getTokenPrices({
    chain: api.chain, block: api.block, useDefaultCoreAssets: true,
    allLps: true, lps, token0CallFn, token1CallFn, reservesCallFn,
  })
  const nftBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: nftCalls, })
  nftBalances.forEach((val, i) => {
    sdk.util.sumSingleBalance(balances, items[i].gbt.toLowerCase(), val, api.chain)
  })
  const toa = []
  items.forEach((val, i) => {
    const owners = [val.xgbt]
    owners.forEach(o => {
      toa.push([baseTokens[i], o])
      toa.push([val.gbt, o])
    })
  })

  await sumTokens2({ api, tokensAndOwners: toa, balances, })
  await updateBalances(balances)
  return balances
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: 'Value of base token * 2 (nfts in pools are valued equal to base tokens in pool) + staked nft tokens'
}