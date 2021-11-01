const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");
const { sumTokens } = require("../helper/unwrapLPs");

const MasterChefContract = "0x111E1E97435b57467E79d4930acc4B7EB3d478ad";

const tokensAndOwners = [
  [
    "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",//USDC
    "0x2bb9c8c7FB619aD669C99FEa6947eE52c30eb0A5", // ExchangeContract
  ],
  [
    //WAVAX
    "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "0xC029713E92383426C9b387b124C0BF6271d08b80", //avaxAVLT Monitor Valut
  ],
  [
    //WETH
    "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    //ethAVLT Monitor Valut
    "0x4805D6563B36a02C5012c11d6e15552f50066d58",
  ]
];

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformAvaxAddress();

  await sumTokens(
    balances,
    tokensAndOwners,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
};

const orcadaoToken = "0x8B1d98A91F853218ddbb066F20b8c63E782e2430"
async function pool2(timestamp, ethBlock, chainBlocks){
  const balances = {}
  await addFundsInMasterChef(
    balances,
    MasterChefContract,
    chainBlocks["avax"],
    "avax",
    addr=>`avax:${addr}`,
    undefined,
    [orcadaoToken]
  );
  return balances
}

module.exports = {
  avalanche: {
    tvl: avaxTvl,
    pool2,
    staking: staking(MasterChefContract, orcadaoToken, 'avax')
  },
  methodology:
    "We count liquidity on the Farming section through PodLeader (MasterChef) Contract and the Monitor Vaults seccion their contracts",
};
