const { sumTokens2 } = require("../helper/unwrapLPs");

const fsGLPHolder = "0x65c59ee732bd249224718607ee0ec0e293309923";
const vaults = [
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
];

const tvl = async (_, _1, _2, { api }) => {
  const tokensAndOwners = [['0x1addd80e6039594ee970e5872d247bf0414c8903', fsGLPHolder]]
  const tokens = await api.multiCall({  abi: 'address:underlyingToken', calls: vaults })
  const supplyRewardPools = await api.multiCall({  abi: 'address:supplyRewardPool', calls: vaults })
  const borrowedRewardPools = await api.multiCall({  abi: 'address:borrowedRewardPool', calls: vaults })
  tokens.forEach((v, i) => tokensAndOwners.push(
    [v, vaults[i]],
    [v, supplyRewardPools[i]],
    [v, borrowedRewardPools[i]],
    ))

  return sumTokens2({ api, tokensAndOwners})
}

module.exports = {
  methodology: "The TVL (Total Value Locked) of ArchiFinance is calculated by adding the total liquidity and borrowing amount.",
  arbitrum: {
    tvl
  },
};