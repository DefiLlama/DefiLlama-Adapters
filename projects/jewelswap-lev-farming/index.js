const { getNFTs, sumTokens } = require("../helper/chain/elrond");
const { ResultsParser, AbiRegistry, SmartContract, Address, } = require("@multiversx/sdk-core/out");
const { ProxyNetworkProvider } = require("@multiversx/sdk-network-providers/out");
const JEWEL_ONEDEX_FARM_SC_ABI = require("./jewel-onedex-farm.abi.json");
const sui = require("../helper/chain/sui");


const JEWEL_ONEDEX_FARM_SC_ADDRESS = "erd1qqqqqqqqqqqqqpgqm7exdla3rzshywy99pvlxzkr45wt9kjsdfys7qqpn0";
const LENDING_POOL_FARMS = "erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh";

const FARMS = "erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4";
const FARMS2 = "erd1qqqqqqqqqqqqqpgqx6833qjac6uqztgsa8jhlztexucke0hrdfys6wd7qt";
const XEXCHANGE_FARMS = "erd1qqqqqqqqqqqqqpgq9slqavjm7pglxgzuskwlvnq53gnk02vndfysq95mpq";

const jewelOnedexFarmAbiRegistry = AbiRegistry.create(JEWEL_ONEDEX_FARM_SC_ABI);
const jewelOnedexFarmSmartContract = new SmartContract({
  address: new Address(JEWEL_ONEDEX_FARM_SC_ADDRESS),
  abi: jewelOnedexFarmAbiRegistry
});


const networkConfigs = {
  mainnet: {
    id: "mainnet",
    chainId: "1",
    apiUrl: "https://api.multiversx.com",
    gatewayUrl: "https://gateway.multiversx.com",
    explorerUrl: "https://explorer.multiversx.com",
    apiTimeout: 10000
  }
};


const ELROND_NETWORK = "mainnet";
const networkConfig = networkConfigs[ELROND_NETWORK];

const proxyProvider = new ProxyNetworkProvider(networkConfig.gatewayUrl, {
  timeout: networkConfig.apiTimeout
});


// ─── Sui Constants ───

// Sui token types
const WUSDC = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
const SUI_TOKEN = '0x2::sui::SUI'
const DEEP = '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
const HIPPO = '0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::hippo::HIPPO'
const CETUS = '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS'
const SCA = '0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA'
const WETH = '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN'

// Cetus farm pools: [farmPoolId, cetusPoolId, coinTypeA, coinTypeB]
const CETUS_FARMS = [
  ['0x577c58b5e4c46e14a2fee4fa29a7a4efd8e6528065b8a8a6da12e22590dbc797', '0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688571', WUSDC, SUI_TOKEN],
  ['0x1c80f02a3a3c5d81b62135cbeaf812577b8e21e48e881e232e1f15b4591352e6', '0xb8d7d9e66a60c239e7a60110efcf8571655daa67e6f815ee5f715bb80571df33', USDC, SUI_TOKEN],
  ['0x27041ee573ee559e037ca73d3fcbc46e809100be4d47be45637adeacd2839997', '0xe01243f37f712ef87e556afb9b1d03d0fae13f96d324ec912b85571a1b62571a', DEEP, SUI_TOKEN],
  ['0x7161eb0a9aafbe497d697b48f8ca3b23c6de1c20e6eaa38e4c7506dc45fe90b3', '0xb785e6eed355b4a8ab31b2fa28b1b413286ddd817ce9c0a4aba85dab96e88e7e', HIPPO, SUI_TOKEN],
  ['0xa37433c5706e0c0c46073996d976e6d43bb56e68242a1bfe08ffcfb0c140a063', '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded', CETUS, SUI_TOKEN],
  ['0x714fd4e1053a8cce8a18cfe1b81b0e53c0b4d0e64d8fecbecc0c7a8e6e04739e', '0x9e593f5bcc31019bca461be55e353b59b3008e41140ad1860804287ad3584353', USDC, WETH],
  ['0x28638f99627e87f59c80cab7876a6eb7e36e10bb89eb2b5d6a1c28dfba1f0881', '0x3b13ac26e251e02eaf25fd0bf30c7decd97420f6c33bdae8bab07155b37caf1c', USDC, CETUS],
  ['0xdbc21b9cba37bcaa5e1392e74ff34ee33f18886c2a76e37167e32d59781b082b', '0xaa72ec9be01dba54bab66c9768e57e03bda0dd3c3030c6e9c4e512e6c5e58559', SCA, SUI_TOKEN],
]

// Turbos farm pools: [farmId, turbosPoolId, coinTypeA, coinTypeB]
// Currently empty — valid pool IDs will be added when Turbos farms are deployed
const TURBOS_FARMS = [
]

// Scallop farm obligation
const SCALLOP_OBLIGATION_ID = '0x5d1c3c7cb70264e8d92fe2d21022d2160dfbcb66298c2b423df47c8e3727dcb6'


// ─── CLMM Math ───

function parseI32Bits(field) {
  if (!field) return 0
  const bits = field.fields ? field.fields.bits : field
  const val = BigInt(bits)
  return Number(val >= 2n ** 31n ? val - 2n ** 32n : val)
}

function tickToSqrtPrice(tick) {
  return Math.sqrt(Math.pow(1.0001, tick))
}

function getCoinAmountsFromPosition(liquidity, currentSqrtPriceX64, tickLowerBits, tickUpperBits) {
  const Q64 = 2 ** 64
  const currentSqrt = Number(currentSqrtPriceX64) / Q64
  const tickLower = parseI32Bits(tickLowerBits)
  const tickUpper = parseI32Bits(tickUpperBits)
  const sqrtLower = tickToSqrtPrice(tickLower)
  const sqrtUpper = tickToSqrtPrice(tickUpper)
  const liq = Number(liquidity)
  let amount0 = 0, amount1 = 0
  if (currentSqrt <= sqrtLower) {
    amount0 = liq * (1 / sqrtLower - 1 / sqrtUpper)
  } else if (currentSqrt >= sqrtUpper) {
    amount1 = liq * (sqrtUpper - sqrtLower)
  } else {
    amount0 = liq * (1 / currentSqrt - 1 / sqrtUpper)
    amount1 = liq * (currentSqrt - sqrtLower)
  }
  return { amount0: Math.floor(Math.abs(amount0)), amount1: Math.floor(Math.abs(amount1)) }
}


// ─── Sui TVL ───

async function suiTvl(api) {
  // Cetus CLMM farms
  const farmPoolIds = CETUS_FARMS.map(f => f[0])
  const cetusPoolIds = CETUS_FARMS.map(f => f[1])
  const [farmPools, cetusPools] = await Promise.all([
    sui.getObjects(farmPoolIds),
    sui.getObjects(cetusPoolIds),
  ])
  for (let i = 0; i < CETUS_FARMS.length; i++) {
    const [, , coinA, coinB] = CETUS_FARMS[i]
    const farm = farmPools[i]
    const pool = cetusPools[i]
    if (!farm || !pool) continue

    // Surplus balances held outside CLMM position
    api.add(coinA, farm.fields.surplus_balance_a || 0)
    api.add(coinB, farm.fields.surplus_balance_b || 0)

    // CLMM position value
    const pos = farm.fields.cetus_position?.fields
    if (pos && pos.liquidity && Number(pos.liquidity) > 0) {
      const { amount0, amount1 } = getCoinAmountsFromPosition(
        pos.liquidity,
        pool.fields.current_sqrt_price,
        pos.tick_lower_index,
        pos.tick_upper_index,
      )
      api.add(coinA, amount0)
      api.add(coinB, amount1)
    }
  }

  // Turbos CLMM farms
  for (const [farmId, turbosPoolId, coinA, coinB] of TURBOS_FARMS) {
    const [farm, pool] = await sui.getObjects([farmId, turbosPoolId])
    if (!farm || !pool) continue
    const totalShare = Number(farm.fields.total_share || 0)
    const poolLiquidity = Number(pool.fields.liquidity || 0)
    if (totalShare <= 0 || poolLiquidity <= 0) continue
    const ratio = totalShare / poolLiquidity
    api.add(coinA, Math.floor(Number(pool.fields.coin_a || 0) * ratio))
    api.add(coinB, Math.floor(Number(pool.fields.coin_b || 0) * ratio))

    // Compounding and protocol assets in Bags
    const bags = [farm.fields.compounding_assets, farm.fields.protocol_assets]
    for (const bag of bags) {
      if (!bag?.fields?.id?.id) continue
      const entries = await sui.getDynamicFieldObjects({ parent: bag.fields.id.id })
      for (const entry of entries) {
        const balance = entry.fields?.value?.fields?.balance || entry.fields?.value || 0
        if (Number(balance) > 0) {
          const name = entry.fields?.name
          if (typeof name === 'string' && name.includes('::')) {
            api.add(name, balance)
          }
        }
      }
    }
  }

  // Scallop leveraged farm (single-pair: suiUSDT collateral, USDC debt)
  const [obligation] = await sui.getObjects([SCALLOP_OBLIGATION_ID])
  if (obligation) {
    const collateralTableId = obligation.fields.collaterals?.fields?.table?.fields?.id?.id
    if (collateralTableId) {
      const collateralEntries = await sui.getDynamicFieldObjects({ parent: collateralTableId })
      for (const entry of collateralEntries) {
        const coinType = '0x' + (entry.fields?.name?.fields?.name || '')
        const amount = entry.fields?.value?.fields?.amount || 0
        if (Number(amount) > 0) api.add(coinType, amount)
      }
    }
    const debtTableId = obligation.fields.debts?.fields?.table?.fields?.id?.id
    if (debtTableId) {
      const debtEntries = await sui.getDynamicFieldObjects({ parent: debtTableId })
      for (const entry of debtEntries) {
        const coinType = '0x' + (entry.fields?.name?.fields?.name || '')
        const amount = entry.fields?.value?.fields?.amount || 0
        if (Number(amount) > 0) api.add(coinType, -amount)
      }
    }
  }
}


// ─── MultiversX TVL ───

async function elrondTvl(api) {

  addNfts(await getNFTs(FARMS))
  addNfts(await getNFTs(FARMS2))
  await oneDexFarm(api)
  return sumTokens({ owners: [LENDING_POOL_FARMS, XEXCHANGE_FARMS], balances: api.getBalances() })

  function addNfts(nfts) {
    nfts.forEach(nft => {
      let lpToken
      switch (nft.collection) {
        case "FARM-e5ffde": lpToken = "ALP-2d0cf8"; break;
        case "FARM-9ed1f9": lpToken = "ALP-5f9191"; break;
        case "FARM-ccefc2": lpToken = "ALP-0fe50a"; break;
        case "FARM-795466": lpToken = "ALP-afc922"; break;
        case "FARM-b637f0": lpToken = "ALP-713ae8"; break;
        case "FARM-83c131": lpToken = "ALP-f7dee1"; break;
        default: lpToken = null;
      }
      if (lpToken) api.add(lpToken, nft.balance)
    })
  }
}

async function oneDexFarm(api) {
  const interaction =
    jewelOnedexFarmSmartContract.methodsExplicit.viewFarms();
  const query = interaction.check().buildQuery();
  const queryResponse =
    await proxyProvider.queryContract(query);
  const endpointDefinition = interaction.getEndpoint();
  const { firstValue, returnCode, returnMessage } =
    new ResultsParser().parseQueryResponse(
      queryResponse,
      endpointDefinition
    );

  if (!firstValue || !returnCode.isSuccess()) {
    throw Error(returnMessage);
  }

  const values = firstValue.valueOf();
  const decoded = values.map((value) => ({
    token0: value.first_token_id.toString(),
    token1: value.second_token_id.toString(),
    lpAmount: value.lp_token_amount.toFixed(0),
    lpSupply: value.lp_token_supply.toFixed(0),
    token0Supply: value.first_token_reserve.toFixed(0),
    token1Supply: value.second_token_reserve.toFixed(0)
  }));
  decoded.forEach(({ token0, token1, lpAmount, lpSupply, token0Supply, token1Supply}) => {
    const ratio = lpAmount / lpSupply
    api.add(token0, token0Supply * ratio)
    api.add(token1, token1Supply * ratio)
  })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  elrond: {
    tvl: elrondTvl
  },
  sui: {
    tvl: suiTvl
  }
};
