const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const BigNumberJs = require("bignumber.js");
const ABI = require("./abi.json");
const { toBigNumberJsOrZero } = require("./utils.js");

const ZERO_ADDRESS = ADDRESSES.null;
const REGISTRY_ADDRESS = "0xDA820e20A89928e43794645B9A9770057D65738B";
const BOOSTER_ADDRESS = "0x6d12e3dE6dAcDBa2779C4947c0F718E13b78cfF4";
const MUKGL_ADDRESS = "0x5eaAe8435B178d4677904430BAc5079e73aFa56e";
const MULAY_ADDRESS = "0xDDF2ad1d9bFA208228166311FC22e76Ea7a4C44D";
const MUUU_REWARDS_ADDRESS = "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255";
// const TOKENS = {
//   // USDC
//   [ADDRESSES.moonbeam.USDC]: ADDRESSES.ethereum.USDC,
//   // USDT
//   [ADDRESSES.astar.USDT]: ADDRESSES.ethereum.USDT,
//   // DAI
//   [ADDRESSES.astar.DAI]: ADDRESSES.ethereum.DAI,
//   // Starlay lUSDC -> USDC
//   [ADDRESSES.astar.lUSDC]: ADDRESSES.ethereum.USDC,
//   // Starlay lUSDT -> USDT
//   [ADDRESSES.astar.lUSDT]: ADDRESSES.ethereum.USDT,
//   // Starlay lDAI -> DAI
//   [ADDRESSES.astar.lDAI]: ADDRESSES.ethereum.DAI,
//   // BUSD
//   [ADDRESSES.oasis.ceUSDT]: ADDRESSES.ethereum.BUSD,
//   // 3KGL -> DAI(TMP)
//   "0x18BDb86E835E9952cFaA844EB923E470E832Ad58": ADDRESSES.ethereum.DAI,
//   // BAI -> DAI(TMP)
//   [ADDRESSES.astar.BAI]: ADDRESSES.ethereum.DAI,
//   // aUSD -> DAI(TMP)
//   [ADDRESSES.astar.aUSD]: ADDRESSES.ethereum.DAI,
//   // ASTR
//   [ADDRESSES.astar.nASTR]: "0x67f6b5bc5670fd29bcc8af3d6633b2840aba2f30",
//   [ADDRESSES.astar.WASTR]: "0x67f6b5bc5670fd29bcc8af3d6633b2840aba2f30",
// };

async function tvl(timestamp, block, chainBlocks) {
  let allCoins = {};

  const poolLength = (
    await sdk.api.abi.call({
      target: BOOSTER_ADDRESS,
      abi: ABI.poolLength,
      block: chainBlocks["astar"],
      chain: "astar",
    })
  ).output;
  const poolInfo = [];
  const calldata = [];
  for (let i = 0; i < poolLength; i++) {
    calldata.push({
      target: BOOSTER_ADDRESS,
      params: [i],
    });
  }
  const returnData = await sdk.api.abi.multiCall({
    abi: ABI.poolInfo,
    calls: calldata,
    block: chainBlocks["astar"],
    chain: "astar",
  });
  for (let i = 0; i < poolLength; i++) {
    const pdata = returnData.output[i].output;
    if (pdata.shutdown) continue;
    poolInfo.push(pdata);
  }
  await Promise.all(
    [...Array(Number(poolInfo.length)).keys()].map(async (i) => {
      const supplyFromMuuuFinance = (
        await sdk.api.erc20.totalSupply({
          target: poolInfo[i].token,
          block: chainBlocks["astar"],
          chain: "astar",
        })
      ).output;

      const totalsupply = (
        await sdk.api.erc20.totalSupply({
          target: poolInfo[i].lptoken,
          block: chainBlocks["astar"],
          chain: "astar",
        })
      ).output;

      const muuuFinanceShare = BigNumberJs(supplyFromMuuuFinance)
        .div(totalsupply)
        .toFixed(6);

      const pool = (
        await sdk.api.abi.call({
          target: REGISTRY_ADDRESS,
          block: chainBlocks["astar"],
          chain: "astar",
          abi: ABI.get_pool_from_lp_token,
          params: poolInfo[i].lptoken,
        })
      ).output;

      if (pool != ZERO_ADDRESS) {
        const virtual_price = (
          await sdk.api.abi.call({
            target: pool,
            block: chainBlocks["astar"],
            chain: "astar",
            abi: ABI.get_virtual_price,
          })
        ).output;

        const rewardSupply = (
          await sdk.api.erc20.totalSupply({
            target: poolInfo[i].crvRewards,
            block: chainBlocks["astar"],
            chain: "astar",
          })
        ).output;

        const tvl = BigNumberJs(rewardSupply.toString())
          .multipliedBy(muuuFinanceShare)
          .dividedBy(1e18)
          .multipliedBy(BigNumberJs(virtual_price.toString()));

        allCoins[ADDRESSES.ethereum.DAI] = allCoins[ADDRESSES.ethereum.DAI]
          ? allCoins[ADDRESSES.ethereum.DAI].plus(tvl)
          : tvl;
      }
    })
  );

  // When KGL's price is determined, we can count muKGL's TVL
  const muKGL = await sdk.api.erc20.totalSupply({
    target: MUKGL_ADDRESS,
    block: chainBlocks["astar"],
    chain: "astar",
  });
  sdk.util.sumSingleBalance(
    allCoins,
    "kagla-finance",
    toBigNumberJsOrZero(muKGL.output).shiftedBy(-18).toNumber()
  );

  const muLAY = await sdk.api.erc20.totalSupply({
    target: MULAY_ADDRESS,
    block: chainBlocks["astar"],
    chain: "astar",
  });
  sdk.util.sumSingleBalance(
    allCoins,
    "starlay-finance",
    toBigNumberJsOrZero(muLAY.output).shiftedBy(-18).toNumber()
  );

  return allCoins;
}

// When MUUU's price is determined, we can count MUUU's TVL
async function staking(timestamp, block, chainBlocks) {
  const balances = {};
  const muuuStakedSupply = await sdk.api.erc20.totalSupply({
    target: MUUU_REWARDS_ADDRESS,
    block: chainBlocks["astar"],
    chain: "astar",
  });

  sdk.util.sumSingleBalance(
    balances,
    "muuu",
    toBigNumberJsOrZero(muuuStakedSupply.output).shiftedBy(-18).toNumber()
  );
  return balances;
}

module.exports = {
  tvl,
  staking,
};
