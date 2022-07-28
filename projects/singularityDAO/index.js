const abi = require("./abi.json");
const http = require("../helper/http");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { sumTokens } = require("../helper/unwrapLPs");
const { addFundsInMasterChef } = require("./masterchef");
const NuNet_TOKEN = "0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935";
const SDAO_TOKEN = "0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F";
const AGIX_TOKEN = "0x5B7533812759B45C2B44C19e320ba2cD2681b542";
const NuNeT_TOKEN_BNB = "0x5C4Bcc4DbaEAbc7659f6435bCE4E659314ebad87";
const SDAO_TOKEN_BNB = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";
const { transformBscAddress } = require("../helper/portedTokens");
const chain = "bsc";

const getDynasetQuery =
  "{ dynaset { addresses { chainId value __typename } } }";
const graphEndpoint =
  "https://dev-onchain-server.singularitydao.ai/dynaset-server/api/graphql";

/////////////////////////////////////////////////
///// ETHEREUM /////////////////////////////////
///////////////////////////////////////////////

// Dynasets ERC

async function tvl(ts, block) {
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
  tokens.map((t, index) =>
    t.output.forEach((token) => tokensAndOwners.push([token, dynasets[index]]))
  );
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
}

// LP Pools ERC

async function pool2(ts, block) {
  const balances = {};
  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0", // SDAO Unbonded
    skipTokens: [NuNet_TOKEN, SDAO_TOKEN, AGIX_TOKEN],
  });
  await addFundsInMasterChef({
    balances,
    block,
    masterchef: "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4", // NTX Unbonded
    skipTokens: [NuNet_TOKEN, SDAO_TOKEN, AGIX_TOKEN],
  });
  return balances;
}

// Staking pools ERC

async function staking(ts, block) {
  const balances = {};
  const tokensAndOwners = [
    [NuNet_TOKEN, "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4"], // NTX Unbonded
    [NuNet_TOKEN, "0x502B965d3D51d4FD531E6A1c1fA9bFA50337bA55"], // NTX Bonded
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
    //[NuNeT_TOKEN_BNB, "0xBa1933bc47e6Ad050A4E4485F6f4b16b9CcdB806"], // NTX Unbonded
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
    masterchef: "0x79292c62f593e08d9b850b790b07e7a0903fd007", // SDAO Unbonded
    skipTokens: [NuNeT_TOKEN_BNB, SDAO_TOKEN_BNB],
    chain,
  });
  // await addFundsInMasterChef({
  //   balances,
  //   block,
  //   masterchef: "0xBa1933bc47e6Ad050A4E4485F6f4b16b9CcdB806", // NTX Unbonded
  //   skipTokens: [NuNeT_TOKEN_BNB, SDAO_TOKEN_BNB],
  //   chain,
  // });
  return balances;
}

module.exports = {
  doublecounted: false,
  ethereum: {
    tvl, // Dynasets
    staking, // Staking
    pool2, // LP Pools
  },
  bsc: {
    staking: stakingBNB,
    pool2: pool2BNB,
  },
};
