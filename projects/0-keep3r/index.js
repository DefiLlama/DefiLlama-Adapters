// @ts-check
/**
 * @typedef {{ [address: string]: string }} Balances
 * @typedef {{ [address: string]: { price: string } }} TokenPrices
 * @typedef {{ [address: string]: { price: string, balance: string } }} TokenData
 */
const BigNumber = require("bignumber.js");
const web3 = require("../config/web3.js");

const abis = require("./abis.js").abis;
const registry = require("./registry.js").registry;

const sdk = require("@defillama/sdk");
const {
  sumTokensAndLPsSharedOwners,
  unwrapUniswapLPs,
} = require("../helper/unwrapLPs");

const utils = require("../helper/utils");

// async function staking(timestamp, block) {
//   const balances = {};
//   // Protocol Credit Mining LPs
//   await sumTokensAndLPsSharedOwners(
//     balances,
//     [
//       [KPR_WETH_SUSHI_POOL, true],
//       [KPR_LDO_SUSHI_POOL, true],
//       [KPR_MM_SUSHI_POOL, true],
//       [KPR_AMOR_SUSHI_POOL, true],
//       [KP3R, false],
//     ],
//     [KP3R],
//     block
//   );

//   console.log('===================  staking ======================')
//   console.log({balances})

//   return balances;
// }

async function tvl(timestamp, block) {
  const balances = {};

  // const { output: sushiToken } = await sdk.api.abi.call({
  //   abi: abis.userInfo,
  //   target: MASTERCHEF,
  //   params: [58, YEARN_DEPLOYER],
  //   block,
  // });

  // await unwrapUniswapLPs(
  //   balances,
  //   [{ token: KPR_WETH_SUSHI_POOL, balance: sushiToken.amount }],
  //   block
  // );

  /** @todo: KP3R SUSHI NOT RETURNING RIGHT BALANCES I THINK */
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      // [MIM, false],
      [registry.CVX, false],
      [registry.DAI, false],
      [registry.KP3R, false],
      [registry.SUSHI, false],
      [registry.CRV, false],
      [registry.CVXCRV, false],
      [registry.SPELL, false],
      [registry.WETH, false],
      // [SEUR, false],
      // [SAUD, false],
      // [SGBP, false],
      // [SKRW, false],
      // [SJPY, false],
      // [SCHF, false],
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
    Object.values(registry.Kp3rV1Slps).map((t) => [t, true]),
    [registry.KP3R]
  );

  console.log(balances[registry.KP3R.toLowerCase()]);
  console.log({ balances });
  return balances;
}

// async function borrowed(timestamp, block) {
//   const balances = {};

//   const cyTokens = Object.values(cTokens);
//   const { output: borrowed } = await sdk.api.abi.multiCall({
//     block: block,
//     calls: cyTokens.map((coin) => ({
//       target: coin,
//     })),
//     abi: abis.totalBorrows,
//   });

// const ib = Object.values(ibTokens);
// for (const idx in borrowed) {
//   sdk.util.sumSingleBalance(balances, ib[idx], borrowed[idx].output);
// }

//   console.log('=================== borroweds ======================')
//   console.log({balances})

//   return balances;
// }

const ffRegistryAddress = "0x5C08bC10F45468F18CbDC65454Cbd1dd2cB1Ac65";

// const IB_TOKENS = [
//   '0xFAFdF0C4c1CB09d430Bf88c75D88BB46DAe09967', // ibAUD
//   '0x1CC481cE2BD2EC7Bf67d1Be64d4878b16078F309', // ibCHF
//   '0x69681f8fde45345C3870BCD5eaf4A05a60E7D227', // ibGBP
//   '0x5555f75e3d5278082200Fb451D1b6bA946D8e13b', // ibJPY
//   '0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27', // ibEUR
//   '0x95dFDC8161832e4fF7816aC4B6367CE201538253', // ibKRW
// ];

/**
 * @param {{ block }} options
 * @returns {Promise<TokenPrices>} prices
 */
const getIbTokenPrices = async ({ block }) => {
  const ibTokensAddresses = Object.values(registry.ibTokens);
  const { output } = await sdk.api.abi.multiCall({
    block: block,
    calls: ibTokensAddresses.map((address) => ({
      target: ffRegistryAddress,
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

  const ibTokenAddresses = Object.keys(ibTokenPrices).map((a) =>
    a.toLowerCase()
  );

  const ibTokensData = ibTokenAddresses.reduce((acc, addr) => {
    acc[addr].balance = balances[addr];
    return acc;
  }, /** @type {TokenData} */ (ibTokenPrices));

  return Object.values(ibTokensData).reduce(
    (acc, { price, balance }) =>
      acc + (BigInt(price) * BigInt(balance)) / BigInt(1e36),
    0n
  );
};

// /**
//  * @param {{ balances: Balances }} options
//  * @return {Promise<BigInt>} kp3rTVL
//  */
// const getKp3rTVL = async ({ balances }) => {
//   const { data } = await utils.getPricesfromString("keep3rv1");
//   const kp3rPrice = data.keep3rv1.usd;
//   return (BigInt(Math.round(kp3rPrice * 100)) * BigInt(balances[KP3R.toLowerCase()])) / BigInt(1e18) / 100n;
// }

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
  ];

  const { data } = await utils.getPricesFromContract(addresses);

  const TVL = addresses.reduce((acc, curr) => {
    const addr = curr.toLowerCase();
    const price = data[addr].usd;
    const balance = balances[addr];

    acc +=
      (BigInt(Math.round(price * 100)) * BigInt(balance)) / BigInt(1e18) / 100n;
    return acc;
  }, 0n);

  return TVL;
};

async function fetch(timestamp, block) {
  const balances = /** @type {Balances} */ (await tvl(timestamp, block));

  const IB_TOKENS_TVL = await getIbTokensTVL({ balances, block });

  // const KP3R_TVL = await getKp3rTVL({ balances });

  const OTHER_TOKENS_TVL = await getOtherTokensTVL({ balances });

  console.log({ OTHER_TOKENS_TVL });

  // @ts-ignore
  const TVL = IB_TOKENS_TVL + OTHER_TOKENS_TVL;

  console.log({ TVL });

  return TVL;
}

module.exports = {
  ethereum: {
    fetch,
    // tvl,
    // staking,
    // borrowed,
  },
  fetch,
};
