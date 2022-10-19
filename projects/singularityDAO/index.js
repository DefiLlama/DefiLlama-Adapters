const abi = require("./abi.json");
const http = require("../helper/http");
const sdk = require("@defillama/sdk");

const { sumTokens, sumTokens2 } = require("../helper/unwrapLPs");
const { addFundsInMasterChef } = require("./masterchef");
const { getParamCalls } = require('../helper/utils')


const AGIX_TOKEN = "0x5B7533812759B45C2B44C19e320ba2cD2681b542";
const NuNet_TOKEN = "0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935";
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
  const blacklistedTokens = [SDAO_TOKEN, LP_TOKEN_SDAO_ETH, LP_TOKEN_SDAO_USDT, AGIX_TOKEN, NuNet_TOKEN]
  // DYNASETS

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

  let { output: forgetCount } = await sdk.api.abi.multiCall({
    abi: abis.totalForges,
    calls: DYNASET_FORGES.map(i => ({ target: i})),
    block,
  })

  const calls = []
  forgetCount = forgetCount.map(({input: { target}, output}) => {
    let arry = getParamCalls(output)
    arry.forEach(i => i.target = target)
    calls.push(...arry)
  })

  let { output: tokenInfo } = await sdk.api.abi.multiCall({
    abi: abis.forgeInfo, calls,    block,
  })

  tokenInfo.forEach(({input: { target}, output}) => {
    tokensAndOwners.push([output.contributionToken, target])
  })

  return sumTokens2({ tokensAndOwners, block, blacklistedTokens, })
}

// LP Pools ERC

// Staked LP tokens where one side of the market is the platform's own governance token.

async function pool2(ts, block) {
  const tokensAndOwners = [
    [LP_TOKEN_SDAO_ETH, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [LP_TOKEN_SDAO_USDT, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Bonded 6M
  ];
  return sumTokens2({tokensAndOwners, block});
}

// Staking pools ERC
// The platform's own tokens

async function staking(ts, block) {
  const tokensAndOwners = [
    [SDAO_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [SDAO_TOKEN, "0x74641ed232dbB8CBD9847484dD020d44453F0368"], // Bonded 6M
    [SDAO_TOKEN, "0xF5738B4aD2f8302b926676692a0C09603d930b42"], // Bonded 12M
    [NuNet_TOKEN, "0x502B965d3D51d4FD531E6A1c1fA9bFA50337bA55"],
    [NuNet_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"],
    [NuNet_TOKEN, "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4"],
    [AGIX_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"],
    [AGIX_TOKEN, "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4"],
  ];
  return sumTokens2({ tokensAndOwners, block, })
}

//////////////////////////////////
////// BNB CHAIN ////////////////
////////////////////////////////

// Staking pools BNB

async function stakingBNB(ts, EthBlock, { bsc: block }) {
  const tokensAndOwners = [
    [SDAO_TOKEN_BNB, "0x79292c62f593e08d9b850b790b07e7a0903fd007"], // Unbonded
    [SDAO_TOKEN_BNB, "0x17de46760F4c18C26eEc36117C23793299F564A8"], // Bonded
  ];
  return sumTokens2({ tokensAndOwners, block, chain: 'bsc' })
}

// LP Pools BNB

async function pool2BNB(ts, EthBlock, { bsc: block }) {
  const tokensAndOwners = [
    ['0x6c805d2077025eaaa42fae7f764e61df42aadb14', "0xba1933bc47e6ad050a4e4485f6f4b16b9ccdb806"],
    ['0x43b95976cf0929478bc13332c9cd2d63bf060976', "0x79292c62f593e08d9b850b790b07e7a0903fd007"],
    ['0x3d12e4381901a6b94438758b90881cb03f10b01e', "0x79292c62f593e08d9b850b790b07e7a0903fd007"],
  ];
  return sumTokens2({ tokensAndOwners, block, chain: 'bsc' })
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

const abis = {
  totalForges: {"inputs":[],"name":"totalForges","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  forgeInfo: {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"forgeInfo","outputs":[{"internalType":"bool","name":"isEth","type":"bool"},{"internalType":"address","name":"contributionToken","type":"address"},{"internalType":"uint256","name":"dynasetLp","type":"uint256"},{"internalType":"uint256","name":"totalContribution","type":"uint256"},{"internalType":"uint256","name":"minContribution","type":"uint256"},{"internalType":"uint256","name":"maxContribution","type":"uint256"},{"internalType":"uint256","name":"maxCap","type":"uint256"},{"internalType":"uint256","name":"contributionPeriod","type":"uint256"},{"internalType":"bool","name":"withdrawEnabled","type":"bool"},{"internalType":"bool","name":"depositEnabled","type":"bool"},{"internalType":"bool","name":"forging","type":"bool"},{"internalType":"uint256","name":"nextForgeContributorIndex","type":"uint256"}],"stateMutability":"view","type":"function"},
}