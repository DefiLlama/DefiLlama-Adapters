const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const TAIDOG_TOKEN = "0x1Fd2f219B59b88bDda7dacd50c6e0667aA2d3Ee7";
const TAIDOG_STAKING_CONTRACT = "0x9b4484D5A2665930702d09f74086CAD86d96b25E";

const TAIDOG_WETH_LP = "0x28Be5f9caBd48B712a031a901590b71f5509526D";
const LP_STAKING_CONTRACT = "0xD664c3b22c60b4927ab1e0035b99F157bc2d8F1B";

const TAIKO_TOKEN = ADDRESSES.taiko.TAIKO;
const TAIKO_STAKING_CONTRACT = "0x89a95021E45AcAB4B89eb20C18691E3E0D1d2170";

async function poolsTvl(api) {
  const lpTAIDOGReserves = await api.call({
    abi: "erc20:balanceOf",
    target: TAIDOG_TOKEN,
    params: [TAIDOG_WETH_LP],
  });

  const lpWETHReserves = await api.call({
    abi: "erc20:balanceOf",
    target: ADDRESSES.taiko.WETH,
    params: [TAIDOG_WETH_LP],
  });

  const lpStakingBalance = await api.call({
    abi: "erc20:balanceOf",
    target: TAIDOG_WETH_LP,
    params: [LP_STAKING_CONTRACT],
  });

  const totalLPSupply = await api.call({
    abi: "erc20:totalSupply",
    target: TAIDOG_WETH_LP,
    params: [],
  });

  // (STAKED_LP_TOKENS / LP_TOTALSUPPLY) * LP_TAIDOG_TOKEN_0_RESERVE
  api.add(TAIDOG_TOKEN, (lpStakingBalance / totalLPSupply) * lpTAIDOGReserves);

  // (STAKED_LP_TOKENS / LP_TOTALSUPPLY) * LP_WETH_TOKEN_1_RESERVE
  api.add(
    ADDRESSES.taiko.WETH,
    (lpStakingBalance / totalLPSupply) * lpWETHReserves
  );
}

async function stakingTvl(api) {
  const stakingBalance = await api.call({
    abi: "erc20:balanceOf",
    target: TAIDOG_TOKEN,
    params: [TAIDOG_STAKING_CONTRACT],
  });

  // Transform token via LP Pricing
  // TOKEN_0 ==> LP_RESERVES ==> WETH_TOKEN_1

  const lpTAIDOGReserves = await api.call({
    abi: "erc20:balanceOf",
    target: TAIDOG_TOKEN,
    params: [TAIDOG_WETH_LP],
  });

  const lpWETHReserves = await api.call({
    abi: "erc20:balanceOf",
    target: ADDRESSES.taiko.WETH,
    params: [TAIDOG_WETH_LP],
  });

  // transform conversion via price (staking_TOKEN_0 / TOKEN_0_RESERVE * TOKEN_1_RESERVE)
  const transformedToWETHBalance =
    (stakingBalance / lpTAIDOGReserves) * lpWETHReserves;

  // TAIDOG staking token TRANSFORM to WETH via LP Pricing
  api.add(ADDRESSES.taiko.WETH, transformedToWETHBalance);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL counts user deposits of assets like (ETH, USDC, TAIKO) into protocol, counts pool2 (lp tokens) in staking contract 0xD664c3b22c60b4927ab1e0035b99F157bc2d8F1B, and counts the number of TAIDOG tokens in the staking contract 0x9b4484D5A2665930702d09f74086CAD86d96b25E",
  taiko: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [TAIKO_TOKEN, TAIKO_STAKING_CONTRACT],
        [ADDRESSES.taiko.WETH, "0x4625F913FF1ed54859b31Cce2CE1a4DBED33b825"],
        [ADDRESSES.taiko.USDC, "0xc004e7d1eA0f69476dc26BE343E8643088246A08"],
      ],
      resolveLP: true,
    }),
    pool2: poolsTvl,
    staking: stakingTvl,
  },
};
