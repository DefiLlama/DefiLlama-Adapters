const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { stakings } = require("../helper/staking");

// addresses grabbed from https://docs.elasticswap.org/resources/deployments
const addresses = {
  ethStakingPool: "0xc8D00C0a8d2ec4EC538a82461A7a7F5C3aC99d95",
  avaxStakingPool: "0x9B7B70F65eA5266EBd0a0F8435BE832d39e71280",
  avaxStakingPoolLegacy: "0x416494bD4FbEe227313b76a07A1e859928D7bA47",

  ethTicToken: "0x2163383C1F4E74fE36c50E6154C7F18d9Fd06d6f",
  avaxTicToken: "0x75739a693459f33B1FBcC02099eea3eBCF150cBe",

  ethFactory: "0x8B3D780Db8842593d8b61632A2F76c4D4f31D7C3",
  ethTicUsdc: "0x79274BF95e05f0e858ab78411f3eBe85909E4F76",
  ethAmplUsdc: "0xa0c5aA50cE3cc69b1c478d8235597bC0c51DfDAb",
  ethFoxyFox: "0x1b80e501e397dBf8B7d86d06bD42679d61CAC756",

  avaxFactory: "0x8B3D780Db8842593d8b61632A2F76c4D4f31D7C3",
  avaxTicUsdce: "0x4ae1da57f2d6b2e9a23d07e264aa2b3bbcaed19a",
  avaxAmplUsdce: "0x1b80e501e397dbf8b7d86d06bd42679d61cac756",
  avaxAmplTic: "0xa0c5aa50ce3cc69b1c478d8235597bc0c51dfdab",
};

const InternalBalancesAbi = {
  inputs: [],
  name: "internalBalances",
  outputs: [
    {
      internalType: "uint256",
      name: "baseTokenReserveQty",
      type: "uint256",
    },
    {
      internalType: "uint256",
      name: "quoteTokenReserveQty",
      type: "uint256",
    },
    { internalType: "uint256", name: "kLast", type: "uint256" },
  ],
  stateMutability: "view",
  type: "function",
};

const BaseTokenAbi = {
  inputs: [],
  name: "baseToken",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  stateMutability: "view",
  type: "function",
};

const QuoteTokenAbi = {
  inputs: [],
  name: "quoteToken",
  outputs: [{ internalType: "address", name: "", type: "address" }],
  stateMutability: "view",
  type: "function",
};

async function getPriceFromContractAndChain(address, chain) {
  const _address = address.toLowerCase();
  const _chain = chain === "avax" ? "avalanche" : chain;
  try {
    const priceUrl = `https://api.coingecko.com/api/v3/simple/token_price/${chain}?contract_addresses=${_address}&vs_currencies=USD`;
    const { data: priceResp } = await utils.fetchURL(priceUrl);
    const price = priceResp[_address].usd;
    return Number(price);
  } catch {
    return 0;
  }
}

async function getElasticSwapLpReserves(address, chain = "ethereum") {
  const { output: internalBalances } = await sdk.api.abi.call({
    abi: InternalBalancesAbi,
    target: address,
    chain,
  });
  const { baseTokenReserveQty, quoteTokenReserveQty } = internalBalances;

  const { output: baseToken } = await sdk.api.abi.call({
    abi: BaseTokenAbi,
    target: address,
    chain,
  });
  const { output: baseTokenDecimal } = await sdk.api.erc20.decimals(
    baseToken,
    chain
  );
  const baseTokenPrice = await getPriceFromContractAndChain(baseToken, chain);
  const baseTokenReserve =
    (Number(baseTokenReserveQty) / 10 ** baseTokenDecimal) * baseTokenPrice;

  const { output: quoteToken } = await sdk.api.abi.call({
    abi: QuoteTokenAbi,
    target: address,
    chain,
  });
  const { output: quoteTokenDecimal } = await sdk.api.erc20.decimals(
    quoteToken,
    chain
  );
  const quoteTokenPrice = await getPriceFromContractAndChain(quoteToken, chain);
  const quoteTokenReserve =
    (Number(quoteTokenReserveQty) / 10 ** quoteTokenDecimal) * quoteTokenPrice;

  // FOXY is staked FOX and not listed on CoinGecko
  if (baseTokenReserve === 0) {
    return { address, value: quoteTokenReserve * 2 };
  } else if (quoteTokenReserve === 0) {
    return { address, value: baseTokenReserve * 2 };
  } else {
    return { address, value: quoteTokenReserve + baseTokenReserve };
  }
}

async function getEthereumTvl(timestamp, block, chainBlocks) {
  const balances = {};
  const lps = [
    addresses.ethTicUsdc,
    addresses.ethAmplUsdc,
    addresses.ethFoxyFox, // FOXY is staked FOX. ElasticSwap is the only place I found liquidity.
  ];

  const reserves = await Promise.all(
    lps.map(async (lp) => {
      return await getElasticSwapLpReserves(lp, "ethereum");
    })
  );

  reserves.forEach((reserve) => {
    sdk.util.sumSingleBalance(balances, reserve.address, reserve.value);
  });

  return balances;
}

module.exports = {
  ethereum: {
    tvl: getEthereumTvl,
  },
};
