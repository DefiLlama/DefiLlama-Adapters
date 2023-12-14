/* const LIQUIDITY_ON_ETH = [
  "0xb55EE890426341FE45EE6dc788D2D93d25B59063", // LOVE
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
];

const LIQUIDITY_ON_PLS = [
  "0xb55EE890426341FE45EE6dc788D2D93d25B59063", // LOVE
  "0x95B303987A60C71504D99Aa1b13B4DA07b0790ab", // PLSX
  "0xb55EE890426341FE45EE6dc788D2D93d25B59063", // LOVE (for love/wpls)
  "0xA1077a294dDE1B09bB078844df40758a5D0f9a27", // WPLS
];

// Love staking contract addresses for different chains
const LOVE_STAKING_CONTRACT = {
  eth: "0xE639E9DC0E302f5dB025713009868c8adE4Ced26",
  pls: "0xDd91E607C919Db74e18C2845e4cfb22793c30b2f",
  bsc: "0x1781e00780AfD93a03Bf5f9dED088a8578cE9B09",
};

const LOVE_TOKEN_CONTRACT = "0xb55EE890426341FE45EE6dc788D2D93d25B59063";
// get balance
async function getBalance(api, target, params) {
  try {
    return await api.call({
      abi: "erc20:balanceOf",
      target,
      params,
    });
  } catch (error) {
    console.error(`Error fetching balance for ${target}: ${error.message}`);
    throw error; // Rethrow the error for higher-level handling if needed
  }
}
async function stakingETH(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: "uint256:totalSupply",
    target: LOVE_STAKING_CONTRACT.eth,
  });

  api.add(LOVE_TOKEN_CONTRACT, collateralBalance);
}

async function stakingPLS(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: "uint256:totalSupply",
    target: LOVE_STAKING_CONTRACT.pls,
  });

  api.add(LOVE_TOKEN_CONTRACT, collateralBalance);
}

async function stakingBSC(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: "uint256:totalSupply",
    target: LOVE_STAKING_CONTRACT.bsc,
  });

  api.add(LOVE_TOKEN_CONTRACT, collateralBalance);
}

async function tvl_ETH(_, _1, _2, { api }) {
  const [loveBalance, wethBalance, stakingLockedTokens] = await Promise.all([
    getBalance(api, LIQUIDITY_ON_ETH[0], [
      "0x7bfa17E9D4296bf9697769a55B6654222E36097E",
    ]),
    getBalance(api, LIQUIDITY_ON_ETH[1], [
      "0x7bfa17E9D4296bf9697769a55B6654222E36097E",
    ]),
    stakingETH(_, _1, _2, { api }), // Include staking value in TVL calculation
  ]);

  api.addTokens(LIQUIDITY_ON_ETH, [
    loveBalance,
    wethBalance,
    stakingLockedTokens,
  ]);
}

async function tvl_PLS(_, _1, _2, { api }) {
  const [
    loveBalance,
    plsxBalance,
    wplsBalance,
    loveOnPlsxBalance,
    stakingLockedTokens,
  ] = await Promise.all([
    getBalance(api, LIQUIDITY_ON_PLS[0], [
      "0xEFfB56e3402f1993A34887EecaaA3D63da8E3f85",
    ]),
    getBalance(api, LIQUIDITY_ON_PLS[1], [
      "0xEFfB56e3402f1993A34887EecaaA3D63da8E3f85",
    ]),
    getBalance(api, LIQUIDITY_ON_PLS[2], [
      "0xf488E4bd34F821c0888e0D04513153a326499BD9",
    ]),
    getBalance(api, LIQUIDITY_ON_PLS[3], [
      "0xf488E4bd34F821c0888e0D04513153a326499BD9",
    ]),
    stakingPLS(_, _1, _2, { api }), // Include staking value in TVL calculation
  ]);

  api.addTokens(LIQUIDITY_ON_PLS, [
    loveBalance,
    plsxBalance,
    wplsBalance,
    loveOnPlsxBalance,
    stakingLockedTokens,
  ]);
}
async function tvl_BSC(_, _1, _2, { api }) {
  const [stakingLockedTokens] = await Promise.all([
    // getBalance(api, LIQUIDITY_ON_ETH[0], [
    //   "0x7bfa17E9D4296bf9697769a55B6654222E36097E",
    // ]),
    // getBalance(api, LIQUIDITY_ON_ETH[1], [
    //   "0x7bfa17E9D4296bf9697769a55B6654222E36097E",
    // ]),
    stakingBSC(_, _1, _2, { api }), // Include staking value in TVL calculation
  ]);

  api.add(LIQUIDITY_ON_ETH[0], [stakingLockedTokens]);
} */
module.exports = {
  methodology:
    "The liquidity on these three pools + the tokens staked on all three chains (PulseChain, Ethereum, and Binance Smart Chain)",
  start: 1000235,
};

const config = {
  ethereum: { staking: '0xE639E9DC0E302f5dB025713009868c8adE4Ced26' },
  pulse: { staking: '0xDd91E607C919Db74e18C2845e4cfb22793c30b2f' },
  bsc: { staking: '0x1781e00780AfD93a03Bf5f9dED088a8578cE9B09' },
}

Object.keys(config).forEach(chain => {
  const { staking} = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: async (_, _b, _cb, { api, }) => {
      const stakingToken = await api.call({  abi: 'address:stakingToken', target: staking})
      return api.sumTokens({ owner: staking, tokens: [stakingToken]})
    }
  }
})