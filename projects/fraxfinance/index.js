const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const FXS = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0";

const FEI3CRVs = [
  "0x70F55767B11c047C8397285E852919F5f6c8DC60",
  "0xE4BD0461AE7fdc76c61CE286a80c9B55d83B204a",
];

const contractAddresses = [
  //FRAX3CRV
  "0x49ee75278820f409ecd67063D8D717B38d66bd71",
  //CURVE_AMO
  "0x72170Cdc48C33a6AE6B3E83CD387ca3Fb9105da2",
  //FRAX_AMO_MINTER
  "0xcf37B62109b537fa0Cb9A90Af4CA72f6fb85E241",
  //LENDING_AMO
  "0x9507189f5B6D820cd93d970d67893006968825ef",
  //MANUAL_AMO
  "0x1Be588641Fb28Eb8C2A51f1129707FB1E2683f5a",
  //USDC_POOL_V1
  "0x3C2982CA260e870eee70c423818010DfeF212659",
  //USDC_POOL_V2
  "0x1864Ca3d47AaB98Ee78D11fc9DCC5E7bADdA1c0d",
  //USDC_POOL_V3
  "0x2fE065e6FFEf9ac95ab39E5042744d695F560729",
  //INVESTOR_COLLATERAL_POOL
  "0xEE5825d5185a1D512706f9068E69146A54B6e076",
  //INVESTOR_AMO_V2
  "0xB8315Af919729c823B2d996B1A6DDE381E7444f1",
];

const veFXS_StakingContract = "0xc8418aF6358FFddA74e09Ca9CC3Fe03Ca6aDC5b0";

const POOL_STAKING_CONTRACTS = [
  "0xD875628B942f8970De3CcEaf6417005F68540d4f",
  "0xa29367a3f057F3191b62bd4055845a33411892b6",
  "0xda2c338350a0E59Ce71CDCED9679A3A590Dd9BEC",
  "0xDc65f3514725206Dd83A8843AAE2aC3D99771C88",
];
const LP_ADDRESSES = [
  //Uniswap FRAX/WETH LP
  "0xFD0A40Bc83C5faE4203DEc7e5929B446b07d1C76",
  //Uniswap FRAX/USDC LP
  "0x97C4adc5d28A86f9470C70DD91Dc6CC2f20d2d4D",
  //Uniswap FRAX/FXS LP
  "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237",
  //Uniswap FXS/WETH LP
  "0xecBa967D84fCF0405F6b32Bc45F4d36BfDBB2E81",
];

const ethereumTvl = async (timestamp, block) => {
  let balances = {};

  // --- CurveMetapoolLockerAMOs USDC TVL ---
  const usdValueInVault = (
    await sdk.api.abi.multiCall({
      calls: FEI3CRVs.map((addr) => ({ target: addr })),
      abi: abi.usdValueInVault,
      block,
    })
  ).output.map((value) => value.output);

  usdValueInVault.forEach((value) => {
    sdk.util.sumSingleBalance(
      balances,
      USDC,
      BigNumber(value)
        .dividedBy(10 ** 12)
        .toFixed(0)
    );
  });

  // --- USDC POOLs + AMOs + FRAX3CRV and FEI3CRVs ---
  const usdcTvls = (
    await sdk.api.abi.multiCall({
      calls: contractAddresses.map((addr) => ({ target: addr })),
      abi: abi.collatDollarBalance,
      block,
    })
  ).output.map((response) => response.output);

  usdcTvls.forEach((usdcTvl) => {
    sdk.util.sumSingleBalance(
      balances,
      USDC,
      BigNumber(usdcTvl)
        .dividedBy(10 ** 12)
        .toFixed(0)
    );
  });

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(veFXS_StakingContract, FXS),
    pool2: pool2s(POOL_STAKING_CONTRACTS, LP_ADDRESSES),
    tvl: ethereumTvl,
  },
  methodology: "Counts liquidty as the Collateral USDC on all AMOs, USDC POOLs, FRAX3CRV and FEI3CRVs through their Contracts",
};
