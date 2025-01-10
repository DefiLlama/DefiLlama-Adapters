const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

const VOTERv1 = "0x4bebEB8188aEF8287f9a7d1E4f01d76cBE060d5b";
const VOTERv2 = "0xE3D1A117dF7DCaC2eB0AC8219341bAd92f18dAC1";
const ZEROA = "0x0000000000000000000000000000000000000000";
const USDbC = "0x1b6382dbdea11d97f24495c9a90b7c88469134a4"
const USdec = 10**6;

async function sumAllGauges(api) {
  // 1. Get Gauges Length
  // 2. Get all Pools
  // 3. Get all Gauges
  // 4. Does its customGauge exist?
  // 5. exists ? customGauge.tvl() : sum2tokens( gauge, gauge.totalSupply() )

  // 1.
  const lengV1 = await api.call({ target: VOTERv1, abi: 'function length() public view returns(uint)' });
  const lengV2 = await api.call({ target: VOTERv2, abi: 'function length() public view returns(uint)' });
  ///console.log({ leng })

  // 2.
  const poolsV1 = await api.multiCall({
    abi: "function pools(uint) public view returns(address)",
    calls: Array.from(Array(Number(lengV1))).map((e,i)=>({ target: VOTERv1, params: [i] }) )
  })
  const poolsV2 = await api.multiCall({
    abi: "function pools(uint) public view returns(address)",
    calls: Array.from(Array(Number(lengV2))).map((e,i)=>({ target: VOTERv2, params: [i] }) )
  })
  //console.log({pools})

  // 3.
  const gaugesV1 = await api.multiCall({
    abi: "function gauges(address) public view returns(address)",
    calls: poolsV1.map((e,i)=>({ target: VOTERv1, params: [e] }) )
  })
  const gaugesV2 = await api.multiCall({
    abi: "function gauges(address) public view returns(address)",
    calls: poolsV2.map((e,i)=>({ target: VOTERv2, params: [e] }) )
  })
  ///console.log({gauges})

  // 4.
  const customGauges = await api.multiCall({
    abi: "function customGauges(address) public view returns(address)",
    calls: gaugesV2.map((e,i)=>({ target: VOTERv2, params: [e] }) )
  })
  ///console.log({customGauges})

  // 5.
  let filteredPools = [], filteredGauges = [], filteredFarmlands = [];
  for(i=0;i<poolsV1.length;i++) {
    filteredPools.push(poolsV1[i]);
    filteredGauges.push(gaugesV1[i]);
  }
  for(i=0;i<poolsV2.length;i++) {
    if(customGauges[i] == ZEROA) {
      filteredPools.push(poolsV2[i]);
      filteredGauges.push(gaugesV2[i]);
    }
    else {
      filteredFarmlands.push(customGauges[i]);
    }
  }
  ///console.log({ filteredPools , filteredGauges , filteredFarmlands })

  // 5.1 Default
  const filteredGaugesAmounts = await api.multiCall({
    abi: "function totalSupply() public view returns(uint)",
    calls: filteredGauges.map((e,i)=>({ target: e }) )
  })
  ///console.log({ filteredGaugesAmounts })

  // 5.2 Custom
  const filteredFarmlandsTVL = (await api.multiCall({
    abi: "function tvl() public view returns(uint)",
    calls: filteredFarmlands.map((e,i)=>({ target: e }) ),
    permitFailure: true
  }))
    .map( i=> isFinite(Number(i)) ? Number(i)/1e18 : 0 )
    .reduce( (i,a) => (i+a) )
  console.log({ filteredFarmlandsTVL })

  // 5.3 Total
  filteredGauges.forEach( (e,i) => api.addToken( filteredPools[i], filteredGaugesAmounts[i] ));
  api.addToken( USDbC , USdec * filteredFarmlandsTVL )
  return sumTokens2({ api, resolveLP: true })

}

module.exports = {
  methodology: 'On-chain TVL Sum of only Assets Staked into Voted Equalizer Gauges & Farmlands.',
  misrepresentedTokens: true,
  fantom: {
    tvl: sumAllGauges,
    staking: staking("0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94", "0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6"),
  }
}