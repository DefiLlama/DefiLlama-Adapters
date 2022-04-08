const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { transformAvaxAddress } = require("../helper/portedTokens");

const MaximizerStaking = "0x6d7AD602Ec2EFdF4B7d34A9A53f92F06d27b82B1";
const Treasury = "0x22cF6c46b4E321913ec30127C2076b7b12aC6d15";
const MAXI = "0x7C08413cbf02202a1c13643dB173f2694e0F73f0";
const DAI = "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const MAXI_DAI_JLP = "0xfBDC4aa69114AA11Fae65E858e92DC5D013b2EA9";
const MAXI_WAVAX_PGL = "0xbb700450811a30c5ee0dB80925Cf1BA53dBBd60A";
const PNG_WAVAX_PGL = "0xd7538cABBf8605BdE1f4901B47B8D42c61DE0367";

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
      [WAVAX, false],
      [MAXI_DAI_JLP, true],
      [MAXI_WAVAX_PGL, true],
      [PNG_WAVAX_PGL, true],
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
  methodology:
    "Counts DAI, DAI LP (MAXI-DAI JLP), WAVAX, WAVAX LP (MAXI-WAVAX PGL, PNG-WAVAX PGL) on the treasury",
};
