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
    calls: salesWithOtherCurrency.map((sale) => ({ target: sale.currencyAddress, params: [sale.address] })),
    requery: true
  });
  api.addTokens(tokenAddressesWithOtherCurrency, availableOtherCurrenciesValues)
  
  // Tokens TVL
  const tokensValues = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: sales.map((sale) => ({ target: sale.tokenAddress, params: [sale.address] })),
    requery: true
  });
  api.addTokens(tokenAddresses, tokensValues)
  
  return sumTokens2({api, resolveLP: true});
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
