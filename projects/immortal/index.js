const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformCeloAddress } = require("../helper/portedTokens");

const immortalStaking = "0xA02F4e8dE9A226E8f2F2fe27B9b207fC85CFEED2";
const immo = "0xE685d21b7B0FC7A248a6A8E03b8Db22d013Aa2eE";
const immo_mcusd_lp = "0x7d63809EBF83EF54c7CE8dEd3591D4E8Fc2102eE";
const treasury = "0xe2adCd126b4275cD75e72Ff7ddC8cF7e43fc13D4";
const mcusd = "0x918146359264C492BD6934071c6Bd31C854EDBc3";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformCeloAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mcusd, false],
      [immo_mcusd_lp, true],
    ],
    [treasury],
    chainBlocks.celo,
    "celo",
    transform
  );

  const stakingBalance = await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: immo,
    params: immortalStaking,
    block: chainBlocks.celo,
    chain: "celo",
  });

  sdk.util.sumSingleBalance(balances, "celo:" + immo, stakingBalance.output);

  return balances;
}

module.exports = {
  celo: {
    tvl,
  },
  methodology: "Tokens deposited in the contracts are counted as TVL",
};

