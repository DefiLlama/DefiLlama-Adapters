const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");

const getTokenBalance = async (tokenAddress, chainName, contractAddress) => {
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
};

const fetchTotalValue = async (tokenBalances) => {
  const tokenAddresses = tokenBalances.map((token) => token.address);
  const prices = (
    await utils.postURL(
      "https://ethMainnet.relayer.hinkal.pro/get-token-prices",
      { erc20Addresses: tokenAddresses }
    )
  ).data.prices;

  console.log({ prices });

  return tokenBalances.reduce(
    (currentTotal, tokenBal, currIdx) =>
      currentTotal + Number(tokenBal.balance) * prices[currIdx],
    0
  );
};

module.exports = { getTokenBalance, fetchTotalValue };
