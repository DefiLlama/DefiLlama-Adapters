const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs")

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
  SUSDE: ADDRESSES.ethereum.sUSDe,
  USDE: ADDRESSES.ethereum.USDe,
  WSTETH: ADDRESSES.ethereum.WSTETH,
  WBTC: ADDRESSES.ethereum.WBTC,
  WEETH: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
  WEETHS: "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  MSTETH: "0x49446A0874197839D15395B908328a74ccc96Bc0",
  STETH: ADDRESSES.ethereum.STETH,
  RSUSDE: "0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26",
  RSTETH: "0x7a4effd87c2f3c55ca251080b1343b605f327e3a",
  RE7LRT: "0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a",
  RE7RWBTC: "0x7F43fDe12A40dE708d908Fb3b9BFB8540d9Ce444",
  KUSDE: "0xBE3cA34D0E877A1Fc889BD5231D65477779AFf4e",
  KWEETH: "0x2DABcea55a12d73191AeCe59F508b191Fb68AdaC",
  DC_WSTETH_COLLATERAL: "0xC329400492c6ff2438472D4651Ad17389fCb843a",
  DC_SUSDE_COLLATERAL: "0x19d0D8e6294B7a04a2733FE433444704B791939A",
};

const MORPHO_SUSDE_MARKET_ID =
  "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48";

async function tvl(api) {
  const owners = await getOwners(api);

  await Promise.all([sumBaseTokens, handleLockedUSDE, handleMorphoSuppliedSUSDE, handleZircuitAssets, handleStrategyTokenBalances].map(async (fn) => fn()));

  async function sumBaseTokens() {
    return api.sumTokens({
      owners, tokens: [TOKENS.AGETH, TOKENS.WEETH, TOKENS.USDE, TOKENS.SUSDE, TOKENS.MSTETH, TOKENS.WSTETH, TOKENS.STETH,TOKENS.WBTC,]
    })
  }


  async function handleLockedUSDE() {
    const stakes = await api.multiCall({
      target: CONTRACTS.ETHENA_LP_STAKING,
      abi: "function stakes(address,address) view returns (uint256 amount,uint152,uint104)",
      calls: owners.map((owner) => ({ params: [owner, TOKENS.USDE] })),
    });
    api.add(TOKENS.USDE, stakes.map(i => i.amount))
  }

  async function handleMorphoSuppliedSUSDE() {
    const positions = await api.multiCall({
      target: CONTRACTS.MORPHO_BLUE,
      abi: "function position(bytes32,address) view returns (uint256,uint128,uint128 amount)",
      calls: owners.map((owner) => ({ params: [MORPHO_SUSDE_MARKET_ID, owner] })),
    });
    api.add(TOKENS.USDE, positions.map(i => i.amount))
  }

  async function handleZircuitAssets() {
    const assets = [TOKENS.WEETH, TOKENS.WEETHS, TOKENS.USDE, TOKENS.MSTETH]
    const calls = []
    for (const asset of assets)
      for (const owner of owners)
        calls.push({ params: [asset, owner] })
    const tokens = calls.map(i => i.params[0])
    const bals = await api.multiCall({ target: CONTRACTS.ZIRCUIT_RESTAKING_POOL, abi: "function balance(address,address) view returns (uint256)", calls, });
    api.add(tokens, bals)
  }
  
  async function handleStrategyTokenBalances() {
    const tokens = [
      TOKENS.KWEETH,
      TOKENS.KUSDE,
      TOKENS.DC_WSTETH_COLLATERAL,
      TOKENS.DC_SUSDE_COLLATERAL,
      TOKENS.MSTETH,
      TOKENS.RSUSDE,
      TOKENS.RSTETH,
      TOKENS.RE7LRT,
      TOKENS.RE7RWBTC,
    ]
    return api.sumTokens({ owners, tokens })
  }
}

async function getOwners(api) {
  const logs = await getLogs2({
    api,
    target: CONTRACTS.RUMPEL_WALLET_FACTORY,
    topic: "SafeCreated(address,address[],uint256)",
    eventAbi:
      "event SafeCreated(address indexed safe, address[] indexed owners, uint256 threshold)",
    fromBlock: DEPLOYMENT.RUMPEL_WALLET_FACTORY.block,
  });
  return logs
    .map((log) => log.safe)
    .concat(CONTRACTS.RUMEPL_POINT_TOKENIZATION_VAULT);
}



module.exports = {
  methodology:
    "Sums up the supported tokens in Rumpel Wallets + Deposits in the Rumpel Point Tokenization Vault",
  start: DEPLOYMENT.RUMPEL_WALLET_FACTORY.timestamp,
  ethereum: {
    tvl,
  },
};
