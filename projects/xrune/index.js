const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking.js");
const abi = require("./abi.json");
const BN = require("bignumber.js");

async function getTotal(pools, chain, block) {
  const balances = {};
  await Promise.all(
    pools.map((pool) =>
      sdk.api.erc20
        .balanceOf({
          target: pool[1],
          owner: pool[0],
          chain,
          block,
        })
        .then((result) =>
          sdk.util.sumSingleBalance(balances, pool[2], result.output)
        )
    )
  );
  return balances;
}

const token = "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c";
const ethStaking = [
  "0x93f5dc8bc383bb5381a67a67516a163d1e56012a", //Staking
  "0x2a092e401507dD4877cCd0b4Ee70B769452DbB7a", //2-Month Vault
  "0xc20434f595c32B5297A737Cb173382Dd2485C2cC", //4-Month Vault
  "0x8ba0C510Da4507D1F5f73ff9E1FcD14Edc819EB2", //6-Month Vault
];
const ethPools = [
  [
    "0x817ba0ecafD58460bC215316a7831220BFF11C80",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //Tiers
  [
    "0xebcd3922a199cd1358277c6458439c13a93531ed",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //DAO
  [
    "0x5b1b8bdbcc534b17e9f8e03a3308172c7657f4a3",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //DAO
];

async function eth(_timestamp, block, chainBlocks) {
  return getTotal(ethPools, "ethereum", block);
}

module.exports = {
  methodology: `TVL comes from the Staking Vaults and Launchpad Tiers`,
  ethereum: {
    tvl: eth,
    staking: stakings(ethStaking, token),
  },
};
