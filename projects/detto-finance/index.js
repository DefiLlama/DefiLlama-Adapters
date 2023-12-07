const { abi } = require("@defillama/sdk/build/api");
const ADDRESSES = require("../helper/coreAssets.json");
const { sumUnknownTokens } = require("../helper/unknownTokens");
const { default: BigNumber } = require("bignumber.js");

async function getPoolTvl(_, _1, _2, { api }) {
  let pools = await api.call({
    abi: abiInfo.poolTvls,
    target: DETTO_FARM_ADDRESS,
  });
  pools = pools.filter((pool) => pool.pid !== DETTO_FARM_TOKEN_LP_ADDRESS);
  pools.forEach((pool) => {
    api.addToken(pool.assets, pool.tvl);
  });

  let balances = await sumUnknownTokens({
    api,
    useDefaultCoreAssets: false,
    resolveLP: true,
    abis: {
      getReservesABI: abiInfo.reserves,
    },
  });
  return balances;
}

async function getStaking(_, _1, _2, { api }) {
  const transform = (i) => "base:" + i.toLowerCase();
  const [pools, nftPools, reserves, token0, token1] = await Promise.all([
    api.call({ abi: abiInfo.poolTvls, target: DETTO_FARM_ADDRESS }),
    api.call({ abi: abiInfo.nftTvls, target: DETTO_NFT_FARM_ADDRESS }),
    api.call({ abi: abiInfo.reserves, target: DETTO_FARM_TOKEN_LP_ADDRESS }),
    api.call({ abi: abiInfo.token0Abi, target: DETTO_FARM_TOKEN_LP_ADDRESS }),
    api.call({ abi: abiInfo.token1Abi, target: DETTO_FARM_TOKEN_LP_ADDRESS }),
  ]);
  let detoPool = pools.find(
    (pool) =>
      pool.assets.toLowerCase() === DETTO_FARM_TOKEN_ADDRESS.toLowerCase()
  );
  let bal = BigNumber(detoPool.tvl);
  nftPools.forEach((nftPool) => {
    let detoNum = NFT_DETO_MAP[nftPool.nftAssets];
    bal = bal.plus(detoNum * nftPool.tvl * 10 ** 18);
  });

  let token, stakedBal;
  let [_reserve0, _reserve1] = reserves;
  if (token0.toLowerCase() === DETTO_FARM_TOKEN_ADDRESS.toLocaleLowerCase()) {
    token = token1;
    stakedBal = bal.times(BigNumber(_reserve1).div(BigNumber(_reserve0)));
  } else {
    token = token0;
    stakedBal = bal.times(BigNumber(_reserve0) / BigNumber(_reserve1));
  }

  const balances = {
    [transform(token)]: stakedBal.toFixed(0),
  };
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getPoolTvl,
    staking: getStaking,
  },
};

const DETTO_FARM_ADDRESS = "0x6D360d5410b6cdF25fB2D90D36335F228F0Efe48";
const DETTO_FARM_TOKEN_ADDRESS = "0x7BC401227777F173Ff871993b198A8632741B9Bb";
const DETTO_FARM_TOKEN_LP_ADDRESS =
  "0xC2135717aF0646B34C93979Cd351f656D8d4924C";
const DETTO_NFT_FARM_ADDRESS = "0x840C37352c6ECc65207c87fa029EA3cAbba43A23";
const Pacho_ADDRESS = "0x38f375BCf83c4B8d4CA3725e80f9f599EA4B7f70";
const Wolpis_ADDRESS = "0xd9faf59079Fc49334C3c347ff14E5c6070fE6C36";
const Fergus_ADDRESS = "0x944bCcb1d6C57d628B08554E0B896537Cb6700f8";
const Derrick_ADDRESS = "0x747729391D9D8e75C529Cb130a8019c5dC214fB5";
const Maxim_ADDRESS = "0x892Da9b4F08Af4A57d3DbFbCF931177e4e7BF1bC";

const NFT_DETO_MAP = {
  [Pacho_ADDRESS]: 200,
  [Wolpis_ADDRESS]: 800,
  [Fergus_ADDRESS]: 2000,
  [Derrick_ADDRESS]: 5000,
  [Maxim_ADDRESS]: 12000,
};

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
  nftTvls:
    "function getPoolTotalNftCount() view returns (tuple(uint256 pid, address nftAssets, uint256 tvl)[])",
  reserves:
    "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)",
  token0Abi: "address:token0",
  token1Abi: "address:token1",
};
