const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const space = "0x353af195c0d82820c59427BFbD318A49971AAe1a";
const stakingV1 = "0x910F038C9E74dF8baEd886a22f75C69FaE8a6792";
const stakingV2 = "0x073d3F4Ed6cb32Bd7f6F7B6da4C25672ee76c95B";
const treasury = "0xE05CEc7Ed93C2d3E106Df88B8d7B963Ce3618f46";
const mim = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const avai = "0x346a59146b9b4a77100d369a3d18e8007a9f46a6";
const spaceMimJLP = "0x5087706DD31962938c57a0fB3A3107ed3794c996";

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      [avai, false],
      [spaceMimJLP, true],
    ],
    [treasury],
    chainBlocks.avax,
    "avax",
    (addr) => `avax:${addr}`
  );
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  const stakingBalances = (
    await sdk.api.abi.multiCall({
      calls: [
        {
          target: space,
          params: stakingV1,
        },
        {
          target: space,
          params: stakingV2,
        },
      ],
      abi: "erc20:balanceOf",
      block: chainBlocks.avax,
      chain: "avax",
    })
  ).output;
  stakingBalances.forEach((p) => {
    sdk.util.sumSingleBalance(balances, `avax:${space}`, p.output);
  });
  return balances;
}

module.exports = {
  avax:{
    tvl,
    staking,
  },
};
