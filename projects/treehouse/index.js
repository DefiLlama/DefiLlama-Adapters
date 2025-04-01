const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')


async function getInFlightLidoRedemptionNav(api, strategies) {
  const unStEth = '0x889edc2edab5f40e902b864ad4d7ade8e412f9b1';
  const navUnStEth = '0x4c82F6829797A4174a082CE9FEE0B9BDDc1E5E39';

  // uint[][]
  const requestIdsArr = await api.multiCall({
    abi: "function getWithdrawalRequests(address) external view returns (uint256[])", calls: strategies.map(strategyAddress => ({ target: unStEth, params: strategyAddress }))
  })

  // skip further calls if no unStEth requests
  if(requestIdsArr.flat().length == 0) return;

  // uint[]
  const navArr = await api.multiCall({
    abi: "function nav(address, uint[]) external view returns (uint)", calls: requestIdsArr.map((requestIds, i) => ({ target: navUnStEth, params: [strategies[i], requestIds] }))
  })

  for (let i=0;i<navArr.length;i++) {
    api.add(ADDRESSES.ethereum.WSTETH, navArr[i])
  }
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

  const storage = await api.call({ abi: 'address:strategyStorage', target: vault })
  const strategies = await api.fetchList({ lengthAbi: 'getStrategyCount', itemAbi: 'getStrategyAddress', target: storage })
  await getInFlightLidoRedemptionNav(api, strategies)

  await sumTokens2({
    api, owners: [strategies[0]], fetchCoValentTokens: true, resolveUniV3: true, tokenConfig: {
      onlyWhitelisted: false,
    }
  })

  // covalent doesn't returns these tokens in sumTokens2 above when strategies[1] and [2] are owners,
  // they may include other unlisted debt and collateral tokens, so we will be using our own nav module

  // strategies[1]
  // tokensAndOwners:[
  //     [ADDRESSES.ethereum.WSTETH, '0x5ae0e44de96885702bd99a6914751c952d284938'], // wstETH
  //     ['0x12B54025C112Aa61fAce2CDB7118740875A566E9', '0x5ae0e44de96885702bd99a6914751c952d284938'], // spark collateral wsteth
  //     ['0x2e7576042566f8D6990e07A1B61Ad1efd86Ae70d', '0x5ae0e44de96885702bd99a6914751c952d284938'], // spark debt weth
  // ]

  // strategies[2]
  // tokensAndOwners:[
  //     ['0xC035a7cf15375cE2706766804551791aD035E0C2', '0xB27D688Ac06a441c005657971B11521e80CdcE98'], // aavePrime collateral wsteth
  // ]

  const navRegistry = '0xe2d60463dE3a0221276D737b87C605e0BB5451E9'
  const navArr = await api.multiCall({
    abi: "function getStrategyNav(address,(bytes4,bytes)[]) external view returns (uint)", calls: strategies.slice(1).map((e) => ({ target: navRegistry, params: [e, [
      [
        `0x75418615`,
        `0xab311908000000000000000000000000${e.slice(2).toLowerCase()}00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000`
      ]
    ]]}))
  })

  for (let i=0;i<navArr.length;i++) {
    api.add(ADDRESSES.ethereum.WSTETH, navArr[i])
  }

  return
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