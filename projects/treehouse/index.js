const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')


async function getInFlightLidoRedemptionNav(api) {
  const unStEth = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
  const strategy = '0x60d2D94aCB969CA54e781007eE89F04c1A2e5943';
  const navHelper = '0xf22Ca896427677507a9EF99D30B261659775ff56';

  const requestIds = await api.call({
    abi: "function getWithdrawalRequests(address _owner) external view returns (uint256[] memory requestsIds)",
    target: unStEth,
    chain: 'ethereum',
    params: [strategy]
  });


  // NAV of lido in-flight redemptions in wstETH.
  const nav = await api.call({
    abi: 'function getLidoRedemptionsNav(uint[], address) external view returns (uint)',
    target: navHelper,
    chain: 'ethereum',
    params: [requestIds, strategy]
  })

  api.add(ADDRESSES.ethereum.WSTETH, nav)
}

// count the value in the grow autovault and exclude the value of tETH in the vault to avoid double counting
async function addGrowAutovaultNav(api) {
  const growVault = '0x5Fde59415625401278c4d41C6beFCe3790eb357f'
  const dataVault = '0xaD744e7B3ae782b2c6DD6c316332d60ac33D8Db2'

  const tETHwstETHGauge = '0xf697535848B535900c76f70F1e36EC3985D27862'
  const tETHwstETHLP = '0x1d13531bf6344c102280ce4c458781fbf14dad14'
  const balVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'
  const tETH = '0xD11c452fc99cF405034ee446803b6F6c1F6d5ED8'
  const tETHweWTHcurveLP = '0x394a1e1b934cb4F4a0dC17BDD592ec078741542F'
  const tETHwstTHcurveLP = '0xA10d15538E09479186b4D3278BA5c979110dDdB1'


  await api.sumTokens({ owners: [growVault, dataVault], tokens: [ADDRESSES.ethereum.WSTETH] })
  const [tETHwstETHGaugeBal, tETHweWTHcurveLPBal, tETHwstETHcurveLPBal, tEThwEETHLP_weethBal, tEThwstETHLP_wstethBal] = await api.multiCall({
    abi: 'erc20:balanceOf', calls: [
      { target: tETHwstETHGauge, params: dataVault },
      { target: tETHweWTHcurveLP, params: dataVault },
      { target: tETHwstTHcurveLP, params: dataVault },
      { target: ADDRESSES.ethereum.WEETH, params: tETHweWTHcurveLP },
      { target: ADDRESSES.ethereum.WSTETH, params: tETHwstTHcurveLP },
    ]
  })

  // resolve balancer LP 
  const balTokenSupply = await api.call({ abi: 'uint256:getActualSupply', target: tETHwstETHLP })
  const poolId = await api.call({ abi: 'function getPoolId() view returns (bytes32)', target: tETHwstETHLP })
  const [tokens, bals] = await api.call({ abi: 'function getPoolTokens(bytes32) view returns (address[], uint256[],uint256)', target: balVault, params: poolId })
  const balLPRatio = tETHwstETHGaugeBal / balTokenSupply
  tokens.forEach((v, i) => {
    if (v.toLowerCase() === tETHwstETHLP.toLowerCase()) return;
    api.add(v, bals[i] * balLPRatio)
  })

  // resolve tETH-weETH curve LP
  const tETHweWTHcurveLPSupply = await api.call({ abi: 'uint256:totalSupply', target: tETHweWTHcurveLP })
  const tETHweETHLPRatio = tETHweWTHcurveLPBal / tETHweWTHcurveLPSupply
  api.add(ADDRESSES.ethereum.WEETH, tEThwEETHLP_weethBal * tETHweETHLPRatio)

  // resolve tETH-wstETH curve LP
  const tETHwstETHLPSupply = await api.call({ abi: 'uint256:totalSupply', target: tETHwstTHcurveLP })
  const tETHwstETHLPRatio = tETHwstETHcurveLPBal / tETHwstETHLPSupply
  api.add(ADDRESSES.ethereum.WSTETH, tEThwstETHLP_wstethBal * tETHwstETHLPRatio)


  api.removeTokenBalance(tETH)
}


async function tvl(api) {
  await addGrowAutovaultNav(api)

  const vault = '0x551d155760ae96050439ad24ae98a96c765d761b'
  const tokens = await api.call({ abi: 'address[]:getAllowableAssets', target: vault })
  await api.sumTokens({ owner: vault, tokens })

  await getInFlightLidoRedemptionNav(api)

  const storage = await api.call({ abi: 'address:strategyStorage', target: vault })
  const strategies = await api.fetchList({ lengthAbi: 'getStrategyCount', itemAbi: 'getStrategyAddress', target: storage })
  return sumTokens2({
    api, owners: strategies, fetchCoValentTokens: true, resolveUniV3: true, tokenConfig: {
      onlyWhitelisted: false,
    }
  })
}

async function tvlMantle(api) {
  return api.sumTokens({ owner: '0x5E4ACCa7a9989007cD74aE4ed1b096c000779DCC', tokens: [ADDRESSES.mantle.cmETH] })
}

module.exports = {
  methodology: 'Token balance in vault and strategy contracts',
  doublecounted: true,
  start: '2024-09-10', // Tuesday, September 10, 2024 12:00:00 AM,
  ethereum: {
    tvl,
  },
  mantle: {
    tvl: tvlMantle
  }
}