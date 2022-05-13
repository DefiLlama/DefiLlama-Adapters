// @ts-check
/**
* @typedef {{ [address: string]: string }} Balances
* @typedef {{ [address: string]: { price: string } }} TokenPrices
* @typedef {{ [address: string]: { price: string, balance: string } }} TokenData
*/
const sdk = require("@defillama/sdk");

const abis = require("./abis.js").abis;
const registry = require("./registry.js").registry;
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const utils = require("../helper/utils");

// =================== UTILS ===================

/**
 * @param {number} usd
 * @param {string} bn
 * @returns {bigint}
 */
const multiplyUSDby1e18 = (usd, bn) =>
  (BigInt(Math.round(usd * 100)) * BigInt(bn)) / BigInt(1e18) / BigInt(100);

/**
 * @param {Balances} balances
 * @param {TokenPrices} tokenPrices
 * @returns {bigint}
 */
const getTVLFromBalancesAndTokenPrices = (balances, tokenPrices) => {
  const ibTokenAddresses = Object.keys(tokenPrices).map((a) => a.toLowerCase());

  const ibTokensData = ibTokenAddresses.reduce((acc, addr) => {
    acc[addr].balance = balances[addr];
    return acc;
  }, /** @type {TokenData} */ (tokenPrices));

  return Object.values(ibTokensData).reduce(
    (acc, { price, balance }) =>
      acc + (BigInt(price) * BigInt(balance)) / BigInt(1e36),
      BigInt(0)
  );
};

// =================== TVL getters ===================

/**
 * WARNING: this method return prices with 1e18 base, those can't be used in `multiplyUSDby1e18` function
 * @param {any} options
 * @returns {Promise<TokenPrices>} prices
 */
const getIbTokenPrices = async ({ block }) => {
  const ibTokensAddresses = Object.values(registry.ibTokens);
  const { output } = await sdk.api.abi.multiCall({
    block: block,
    calls: ibTokensAddresses.map((address) => ({
      target: registry.FF_REGISTRY,
      params: address,
    })),
    abi: abis.priceRegistry,
  });

  return output.reduce((acc, curr) => {
    const address = curr.input.params[0].toLowerCase();

    acc[address] = {
      price: curr.output,
    };

    return acc;
  }, {});
};


/**
 * @param {{ balances: Balances, block: any }} options
 * @return {Promise<BigInt>} ibTokensTVL
 */
const getIbTokensTVL = async ({ balances, block }) => {
  const ibTokenPrices = await getIbTokenPrices({ block });

  return getTVLFromBalancesAndTokenPrices(balances, ibTokenPrices);
};

/**
 * @param {{ balances: Balances }} options
 * @return {Promise<BigInt>} kp3rTVL
 */
const getKLPsTVL = async ({ balances }) => {
  const WETH = registry.WETH.toLowerCase();
  const KP3R = registry.KP3R.toLowerCase();
  const klp = registry.Kp3rV2Klps.KP3R_WETH_1_PERCENT.toLowerCase();

  const addresses = [KP3R, WETH];

  const { data } = await utils.getPricesFromContract(addresses);

  const kp3rPrice = data[KP3R].usd;
  const wethPrice = data[WETH].usd;

  const klpPrice = 2 * Math.sqrt(kp3rPrice / wethPrice) * wethPrice;

  const klpTvl = multiplyUSDby1e18(klpPrice, balances[klp]);

  return klpTvl;
};

/**
 * @param {{ balances: Balances }} options
 * @return {Promise<BigInt>} kp3rTVL
 */
const getOtherTokensTVL = async ({ balances }) => {
  const addresses = [
    registry.KP3R,
    registry.WETH,
    registry.CVX,
    registry.DAI,
    registry.SUSHI,
    registry.CRV,
    registry.CVXCRV,
    registry.SPELL,
    registry.ARMOR,
    registry.HEGIC,
    registry.LDO,
    registry.MM,
  ];

  const { data } = await utils.getPricesFromContract(addresses);

  const othersTvl = addresses.reduce((acc, curr) => {
    const addr = curr.toLowerCase();
    const price = data[addr].usd;
    const balance = balances[addr];

    acc += multiplyUSDby1e18(price, balance);
    return acc;
  }, BigInt(0));

  return othersTvl;
};

// =================== MAIN FUNCTIONS ===================

/**
 * @param {string} timestamp
 * @param {any} block
 * @return {Promise<BigInt>} TVL
 */
async function fetch(timestamp, block) {
  const balances = /** @type {Balances} */ (await tvl(timestamp, block));

  const IB_TOKENS_TVL = await getIbTokensTVL({ balances, block });
  const KLPS_TVL = await getKLPsTVL({ balances });

  const OTHER_TOKENS_TVL = await getOtherTokensTVL({ balances });

  // @ts-ignore
  const TVL = IB_TOKENS_TVL + OTHER_TOKENS_TVL + KLPS_TVL;

  return TVL;
}

/**
 * @param {string} _timestamp
 * @param {any} block
 * @return {Promise<any>} TVL
 */
async function staking(_timestamp, block) {
  const { KP3R, VKP3R } = registry;
  const balances = {};

  await sumTokensAndLPsSharedOwners(balances, [[KP3R, false]], [VKP3R], block);

  // @dev should return stakingTvl
  return balances;
}

/**
 * @param {string} _timestamp
 * @param {any} block
 * @return {Promise<any>} TVL
 */
async function borrowed(_timestamp, block) {
  /** @type {Balances} */
  const balances = {};

  const cyTokens = Object.values(registry.cTokens);
  const { output: borrowed } = await sdk.api.abi.multiCall({
    block: block,
    calls: cyTokens.map((coin) => ({
      target: coin,
    })),
    abi: abis.totalBorrows,
  });

  const ib = Object.values(registry.ibTokens);
  for (const idx in borrowed) {
    sdk.util.sumSingleBalance(
      balances,
      ib[idx].toLowerCase(),
      borrowed[idx].output
    );
  }

  const ibTokenPrices = await getIbTokenPrices({ block });

  const borrowedTvl = getTVLFromBalancesAndTokenPrices(balances, ibTokenPrices);

  // @dev should return borrowedTvl
  return balances;
}

/**
 * @param {string} _timestamp
 * @param {any} block
 * @return {Promise<Balances>} balances
 */
async function tvl(_timestamp, block) {
  /** @type {Balances} */
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [registry.CVX, false],
      [registry.DAI, false],
      [registry.KP3R, false],
      [registry.SUSHI, false],
      [registry.CRV, false],
      [registry.CVXCRV, false],
      [registry.SPELL, false],
      [registry.WETH, false],
    ].concat(
      [
        [registry.KPR_WETH_SUSHI_POOL, true],
        [registry.USDC_ibAUD_POOL, true],
        [registry.USDC_ibEUR_POOL, true],
        [registry.USDC_ibKRW_POOL, true],
        [registry.USDC_ibJPY_POOl, true],
        [registry.USDC_ibGBP_POOL, true],
        [registry.USDC_ibCHF_POOL, true],
      ],
      Object.values(registry.ibTokens).map((t) => [t, false])
    ),
    [registry.YEARN_DEPLOYER, registry.BOND_TREASURY].concat(
      Object.values(registry.cTokens),
      Object.values(registry.ibCrvGauges)
    ),
    block
  );

  await sumTokensAndLPsSharedOwners(
    balances,
    Object.values(registry.Kp3rV2Klps).map((t) => [t, false]),
    [registry.KP3RV2],
    block
  );

  await sumTokensAndLPsSharedOwners(
    balances,
    Object.values(registry.Kp3rV1Slps).map((t) => [t, true]),
    [registry.KP3R],
    block
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking,
    borrowed
  },
  fetch,
};
