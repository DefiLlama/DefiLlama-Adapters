const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

const VOTER = "0x46abb88ae1f2a35ea559925d99fdc5441b592687";
const ZEROA = "0x0000000000000000000000000000000000000000";
const USDbC = "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca"
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
  base: {
    tvl: sumAllGauges,
    staking: staking("0x28c9c71c776a1203000b56c0cca48bef1cd51c53", "0x54016a4848a38f257b6e96331f7404073fd9c32c"),
  }
};