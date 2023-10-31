const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getLPData } = require("../helper/unknownTokens");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { getTokenPrices } = require("../helper/cache/sumUnknownTokens");
const BigNumber = require("bignumber.js");

NATIVE_ADDRES = "0xfeC65bFB6e5BbCC9ab8aE98f62A8AaB2EA51c495";
NATIVE_USDT_ADDRESS = "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df";
NATIVE_LP_ADDRESS = "0x47ED4E0a52716e91a4F37914b04B2252B5B5fcDF";
FARM_ADDRES = "0xC692CA3066C84012C616989Bc7fD9659f16DDCFd";

async function calculateNativeToken(balances, token, tvl, api) {
  let [usdtBalance, pedBalance] = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: [
      { target: NATIVE_USDT_ADDRESS, params: [NATIVE_LP_ADDRESS] },
      { target: NATIVE_ADDRES, params: [NATIVE_LP_ADDRESS] },
    ],
  });
  let ret = BigNumber(tvl).div(pedBalance).times(usdtBalance).toFixed(0);
  sdk.util.sumSingleBalance(balances, token, ret);
}

async function tvl(_, _1, _2, { api }) {
  const transform = (i) => `scroll:${i.toLowerCase()}`;
  const balances = {
    tvl: {},
  };
  let pools = await api.call({
    abi: abi.getPoolTotalTvl,
    target: FARM_ADDRES,
  });

  const poolTvls = pools.map((pool) => pool.tvl);
  const tokens = pools.map((pool) => pool.assets);
  tokens.forEach(async (token, index) => {
    if (NATIVE_ADDRES === token) {
      await calculateNativeToken(balances.tvl, transform(NATIVE_USDT_ADDRESS), poolTvls[index], api);
    } else {
      sdk.util.sumSingleBalance(balances.tvl, transform(token), poolTvls[index]);
    }
  });

  await unwrapLPsAuto({ api, balances: balances.tvl, abis: { getReservesABI: abi.getReserves } });

  const pairInfos = await getLPData({
    chain: "scroll",
    lps: tokens,
    abis: { getReservesABI: abi.reserves },
  });
  const lps = Object.keys(pairInfos);
  if (lps.length) {
    const { updateBalances } = await getTokenPrices({ lps, ...api, abis: { getReservesABI: abi.getReserves } });
    balances.tvl = await updateBalances(balances.tvl);
  }

  return balances.tvl;
}

module.exports = {
  scroll: {
    tvl,
  },
};
