const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require('../helper/pool2')

const ethPools = [
  {
    // USDC:XSGD
    lpToken: "0x64DCbDeb83e39f152B7Faf83E5E5673faCA0D42A",
    token0: "0x70e8de73ce538da2beed35d14187f6959a8eca96",
    token1: ADDRESSES.ethereum.USDC,
  },
  {
    // USDC:TCAD
    lpToken: "0xE15E50fF9d52beC41D53d3173F2ed40834D455f4",
    token0: "0x00000100F2A2bd000715001920eB70D229700085",
    token1: ADDRESSES.ethereum.USDC,
  },
  {
    // USDC:TAUD
    lpToken: "0x11816335DEe6763e2A7B6080b2b2980Eac7F85E4",
    token0: "0x00006100F7090010005F1bd7aE6122c3C2CF0090",
    token1: ADDRESSES.ethereum.USDC,
  },
  {
    // USDC:TGBP
    lpToken: "0x2ED09E2961D72659E4002ba8C2BaDfedC7db19B7",
    token0: "0x00000000441378008ea67f4284a57932b1c000a5",
    token1: ADDRESSES.ethereum.USDC,
  },
];

const polyPools = [
  {
    //xSGD:USDC
    lpToken: "0x8123C64D6607412C7Ac9E880f12245ef22558b14",
    token0: "0x769434dca303597c8fc4997bf3dab233e961eda2",
    token1: ADDRESSES.polygon.USDC,
  },
  {
    //wTCAD:USDC
    lpToken: "0xaEad273bc7E17DD6951ceD3264B1dBa8A19114C2",
    token0: "0x6d3cC56DFC016151eE2613BdDe0e03Af9ba885CC",
    token1: ADDRESSES.polygon.USDC,
  },
  {
    //wTAUD:USDC
    lpToken: "0x95AB308bE1e209eB6FfdD3279B5ea71D365AD30B",
    token0: "0xe4F7761b541668f88d04fe9F2E9DF10CA613aEf7",
    token1: ADDRESSES.polygon.USDC,
  },
  {
    //wTGBP:USDC
    lpToken: "0xbF772a745533f6bAd97C58D2cb6B241eF7487242",
    token0: "0x81A123f10C78216d32F8655eb1A88B5E9A3e9f2F",
    token1: ADDRESSES.polygon.USDC,
  },
];

const arbiPools = [
  {
    //fxPHP-USDC
    lpToken: "0x90b48bb20048786b167473dfeec443142d043cf7",
    token0: ADDRESSES.arbitrum.USDC,
    token1: "0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0",
  },
  {
    //fxAUD-USDC
    lpToken: "0xd5ad9eed5c5f28d83933779cd7e677e112991f51",
    token0: ADDRESSES.arbitrum.USDC,
    token1: "0x7E141940932E3D13bfa54B224cb4a16510519308",
  },
];

async function tvl(api) {
  let pools = []
  switch (api.chain) {
    case 'ethereum': pools = ethPools; break;
    case 'polygon': pools = polyPools; break;
    case 'arbitrum': pools = arbiPools; break;
  }
  const ownerTokens = pools.map(pool => [[pool.token0, pool.token1], pool.lpToken])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  ethereum: {
    tvl,
    //staking: staking(rnbwEthPool, rnbwEthToken),
    pool2: pool2('0x9cFf4A10b6Fb163a4DF369AaFed9d95838222ca6', '0x3E8E036Ddfd310B0838d3CC881A9fa827778845D'),
  },
  polygon: {
    tvl,
    //staking: staking(wrnbwPolyPool, wrnbwPolyToken),
  },
  arbitrum: {
    tvl,
  },
};
