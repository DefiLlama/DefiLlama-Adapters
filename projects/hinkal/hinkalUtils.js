const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const RELAYER_URLS = require("./relayerUrls.js");
const { ethers } = require("ethers");
const ownerByChain = require("./owners.js");

const nullAddress = "0x0000000000000000000000000000000000000000";

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

  const decimalCalls = tokenList.map((token) => ({
    target: token,
  }));

  const decimals = (
    await sdk.api.abi.multiCall({
      calls: decimalCalls,
      abi: "erc20:decimals",
      chain,
    })
  ).output;

  const tokenBalances = balances.map((bal) => {
    const token = bal.input.target;

    const tokenBalance = bal.output;

    const tokenDecimal = decimals?.find(
      (decimalOutput) => decimalOutput.input.target === token
    ).output;

    return {
      balance: ethers.formatUnits(tokenBalance, Number(tokenDecimal ?? 18)),
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
    balance: ethers.formatUnits(nativeTokenBalance, 18),
  });

  return tokenBalances.filter((tokenBal) => Number(tokenBal.balance) > 0);
};

const fetchTotalValue = async (tokenBalances, chainName) => {
  const tokenAddresses = tokenBalances.map((token) => token.address);
  const prices = (
    await utils.postURL(`${RELAYER_URLS[chainName]}/get-token-prices`, {
      erc20Addresses: tokenAddresses,
    })
  ).data.prices;

  const total = tokenBalances.map((token, index) => {
    const price = prices[index];
    const tokenBalance = Number(token.balance);
    if (!price || !tokenBalance || isNaN(price) || isNaN(tokenBalance)) {
      console.log("Some error occured for token", {
        token: token.address,
        balance: tokenBalance,
        price,
        chainName,
      });
      return {
        tokenAddress: token.address,
        tokenBalance: 0,
      };
    }
    return {
      tokenAddress: token.address,
      tokenBalance: tokenBalance * price,
    };
  });
  return total.filter((token) => token && token.tokenBalance > 0);
};

module.exports = {
  getAllTokenBalances,
  fetchTotalValue,
};
