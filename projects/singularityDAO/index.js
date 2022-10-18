const abi = require("./abi.json");
const http = require("../helper/http");
const sdk = require("@defillama/sdk");

const { sumTokens } = require("../helper/unwrapLPs");
const { addFundsInMasterChef } = require("./masterchef");

const SDAO_TOKEN = "0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F";
const SDAO_TOKEN_BNB = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";

const DYNASET_FORGES = [
  "0xe125044733366071793Afd1f9CB41521078Dd029",
  "0x5d94F225caBd9010c8206c1036c6352F66C06E57",
  "0xa5a94Da27E2533ceD5c68D6DFAbDB5FB4269Dd97",
];

const LP_TOKEN_SDAO_ETH = "0x424485f89ea52839fdb30640eb7dd7e0078e12fb";
const LP_TOKEN_SDAO_USDT = "0x3a925503970d40d36d2329e3846e09fcfc9b6acb";

const { transformBscAddress } = require("../helper/portedTokens");
const chain = "bsc";

const getDynasetQuery =
  "{ dynaset { addresses { chainId value __typename } } }";
const graphEndpoint =
  "https://dev-onchain-server.singularitydao.ai/dynaset-server/api/graphql";

/////////////////////////////////////////////////
///// ETHEREUM /////////////////////////////////
///////////////////////////////////////////////

// TVL

async function tvl(ts, block) {
  // DYNASETS

  const balances = {};
  const response = await http.graphQuery(graphEndpoint, getDynasetQuery);
  const dynasets = response.dynaset
    .map((d) => d.addresses.map((a) => a.value))
    .flat();
  const { output: tokens } = await sdk.api.abi.multiCall({
    calls: dynasets.map((addr) => ({ target: addr })),
    abi: abi.getCurrentTokens,
    block,
  });
  const tokensAndOwners = [];
  tokens
    .filter((t) => t.output)
    .map((t, index) =>
      t.output.forEach((token) =>
        tokensAndOwners.push([token, dynasets[index]])
      )
    );

  // Dynaset Contribution
  DYNASET_FORGES.forEach((forge) =>
    tokensAndOwners.push(
      ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", forge],
      ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", forge],
      ["0xdAC17F958D2ee523a2206206994597C13D831ec7", forge],
      ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", forge],
      ["0x514910771AF9Ca656af840dff83E8264EcF986CA", forge]
    )
  );

  // VAULTS

  tokensAndOwners.push([
    "0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935",
    "0x502B965d3D51d4FD531E6A1c1fA9bFA50337bA55",
  ]);
  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0",
    skipTokens: [SDAO_TOKEN, LP_TOKEN_SDAO_ETH, LP_TOKEN_SDAO_USDT],
  });

  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4",
    skipTokens: [SDAO_TOKEN],
  });

  await sumTokens(balances, tokensAndOwners, block);

  return balances;
}

// LP Pools ERC

// Staked LP tokens where one side of the market is the platform's own governance token.

async function pool2(ts, block) {
  const balances = {};
  const tokensAndOwners = [
    [LP_TOKEN_SDAO_ETH, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [LP_TOKEN_SDAO_USDT, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Bonded 6M
  ];
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
}

// Staking pools ERC
// The platform's own tokens

async function staking(ts, block) {
  const balances = {};
  const tokensAndOwners = [
    [SDAO_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [SDAO_TOKEN, "0x74641ed232dbB8CBD9847484dD020d44453F0368"], // Bonded 6M
    [SDAO_TOKEN, "0xF5738B4aD2f8302b926676692a0C09603d930b42"], // Bonded 12M
  ];
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
}

//////////////////////////////////
////// BNB CHAIN ////////////////
////////////////////////////////

// Staking pools BNB

async function stakingBNB(ts, EthBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];
  const tokensAndOwners = [
    [SDAO_TOKEN_BNB, "0x79292c62f593e08d9b850b790b07e7a0903fd007"], // Unbonded
    [SDAO_TOKEN_BNB, "0x17de46760F4c18C26eEc36117C23793299F564A8"], // Bonded
  ];
  const transform = await transformBscAddress();
  await sumTokens(balances, tokensAndOwners, block, chain, transform);
  return balances;
}

// LP Pools BNB

async function pool2BNB(ts, EthBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];

  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0x79292c62f593e08d9b850b790b07e7a0903fd007",
    skipTokens: [SDAO_TOKEN_BNB],
    chain,
  });
  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0xBa1933bc47e6Ad050A4E4485F6f4b16b9CcdB806",
    skipTokens: [],
    chain,
  });
  return balances;
}

module.exports = {
  doublecounted: false,
  ethereum: {
    tvl,
    staking,
    pool2,
  },
  bsc: {
    staking: stakingBNB,
    pool2: pool2BNB,
  },
};
