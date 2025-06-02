const { compoundExports2 } = require('../helper/compound')
const ADDRESSES = require('../helper/coreAssets.json')

const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Anchor
const anchorStart = 11915867;
const comptroller = "0x4dcf7407ae5c07f8681e1659f626e114a7667339";

// Stabilizer
const stabilizer = "0x7eC0D931AFFBa01b77711C2cD07c76B970795CDd";
const dai = ADDRESSES.ethereum.DAI;

// Vaults
const vaults = [
  "0x89eC5dF87a5186A0F0fa8Cb84EdD815de6047357", // inUSDC->ETH
  "0xc8f2E91dC9d198edEd1b2778F6f2a7fd5bBeac34", // inDAI->WBTC
  "0x41D079ce7282d49bf4888C71B5D9E4A02c371F9B", // inDAI->YFI
  "0x2dCdCA085af2E258654e47204e483127E0D8b277", // inDAI->ETH
];

async function vaultsTVL(api) {
  const tokens  = await api.multiCall({  abi: abi.underlying, calls: vaults})
  const bals = await api.multiCall({  abi: abi.totalSupply, calls: vaults})
  api.add(tokens, bals)
}

async function stabilizerTVL(api) {
  if (api < anchorStart)
    return;

  const supply = await api.call({ target: stabilizer, abi: abi["supply"], })
  api.add(dai, supply);
}

async function tvl(api) {
  const compTvl = compoundExports2({ comptroller, cether: ['0x697b4acaa24430f254224eb794d2a85ba1fa1fb8', '0x8e103eb7a0d01ab2b2d29c91934a9ad17eb54b86'], blacklistedTokens: ['0x865377367054516e17014ccded1e7d814edc9ce4']}).tvl

  await Promise.all([
    compTvl(api),
    vaultsTVL(api),
    stabilizerTVL(api),
  ]);
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  methodology: "DOLA curve metapool replaced by DOLA",
  hallmarks: [
    [1648771200, "INV price hack"],
    [1655380800, "Inverse Frontier Deprecated"]
  ],
  start: '2020-12-12', // Dec 12 2020 00:00:00 GMT+0000
  ethereum: { tvl }
};
