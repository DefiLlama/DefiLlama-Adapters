const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { cachedGraphQuery } = require('../helper/cache')
const sdk = require("@defillama/sdk");

const { sumTokens2 } = require("../helper/unwrapLPs");
const { getParamCalls } = require("../helper/utils");

const AGIX_TOKEN = "0x5B7533812759B45C2B44C19e320ba2cD2681b542";
const NUNET_TOKEN = "0xF0d33BeDa4d734C72684b5f9abBEbf715D0a7935";
const SDAO_TOKEN = "0x993864E43Caa7F7F12953AD6fEb1d1Ca635B875F";
const SDAO_TOKEN_BNB = "0x90Ed8F1dc86388f14b64ba8fb4bbd23099f18240";

const DYNASETSBNB = "0x5569B42513203f49a761Cc9720D4Bb9B6b9E5AB8";

const DYNASET_FORGES = [
  "0xe125044733366071793Afd1f9CB41521078Dd029",
  "0x5d94F225caBd9010c8206c1036c6352F66C06E57",
  "0xa5a94Da27E2533ceD5c68D6DFAbDB5FB4269Dd97",
];

const LP_TOKEN_SDAO_ETH = "0x424485f89ea52839fdb30640eb7dd7e0078e12fb";
const LP_TOKEN_SDAO_USDT = "0x3a925503970d40d36d2329e3846e09fcfc9b6acb";

const getDynasetQuery = "{ dynaset { address } }";
const graphEndpoint =
  "https://singularitydao.ai/api/dynaset-server/api/graphql";


async function tvl(_, block) {
  const blacklistedTokens = [
    SDAO_TOKEN,
    LP_TOKEN_SDAO_ETH,
    LP_TOKEN_SDAO_USDT,
    AGIX_TOKEN,
    NUNET_TOKEN,
  ];

  const response = await cachedGraphQuery('singularity-dao', graphEndpoint, getDynasetQuery);
  const dynasets = response.dynaset.map((d) => d.address).flat();
  const { output: tokens } = await sdk.api.abi.multiCall({
    calls: dynasets.map((addr) => ({ target: addr })),
    abi: abi.getCurrentTokens,
    block,
    permitFailure: true,
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
    calls: DYNASET_FORGES.map((i) => ({ target: i })),
    block,
  });

  const calls = [];
  forgetCount = forgetCount.map(({ input: { target }, output }) => {
    let arry = getParamCalls(output);
    arry.forEach((i) => (i.target = target));
    calls.push(...arry);
  });

  let { output: tokenInfo } = await sdk.api.abi.multiCall({
    abi: abis.forgeInfo,
    calls,
    block,
  });

  tokenInfo.forEach(({ input: { target }, output }) => {
    tokensAndOwners.push([output.contributionToken, target]);
  });

  return sumTokens2({ tokensAndOwners, block, blacklistedTokens });
}

// LP Pools ERC

// Staked LP tokens where one side of the market is the platform's own governance token.

async function pool2(ts, block) {
  const tokensAndOwners = [
    [LP_TOKEN_SDAO_ETH, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [LP_TOKEN_SDAO_USDT, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Bonded 6M
  ];
  return sumTokens2({ tokensAndOwners, block, resolveLP: true });
}

// Staking pools ERC
// The platform's own tokens

async function staking(ts, block) {
  const tokensAndOwners = [
    [SDAO_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"], // Unbonded
    [SDAO_TOKEN, "0x74641ed232dbB8CBD9847484dD020d44453F0368"], // Bonded 6M
    [SDAO_TOKEN, "0xF5738B4aD2f8302b926676692a0C09603d930b42"], // Bonded 12M
    [NUNET_TOKEN, "0x502B965d3D51d4FD531E6A1c1fA9bFA50337bA55"],
    [NUNET_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"],
    [NUNET_TOKEN, "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4"],
    [AGIX_TOKEN, "0xfB85B9Ec50560e302Ab106F1E2857d95132120D0"],
    [AGIX_TOKEN, "0xb267deaace0b8c5fcb2bb04801a364e7af7da3f4"],
  ];
  return sumTokens2({ tokensAndOwners, block });
}

//////////////////////////////////
////// BNB CHAIN ////////////////
////////////////////////////////

// DYNASET BNB CHAIN

async function tvlBNB(ts, EthBlock, { bsc: block }) {
  const tokensAndOwners = [
    [ADDRESSES.bsc.WBNB, DYNASETSBNB], // BNB
    [ADDRESSES.bsc.BUSD, DYNASETSBNB], // BUSD
    ["0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", DYNASETSBNB], // BDOT
    [ADDRESSES.bsc.ETH, DYNASETSBNB], // BETH
    ["0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", DYNASETSBNB], // BXRP
    [ADDRESSES.bsc.BTCB, DYNASETSBNB], // WBTC
    ["0x1CE0c2827e2eF14D5C4f29a091d735A204794041", DYNASETSBNB], // BAVAX
    ["0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", DYNASETSBNB], // BADA
    ["0xCC42724C6683B7E57334c4E856f4c9965ED682bD", DYNASETSBNB], // BMATIC
    ["0xfA54fF1a158B5189Ebba6ae130CEd6bbd3aEA76e", DYNASETSBNB], // BSOL
  ];
  return sumTokens2({ tokensAndOwners, block, chain: "bsc" });
}

// Staking pools BNB

async function stakingBNB(ts, EthBlock, { bsc: block }) {
  const tokensAndOwners = [
    [SDAO_TOKEN_BNB, "0x79292c62f593e08d9b850b790b07e7a0903fd007"], // Unbonded
    [SDAO_TOKEN_BNB, "0x17de46760F4c18C26eEc36117C23793299F564A8"], // Bonded
  ];
  return sumTokens2({ tokensAndOwners, block, chain: "bsc" });
}

// LP Pools BNB

async function pool2BNB(ts, EthBlock, { bsc: block }) {
  const tokensAndOwners = [
    [
      "0x6c805d2077025eaaa42fae7f764e61df42aadb14",
      "0xba1933bc47e6ad050a4e4485f6f4b16b9ccdb806",
    ],
    [
      "0x43b95976cf0929478bc13332c9cd2d63bf060976",
      "0x79292c62f593e08d9b850b790b07e7a0903fd007",
    ],
    [
      "0x3d12e4381901a6b94438758b90881cb03f10b01e",
      "0x79292c62f593e08d9b850b790b07e7a0903fd007",
    ],
  ];
  return sumTokens2({ tokensAndOwners, block, chain: "bsc", resolveLP: true });
}

module.exports = {
  ethereum: {
    tvl,
    staking,
    pool2,
  },
  bsc: {
    tvl: tvlBNB,
    staking: stakingBNB,
    pool2: pool2BNB,
  },
};

const abis = {
  totalForges: "uint256:totalForges",
  forgeInfo:
    "function forgeInfo(uint256) view returns (bool isEth, address contributionToken, uint256 dynasetLp, uint256 totalContribution, uint256 minContribution, uint256 maxContribution, uint256 maxCap, uint256 contributionPeriod, bool withdrawEnabled, bool depositEnabled, bool forging, uint256 nextForgeContributorIndex)",
};
