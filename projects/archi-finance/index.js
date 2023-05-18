const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const ABI = require("./abi.json");

const addresses = {
  vaultInfo: "0x73956FF7375476EBFD5e82d80Ea9065a5bCc3d2b",
  collateralPoolAddress: "0xbd198617aD1dc75B0f7A0A67BbE31993919Cd716",
  fsGlpAddress: ADDRESSES.arbitrum.fsGLP,
  fsGlpHolders: ["0x65C59eE732BD249224718607Ee0EC0e293309923", "0x49EE14e37Cb47bff8c512B3A0d672302A3446eb1"],
  vaults: [
    // weth pool
    "0x7674Ccf6cAE51F20d376644C42cd69EC7d4324f4",
    // usdt pool
    "0x179bD8d1d654DB8aa1603f232E284FF8d53a0688",
    // usdc pool
    "0xa7490e0828Ed39DF886b9032ebBF98851193D79c",
    // wbtc pool
    "0xee54A31e9759B0F7FDbF48221b72CD9F3aEA00AB",
    // dai pool
    "0x4262BA30d5c1bba98e9E9fc3c40602a7E09Ca49F",
    // link pool
    "0xB86a783C329d5D0CE84093757586F5Fd5364cd71",
    // uni pool
    "0xAf2a336AE86eF90a3958F4bFC6EFc23cD6190951",
    // frax pool
    "0x2032998a5312B88f6b4d2b86638Be31B20d1B573",
    // mim pool
    "0xbd70E8712264D6A62a7A6BD255A59992068adCAd"
  ]
}

async function tvl(timestamp, block, chainBlocks, { api }) {
  const tokens = await api.multiCall({  abi: 'address:underlyingToken', calls: addresses.vaults })
  const tokensAndOwners = tokens.map((v, i) => [v, addresses.vaults[i]])
  addresses.fsGlpHolders.forEach(i => tokensAndOwners.push([addresses.fsGlpAddress, i]))
  
  return sumTokens2({ api, tokensAndOwners})
}

async function borrowed(timestamp, block, chainBlocks, { api }) {
  const borrowedBalance = await api.call({ target: addresses.vaultInfo, abi: ABI.borrowedBalance, params: [addresses.vaults] });
  api.addTokens(borrowedBalance[0], borrowedBalance[1]);
}

module.exports = {
  methodology: "The TVL (Total Value Locked) of ArchiFinance is calculated by adding the total liquidity and borrowing amount.",
  arbitrum: {
    tvl,
    borrowed,
  },
};