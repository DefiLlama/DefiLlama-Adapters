const ADDRESSES = require('../helper/coreAssets.json')
const { staking, stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokens2, sumTokensExport } = require("../helper/unwrapLPs");

const alpacaAdapterAbi = "uint256:totalValue";

const AssessorAbi = "uint256:seniorDebt"

// BSC address
const BSC_NAOS_ADDRESS = "0x758d08864fb6cce3062667225ca10b8f00496cc2";
const CAKE_BNB_NAOS_LP_ADDRESS = "0xcaa662ad41a662b81be2aea5d59ec0697628665f";
const BSC_BOOST_POOL = "0x3dcd32dd2b225749aa830ca3b4f2411bfeb03db4";
const BUSD_CONTRACT_ADDRESS = ADDRESSES.bsc.BUSD;
const BUSD_CONTRACT_HOLDER = [
  "0x9591ff9c5070107000155ff6c5ce049aa1443dd3", // Formation
  "0xb9ece39b356d5c0842301b42a716e4385617c871", // Transmuter
  "0xcd2e1ebfc804dd867ca052133fa70d9db6d86ab7", // Beta insurance
];
const BSC_ALPACA_ADAPTERS = [
  "0x640848400fc1cbaf9e4a1ed18d1bd3e2b16d1de2", // Formation adapter
  "0x4ca1a19d108b84f6f671ffe3555e7743c5ed6a2c", // Transmuter adapter
  "0xAB806724B03D0F4aEE891976fA0Eee77bC22739b", // Beta insurance adapter
];

const BSC_STAKING_POOL_WITH_TRANSFER =
  "0x6ebc2c41c1e29a5506b86b758b6c16dd5bbcf7d1";

// RWA
const Galaxy = [
  {
    Tranche: "0x2e07a30Ba047058ed1c360Cbf00CfCb61B07A1aA",
    Assessor: "0x2E6FB688635A8C85D2B93e70087ed35c87ACe1D1",
    Reserve: "0x9eEd257f7d5Bed450BC2B3562B24113C9fbD848b"
  }
]

// ETH address
const STAKING_POOL_ADDRESS = "0x99E4eA9eF6bf396C49B35FF9478EbB8890aEF581";
const UNI_ETH_NAOS_LP_ADDRESS = "0x9b577e849b128ee1a69144b218e809b8bb98c35d";
const NAOS_ADDRESS = "0x4a615bb7166210cce20e6642a6f8fb5d4d044496";
const NUSD_3CRV_LP_ADDRESS = "0x67d9eAe741944D4402eB0D1cB3bC3a168EC1764c";

const DAI_CONTRACT_ADDRESS = ADDRESSES.ethereum.DAI;
const DAI_CONTRACT_HOLDER = [
  "0x9Ddceb30515eD297C1B72Ff8F848F254104b7A12", // Formation
  "0x3ED6355Ad74605c0b09415d6B0b29a294Fd31265", // Transmuter
];

// yearn vault version/address
const YEARN_VAULT = {
  v1: "0x19d3364a399d251e894ac732651be8b0e4e85001",
  v2: "0xda816459f1ab5631232fe5e97a05bbbb94970c95",
};

// yearn adapter version/address
const YEARN_ADAPTER = {
  v1: "0xC1802cccc61e671f7c547E9326523edD2f55E84D",
  v2: "0x8394BB87481046C1ec84C39689D402c00189df43",
};

async function tvl(api) {
  let YEARN_VAULT_ADDRESS = "";
  let YEARN_ADAPTER_ADDRESS = "";
  YEARN_VAULT_ADDRESS = YEARN_VAULT.v2;
  YEARN_ADAPTER_ADDRESS = YEARN_ADAPTER.v2;

  return sumTokens2({ api, tokens: [DAI_CONTRACT_ADDRESS, YEARN_VAULT_ADDRESS], owners: DAI_CONTRACT_HOLDER.concat([YEARN_ADAPTER_ADDRESS]) })
}

async function bscTvl(api) {
  let busdOwners = [...BUSD_CONTRACT_HOLDER]
  // RWA
  for (let borrwer of Galaxy)
    busdOwners.push(borrwer.Reserve, borrwer.Tranche)

  await sumTokens2({ api, owners: busdOwners, tokens: [BUSD_CONTRACT_ADDRESS] })

  const isBUSDs = await api.multiCall({
    abi: alpacaAdapterAbi,
    calls: BSC_ALPACA_ADAPTERS,
  })
  api.add(BUSD_CONTRACT_ADDRESS, isBUSDs)
}


async function bscBorrowed(api) {
  for (let borrwer of Galaxy) {
    const seniorDebt = await api.call({ target: borrwer.Assessor, abi: AssessorAbi, })
    api.add(BUSD_CONTRACT_ADDRESS, seniorDebt)
  }
}


module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking(STAKING_POOL_ADDRESS, NAOS_ADDRESS),
    pool2: sumTokensExport({ owner: STAKING_POOL_ADDRESS, tokens: [UNI_ETH_NAOS_LP_ADDRESS, NUSD_3CRV_LP_ADDRESS] }),
  },
  bsc: {
    tvl: bscTvl,
    borrowed: bscBorrowed,
    staking: stakings([BSC_BOOST_POOL,], BSC_NAOS_ADDRESS),
    pool2: pool2(BSC_STAKING_POOL_WITH_TRANSFER, CAKE_BNB_NAOS_LP_ADDRESS),
  },
};
