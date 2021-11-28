const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("../helper/portedTokens");

const MaximizerStaking = "0x6d7AD602Ec2EFdF4B7d34A9A53f92F06d27b82B1";
const Treasury = "0x22cF6c46b4E321913ec30127C2076b7b12aC6d15";
const MAXI = "0x7C08413cbf02202a1c13643dB173f2694e0F73f0";
const DAI = "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70";
const MAXI_DAI_JLP = "0xfBDC4aa69114AA11Fae65E858e92DC5D013b2EA9";

const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stakingBalance = await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: MAXI,
    params: MaximizerStaking,
    block: chainBlocks.avax,
    chain: "avax",
  });

  sdk.util.sumSingleBalance(balances, "avax:" + MAXI, stakingBalance.output);

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DAI, false],
      [MAXI_DAI_JLP, true],
    ],
    [Treasury],
    chainBlocks.avax,
    "avax",
    await transformAvaxAddress()
  );

  return balances;
}

module.exports = {
  avalanche: {
    tvl,
    staking,
  },
  methodology: "Counts DAI, DAI JLP (MAXI-DAI) on the treasury",
};
