const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs")

const CONTRACTS = {
  RUMEPL_POINT_TOKENIZATION_VAULT: "0xe47F9Dbbfe98d6930562017ee212C1A1Ae45ba61",
  RUMPEL_WALLET_FACTORY: "0x5774abcf415f34592514698eb075051e97db2937",
  ETHENA_LP_STAKING: "0x8707f238936c12c309bfc2B9959C35828AcFc512",
  MORPHO_BLUE: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
  ZIRCUIT_RESTAKING_POOL: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",
  FLUID_POSITION_RESOLVER: "0x3E3dae4F30347782089d398D462546eb5276801C",
  FLUID_VAULT_RESOLVER: "0x77648C2FEda8D5f9f21A9FE91db0d102E49d3031",
  FLUID_DEX_RESOLVER: "0x71783F64719899319B56BdA4F27E1219d9AF9a3d",
  FLUID_DEX_RESERVES_RESOLVER: "0xC93876C0EEd99645DD53937b25433e311881A27C",
  // HyperEVM contracts
  HYPEREVM_RUMPEL_WALLET_FACTORY: "0xbC89e0B2716079b46A971ce50C208730F73503De",
  HYPEREVM_POINT_TOKEN_VAULT: "0xEa333eb11FC6ea62F6f4c2d73Cd9F2d994Ff3587",
};

const DEPLOYMENT = {
  RUMPEL_WALLET_FACTORY: {
    block: 20696108,
    timestamp: 1725680627000,
  },
  HYPEREVM_RUMPEL_WALLET_FACTORY: {
    block: 4536816,
    timestamp: 1748632980000,
  },
};

const TOKENS = {
  AGETH: "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e",
  SUSDE: ADDRESSES.ethereum.sUSDe,
  GHO: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
  USDT: ADDRESSES.ethereum.USDT,
  USDE: ADDRESSES.ethereum.USDe,
  WSTETH: ADDRESSES.ethereum.WSTETH,
  WBTC: ADDRESSES.ethereum.WBTC,
  AMPHRETH: "0x5fD13359Ba15A84B76f7F87568309040176167cd",
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
  SYMBIOTIC_WSTETH_COLLATERAL: "0xC329400492c6ff2438472D4651Ad17389fCb843a",
  SYMBIOTIC_SUSDE_COLLATERAL: "0x19d0D8e6294B7a04a2733FE433444704B791939A",
  SYMBIOTIC_LBTC_COLLATERAL: "0x9C0823D3A1172F9DdF672d438dec79c39a64f448",
  SYMBIOTIC_METH_COLLATERAL: "0x475D3Eb031d250070B63Fa145F0fCFC5D97c304a",
  SYMBIOTIC_WBTC_COLLATERAL: "0x971e5b5D4baa5607863f3748FeBf287C7bf82618",
  SYMBIOTIC_RETH_COLLATERAL: "0x03Bf48b8A1B37FBeAd1EcAbcF15B98B924ffA5AC",
  SYMBIOTIC_CBETH_COLLATERAL: "0xB26ff591F44b04E78de18f43B46f8b70C6676984",
  SYMBIOTIC_ENA_COLLATERAL: "0xe39B5f5638a209c1A6b6cDFfE5d37F7Ac99fCC84",
  SYMBIOTIC_WBETH_COLLATERAL: "0x422F5acCC812C396600010f224b320a743695f85",
  SYMBIOTIC_SWETH_COLLATERAL: "0x38B86004842D3FA4596f0b7A0b53DE90745Ab654",
  SYMBIOTIC_LSETH_COLLATERAL: "0xB09A50AcFFF7D12B7d18adeF3D1027bC149Bad1c",
  SYMBIOTIC_OSETH_COLLATERAL: "0x52cB8A621610Cc3cCf498A1981A8ae7AD6B8AB2a",
  SYMBIOTIC_SFRXETH_COLLATERAL: "0x5198CB44D7B2E993ebDDa9cAd3b9a0eAa32769D2",
  SYMBIOTIC_GUANTLET_RESTAKED_SWETH_COLLATERAL: "0x65B560d887c010c4993C8F8B36E595C171d69D63",
  SYMBIOTIC_ETHFI_COLLATERAL: "0x21DbBA985eEA6ba7F27534a72CCB292eBA1D2c7c",
  SYMBIOTIC_GAUNTLET_RESTAKED_CBETH_COLLATERAL: "0xB8Fd82169a574eB97251bF43e443310D33FF056C",
  SYMBIOTIC_FXS_COLLATERAL: "0x940750A267c64f3BBcE31B948b67CD168f0843fA",
  SYMBIOTIC_TBTC_COLLATERAL: "0x0C969ceC0729487d264716e55F232B404299032c",
  SYMBIOTIC_MANTA_COLLATERAL: "0x594380c06552A4136E2601F89E50b3b9Ad17bd4d",
  SYMBIOTIC_GAUNTLET_RESTAKED_WSTETH_COLLATERAL: "0xc10A7f0AC6E3944F4860eE97a937C51572e3a1Da",
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
  YT_SUSDE_31JUL2025: "0xb7E51D15161C49C823f3951D579DEd61cD27272B",
  YT_EUSDE_28MAY2025: "0x708dD9B344dDc7842f44C7b90492CF0e1E3eb868",
  YT_EUSDE_13AUG2025: "0xe8eF806c8aaDc541408dcAd36107c7d26a391712",
  YT_USDE_30JUL2025: "0x733Ee9Ba88f16023146EbC965b7A1Da18a322464",
  YT_LVLUSD_24SEP2025: "0x946934554a2Bf59039661f971986F0223E906264",
  YT_USR_28MAY2025: "0x77DE4Be22Ecc633416D79371eF8e861Fb1d2cC39",
  YT_WSTUSR_24SEP2025: "0x1E24B022329f3CA0083b12FAF75d19639FAebF6f",
  YT_WEETHS_25JUNE2025: "0xaaC7DB6C2bC926aDE954D69A2d705f059043EA02",
  YT_EETH_25JUNE2025: "0x08AEfe9dFe7818CaaedD94E38e910d2155b7d2b0",
  YT_WEETHK_25JUNE2025: "0x03722CE19e9F5828969D39474a8EfC35c4eA3987",
  YT_AGETH_25JUNE2025: "0x0310A860CF7Efe8F54Ab9B4dE49Cd071C37fCBCB",
  YT_USDE_24SEP2025: "0x48bbbEdc4d2491cc08915D7a5c7cc8A8EdF165da",
  YT_SUSDE_24SEP2025: "0x029d6247ADb0A57138c62E3019C92d3dfC9c1840",
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
  // Resolv tokens
  USR: "0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110",
  RLP: "0x4956b52aE2fF65D74CA2d61207523288e4528f96",
  STUSR: "0x6c8984bc7DBBeDAf4F6b2FD766f16eBB7d10AAb4",

  WBETH: ADDRESSES.bsc.wBETH,
  SWETH: "0xf951E335afb289353dc249e82926178EaC7DEd78",
  LSETH: "0x7BfEe91193d9Df2Ac0bFe90191D40F23c773C060",
  OSETH: "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38",
  MANTA: "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5",
  // Additional tokens
  WSTUSR: "0x1202F5C7b4B9E47a1A484E8B270be34dbbC75055",
  EBTC: ADDRESSES.ethereum.EBTC,
  CBBTC: ADDRESSES.ethereum.cbBTC,
  POND: "0x57B946008913B82E4dF85f501cbAeD910e58D26C",
  SENA: "0x8bE3460A480c80728a8C4D7a5D5303c85ba7B3b9",
  // HyperEVM tokens
  HYPEREVM_WHYPE: ADDRESSES.hyperliquid.WHYPE,
  HYPEREVM_WSTHYPE: ADDRESSES.hyperliquid.wstHYPE,
  HYPEREVM_UBTC: "0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463",
  HYPEREVM_UETH: "0xBe6727B535545C67d5cAa73dEa54865B92CF7907",
  HYPEREVM_USDT0: ADDRESSES.corn.USDT0,
  HYPEREVM_XAUT0: "0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949",
  HYPEREVM_USDHL: "0xb50A96253aBDF803D85efcDce07Ad8becBc52BD5",
  HYPEREVM_HBHYPE: "0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB",
  HYPEREVM_HBBTC: "0xc061d38903b99aC12713B550C2CB44B221674F94",
  HYPEREVM_HBXAUT: "0x6EB6724D8D3D4FF9E24d872E8c38403169dC05f8",
  HYPEREVM_GTUSDT0: "0x53A333e51E96FE288bC9aDd7cdC4B1EAD2CD2FfA",
  HYPEREVM_HYPERUSDT0: "0xe5ADd96840F0B908ddeB3Bd144C0283Ac5ca7cA0",
  HYPEREVM_MCHYPE: "0xd19e3d00f8547f7d108abFD4bbb015486437B487",
  HYPEREVM_GTUETH: "0x0571362ba5ea9784a97605f57483f865a37dbeaa",
  HYPEREVM_BEHYPE: "0x441794D6a8F9A3739F5D4E98a728937b33489D29",
  HYPEREVM_HYPERBEAT_LST: "0x81e064d0eB539de7c3170EDF38C1A42CBd752A76",
  HYPEREVM_SENTIMENT_HYPE_SUPER_POOL: "0x2831775cb5e64b1d892853893858a261e898fbeb",
  HYPEREVM_USDT0_FELIX_METAMORPHO_VAULT: "0xFc5126377F0efc0041C0969Ef9BA903Ce67d151e",
  HYPEREVM_USDHL_FELIX_METAMORPHO_VAULT: "0x9c59a9389D8f72DE2CdAf1126F36EA4790E2275e",
  EULER_EWSTUSR: "0x9f12d29c7CC72bb3d237E2D042A6D890421f9899",
  PENDLE_LP_WSTUSR_24SEP2025: "0x09fA04Aac9c6d1c6131352EE950CD67ecC6d4fB9",
};

// Note: Some vaults are "smart vaults" where the collateral is DEX LP tokens
// For these vaults, the positions hold LP shares that need to be unwrapped to get actual token values
const FLUID_VAULTS = [
  { VAULT: "0xeAEf563015634a9d0EE6CF1357A3b205C35e028D", TOKEN: TOKENS.WEETH },
  { VAULT: "0x1c6068eC051f0Ac1688cA1FE76810FA9c8644278", TOKEN: TOKENS.WEETHS },
  { VAULT: "0x3996464c0fCCa8183e13ea5E5e74375e2c8744Dd", TOKEN: TOKENS.SUSDE },
  { VAULT: "0xBc345229C1b52e4c30530C614BB487323BA38Da5", TOKEN: TOKENS.SUSDE },
  { VAULT: "0xe210d8ded13Abe836a10E8Aa956dd424658d0034", TOKEN: TOKENS.SUSDE },
  { VAULT: "0x2F3780e21cAba1bEdFB24E37C97917def304dFFA", TOKEN: TOKENS.SUSDE },
  { VAULT: "0x7503b58Bb29937e7E2980f70D3FD021B7ebeA6d0", TOKEN: TOKENS.SUSDE ,IS_SMART: true, LP_TOKEN: "0x1DD125C32e4B5086c63CC13B3cA02C4A2a61Fa9b", TOKEN0: TOKENS.SUSDE, TOKEN1: TOKENS.USDT },
  { VAULT: "0x989a44CB4dBb7eBe20e0aBf3C1E1d727BF90F881", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xf063BD202E45d6b2843102cb4EcE339026645D4a", TOKEN0: TOKENS.USDE, TOKEN1: TOKENS.USDT },
  { VAULT: "0x43d1cA906c72f09D96291B4913D7255E241F428d", TOKEN: TOKENS.WBTC },
  { VAULT: "0xB170B94BeFe21098966aa9905Da6a2F569463A21", TOKEN: TOKENS.SUSDE, IS_SMART: true, LP_TOKEN: "0x1DD125C32e4B5086c63CC13B3cA02C4A2a61Fa9b", TOKEN0: TOKENS.SUSDE, TOKEN1: TOKENS.USDT }, 
  { VAULT: "0xaEac94D417BF8d8bb3A44507100Ab8c0D3b12cA1", TOKEN: TOKENS.USDE , IS_SMART: true, LP_TOKEN: "0xf063BD202E45d6b2843102cb4EcE339026645D4a", TOKEN0: TOKENS.USDE, TOKEN1: TOKENS.USDT },
  { VAULT: "0x0a90ED6964f6bA56902fD35EE11857A810Dd5543", TOKEN: TOKENS.SUSDE, IS_SMART: true, LP_TOKEN: "0xDd5F2AFab5Ae5484339F9aD40FB4d51Fc5c96be3", TOKEN0: TOKENS.SUSDE, TOKEN1: TOKENS.GHO },
  { VAULT: "0x91D5884a57E4A3718654B462B32cC628b2c6A39A", TOKEN: TOKENS.SUSDE, IS_SMART: true, LP_TOKEN: "0x1DD125C32e4B5086c63CC13B3cA02C4A2a61Fa9b", TOKEN0: TOKENS.SUSDE, TOKEN1: TOKENS.USDT },
  { VAULT: "0x4B5fa15996C2E23b35E64f0ca62d30c4945E53Cb", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xf063BD202E45d6b2843102cb4EcE339026645D4a", TOKEN0: TOKENS.USDE, TOKEN1: TOKENS.USDT },
  { VAULT: "0x4095a3A8efe779D283102377669778900212D856", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0x862FC0A67623a4E6f0776103340836c91728B06D", TOKEN0: TOKENS.GHO, TOKEN1: TOKENS.USDE },
  { VAULT: "0x5668c53C6188BA0a311E28b54D7822771D9BDeea", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xB0960263E39C70C9B6e9EA2A382B18095264A364", TOKEN0: TOKENS.USDE, TOKEN1: "0xC139190F447e929f090Edeb554D95AbB8b18aC1C" },
  { VAULT: "0x71a3bD2B2214E51e33144590948aA88beAfF2E44", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xB0960263E39C70C9B6e9EA2A382B18095264A364", TOKEN0: TOKENS.USDE, TOKEN1: "0xC139190F447e929f090Edeb554D95AbB8b18aC1C" },
  { VAULT: "0x1e6ce96d65901E0779C17E83258e07D2f8962fa4", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xB0960263E39C70C9B6e9EA2A382B18095264A364", TOKEN0: TOKENS.USDE, TOKEN1: "0xC139190F447e929f090Edeb554D95AbB8b18aC1C" },
  { VAULT: "0xe3Cac7cC6b0EeD28e16331F08be7948BbfcB5acC", TOKEN: TOKENS.USDE, IS_SMART: true, LP_TOKEN: "0xdE632C3a214D5f14C1d8ddF0b92F8BCd188fee45", TOKEN0: TOKENS.GHO, TOKEN1: TOKENS.USDE },
]

const MORPHO_SUSDE_MARKET_ID =
  "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48";

async function tvl(api) {
  const owners = await getOwners(api);

  await Promise.all([
    sumBaseTokens, 
    handleLockedUSDE, 
    handleMorphoSuppliedSUSDE, 
    handleZircuitAssets, 
    handleStrategyTokenBalances, 
    handleSymbioticTokens,
    handleFluidPositions,
    handleHyperEVMERC4626Vaults
  ].map(async (fn) => fn()));

  async function sumBaseTokens() {
    const chain = api.chain;
    
    if (chain === 'ethereum') {
      return api.sumTokens({
        owners, tokens: [TOKENS.AGETH, TOKENS.WEETH, TOKENS.USDE, TOKENS.SUSDE, TOKENS.MSTETH, TOKENS.WSTETH, TOKENS.STETH, TOKENS.WBTC, TOKENS.WEETHS, TOKENS.AMPHRETH, TOKENS.USR, TOKENS.RLP, TOKENS.STUSR, TOKENS.WSTUSR, TOKENS.EBTC, TOKENS.CBBTC, TOKENS.POND, TOKENS.SENA]
      })
    } else if (chain === 'hyperliquid') {
      return api.sumTokens({
        owners, tokens: [TOKENS.HYPEREVM_WHYPE, TOKENS.HYPEREVM_WSTHYPE, TOKENS.HYPEREVM_UBTC, TOKENS.HYPEREVM_UETH, TOKENS.HYPEREVM_USDT0, TOKENS.HYPEREVM_XAUT0, TOKENS.HYPEREVM_USDHL]
      })
    }
  }

  async function handleLockedUSDE() {
    if (api.chain !== 'ethereum') return;
    
    const stakes = await api.multiCall({
      target: CONTRACTS.ETHENA_LP_STAKING,
      abi: "function stakes(address,address) view returns (uint256 amount,uint152,uint104)",
      calls: owners.map((owner) => ({ params: [owner, TOKENS.USDE] })),
    });
    api.add(TOKENS.USDE, stakes.map(i => i.amount))
  }

  async function handleMorphoSuppliedSUSDE() {
    if (api.chain !== 'ethereum') return;
    
    const positions = await api.multiCall({
      target: CONTRACTS.MORPHO_BLUE,
      abi: "function position(bytes32,address) view returns (uint256,uint128,uint128 amount)",
      calls: owners.map((owner) => ({ params: [MORPHO_SUSDE_MARKET_ID, owner] })),
    });
    api.add(TOKENS.USDE, positions.map(i => i.amount))
  }

  async function handleFluidPositions() {
    if (api.chain !== 'ethereum') return;
    
    const positions = await api.multiCall({
      target: CONTRACTS.FLUID_POSITION_RESOLVER,
      abi: "function getAllVaultPositions(address) view returns ((uint256,address owner,uint256 supply,uint256)[])",
      calls: FLUID_VAULTS.map(({ VAULT }) => ({ params: [VAULT] })),
    });

    for (let i = 0; i < positions.length; i++) {
      const vaultPositions = positions[i];
      const rumpelPositions = vaultPositions.filter(p => owners.includes(p.owner));

      if (rumpelPositions.length === 0) continue;

      const vault = FLUID_VAULTS[i];

      if (vault.IS_SMART) {
        const [totalSupplySharesRaw, reserves] = await Promise.all([
          api.call({
            target: CONTRACTS.FLUID_DEX_RESOLVER,
            abi: 'function getTotalSupplySharesRaw(address dex_) view returns (uint)',
            params: [vault.LP_TOKEN]
          }),
          api.call({
            target: CONTRACTS.FLUID_DEX_RESERVES_RESOLVER,
            abi: 'function getDexCollateralReserves(address) view returns (uint256,uint256,uint256,uint256)',
            params: [vault.LP_TOKEN]
          })
        ]);

        const totalSupplyShares = BigInt(totalSupplySharesRaw) & BigInt('0xffffffffffffffffffffffffffffffff');
        const [token0Reserves, token1Reserves] = reserves;

        const totalPositionShares = rumpelPositions.reduce((sum, p) => sum + BigInt(p.supply), 0n);
        const ratio = Number(totalPositionShares) / Number(totalSupplyShares);

        const token0Amount = Number(token0Reserves) * ratio;
        const token1Amount = Number(token1Reserves) * ratio;

        if (token0Amount > 0) api.add(vault.TOKEN0, token0Amount.toFixed(0));
        if (token1Amount > 0) api.add(vault.TOKEN1, token1Amount.toFixed(0));
      } else {
        api.add(vault.TOKEN, rumpelPositions.map(p => p.supply));
      }
    }
  }

  async function handleZircuitAssets() {
    if (api.chain !== 'ethereum') return;
    
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
    const chain = api.chain;
    let tokens = [];
    
    if (chain === 'ethereum') {
      tokens = [
        TOKENS.KWEETH,
        TOKENS.KUSDE,
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
        TOKENS.YT_SUSDE_31JUL2025,
        TOKENS.YT_EUSDE_28MAY2025,
        TOKENS.YT_EUSDE_13AUG2025,
        TOKENS.YT_USDE_30JUL2025,
        TOKENS.YT_LVLUSD_24SEP2025,
        TOKENS.YT_USR_28MAY2025,
        TOKENS.YT_WSTUSR_24SEP2025,
        TOKENS.YT_WEETHS_25JUNE2025,
        TOKENS.YT_EETH_25JUNE2025,
        TOKENS.YT_WEETHK_25JUNE2025,
        TOKENS.YT_AGETH_25JUNE2025,
        TOKENS.YT_USDE_24SEP2025,
        TOKENS.YT_SUSDE_24SEP2025,
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
        TOKENS.EULER_EWSTUSR,
        TOKENS.PENDLE_LP_WSTUSR_24SEP2025,
      ]
    } else if (chain === 'hyperliquid') {
      // Strategy tokens are handled by handleHyperEVMERC4626Vaults which converts them to underlying assets
      tokens = []
    }

    if (tokens.length > 0) {
      await api.sumTokens({ owners, tokens });
    }
  }

  async function handleSymbioticTokens() {
    if (api.chain !== 'ethereum') return;
    
    const symbioticMappings = [
      { collateral: TOKENS.SYMBIOTIC_WSTETH_COLLATERAL, underlying: TOKENS.WSTETH },
      { collateral: TOKENS.SYMBIOTIC_SUSDE_COLLATERAL, underlying: TOKENS.SUSDE },
      { collateral: TOKENS.SYMBIOTIC_LBTC_COLLATERAL, underlying: ADDRESSES.ethereum.LBTC },
      { collateral: TOKENS.SYMBIOTIC_METH_COLLATERAL, underlying: ADDRESSES.ethereum.METH },
      { collateral: TOKENS.SYMBIOTIC_WBTC_COLLATERAL, underlying: TOKENS.WBTC },
      { collateral: TOKENS.SYMBIOTIC_RETH_COLLATERAL, underlying: ADDRESSES.ethereum.RETH },
      { collateral: TOKENS.SYMBIOTIC_CBETH_COLLATERAL, underlying: ADDRESSES.ethereum.cbETH },
      { collateral: TOKENS.SYMBIOTIC_ENA_COLLATERAL, underlying: ADDRESSES.ethereum.ENA },
      { collateral: TOKENS.SYMBIOTIC_ETHFI_COLLATERAL, underlying: ADDRESSES.ethereum.ETHFI },
      { collateral: TOKENS.SYMBIOTIC_FXS_COLLATERAL, underlying: ADDRESSES.ethereum.FXS },
      { collateral: TOKENS.SYMBIOTIC_TBTC_COLLATERAL, underlying: ADDRESSES.ethereum.tBTC },
      { collateral: TOKENS.SYMBIOTIC_SFRXETH_COLLATERAL, underlying: ADDRESSES.ethereum.sfrxETH },
      { collateral: TOKENS.SYMBIOTIC_GAUNTLET_RESTAKED_CBETH_COLLATERAL, underlying: ADDRESSES.ethereum.cbETH },
      { collateral: TOKENS.SYMBIOTIC_GAUNTLET_RESTAKED_WSTETH_COLLATERAL, underlying: TOKENS.WSTETH },
      { collateral: TOKENS.SYMBIOTIC_WBETH_COLLATERAL, underlying: TOKENS.WBETH },
      { collateral: TOKENS.SYMBIOTIC_SWETH_COLLATERAL, underlying: TOKENS.SWETH },
      { collateral: TOKENS.SYMBIOTIC_LSETH_COLLATERAL, underlying: TOKENS.LSETH },
      { collateral: TOKENS.SYMBIOTIC_OSETH_COLLATERAL, underlying: TOKENS.OSETH },
      { collateral: TOKENS.SYMBIOTIC_GUANTLET_RESTAKED_SWETH_COLLATERAL, underlying: TOKENS.SWETH },
      { collateral: TOKENS.SYMBIOTIC_MANTA_COLLATERAL, underlying: TOKENS.MANTA },
    ]
    
    const allBalanceCalls = symbioticMappings.flatMap(mapping => 
      owners.map(owner => ({ 
        target: mapping.collateral, 
        params: [owner],
        mapping 
      }))
    )

    const allBalances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: allBalanceCalls.map(call => ({ target: call.target, params: call.params }))
    })

    const underlyingBalances = {}
    allBalanceCalls.forEach((call, index) => {
      const balance = allBalances[index] || 0
      const underlying = call.mapping.underlying
      if (!underlyingBalances[underlying]) {
        underlyingBalances[underlying] = 0n
      }
      underlyingBalances[underlying] += BigInt(balance)
    })

    Object.entries(underlyingBalances).forEach(([underlying, totalBalance]) => {
      if (totalBalance > 0n) {
        api.add(underlying, totalBalance.toString())
      }
    })
  }

  async function handleHyperEVMERC4626Vaults() {
    if (api.chain !== 'hyperliquid') return;
    
    const vaultMappings = [
      { vault: TOKENS.HYPEREVM_HBHYPE, underlying: TOKENS.HYPEREVM_WHYPE },
      { vault: TOKENS.HYPEREVM_HBBTC, underlying: TOKENS.HYPEREVM_UBTC },
      // hbXAUt has 18 decimals, XAUt0 has 6 decimals, so we need decimal conversion
      { vault: TOKENS.HYPEREVM_HBXAUT, underlying: TOKENS.HYPEREVM_XAUT0, isOneToOne: true, vaultDecimals: 18, underlyingDecimals: 6 },
      { vault: TOKENS.HYPEREVM_GTUSDT0, underlying: TOKENS.HYPEREVM_USDT0 },
      { vault: TOKENS.HYPEREVM_HYPERUSDT0, underlying: TOKENS.HYPEREVM_USDT0 },
      { vault: TOKENS.HYPEREVM_MCHYPE, underlying: TOKENS.HYPEREVM_WHYPE },
      { vault: TOKENS.HYPEREVM_GTUETH, underlying: TOKENS.HYPEREVM_UETH },
      { vault: TOKENS.HYPEREVM_BEHYPE, underlying: TOKENS.HYPEREVM_WHYPE },
      { vault: TOKENS.HYPEREVM_HYPERBEAT_LST, underlying: TOKENS.HYPEREVM_WHYPE },
      { vault: TOKENS.HYPEREVM_SENTIMENT_HYPE_SUPER_POOL, underlying: TOKENS.HYPEREVM_WHYPE },
      { vault: TOKENS.HYPEREVM_USDT0_FELIX_METAMORPHO_VAULT, underlying: TOKENS.HYPEREVM_USDT0 },
      { vault: TOKENS.HYPEREVM_USDHL_FELIX_METAMORPHO_VAULT, underlying: TOKENS.HYPEREVM_USDHL },
    ];

    // Get vault balances for all owners
    const balanceCalls = [];
    for (const mapping of vaultMappings) {
      for (const owner of owners) {
        balanceCalls.push({
          target: mapping.vault,
          params: [owner],
          mapping
        });
      }
    }

    const vaultBalances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: balanceCalls.map(call => ({ target: call.target, params: call.params }))
    });

    // Filter out zero balances and prepare convertToAssets calls
    const convertCalls = [];
    const oneToOneBalances = [];
    
    for (let i = 0; i < balanceCalls.length; i++) {
      if (vaultBalances[i] && vaultBalances[i] > 0) {
        if (balanceCalls[i].mapping.isOneToOne) {
          // For 1:1 vaults, directly add to oneToOneBalances
          let amount = BigInt(vaultBalances[i]);
          
          // Handle decimal conversion if needed
          if (balanceCalls[i].mapping.vaultDecimals && balanceCalls[i].mapping.underlyingDecimals) {
            const decimalDiff = balanceCalls[i].mapping.vaultDecimals - balanceCalls[i].mapping.underlyingDecimals;
            if (decimalDiff > 0) {
              // Convert from vault decimals to underlying decimals
              amount = amount / (10n ** BigInt(decimalDiff));
            }
          }
          
          oneToOneBalances.push({
            underlying: balanceCalls[i].mapping.underlying,
            amount: amount
          });
        } else {
          // For ERC4626 vaults, prepare convertToAssets calls
          convertCalls.push({
            target: balanceCalls[i].target,
            params: [vaultBalances[i]],
            mapping: balanceCalls[i].mapping,
            vaultBalance: vaultBalances[i]
          });
        }
      }
    }

    // Add 1:1 balances first
    for (const balance of oneToOneBalances) {
      api.add(balance.underlying, balance.amount);
    }

    if (convertCalls.length === 0) return;

    // Convert vault shares to underlying assets
    const underlyingAmounts = await api.multiCall({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
      calls: convertCalls.map(call => ({ target: call.target, params: call.params })),
      permitFailure: true
    });

    // Add underlying assets to the API
    for (let i = 0; i < convertCalls.length; i++) {
      const underlyingAmount = underlyingAmounts[i];
      const underlying = convertCalls[i].mapping.underlying;
      
      if (underlyingAmount && underlyingAmount > 0) {
        api.add(underlying, underlyingAmount);
      }
    }
  }
}

async function getOwners(api) {
  const chain = api.chain;
  let factoryAddress, fromBlock, pointTokenVault;
  
  if (chain === 'ethereum') {
    factoryAddress = CONTRACTS.RUMPEL_WALLET_FACTORY;
    fromBlock = DEPLOYMENT.RUMPEL_WALLET_FACTORY.block;
    pointTokenVault = CONTRACTS.RUMEPL_POINT_TOKENIZATION_VAULT;
  } else if (chain === 'hyperliquid') {
    factoryAddress = CONTRACTS.HYPEREVM_RUMPEL_WALLET_FACTORY;
    fromBlock = DEPLOYMENT.HYPEREVM_RUMPEL_WALLET_FACTORY.block;
    pointTokenVault = CONTRACTS.HYPEREVM_POINT_TOKEN_VAULT;
  } else {
    return [];
  }
  
  const logs = await getLogs2({
    api,
    target: factoryAddress,
    topic: "SafeCreated(address,address[],uint256)",
    eventAbi:
      "event SafeCreated(address indexed safe, address[] indexed owners, uint256 threshold)",
    fromBlock: fromBlock,
  });
  
  return logs
    .map((log) => log.safe)
    .concat(pointTokenVault);
}

module.exports = {
  methodology:
    "Sums up the supported tokens in Rumpel Wallets + Deposits in the Rumpel Point Tokenization Vault",
  start: DEPLOYMENT.RUMPEL_WALLET_FACTORY.timestamp,
  ethereum: {
    tvl,
  },
  hyperliquid: {
    tvl,
  },
};