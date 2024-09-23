const { stakings } = require("../helper/staking");
const vestingSettingsAbi = require("./vesting-settings-abi.json");
const BigNumber = require("bignumber.js");

const BONE_TOKEN = "0x9813037ee2218799597d83D4a5B6F3b6778218d9";
const BONE_CONTRACT = "0x3358FCA51d7C0408750FBbE7777012E0b67C027F";

const REAL_YIELD_STAKING = "0xe13824Fb7b206E585c775B30431600528572C3E7";
const KNINE_TOKEN = "0x91fbB2503AC69702061f1AC6885759Fc853e6EaE";

const FARMING_FABRIC = "0x8ed1A7c4736b5835560b0f9E961B8E3581774D42";

const VESTING = "0xf7384ba80A51979eC8cc0F17a843089ffD706f0a";

async function tvl(api) {
  const bonesBalance = await api.call({
    abi: "uint256:getTotalPooledBONE",
    target: BONE_CONTRACT,
  });

  api.addToken(BONE_TOKEN, bonesBalance);
}

async function pool2(api) {
  const poolsAddresses = await api.call({
    abi: "address[]:getAllCreatedPools",
    target: FARMING_FABRIC,
  });

  const poolsTokensPromise = api.multiCall({
    abi: "address:pool",
    calls: poolsAddresses.map((address) => ({ target: address })),
  });

  const poolsLiquidityPromise = api.multiCall({
    abi: "uint256:intermediate",
    calls: poolsAddresses.map((address) => ({ target: address })),
  });

  const [poolsTokens, poolsLiquidity] = await Promise.all([
    poolsTokensPromise,
    poolsLiquidityPromise,
  ]);

  api.addTokens(poolsTokens, poolsLiquidity);
}

async function vesting(api) {
  const vestingSettingsPromise = api.call({
    abi: vestingSettingsAbi,
    target: VESTING,
  });

  const esKNINEAddressPromise = api.call({
    abi: "address:esKNINE",
    target: VESTING,
  });

  const [vestingSettings, esKNINEAddress] = await Promise.all([
    vestingSettingsPromise,
    esKNINEAddressPromise,
  ]);

  const esKNINEBalance = await api.call({
    abi: "erc20:balanceOf",
    target: esKNINEAddress,
    params: [VESTING],
  });

  const vestingRatio = vestingSettings[2];

  const KNINEAmount = BigNumber(esKNINEBalance)
    .multipliedBy(vestingRatio)
    .div(100)
    .toFixed(0);

  api.addToken(KNINE_TOKEN, KNINEAmount);
}

module.exports = {
  methodology: "counts the number of MINT tokens in the Club Bonding contract.",
  ethereum: {
    tvl,
  },
  shibarium: {
    staking: stakings([REAL_YIELD_STAKING], KNINE_TOKEN),
    pool2,
    vesting,
  },
};
