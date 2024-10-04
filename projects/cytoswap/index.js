const { sumTokens2 } = require('../helper/unwrapLPs')

const helaPools = [
  {
    //HLUSD-hUSDT
    lpToken: "0x84f4548cf5ed6829afd457a3cceca4ae88b0f2d0",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xd3442073fa7ccf8a7c39d95dc125cd59497aa078",
  },
  {
    //HLUSD-hUSDC
    lpToken: "0x1b5e356d43c1a273fe36ac44ab63eea99b32eef3",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xf5b85320a772b436cb8105441a3db9ba29437b4a",
  },
  {
    //HLUSD-GGC
    lpToken: "0x6c94ac15c83028ad1e981922038ee88caeeb5efc",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xbebd8ceb78ac7f962cce5a53cf19dc89315ebe04",
  },
  {
    //HLUSD-BRUCE
    lpToken: "0x195ded19f2242da6351d12525ba80c733135bf96",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xae86eada4ffae898f9f093c269591bff9f582e65",
  },
  {
    //HLUSD-hUSDC
    lpToken: "0xc627fb9168b8d91787e8859fe7f786edc5cfd00b",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xf5b85320a772b436cb8105441a3db9ba29437b4a",
  },
  {
    //LUI-HLUSD
    lpToken: "0xdc3f3686d5bb7900a0944cee8ecc2fd24bcf2b5d",
    token0: "0x01520b4f9e795e58eaac756f1908a66f1f5ed74b",
    token1: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
  },
  {
    //HLUSD-CYTO
    lpToken: "0x66b5798f7b99139fd10ed3c51df0453a12d2841d",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0x3d74a72315443ee061525b37a01000d0cebb2cfa",
  },
  {
    //hUSDT-hUSDC
    lpToken: "0x674494d1ada80fb6935ce390e540ddf0c90a1ac7",
    token0: "0xd3442073fa7ccf8a7c39d95dc125cd59497aa078",
    token1: "0xf5b85320a772b436cb8105441a3db9ba29437b4a",
  },
  {
    //HLUSD-hUSDT
    lpToken: "0x5e04756c4ec2ed28d44131fc3160d2b08e062e84",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xd3442073fa7ccf8a7c39d95dc125cd59497aa078",
  },
  {
    //HLUSD-hUSDC
    lpToken: "0x40f92b18a66684aa29b7a4d26ac81c884e6b62ea",
    token0: "0x3a035615e101373fa9ba21c5bea7fe4026fc40b4",
    token1: "0xf5b85320a772b436cb8105441a3db9ba29437b4a",
  },
];

async function calcTvl(pools, block, chain) {
  const toa = []
  for (let i = 0; i < pools.length; i++) {
    toa.push([pools[i].token0, pools[i].lpToken])
    toa.push([pools[i].token1, pools[i].lpToken])
  }
  return sumTokens2({ chain, block, tokensAndOwners: toa, })
}

async function helaTvl(timestamp, block, chainBlocks) {
  return calcTvl(helaPools, chainBlocks.hela, "hela");
}

module.exports = {
  hela: {
    tvl: helaTvl,
  },
};
