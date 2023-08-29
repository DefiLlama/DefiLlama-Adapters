const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { default: BigNumber } = require("bignumber.js");
const { getBlock } = require("../helper/http");

const NEAR_TOKEN = "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4";
const WETH = ADDRESSES.ethereum.WETH;

async function addEthBalances(addresses, block, balances) {
  await Promise.all(
    addresses.map(async (target) => {
      const ethBalance = (
        await sdk.api.eth.getBalance({
          target,
          block,
        })
      ).output;

      sdk.util.sumSingleBalance(balances, WETH, ethBalance);
    })
  );
}
const data = {
  ondo_lps: [
    "0x9241943c29eb0B1Fc0f8E5B464fbc14915Da9A57",
    "0x5d62134DBD7D56faE9Bc0b7DF3788f5f8DADE62d",
  ],
  ondo_all_pair_vaults: {
    contracts: [
      "0xeF970A111dd6c281C40Eee6c40b43f24435833c2",
      "0x2bb8de958134afd7543d4063cafad0b7c6de08bc",
    ],
    ignored_vault_ids: [
      "25353739650153436290862732054545997422315472318522956085559001114575751243902",
    ],
  },
  ondo_multisigs: [
    "0xBD9495E42ec4a2F5DF1370A6DA42Ec9a4656E963",
    "0xb230B535D2cf009Bdc9D7579782DE160b795d5E8",
    "0x7EBa8a9cAcb4bFbf7e1258b402A8e7aA004ED9FD",
    "0x5A16e6dD9aB0bEa9a247f92c5aa0b349f2A4E4c6",
  ],
  supported_tokens: [
    "0x4Eb8b4C65D8430647586cf44af4Bf23dEd2Bb794",
    "0x36784d3B5aa8A807698475b3437a13fA20B7E9e1",
    ADDRESSES.ethereum.FRAX,
    "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
    "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
    "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29",
    "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7",
    "0x67B6D479c7bB412C54e03dCA8E1Bc6740ce6b99C",
    "0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e",
    "0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828",
    ADDRESSES.ethereum.CVX,
    "0xff20817765cb7f73d4bde2e66e067e58d11095c2",
    "0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2",
    "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7",
    "0x758b4684be769e92eefea93f60dda0181ea303ec",
    "0xc770eefad204b5180df6a14ee197d99d808ee52d",
    "0xc7283b66eb1eb5fb86327f08e1b5816b0720212b",
    "0xa693B19d2931d498c5B318dF961919BB4aee87a5",
    ADDRESSES.ethereum.WETH,
    "0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4",
  ],
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const partner_tokens = data["supported_tokens"];
  let ondo_multisigs = data["ondo_multisigs"];
  block = await getBlock(timestamp, "ethereum", { ethereum: block });

  if (block > 15258765) ondo_multisigs = [];

  const ondo_lps = data["ondo_lps"];

  await addEthBalances(ondo_multisigs, block, balances);

  const tokens = [
    ...partner_tokens.map((i) => [i, false]),
    ...ondo_lps.map((i) => [i, true]),
  ];

  await sumTokensAndLPsSharedOwners(balances, tokens, ondo_multisigs, block);

  if (balances[NEAR_TOKEN]) {
    balances.near = BigNumber(balances[NEAR_TOKEN])
      .dividedBy(10 ** 24)
      .toFixed(0);
    delete balances[NEAR_TOKEN];
  }

  return balances;
}

async function tvlForAllPairs(timestamp, block, chainBlocks) {
  const ondoAllPairVaults = data["ondo_all_pair_vaults"]["contracts"];
  const ignoredVaultIds = data["ondo_all_pair_vaults"]["ignored_vault_ids"];
  let { output: vaults } = await sdk.api.abi.multiCall({
    calls: ondoAllPairVaults.map((i) => ({ target: i, params: [0, 9999] })),
    block,
    abi: abi.getVaults,
  });
  vaults = vaults.map((i) => i.output).flat();
  const balances = {};
  for (const vault of vaults) {
    if (
      !ignoredVaultIds.includes(vault.id) &&
      timestamp > Number(vault.startAt) &&
      timestamp < Number(vault.redeemAt)
    ) {
      vault.assets.forEach((asset) => {
        sdk.util.sumSingleBalance(balances, asset.token, asset.deposited);
      });
    }
  }
  return balances;
}

module.exports = {
  methodology:
    "Counts all tokens in deployed vaults as well as Ondo's LaaS multi-sigs",
  ethereum: {
    tvl: sdk.util.sumChainTvls([tvlForAllPairs, tvl]),
  },
};
