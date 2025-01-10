const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

const VOTER = "0x17fa9da6e01ad59513707f92033a6eb03ccb10b4";
const ZEROA = "0x0000000000000000000000000000000000000000";
const USDbC = "0x29219dd400f2Bf60E5a23d13Be72B486D4038894"
const USdec = 10**6;

async function sumAllGauges(api) {
  // 1. Get Gauges Length
  // 2. Get all Pools
  // 3. Get all Gauges
  // 4. Does its customGauge exist?
  // 5. exists ? customGauge.tvl() : sum2tokens( gauge, gauge.totalSupply() )

  // 1.
  const leng = await api.call({ target: VOTER, abi: 'function length() public view returns(uint)' });
  ///console.log({ leng })

  // 2.
  const pools = await api.multiCall({
    abi: "function pools(uint) public view returns(address)",
    calls: Array.from(Array(Number(leng))).map((e,i)=>({ target: VOTER, params: [i] }) )
  })
  //console.log({pools})

  // 3.
  const gauges = await api.multiCall({
    abi: "function gauges(address) public view returns(address)",
    calls: pools.map((e,i)=>({ target: VOTER, params: [e] }) )
  })
  ///console.log({gauges})

  // 4.
  const customGauges = await api.multiCall({
    abi: "function customGauges(address) public view returns(address)",
    calls: gauges.map((e,i)=>({ target: VOTER, params: [e] }) )
  })
  ///console.log({customGauges})

  // 5.
  let filteredPools = [], filteredGauges = [], filteredFarmlands = [];
  for(i=0;i<pools.length;i++) {
    if(customGauges[i] == ZEROA) {
      filteredPools.push(pools[i]);
      filteredGauges.push(gauges[i]);
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
  ///console.log({ filteredFarmlandsTVL })

  // 5.3 Total
  filteredGauges.forEach( (e,i) => api.addToken( filteredPools[i], filteredGaugesAmounts[i] ));
  api.addToken( USDbC , USdec * filteredFarmlandsTVL )
  return sumTokens2({ api, resolveLP: true })

}

module.exports = {
  methodology: 'On-chain TVL Sum of only Assets Staked into Voted Equalizer Gauges & Farmlands.',
  misrepresentedTokens: true,
  sonic: {
    tvl: sumAllGauges,
    staking: staking("0x3045119766352fF250b3d45312Bd0973CBF7235a", "0xddF26B42C1d903De8962d3F79a74a501420d5F19"),
  }
};