const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const ownerByChain = require("./owners.js");

const nullAddress = ADDRESSES.null;

const nativeVolatileChains = ["blast"];

const getAllTokenBalances = async (tokenList, chain) => {
  let balanceCalls = tokenList.map((token) => ({
    target: token,
    params: nativeVolatileChains.includes(chain)
      ? ownerByChain[chain].owner ?? ""
      : ownerByChain[chain],
  }));

  if (nativeVolatileChains.includes(chain)) {
    const volatileBalanceCalls = tokenList.map((token) => ({
      target: token,
      params: ownerByChain[chain].volatileOwner ?? "",
    }));

    balanceCalls = [...balanceCalls, ...volatileBalanceCalls];
  }

  const balances = (
    await sdk.api.abi.multiCall({
      calls: balanceCalls,
      abi: "erc20:balanceOf",
      chain,
    })
  ).output;

  const tokenBalances = balances.map((bal) => {
    const token = bal.input.target;
    const tokenBalance = bal.output;

    return {
      balance: tokenBalance,
      address: token,
    };
  });

  const nativeTokenBalance = (
    await sdk.api.eth.getBalance({
      target: nativeVolatileChains.includes(chain)
        ? ownerByChain[chain].volatileOwner ?? ""
        : ownerByChain[chain],
      chain,
    })
  ).output;

  tokenBalances.push({
    address: nullAddress,
    balance: nativeTokenBalance,
  });

  return tokenBalances.filter((tokenBal) => Number(tokenBal.balance) > 0);
};

module.exports = {
  getAllTokenBalances,
};
