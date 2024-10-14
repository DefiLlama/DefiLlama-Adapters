const { sumUnknownTokens } = require("../helper/unknownTokens");

const vestingSettingsAbi = "function settings() view returns (bool lockedOnly, uint64 backingRatio, uint64 vestingRatio, uint64 vestingPeriod)"

const BONE_TOKEN = "0x9813037ee2218799597d83D4a5B6F3b6778218d9";
const BONE_CONTRACT = "0x3358FCA51d7C0408750FBbE7777012E0b67C027F";

const REAL_YIELD_STAKING = "0xe13824Fb7b206E585c775B30431600528572C3E7";
const KNINE_TOKEN = "0x91fbB2503AC69702061f1AC6885759Fc853e6EaE";

const FARMING_FABRIC = "0x8ed1A7c4736b5835560b0f9E961B8E3581774D42";

const VESTING = "0xf7384ba80A51979eC8cc0F17a843089ffD706f0a";

async function tvl(api) {
  const bonesBalance = await api.call({ abi: "uint256:getTotalPooledBONE", target: BONE_CONTRACT, });
  // api.addToken(BONE_TOKEN, bonesBalance);
  api.addCGToken('bone-shibaswap', bonesBalance / 1e18)
}

async function pool2(api) {
  const poolsAddresses = await api.call({ abi: "address[]:getAllCreatedPools", target: FARMING_FABRIC, });

  const tokens = await api.multiCall({ abi: "address:pool", calls: poolsAddresses, });
  const bals = await api.multiCall({ abi: "uint256:intermediate", calls: poolsAddresses, });
  api.add(tokens, bals)
  return sumUnknownTokens({ api, lps: tokens, useDefaultCoreAssets: true, resolveLP: true, })
}

async function vesting(api) {
  const vestingSettings = await api.call({ abi: vestingSettingsAbi, target: VESTING, });
  const esKNINEAddress = await api.call({ abi: "address:esKNINE", target: VESTING, });

  const esKNINEBalance = await api.call({ abi: "erc20:balanceOf", target: esKNINEAddress, params: VESTING, });
  const vestingRatio = vestingSettings[2];

  const KNINEAmount = esKNINEBalance * vestingRatio / 100
  api.addToken(KNINE_TOKEN, KNINEAmount);
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: ['0xF3452bCdEcaDa5E08ce56EC3D2BF8e35ECFFFF91'], })
}
async function staking(api) {
  const bal = await api.call({ abi: "erc20:balanceOf", target: KNINE_TOKEN, params: REAL_YIELD_STAKING, });

  api.addToken(KNINE_TOKEN, bal);
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: ['0xF3452bCdEcaDa5E08ce56EC3D2BF8e35ECFFFF91'],})
}

module.exports = {
  methodology:
    "Counts the liquidity locked inside the K9 Finance DAO protocol, including: the BONE amount locked at the Liquid Staking, the KNINE amount locked at the Real Yield Staking, the KNINE amount locked at the Vesting, the LP tokens locked at the Farming.",
  ethereum: {
    tvl,
  },
  shibarium: {
    staking,
    pool2,
    vesting,
  },
};
