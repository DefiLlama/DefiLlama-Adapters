const sdk = require("@defillama/sdk");
const BigNumberJs = require("bignumber.js");
const ABI = require("./abi.json");
const { toBigNumberJsOrZero } = require("./utils.js");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const REGISTRY_ADDRESS = "0xDA820e20A89928e43794645B9A9770057D65738B";
const BOOSTER_ADDRESS = "0x6d12e3dE6dAcDBa2779C4947c0F718E13b78cfF4";
const MUKGL_ADDRESS = "0x5eaAe8435B178d4677904430BAc5079e73aFa56e";
const MUUU_REWARDS_ADDRESS = "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255";
const TOKENS = {
  // USDC
  "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // USDT
  "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // DAI
  "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // Starlay lUSDC -> USDC
  "0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // Starlay lUSDT -> USDT
  "0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // Starlay lDAI -> DAI
  "0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // BUSD
  "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E":
    "0x4fabb145d64652a948d72533023f6e7a623c7c53",
  // 3KGL -> DAI(TMP)
  "0x18BDb86E835E9952cFaA844EB923E470E832Ad58":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // BAI -> DAI(TMP)
  "0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // oUSD -> DAI(TMP)
  "0x29F6e49c6E3397C3A84F715885F9F233A441165C":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
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
