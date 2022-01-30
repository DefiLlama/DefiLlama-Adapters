const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const sdk = require('@defillama/sdk')

const TimeStaking = "0x4456B87Af11e87E329AB7d7C7A246ed1aC2168B9"
const time = "0xb54f16fB19478766A268F172C9480f8da1a7c9C3"

// https://app.wonderland.money/#/bonds
const treasury = "0x1c46450211CB2646cc1DA3c5242422967eD9e04c"
const dao = "0x78a9e536EBdA08b5b9EDbE5785C9D1D50fA3278C"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"
const wavax = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
const wMEMO = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const transform = addr => addr.toLowerCase() === "0x130966628846bfd36ff31a822705796e8cb8c18d" ? "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3" : `avax:${addr}`

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      [wavax, false],
      ["0x113f413371fC4CC4C9d6416cf1DE9dFd7BF747Df", true], // mim-time
      ["0x781655d802670bba3c89aebaaea59d3182fd755d", true], // wavax-mim
      ["0x8ea6dd9482a49791e8c3d0f7c515bbd3be702f74", true], // MIM-WETH
      ["0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917", true], // wavax-time
      ["0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", false], // WETH
      ["0x4d308c46ea9f234ea515cc51f16fba776451cac8", true], // wmemo-mim
    ],
    [treasury, dao],
    chainBlocks.avax,
    'avax',
    transform
  );

  const wmemoAddress = transform(wMEMO)
  const memo = await sdk.api.abi.call({
    target: wMEMO,
    abi: { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "wMEMOToMEMO", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    chain:'avax',
    block: chainBlocks.avax,
    params: [balances[wmemoAddress]]
  })
  balances[transform(time)] = memo.output
  delete balances[wmemoAddress]

  return balances;
}

const ethTransforms = {
  "0x26fa3fffb6efe8c1e69103acb4044c26b9a106a9": "0x090185f2135308bad17527004364ebcc2d37e5f6"
}

async function ethTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      ["0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", false], //cvx
      ["0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3", false], //mim
      ["0x26fa3fffb6efe8c1e69103acb4044c26b9a106a9", false], // sSPELL
    ],
    ["0x355d72fb52ad4591b2066e43e89a7a38cf5cb341"],
    ethBlock,
    'ethereum',
    addr=>ethTransforms[addr.toLowerCase()]??addr
  );
  return balances
}


module.exports = {
  avalanche: {
    tvl,
    staking: staking(TimeStaking, time, "avax")
  },
  ethereum:{
    tvl:ethTvl
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked TIME for staking",
};
