const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getLiquityTvl } = require("../helper/liquity");
const { pool2 } = require('../helper/pool2');

// staking
const TOKEN_STAKING_ADDRESS = "0x4A2B73ebAc93D9233BAB10a795F04efb9C00D466";
const SET_ADDRESS = "avax:0x37d87e316CB4e35163881fDb6c6Bc0CdBa91dc0A";

const FARM_ADDRESS_SET_USDC = "0xAA31D7Bc8186888D9Eebb5524C47268E4bC87496"
const LP_ADDRESS_SET_USDC = "0x31fa3838788A07607D95C9c640D041eAec649f50"

// system coll
const AVAX_TROVE_MANAGER_ADDRESS = "0x7551A127C41C85E1412EfE263Cadb49900b0668C";
const ETH_TROVE_MANAGER_ADDRESS = "0x7837C2dB2d004eB10E608d95B2Efe8cb57fd40b4";
const BTC_ADDRESS = ADDRESSES.avax.WBTC_e;
const BTC_TROVE_MANAGER_ADDRESS = "0x56c194F1fB30F8cdd49E7351fC9C67d8C762a86F";
const DAI_TROVE_MANAGER_ADDRESS = "0x54b35c002468a5Cc2BD1428C011857d26463ecbC";

// --- staking ---
async function stakingTvl(api) {
  const StakesBalance = await api.call({ target: TOKEN_STAKING_ADDRESS, abi: "uint256:totalTokenStaked", })
  return { [SET_ADDRESS]: StakesBalance }
}

const options = { nonNativeCollateralToken: true }
module.exports = {
  avax: {
    tvl: sdk.util.sumChainTvls([
      getLiquityTvl(ETH_TROVE_MANAGER_ADDRESS, { ...options, collateralToken: ADDRESSES.avax.WETH_e }),
      getLiquityTvl(BTC_TROVE_MANAGER_ADDRESS, { ...options, collateralToken: BTC_ADDRESS }),
      getLiquityTvl(AVAX_TROVE_MANAGER_ADDRESS),
      getLiquityTvl(DAI_TROVE_MANAGER_ADDRESS, { ...options, collateralToken: ADDRESSES.avax.DAI }),
    ]),
    pool2: pool2(FARM_ADDRESS_SET_USDC, LP_ADDRESS_SET_USDC),
    staking: stakingTvl
  }
};
