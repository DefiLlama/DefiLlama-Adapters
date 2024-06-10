const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking, stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const BigNumber = require("bignumber.js");
const { sumTokens2 } = require("../helper/unwrapLPs");

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

async function tvl(timestamp, block) {
  let YEARN_VAULT_ADDRESS = "";
  let YEARN_ADAPTER_ADDRESS = "";
  if (block < 12983023) {
    YEARN_VAULT_ADDRESS = YEARN_VAULT.v1;
    YEARN_ADAPTER_ADDRESS = YEARN_ADAPTER.v1;
  } else {
    YEARN_VAULT_ADDRESS = YEARN_VAULT.v2;
    YEARN_ADAPTER_ADDRESS = YEARN_ADAPTER.v2;
  }

  // ---- Start DAI and yvDai
  const balances = await sumTokens2({ block, tokens: [DAI_CONTRACT_ADDRESS], owners: DAI_CONTRACT_HOLDER })
  const [
    { output: yVDaiTotalAmount },
    { output: yVDaiPricePerShare },
    { output: yVDaiDecimal },
  ] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: YEARN_VAULT_ADDRESS,
      owner: YEARN_ADAPTER_ADDRESS,
      block,
    }),
    sdk.api.abi.call({
      target: YEARN_VAULT_ADDRESS,
      abi: "uint256:pricePerShare", // pricePerShare
      block,
    }),
    sdk.api.erc20.decimals(YEARN_VAULT_ADDRESS),
  ])

  sdk.util.sumSingleBalance(balances, DAI_CONTRACT_ADDRESS, BigNumber(yVDaiTotalAmount * yVDaiPricePerShare / (10 ** yVDaiDecimal)).toFixed(0))

  return balances;
}

async function bscTvl(timestamp, ethBlock, chainBlocks) {
  let block = chainBlocks["bsc"];
  const chain = 'bsc'

  let busdOwners = [...BUSD_CONTRACT_HOLDER]
  // ---- Start BUSD
  // RWA
  for (let borrwer of Galaxy)
    busdOwners.push(borrwer.Reserve, borrwer.Tranche)

  let balances = await sumTokens2({ chain, block, owners: busdOwners, tokens: [BUSD_CONTRACT_ADDRESS] })
  // ---- End BUSD

  // ---- Start ibBUSD (map ibBUSD value to BUSD)
  // formation
  const { output: isBUSDs } = await sdk.api.abi.multiCall({
    abi: alpacaAdapterAbi,
    calls: BSC_ALPACA_ADAPTERS.map(i => ({ target: i })),
    chain, block,
  })
  isBUSDs.forEach(({ output}) => sdk.util.sumSingleBalance(balances, `bsc:${BUSD_CONTRACT_ADDRESS}`, output ))
  // ---- End ibBUSD

  return balances;
}


async function bscBorrowed(timestamp, ethBlock, chainBlocks) {
  let block = chainBlocks["bsc"];
  const chain = 'bsc'
  let balances = {}

  // ---- Start BUSD
  // RWA
  for (let borrwer of Galaxy) {
    const seniorDebt = (
      await sdk.api.abi.call({
        target: borrwer.Assessor,
        abi: AssessorAbi,
        chain, block,
      })
    ).output;
    sdk.util.sumSingleBalance(balances, `bsc:${BUSD_CONTRACT_ADDRESS}`, seniorDebt);
  }
  // ---- End BUSD
  return balances;
}


module.exports = {
  ethereum: {
    tvl: tvl,
    staking: staking(STAKING_POOL_ADDRESS, NAOS_ADDRESS),
    pool2: async (_, block) => {
      const balances = await sumTokens2({ block, owner: STAKING_POOL_ADDRESS, tokens: [UNI_ETH_NAOS_LP_ADDRESS,], })
      const [crvBalance, decimals, price,] = (await Promise.all([
        sdk.api.erc20.balanceOf({
          target: NUSD_3CRV_LP_ADDRESS,
          owner: STAKING_POOL_ADDRESS,
          block,
        }),
        sdk.api.erc20.decimals(NUSD_3CRV_LP_ADDRESS),
        sdk.api.abi.call({
          target: NUSD_3CRV_LP_ADDRESS,
          abi: "uint256:get_virtual_price",
          block,
        })
      ])).map(i => i.output)

      balances.tether = crvBalance * price / (1e18 * (10 ** decimals))
      return balances
    },
  },
  bsc: {
    tvl: bscTvl,
    borrowed: bscBorrowed,
    staking: stakings([BSC_BOOST_POOL,], BSC_NAOS_ADDRESS),
    pool2: pool2(BSC_STAKING_POOL_WITH_TRANSFER, CAKE_BNB_NAOS_LP_ADDRESS),
  },
};
