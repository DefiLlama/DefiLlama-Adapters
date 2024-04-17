const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");
const RELAYER_URLS = require("./relayerUrls.js");

const getTokenBalance = async (tokenAddress, chainName, contractAddress) => {
  try {
    const balance = (
      await sdk.api.erc20.balanceOf({
        target: tokenAddress,
        owner: contractAddress,
        chain: chainName,
      })
    ).output;

    const decimals = (await sdk.api.erc20.decimals(tokenAddress, chainName))
      .output;

    return {
      balance: BigInt(balance) / 10n ** BigInt(decimals),
      address: tokenAddress,
    };
  } catch (error) {
    console.error(error);
    return {
      balance: 0,
      address: tokenAddress,
    };
  }
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

module.exports = { getTokenBalance, fetchTotalValue };
