const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const vaultAbi = require("./integratedVaultAbi.json");
const apePriceGetterAbi = require("./apePriceGetter.json");
const { fetchURL } = require("../helper/utils");
const { default: BigNumber } = require("bignumber.js");

const CHAIN_DATA = {
  polygon: {
    name: "polygon",
    id: 137,
    crystl_token: "0x76bF0C28e604CC3fE9967c83b3C3F31c213cfE64",
    masterhealer: "0xeBCC84D2A73f0c9E23066089C6C24F4629Ef1e6d",
    vaulthealer_v1: "0xDB48731c021bdB3d73Abb771B4D7aF0F43C0aC16",
    vaulthealer_v2: "0xD4d696ad5A7779F4D3A0Fc1361adf46eC51C632d",
    apeprice_getter: "0x05D6C73D7de6E02B3f57677f849843c03320681c",
    pools: "https://polygon.crystl.finance/data/pools.json",
  },
  cronos: {
    name: "cronos",
    id: 25,
    crystl_token: "0xCbDE0E17d14F49e10a10302a32d17AE88a7Ecb8B",
    masterhealer: "",
    vaulthealer_v1: "0x4dF0dDc29cE92106eb8C8c17e21083D4e3862533",
    vaulthealer_v2: "",
    apeprice_getter: "0x6993fFaB6FD7c483f33A5E3EFDFEA676425C8F31",
    pools: "https://cronos.crystl.finance/data/pools.json",
  },
};

let totalTvl = 0;

async function getPools(chain) {
  const poolJson = (await fetchURL(chain.pools)).data;
  const pools = Array.from(poolJson)
    .filter((pool) => pool.contractAddress[chain.id] !== chain.masterhealer)
    .map((pool) => pool.contractAddress[chain.id]);

  return pools;
}

const getBalanceAmount = (amount, decimals = 18) => {
  return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals));
};

const getBalanceNumber = (balance, decimals = 18) => {
  return getBalanceAmount(balance, decimals).toNumber();
};

async function getLPPrice(lpList, lpPrices, chain) {
  let prices = (
    await sdk.api.abi.call({
      abi: apePriceGetterAbi.getLPPrices,
      target: chain.apeprice_getter,
      params: [lpList, 18],
      chain: chain.name,
    })
  ).output.map((price) => getBalanceNumber(Number(price)));

  for (let index = 0; index < lpList.length; index++) {
    lpPrices.push({ token: lpList[index], price: prices[index] });
  }
}

async function getFarmBalance(lpShares, lpList, chain) {
  if (chain.masterhealer === "") {
    return;
  }

  const farmLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: chain.masterhealer,
      chain: chain.name,
    })
  ).output;

  for (let index = 0; index < farmLength; index++) {
    const lpsOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: chain.masterhealer,
        params: index,
        chain: chain.name,
      })
    ).output.lpToken;

    const lpsOrTokens_Bal = getBalanceNumber(
      (
        await sdk.api.abi.call({
          abi: erc20.balanceOf,
          target: lpsOrTokens,
          params: chain.masterhealer,
          chain: chain.name,
        })
      ).output
    );

    lpShares.push({
      token: lpsOrTokens,
      balance: lpsOrTokens_Bal,
    });

    if (!lpList.includes(lpsOrTokens)) {
      lpList.push(lpsOrTokens);
    }
  }
}

async function getVaultBalance(lpShares, lpList, vaultHealer, chain) {
  if (vaultHealer === "") {
    return;
  }

  const vaultV1Length = (
    await sdk.api.abi.call({
      abi: vaultAbi.poolLength,
      target: vaultHealer,
      chain: chain.name,
    })
  ).output;

  for (let index = 0; index < vaultV1Length; index++) {
    const vault = (
      await sdk.api.abi.call({
        abi: vaultAbi.poolInfo,
        target: vaultHealer,
        params: index,
        chain: chain.name,
      })
    ).output;

    const vaultShares = getBalanceNumber(
      (
        await sdk.api.abi.call({
          abi: vaultAbi.vaultSharesTotal,
          target: vault.strat,
          chain: chain.name,
        })
      ).output
    );

    lpShares.push({
      token: vault.want,
      balance: vaultShares,
    });

    if (!lpList.includes(vault.want)) {
      lpList.push(vault.want);
    }
  }
}

async function poolsTvl(chain) {
  const pools = await getPools(chain);

  const poolLength = pools.length;

  let tokenAmount = 0;

  for (let index = 0; index < poolLength; index++) {
    const tokens = Number(
      (
        await sdk.api.abi.call({
          abi: abi.totalStaked,
          target: pools[index],
          chain: chain.name,
        })
      ).output
    );
    tokenAmount += tokens;
  }

  let crystlPrice = getBalanceNumber(
    (
      await sdk.api.abi.call({
        abi: apePriceGetterAbi.getPrice,
        target: chain.apeprice_getter,
        params: [chain.crystl_token, 18],
        chain: chain.name,
      })
    ).output
  );

  return getBalanceNumber(tokenAmount) * crystlPrice;
}

function calculateLpBalancePrice(lpShares, balances, lpPrices) {
  for (let index = 0; index < lpShares.length; index++) {
    balances +=
      lpShares[index].balance *
      lpPrices.find((lp) => lp.token === lpShares[index].token).price;
  }
  return balances;
}

async function fetchChain(chain) {
  let balances = 0;

  let lpShares = [];
  let lpList = [];
  let lpPrices = [];

  let [poolBalance] = await Promise.all([
    poolsTvl(chain),
    getFarmBalance(lpShares, lpList, chain),
    getVaultBalance(lpShares, lpList, chain.vaulthealer_v1, chain),
    getVaultBalance(lpShares, lpList, chain.vaulthealer_v2, chain),
  ]);

  balances += poolBalance;

  await getLPPrice(lpList, lpPrices, chain);

  balances = calculateLpBalancePrice(lpShares, balances, lpPrices);

  totalTvl += balances;

  return balances;
}

async function fetch() {
  return (await polygon()) + (await cronos());
}

async function polygon() {
  return fetchChain(CHAIN_DATA.polygon);
}

async function cronos() {
  return fetchChain(CHAIN_DATA.cronos);
}

module.exports = {
  polygon: {
    fetch: polygon,
  },
  cronos: {
    fetch: cronos,
  },
  fetch,
  methodology:
    "Our TVL is calculated from the Total Value Locked in our Vaults, Farms, and Pools.",
};
