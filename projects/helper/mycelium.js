const { sumTokens2 } = require("./unwrapLPs");
const { getParamCalls } = require("./utils");
const axios = require("axios");
const sdk = require("@defillama/sdk");
const ethers = require("ethers");

function mycExports({ chain, vault, staking }) {
  return async (ts, _block, { [chain]: block }) => {
    const { output: numTokens } = await sdk.api.abi.call({
      target: vault,
      abi: abis.allWhitelistedTokensLength,
      chain,
      block,
    });

    const { output: tokenAddresses } = await sdk.api.abi.multiCall({
      target: vault,
      abi: abis.allWhitelistedTokens,
      calls: getParamCalls(numTokens),
      chain,
      block,
    });

    const { output: totalAssets } = await sdk.api.abi.call({
      target: staking,
      abi: abis.totalAssets,
      chain,
      block,
    });

    const { output: pendingDeposits } = await sdk.api.abi.call({
      target: staking,
      abi: abis.pendingDeposits,
      chain,
      block,
    });

    const priceData = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=mycelium&vs_currencies=usd"
    );

    const totalAssetsBN = ethers.BigNumber.from(totalAssets);
    const pendingDepositsBN = ethers.BigNumber.from(pendingDeposits);
    const totalMycStaked = totalAssetsBN.add(pendingDepositsBN);
    const totalMycStakedUsd = totalMycStaked.mul(
      parseInt(priceData.data.mycelium.usd * 10 ** -18)
    );

    const sumTokens = await sumTokens2({
      owner: vault,
      tokens: tokenAddresses.map((i) => i.output),
      chain,
      block,
    });

    // Add staking TVL to sumTokens
    sumTokens[staking] = totalMycStakedUsd.toString();
    return sumTokens;
  };
}

const abis = {
  allWhitelistedTokensLength: {
    inputs: [],
    name: "allWhitelistedTokensLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  allWhitelistedTokens: {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allWhitelistedTokens",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  totalAssets: {
    inputs: [],
    name: "totalAssets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  pendingDeposits: {
    inputs: [],
    name: "pendingDeposits",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

module.exports = {
  mycExports,
};
