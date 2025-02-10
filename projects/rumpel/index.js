const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs")

const CONTRACTS = {
  RUMEPL_POINT_TOKENIZATION_VAULT: "0xe47F9Dbbfe98d6930562017ee212C1A1Ae45ba61",
  RUMPEL_WALLET_FACTORY: "0x5774abcf415f34592514698eb075051e97db2937",
  ETHENA_LP_STAKING: "0x8707f238936c12c309bfc2B9959C35828AcFc512",
  MORPHO_BLUE: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  ZIRCUIT_RESTAKING_POOL: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
  FLUID_POSITION_RESOLVER: "0x3E3dae4F30347782089d398D462546eb5276801C",
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
  AMPHRETH:"0x5fD13359Ba15A84B76f7F87568309040176167cd",
  WEETH: ADDRESSES.ethereum.WEETH,
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
  DC_LBTC_COLLATERAL: "0x9C0823D3A1172F9DdF672d438dec79c39a64f448",
  YT_EBTC: "0xeB993B610b68F2631f70CA1cf4Fe651dB81f368e",
  YT_WEETHK: "0x7B64b99A1fd80b6c012E354a14ADb352b5916CE1",
  YT_AGETH: "0x3568f1d2e8058F6D99Daa17051Cb4a2930C83978",
  YT_WEETHS: "0x719B51Dd92B7809A80A2E8c91D89367BF58f1D7A",
  YT_SUSDE: "0xbE05538f48D76504953c5d1068898C6642937427",
  YT_USDE: "0x5D8B3cd632c58D5CE75C2141C1C8b3b0C209b3ed",
  YT_RE7LRT: "0x89E7f4E5210A77Ac0f20511389Df71eC98ce9971",
  YT_RSTETH: "0x11CCff2F748a0100dBd457FF7170A54e12064Aba",
  YT_AMPHRETH: "0x5dB8a2391a72F1114BbaE30eFc9CD89f4a29F988",
  YT_KARAK_SUSDE_30JAN2025: "0x27f6F2f5e87A383471C79296c64E4e82269877f7",
  YT_RSUSDE_27MAR2025: "0x079F21309eB9cbD2a387972eB2168d57C8542e32",
  YT_SUSDE_27MAR2025: "0x96512230bF0Fa4E20Cf02C3e8A7d983132cd2b9F",
  YT_SUSDE_29MAY2025: "0x1de6Ff19FDA7496DdC12f2161f6ad6427c52aBBe",
  YT_USDE_27MAR2025: "0x4A8036EFA1307F1cA82d932C0895faa18dB0c9eE",
  MELLOW_DVSTETH: "0x5E362eb2c0706Bd1d134689eC75176018385430B",
  MELLOW_RENZO_PZETH: "0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811",
  MELLOW_RSENA: "0xc65433845ecD16688eda196497FA9130d6C47Bd8",
  MELLOW_AMPHRBTC: "0x64047dD3288276d70A4F8B5Df54668c8403f877F",
  MELLOW_STEAKLRT: "0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc",
  MELLOW_HYVEX: "0x24183535a24CF0272841B05047A26e200fFAB696",
  MELLOW_RE7RTBTC: "0x3a828C183b3F382d030136C824844Ea30145b4c7",
  MELLOW_IFSETH: "0x49cd586dd9BA227Be9654C735A659a1dB08232a9",
  MELLOW_CP0XLRT: "0xB908c9FE885369643adB5FBA4407d52bD726c72d",
  MELLOW_URLRT: "0x4f3Cc6359364004b245ad5bE36E6ad4e805dC961",
  MELLOW_COETH: "0xd6E09a5e6D719d1c881579C9C8670a210437931b",
  MELLOW_HCETH: "0x375A8eE22280076610cA2B4348d37cB1bEEBeba0",
  MELLOW_ISETH: "0xcC36e5272c422BEE9A8144cD2493Ac472082eBaD",
  MELOW_SIBTC: "0xE4357bDAE017726eE5E83Db3443bcd269BbF125d",
  MELLOW_LUGAETH: "0x82dc3260f599f4fC4307209A1122B6eAa007163b",
  MELLOW_ROETH: "0x7b31F008c48EFb65da78eA0f255EE424af855249",
  MELLOW_RSUNIBTC: "0x08F39b3d75712148dacDB2669C3EAcc7F1152547",
};



const FLUID_VAULTS = [
  { VAULT: "0xeAEf563015634a9d0EE6CF1357A3b205C35e028D", TOKEN: TOKENS.WEETH },
  { VAULT: "0x1c6068eC051f0Ac1688cA1FE76810FA9c8644278", TOKEN: TOKENS.WEETHS },
  { VAULT: "0x3996464c0fCCa8183e13ea5E5e74375e2c8744Dd", TOKEN: TOKENS.SUSDE },
  { VAULT: "0xBc345229C1b52e4c30530C614BB487323BA38Da5", TOKEN: TOKENS.SUSDE },
  { VAULT: "0xe210d8ded13Abe836a10E8Aa956dd424658d0034", TOKEN: TOKENS.SUSDE },
  { VAULT: "0x2F3780e21cAba1bEdFB24E37C97917def304dFFA", TOKEN: TOKENS.SUSDE },
]

const MORPHO_SUSDE_MARKET_ID =
  "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48";

async function tvl(api) {
  const owners = await getOwners(api);

  await Promise.all([sumBaseTokens, handleLockedUSDE, handleMorphoSuppliedSUSDE, handleZircuitAssets, handleStrategyTokenBalances, handleFluidPositions].map(async (fn) => fn()));

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

  async function handleFluidPositions() {
    const positions = await api.multiCall({
      target: CONTRACTS.FLUID_POSITION_RESOLVER,
      abi: "function getAllVaultPositions(address) view returns ((uint256,address owner,uint256 supply,uint256)[])",
      calls: FLUID_VAULTS.map(({ VAULT }) => ({ params: [VAULT] })),
    });

    for (let i = 0; i < positions.length; i++) {
      const rumpelPositions = positions[i].filter(i => owners.includes(i.owner));
      api.add(FLUID_VAULTS[i].TOKEN, rumpelPositions.map(i => i.supply))
    }
  }

  async function handleZircuitAssets() {
    const assets = [TOKENS.WEETH, TOKENS.WEETHS, TOKENS.USDE, TOKENS.MSTETH, TOKENS.AMPHRETH]
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
      TOKENS.YT_EBTC,
      TOKENS.YT_WEETHK,
      TOKENS.YT_AGETH,
      TOKENS.YT_WEETHS,
      TOKENS.YT_SUSDE,
      TOKENS.YT_USDE,
      TOKENS.YT_RE7LRT,
      TOKENS.YT_RSTETH,
      TOKENS.YT_AMPHRETH,
      TOKENS.YT_KARAK_SUSDE_30JAN2025,
      TOKENS.YT_RSUSDE_27MAR2025,
      TOKENS.YT_SUSDE_27MAR2025,
      TOKENS.YT_SUSDE_29MAY2025,
      TOKENS.YT_USDE_27MAR2025,
      TOKENS.MELLOW_DVSTETH,
      TOKENS.MELLOW_RENZO_PZETH,
      TOKENS.MELLOW_RSENA,
      TOKENS.MELLOW_AMPHRBTC,
      TOKENS.MELLOW_STEAKLRT,
      TOKENS.MELLOW_HYVEX,
      TOKENS.MELLOW_RE7RTBTC,
      TOKENS.MELLOW_IFSETH,
      TOKENS.MELLOW_CP0XLRT,
      TOKENS.MELLOW_URLRT,
      TOKENS.MELLOW_COETH,
      TOKENS.MELLOW_HCETH,
      TOKENS.MELLOW_ISETH,
      TOKENS.MELOW_SIBTC,
      TOKENS.MELLOW_LUGAETH,
      TOKENS.MELLOW_ROETH,
      TOKENS.MELLOW_RSUNIBTC,
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
