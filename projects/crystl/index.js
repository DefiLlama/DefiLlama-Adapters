const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const vaultAbi = require("./integratedVaultAbi.json");
const apePriceGetterAbi = require("./apePriceGetter.json");
const { fetchURL } = require("../helper/utils");
const { default: BigNumber } = require("bignumber.js");

const CRYSTL_TOKEN = "0x76bF0C28e604CC3fE9967c83b3C3F31c213cfE64";
const MASTERHEALER = "0xeBCC84D2A73f0c9E23066089C6C24F4629Ef1e6d";
const VAULTHEALER_V1 = "0xDB48731c021bdB3d73Abb771B4D7aF0F43C0aC16";
const VAULTHEALER_V2 = "0xD4d696ad5A7779F4D3A0Fc1361adf46eC51C632d";
const APEPRICE_GETTER = "0x05D6C73D7de6E02B3f57677f849843c03320681c";

async function getPools() {
  const poolJson = (
    await fetchURL("https://www.crystl.finance/data/pools.json")
  ).data;
  const pools = Array.from(poolJson)
    .filter((pool) => pool.contractAddress[137] !== MASTERHEALER)
    .map((pool) => pool.contractAddress[137]);

  return pools;
}

const getBalanceAmount = (amount, decimals = 18) => {
  return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals));
};

const getBalanceNumber = (balance, decimals = 18) => {
  return getBalanceAmount(balance, decimals).toNumber();
};

async function getLPPrice(lpList, lpPrices) {
  let prices = (
    await sdk.api.abi.call({
      abi: apePriceGetterAbi.getLPPrices,
      target: APEPRICE_GETTER,
      params: [lpList, 18],
      chain: "polygon",
    })
  ).output.map((price) => getBalanceNumber(Number(price)));

  for (let index = 0; index < lpList.length; index++) {
    lpPrices.push({ token: lpList[index], price: prices[index] });
  }
}

async function getFarmBalance(lpShares, lpList) {
  const farmLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MASTERHEALER,
      chain: "polygon",
    })
  ).output;

  for (let index = 0; index < farmLength; index++) {
    const lpsOrTokens = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MASTERHEALER,
        params: index,
        chain: "polygon",
      })
    ).output.lpToken;

    const lpsOrTokens_Bal = getBalanceNumber(
      (
        await sdk.api.abi.call({
          abi: erc20.balanceOf,
          target: lpsOrTokens,
          params: MASTERHEALER,
          chain: "polygon",
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

async function getVaultBalance(lpShares, lpList, vaultHealer) {
  const vaultV1Length = (
    await sdk.api.abi.call({
      abi: vaultAbi.poolLength,
      target: vaultHealer,
      chain: "polygon",
    })
  ).output;

  for (let index = 0; index < vaultV1Length; index++) {
    const vault = (
      await sdk.api.abi.call({
        abi: vaultAbi.poolInfo,
        target: vaultHealer,
        params: index,
        chain: "polygon",
      })
    ).output;

    const vaultShares = getBalanceNumber(
      (
        await sdk.api.abi.call({
          abi: vaultAbi.vaultSharesTotal,
          target: vault.strat,
          chain: "polygon",
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

async function poolsTvl() {
  const pools = await getPools();

  const poolLength = pools.length;

  let tokenAmount = 0;

  for (let index = 0; index < poolLength; index++) {
    const tokens = Number(
      (
        await sdk.api.abi.call({
          abi: abi.totalStaked,
          target: pools[index],
          chain: "polygon",
        })
      ).output
    );
    tokenAmount += tokens;
  }

  let crystlPrice = getBalanceNumber(
    (
      await sdk.api.abi.call({
        abi: apePriceGetterAbi.getPrice,
        target: APEPRICE_GETTER,
        params: [CRYSTL_TOKEN, 18],
        chain: "polygon",
      })
    ).output
  );

  return getBalanceNumber(tokenAmount) * crystlPrice;
}

async function fetch() {
  let balances = 0;

  let lpShares = [];
  let lpList = [];
  let lpPrices = [];

  let [poolBalance] = await Promise.all([
    poolsTvl(),
    getFarmBalance(lpShares, lpList),
    getVaultBalance(lpShares, lpList, VAULTHEALER_V1),
    getVaultBalance(lpShares, lpList, VAULTHEALER_V2),
  ]);

  balances += poolBalance;

  await getLPPrice(lpList, lpPrices);

  for (let index = 0; index < lpShares.length; index++) {
    balances +=
      lpShares[index].balance *
      lpPrices.find((lp) => lp.token === lpShares[index].token).price;
  }

  return balances;
}

module.exports = {
  fetch,
  methodology:
    "Our TVL is calculated from the Total Value Locked in our Vaults, Farms, and Pools.",
};
