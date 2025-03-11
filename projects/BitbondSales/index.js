const { default: BigNumber } = require('bignumber.js')
const sdk = require('@defillama/sdk')

const { get } = require('../helper/http');
const { sumTokens2 } = require("../helper/unwrapLPs");

const { chainMapping, userAgents, metisBaseUrl } = require("./config.json");

async function fetchSales(networkName) {
  let contracts = [];
  let currentPage = 1;
  let isLastPage = false;

  while (!isLastPage) {
    const response = await get(
      `${metisBaseUrl}/${networkName}/token-sales?page=${currentPage}&perPage=100`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": getRandomUserAgent(),
        }
      }
    );

    contracts.push(...response.meta.contracts);

    const pagination = response.meta.pagination;
    isLastPage = pagination ? pagination.isLastPage : true;
    currentPage = pagination ? pagination.nextPage : currentPage;
  }

  return contracts;
}

function getRandomUserAgent() {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

async function tvl(api) {
  const networkName = chainMapping[api.chain];
  const sales = await fetchSales(networkName);
  const tokenAddresses = sales.map((sale) => (sale.tokenAddress));

  // Native currencies TVL
  const salesWithNativeCurrency = sales.filter((sale) => sale.currencyAddress === "0x0000000000000000000000000000000000000000");
  const tokenAddressesWithNativeCurrency = salesWithNativeCurrency.map((sale) => (sale.currencyAddress));
  const availableNativeCurrenciesValues = await Promise.all(
    salesWithNativeCurrency.map(async (sale) => 
      await sdk.api.eth.getBalance({
        chain: api.chain,
        target: sale.address
      }).then((balance) => balance.output)
    )
  );
  api.addTokens(tokenAddressesWithNativeCurrency, availableNativeCurrenciesValues)

  // Other currencies TVL
  const salesWithOtherCurrency = sales.filter((sale) => sale.currencyAddress !== "0x0000000000000000000000000000000000000000");
  const tokenAddressesWithOtherCurrency = salesWithOtherCurrency.map((sale) => (sale.tokenAddress));
  const availableOtherCurrenciesValues = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: salesWithOtherCurrency.map((sale) => ({ target: sale.currencyAddress, params: [sale.tokenAddress] })),
    requery: true
  });
  api.addTokens(tokenAddressesWithOtherCurrency, availableOtherCurrenciesValues)
  
  // Available tokens TVL
  const availableTokensValues = await api.multiCall({
    abi: "uint256:totalTokensLeft",
    calls: sales.map((sale) => ({ target: sale.address })),
    requery: true
  });
  api.addTokens(tokenAddresses, availableTokensValues)

  // Tokens to claim TVL
  const tokensToClaimExpandedValues = await api.multiCall({
    abi: "function tokensToClaim(address) view returns (uint256)",
    calls: sales.map((sale) => {
      return sale.investors.map((investor) => ({
        target: sale.address,
        params: investor
      }));
    }).flat(1),
    requery: true
  });
  let cursor = 0;
  const tokensToClaimValues = [];
  sales.forEach((sale) => {
    const investorsCount = sale.investors.length;
    tokensToClaimValues.push(tokensToClaimExpandedValues.slice(cursor, cursor + investorsCount).reduce((acc, val) => acc.plus(val), BigNumber(0)));
    cursor += investorsCount;
  });
  api.addTokens(tokenAddresses, tokensToClaimValues)
  
  return sumTokens2({api, resolveLP: true});
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
