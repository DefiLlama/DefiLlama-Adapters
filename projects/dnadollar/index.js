const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const treasuryContract = "0x1420287565FD5Ebec8FbD720c17Cd911600449d3";

const FundDAO = "0x3e1Aa19FA59c9B474f6d2F37976a84DeD64af4Bf";
const USDT = ADDRESSES.cronos.USDT;
const USDC = ADDRESSES.cronos.USDC;
const USDC_DSHARE_meerkatLP = "0xFe0F0d50175789C1F69B41dB797cc9ABd8Ab0120";

const DShareRewardPool = "0x1A4bb8E03C35e2B672A0fcE18cab920aa023d7FC";
// node test.js projects/dnadollar/index.js
const stakingContracts = [
  "0xed94536A27922e2BD0eE661abF5fB030228d9D72",
  FundDAO,
  DShareRewardPool,
];
const DSHARE = "0x0e98dc462ff438b802fad0d68ff7f111a0674bb5";
const DNA = "0xcc57f84637b441127f2f74905b9d99821b47b20c";

async function Staking(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DNA, false],
      [DSHARE, false],
    ],
    stakingContracts,
    chainBlocks["cronos"],
    "cronos",
    (addr) => `cronos:${addr}`
  );

  return balances;
}

const pool2 = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  for (let i = 0; i < 5; i++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: DShareRewardPool,
        params: i,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output.token;

    const getTokenBalance = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: DShareRewardPool,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output;

    lpPositions.push({
      token: token,
      balance: getTokenBalance,
    });
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["cronos"],
    "cronos",
    (addr) => `cronos:${addr}`
  );

  return balances;
};

async function cronosTvl(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDT, false],
      [USDC, false],
      [USDC_DSHARE_meerkatLP, true],
    ],
    [FundDAO],
    chainBlocks["cronos"],
    "cronos",
    (addr) => `cronos:${addr}`
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    staking: () => ({}),
    pool2: () => ({}),
    tvl: () => ({}),
  },
  deadFrom: '2022-07-18',
  methodology: "Counts liquidity of the tokens deposited on the DAO Fund through the wallet Address; and Pool2s and Staking parts through DShareRewardPool and Laboratory Contracts.",
};
