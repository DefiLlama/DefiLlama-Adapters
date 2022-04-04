const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { staking } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const BigNumber = require('bignumber.js');

const treasuryContract = "0x76303016b776ca9e6545c8262954aff7bbfa51c4";

const FundDAO = "0x2b1a5E5544C2494E0f783bE3ce37243D208B52E5";
const WCRO = "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23";
const USDC = "0xc21223249ca28397b4b6541dffaecc539bff0c59";
const MMF = "0x97749c9b61f878a880dfe312d2594ae07aed7656";
const METF = "0xb8df27c687c6af9afe845a2afad2d01e199f4878";
const PES_CRO_meerkatLP = "0x43713f13a350d104319126c13cd7402822a44f6b";
const PES_METF_meerkatLP = "0xadab84bf91c130af81d76be9d7f28b8c4f515367";
const SPES_METF_meerkatLP = "0x72c1f5fb7e5513a07e1ff663ad861554887a0a0a";
const PESRewardPool = "0x64bfcbe4480b53e8234ca258a96720f29fe6a6fb"
const SPESRewardPool = "0xdd403db142a320261858840103b907c2486240c6";
const BOARDROOM = "0x7614A4CEB3ACdfCd4841D7bD76c30e7a401E83cd"
// node test.js projects/dnadollar/index.js
const stakingContracts = [
  BOARDROOM,
  FundDAO,
  SPESRewardPool,
];
const SPES = "0xbbd4650eea85f9dbd83d6fb2a6e8b3d8f32fe1c5";
const PES = "0x8efbaa6080412d7832025b03b9239d0be1e2aa3b";

const pool2 = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  let poolInfoReturn = "";
  //PES farm single pool
  for (let i = 0; i < 4; i++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: PESRewardPool,
        params: i,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output.token;

    const getTokenBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: PESRewardPool,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output;
    sdk.util.sumSingleBalance(
      balances,
      `cronos:${token}`,
      getTokenBalance
    );
  }
  //PES farm liquidity
  {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: PESRewardPool,
        params: 4,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output.token;

    const getTokenBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: PESRewardPool,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output;
    lpPositions.push({
      token: token,
      balance: getTokenBalance,
    });
  }

  //SPES farm
  for (let i = 0; i < 2; i++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: SPESRewardPool,
        params: i,
        chain: "cronos",
        block: chainBlocks["cronos"],
      })
    ).output.token;

    const getTokenBalance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: PESRewardPool,
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

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    pool2: pool2,
    tvl: () => ({}),
  },
  methodology: "Counts liquidity of the tokens deposited in PESRewardPool and SPESRewardPool.",
};
