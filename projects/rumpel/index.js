const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const CONTRACTS = {
  RUMEPL_POINT_TOKENIZATION_VAULT: "0xe47F9Dbbfe98d6930562017ee212C1A1Ae45ba61",
  RUMPEL_WALLET_FACTORY: "0x5774abcf415f34592514698eb075051e97db2937",
  ETHENA_LP_STAKING: "0x8707f238936c12c309bfc2B9959C35828AcFc512",
  MORPHO_BLUE: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  ZIRCUIT_RESTAKING_POOL: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
};

const DEPLOYMENT = {
  RUMPEL_WALLET_FACTORY: {
    block: 20696108,
    timestamp: 1725680627000,
  },
};

const TOKENS = {
  AGETH: "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e",
  SUSDE: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
  USDE: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
  WSTETH: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  WEETH: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  WEETHS: "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  MSTETH: "0x49446A0874197839D15395B908328a74ccc96Bc0",
  STETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
  RSUSDE: "0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26",
  RSTETH: "0x7a4effd87c2f3c55ca251080b1343b605f327e3a",
  KUSDE: "0xBE3cA34D0E877A1Fc889BD5231D65477779AFf4e",
  KWEETH: "0x2DABcea55a12d73191AeCe59F508b191Fb68AdaC",
  DC_WSTETH_COLLATERAL: "0xC329400492c6ff2438472D4651Ad17389fCb843a",
  DC_SUSDE_COLLATERAL: "0x19d0D8e6294B7a04a2733FE433444704B791939A",
};

const MORPHO_SUSDE_MARKET_ID =
  "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48";

async function tvl(api) {
  const owners = await getOwners(api);
  const balances = {};

  await Promise.all([
    sumBaseTokens(api, owners, balances),
    handleLockedUSDE(api, owners, balances),
    handleMorphoSuppliedSUSDE(api, owners, balances),
    handleZircuitAssets(api, owners, balances),
    handleStrategyTokenBalances(api, owners, balances),
  ]);

  return balances;
}

async function getOwners(api) {
  const logs = await getLogs({
    api,
    target: CONTRACTS.RUMPEL_WALLET_FACTORY,
    topic: "SafeCreated(address,address[],uint256)",
    eventAbi:
      "event SafeCreated(address indexed safe, address[] indexed owners, uint256 threshold)",
    fromBlock: DEPLOYMENT.RUMPEL_WALLET_FACTORY.block,
  });
  return logs
    .map((log) => log.args.safe)
    .concat(CONTRACTS.RUMEPL_POINT_TOKENIZATION_VAULT);
}

async function sumBaseTokens(api, owners, balances) {
  await sumTokens2({
    api,
    tokens: [
      TOKENS.AGETH,
      TOKENS.WEETH,
      TOKENS.USDE,
      TOKENS.SUSDE,
      TOKENS.MSTETH,
      TOKENS.WSTETH,
      TOKENS.STETH,
    ],
    owners,
    balances,
  });
}

async function handleLockedUSDE(api, owners, balances) {
  const stakes = await api.multiCall({
    target: CONTRACTS.ETHENA_LP_STAKING,
    abi: "function stakes(address,address) view returns (uint256,uint152,uint104)",
    calls: owners.map((owner) => ({ params: [owner, TOKENS.USDE] })),
  });
  addToBalance(
    balances,
    TOKENS.USDE,
    stakes.reduce((acc, stake) => acc + BigInt(stake[0]), 0n)
  );
}

async function handleMorphoSuppliedSUSDE(api, owners, balances) {
  const positions = await api.multiCall({
    target: CONTRACTS.MORPHO_BLUE,
    abi: "function position(bytes32,address) view returns (uint256,uint128,uint128)",
    calls: owners.map((owner) => ({ params: [MORPHO_SUSDE_MARKET_ID, owner] })),
  });
  addToBalance(
    balances,
    TOKENS.SUSDE,
    positions.reduce((acc, pos) => acc + BigInt(pos[2]), 0n)
  );
}

async function handleZircuitAssets(api, owners, balances) {
  const assets = [TOKENS.WEETH, TOKENS.WEETHS, TOKENS.USDE, TOKENS.MSTETH];
  await Promise.all(
    assets.map((asset) => handleZircuitAsset(asset, api, owners, balances))
  );
}

async function handleZircuitAsset(asset, api, owners, balances) {
  const balancesRaw = await api.multiCall({
    target: CONTRACTS.ZIRCUIT_RESTAKING_POOL,
    abi: "function balance(address,address) view returns (uint256)",
    calls: owners.map((owner) => ({ params: [asset, owner] })),
  });
  addToBalance(
    balances,
    asset,
    balancesRaw.reduce((acc, bal) => acc + BigInt(bal), 0n)
  );
}

async function handleStrategyTokenBalances(api, owners, balances) {
  const configurations = [
    { target: TOKENS.KWEETH, output: TOKENS.WEETH },
    { target: TOKENS.KUSDE, output: TOKENS.USDE },
    { target: TOKENS.DC_WSTETH_COLLATERAL, output: TOKENS.WSTETH },
    { target: TOKENS.DC_SUSDE_COLLATERAL, output: TOKENS.SUSDE },
    { target: TOKENS.MSTETH, output: TOKENS.WSTETH },
    { target: TOKENS.RSUSDE, output: TOKENS.USDE },
    { target: TOKENS.RSTETH, output: TOKENS.WSTETH },
  ];

  await Promise.all(
    configurations.map(async ({ target, output }) => {
      const balancesRaw = await api.multiCall({
        abi: "erc20:balanceOf",
        calls: owners,
        target,
      });
      addToBalance(
        balances,
        output,
        balancesRaw.reduce((acc, bal) => acc + BigInt(bal), 0n)
      );
    })
  );
}

function addToBalance(balances, token, amount) {
  if (amount > 0n) {
    balances[token] = (BigInt(balances[token] || 0n) + amount).toString();
  }
}

module.exports = {
  methodology:
    "Sums up the supported tokens in Rumpel Wallets + Deposits in the Rumpel Point Tokenization Vault",
  timetravel: true,
  ethereum: {
    start: DEPLOYMENT.RUMPEL_WALLET_FACTORY.timestamp,
    tvl,
  },
};
