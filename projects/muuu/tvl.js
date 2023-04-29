const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const BigNumberJs = require("bignumber.js");
const ABI = require("./abi.json");
const { toBigNumberJsOrZero } = require("./utils.js");

const ZERO_ADDRESS = ADDRESSES.null;
const REGISTRY_ADDRESS = "0xDA820e20A89928e43794645B9A9770057D65738B";
const BOOSTER_ADDRESS = "0x6d12e3dE6dAcDBa2779C4947c0F718E13b78cfF4";
const MUKGL_ADDRESS = "0x5eaAe8435B178d4677904430BAc5079e73aFa56e";
const MUUU_REWARDS_ADDRESS = "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255";
const TOKENS = {
  // USDC
  [ADDRESSES.moonbeam.USDC]:
    ADDRESSES.ethereum.USDC,
  // USDT
  [ADDRESSES.astar.USDT]:
    ADDRESSES.ethereum.USDT,
  // DAI
  [ADDRESSES.astar.DAI]:
    ADDRESSES.ethereum.DAI,
  // Starlay lUSDC -> USDC
  [ADDRESSES.astar.lUSDC]:
    ADDRESSES.ethereum.USDC,
  // Starlay lUSDT -> USDT
  [ADDRESSES.astar.lUSDT]:
    ADDRESSES.ethereum.USDT,
  // Starlay lDAI -> DAI
  [ADDRESSES.astar.lDAI]:
    ADDRESSES.ethereum.DAI,
  // BUSD
  [ADDRESSES.oasis.ceUSDT]:
    ADDRESSES.ethereum.BUSD,
  // 3KGL -> DAI(TMP)
  "0x18BDb86E835E9952cFaA844EB923E470E832Ad58":
    ADDRESSES.ethereum.DAI,
  // BAI -> DAI(TMP)
  [ADDRESSES.astar.BAI]:
    ADDRESSES.ethereum.DAI,
  // oUSD -> DAI(TMP)
  [ADDRESSES.astar.oUSD]:
    ADDRESSES.ethereum.DAI,
};

const transformTokenAddress = (address) => TOKENS[address];

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
        .times(1e18)
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

      const maincoins = (
        await sdk.api.abi.call({
          target: REGISTRY_ADDRESS,
          block: chainBlocks["astar"],
          chain: "astar",
          abi: ABI.get_coins,
          params: pool,
        })
      ).output;

      const coins = [];
      for (let key in maincoins) {
        let coin = maincoins[key];
        if (coin == ZERO_ADDRESS) {
          continue;
        }

        const bal = await sdk.api.erc20.balanceOf({
          target: coin,
          owner: pool,
          block: chainBlocks["astar"],
          chain: "astar",
        });
        coins.push({ coin: coin, balance: bal.output });
      }

      for (var c = 0; c < coins.length; c++) {
        const balanceShare = BigNumberJs(coins[c].balance.toString())
          .times(muuuFinanceShare)
          .div(1e18)
          .toFixed(0);

        const coinAddress = coins[c].coin;

        // convert 3KGL tokens to DAI. This is temp and should convert using virtual price
        // as the tokens have accrued interest, this means current tvl is under reporting
        sdk.util.sumSingleBalance(
          allCoins,
          transformTokenAddress(coinAddress),
          balanceShare
        );
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
