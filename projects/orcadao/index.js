const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const MasterChefContract = "0x111E1E97435b57467E79d4930acc4B7EB3d478ad";

const contracts = [
  //ExchangeContract
  "0x2bb9c8c7FB619aD669C99FEa6947eE52c30eb0A5",
  //avaxAVLT Monitor Valut
  "0xC029713E92383426C9b387b124C0BF6271d08b80",
  //ethAVLT Monitor Valut
  "0x4805D6563B36a02C5012c11d6e15552f50066d58",
];

const tokens = [
  //USDC
  "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  //WAVAX
  "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  //WETH
  "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
];

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformAvaxAddress();

  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  for (let i = 0; i < contracts.length; i++) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[tokens[i], false]],
      [contracts[i]],
      chainBlocks["avax"],
      "avax",
      transformAddress
    );
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([avaxTvl]),
  methodology:
    "We count liquidity on the Farming seccion through PodLeader (MasterChef) Contract and the Monitor Vaults seccion their contracts",
};
