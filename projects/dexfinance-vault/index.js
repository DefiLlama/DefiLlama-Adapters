const { sumTokens2, addUniV3LikePosition } = require("../helper/unwrapLPs");
const { abi } = require("./abi");

const CONFIG = {
  optimism: {
    factory: "0xd4f1a99212e5be72426bde45abadef66d7d6edf3",
  },
  fantom: {
    factory: "0x9b7e30644a9b37eebaa7158129b03f5a3088659d",
  },
  pulse: {
    factory: "0xac297968C97EF5686c79640960D106f65C307a37",
    USDEX_PLUS: "0xaA2C47a35C1298795B5271490971Ec4874C8e53d",
  },
  base: {
    factory: "0x714c94b9820d7d73e61510e4c18b91f995a895c1",
  },
  arbitrum: {
    factory: "0xe31fceaf93667365ce1e9edad3bed4a7dd0fc01a",
    USDEX_PLUS: "0x4117EC0A779448872d3820f37bA2060Ae0B7C34B",
    gDEX: "0x92a212d9f5eef0b262ac7d84aea64a0d0758b94f"
  },
  avax: {
    factory: "0x6b714e6296b8b977e1d5ecb595197649e10a3db1",
  },
  bsc: {
    factory: "0x3ace08b10b5c08a17d1c46277d65c81249e65f44",
  },
  // manta: {
  //   factory: "0x714C94B9820D7D73e61510e4C18B91F995A895C1",
  // },
};

/**
Balance table for [fantom] Unrecognized tokens
┌─────────┬────────────┬────────┬─────────┬─────────────────────────────────────────────────────┬──────────┐
│ (index) │ name       │ symbol │ balance │ label                                               │ decimals │
├─────────┼────────────┼────────┼─────────┼─────────────────────────────────────────────────────┼──────────┤
│ 0       │ 'Moon Bay' │ 'BAY'  │ '0'     │ 'fantom:0xe5a4c0af6f5f7ab5d6c1d38254bcf4cc26d688ed' │ '18'     │
└─────────┴────────────┴────────┴─────────┴─────────────────────────────────────────────────────┴──────────┘
 */

/**
Balance table for [pulse] Unrecognized tokens
┌─────────┬───────────────────────┬──────────┬───────────┬────────────────────────────────────────────────────┬──────────┐
│ (index) │ name                  │ symbol   │ balance   │ label                                              │ decimals │
├─────────┼───────────────────────┼──────────┼───────────┼────────────────────────────────────────────────────┼──────────┤
│ 0       │ 'USDEX+'              │ 'USDEX+' │ '109813'  │ 'pulse:0xaa2c47a35c1298795b5271490971ec4874c8e53d' │ '18'     │
│ 1       │ 'EMP from Binance'    │ 'EMP'    │ '245814'  │ 'pulse:0x9231937ac31506b6913ac5fb1db5a1c1ae83783a' │ '18'     │
│ 2       │ 'Degen Protocol GOAT' │ 'GOAT'   │ '4624417' │ 'pulse:0xf5d0140b4d53c9476dc1488bc6d8597d7393f074' │ '18'     │
│ 3       │ 'Burned Spark'        │ 'bSpark' │ '354355'  │ 'pulse:0xfcff9ddd271c8dc3a00d6f7e9c9cfe0ff80e3732' │ '18'     │
└─────────┴───────────────────────┴──────────┴───────────┴────────────────────────────────────────────────────┴──────────┘
 */


/**
Balance table for [optimism] Unrecognized tokens
┌─────────┬───────────────────────┬──────────┬─────────┬───────────────────────────────────────────────────────┬──────────┐
│ (index) │ name                  │ symbol   │ balance │ label                                                 │ decimals │
├─────────┼───────────────────────┼──────────┼─────────┼───────────────────────────────────────────────────────┼──────────┤
│ 0       │ 'REDKoin'             │ 'RED'    │ '695'   │ 'optimism:0x3417e54a51924c225330f8770514ad5560b9098d' │ '18'     │
│ 1       │ 'GoodNodes'           │ 'GNode'  │ '5816'  │ 'optimism:0x5976d4c3bcfc1c5f90ab1419d7f3ddf109cea35a' │ '18'     │
│ 2       │ 'BLUE'                │ 'BLU'    │ '16'    │ 'optimism:0xa50b23cdfb2ec7c590e84f403256f67ce6dffb84' │ '18'     │
│ 3       │ 'Unlock Token'        │ 'UNLOCK' │ '2'     │ 'optimism:0x7ae97042a4a0eb4d1eb370c34bfec71042a056b7' │ '18'     │
│ 4       │ 'Metronome Synth ETH' │ 'msETH'  │ '0'     │ 'optimism:0x1610e3c85dd44af31ed7f33a63642012dca0c5a5' │ '18'     │
│ 5       │ 'Metronome Synth USD' │ 'msUSD'  │ '681'   │ 'optimism:0x9dabae7274d28a45f0b65bf8ed201a5731492ca0' │ '18'     │
│ 6       │ 'Chi USD'             │ 'CHI'    │ '237'   │ 'optimism:0xca0e54b636db823847b29f506bffee743f57729d' │ '18'     │
└─────────┴───────────────────────┴──────────┴─────────┴───────────────────────────────────────────────────────┴──────────┘
 */

/**
Balance table for [base] Unrecognized tokens
┌─────────┬───────────────────────────┬────────┬─────────┬───────────────────────────────────────────────────┬──────────┐
│ (index) │ name                      │ symbol │ balance │ label                                             │ decimals │
├─────────┼───────────────────────────┼────────┼─────────┼───────────────────────────────────────────────────┼──────────┤
│ 0       │ 'Threshold Network Token' │ 'T'    │ '2'     │ 'base:0x26f3901ac8a79c50fb0d8289c74f0d09adc42e29' │ '18'     │
│ 1       │ 'AAG'                     │ 'AAG'  │ '155'   │ 'base:0x96e890c6b2501a69cad5dba402bfb871a2a2874c' │ '18'     │
└─────────┴───────────────────────────┴────────┴─────────┴───────────────────────────────────────────────────┴──────────┘
length:  3
 */

/**
 * 
Balance table for [arbitrum] Unrecognized tokens
┌─────────┬────────────────────────────────┬──────────────┬─────────┬───────────────────────────────────────────────────────┬──────────┐
│ (index) │ name                           │ symbol       │ balance │ label                                                 │ decimals │
├─────────┼────────────────────────────────┼──────────────┼─────────┼───────────────────────────────────────────────────────┼──────────┤
│ 0       │ 'DexFi Governance'             │ 'gDEX'       │ '114'   │ 'arbitrum:0xda064d44871ba31dae33a65b3e23b37e44e9168a' │ '18'     │
│ 1       │ 'DexFi Governance'             │ 'gDEX'       │ '84015' │ 'arbitrum:0x92a212d9f5eef0b262ac7d84aea64a0d0758b94f' │ '18'     │
│ 2       │ 'Wombat Pendle Asset'          │ 'LP-PENDLE'  │ '0'     │ 'arbitrum:0xb4beb0fdf0163a39d39b175942e7973da2c336fb' │ '18'     │
│ 3       │ 'Wombat mPendle Asset'         │ 'LP-mPendle' │ '0'     │ 'arbitrum:0x5ad0b68c8544d475ee73ffd4c8dfe7e273b01266' │ '18'     │
│ 4       │ 'Wombat Fluid USDC  Asset'     │ 'LP-fUSDC'   │ '22'    │ 'arbitrum:0xc74a9d15037886ea357f0ef243c50010b11133cb' │ '18'     │
│ 5       │ 'Wombat USD Coin (Arb1) Asset' │ 'LP-USDC'    │ '0'     │ 'arbitrum:0x4688300d46ef400c3506a165d5bdca6a51350978' │ '18'     │
│ 6       │ 'USDEX+'                       │ 'USDEX+'     │ '15163' │ 'arbitrum:0x4117ec0a779448872d3820f37ba2060ae0b7c34b' │ '18'     │
└─────────┴────────────────────────────────┴──────────────┴─────────┴───────────────────────────────────────────────────────┴──────────┘
 */


// const getVaults = async (api, factory ) => {
//   const items = []
//   let vaults = await api.fetchList({ lengthAbi: abi.factory.vaultsLength, itemAbi: abi.factory.vaults, target: factory });

//   for (const vault of vaults) {
//     const farmsRes = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, target: vault, permitFailure: true })
//     if(!farmsRes) continue
//     const farms = farmsRes.map(({ beacon }) => ({ beacon }));
//     items.push({ vault, farms })
//   }
  
//   return items.flat()
// };

const getVaults = async (api, factory) => {
  const vaultLists = await api.fetchList({ lengthAbi: abi.factory.vaultsLength,itemAbi: abi.factory.vaults,target: factory,permitFailure: true });

  return  Promise.all(
    vaultLists.map(async (vault) => {
      const farmRes = await api.fetchList({ lengthAbi: abi.vault.farmsLength, itemAbi: abi.vault.farms, target: vault, permitFailure: true });
      const farms = farmRes.filter((i) => i !== null).map(({ beacon, percent }) => ({ beacon, percent }));
      return { vault, farms };
    })
  );
};

const getConnectors = async (api, factory, vaults) => {
  const farmsFlat = [];
  const connectorsCalls = [];
  const calculationConnectorCalls = [];

  vaults.forEach(({ vault, farms }) => {
    farms.forEach((farm) => {
      connectorsCalls.push({ target: vault, params: [farm.beacon] });
      calculationConnectorCalls.push({ target: factory, params: [farm.beacon] });
    });
  });

  const [connectors, calculationConnectors] = await Promise.all([
    api.multiCall({ calls: connectorsCalls, abi: abi.vault.farmConnector }),
    api.multiCall({ calls: calculationConnectorCalls, abi: abi.factory.farmCalculationConnector }),
  ]);

  let connectorIndex = 0;
  vaults.forEach(({ farms }) => {
    farms.forEach((farm) => {
      farmsFlat.push({
        ...farm,
        calculationConnector: calculationConnectors[connectorIndex],
        connector: connectors[connectorIndex++],
      });
    });
  });

  return farmsFlat;
};

const getVaultsDatas = async (api, vaultFarms) => {
  const calls = vaultFarms.map(({ connector }) => connector)
  const liquidityCalls = vaultFarms.map(({ calculationConnector, connector }) => ({ target: calculationConnector, params: [connector] }))

  const [types, stakingTokens, tokenIds, liquidities] =
    await Promise.all([
      api.multiCall({ calls, abi: abi.farm.type }),
      api.multiCall({ calls, abi: abi.farm.stakingToken }),
      api.multiCall({ calls, abi: abi.farm.tokenId, permitFailure: true }),
      api.multiCall({ calls: liquidityCalls, abi: abi.vault.liquidity }),
    ]);

  return vaultFarms.map((farm, i) => {
    return {
      ...farm,
      type: types[i],
      stakingToken: stakingTokens[i],
      tokenId: tokenIds[i],
      liquidity: liquidities[i]
    };
  });
};

const groupBy = (array, keyFn) => {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

const lpv2Balances = async (api, farms) => {
  farms.forEach(({ stakingToken, liquidity }) => {
    api.add(stakingToken, liquidity);
  });
};

const lpv3Balances = async (api, farms) => {
  const Q96 = 2 ** 96;
  const priceToTick = (price) => Math.log(price) / Math.log(1.0001);
  const sqrtPriceX96ToPrice = (sqrtPriceX96) => (sqrtPriceX96 / Q96) ** 2;

  const calls = farms.filter(({ tokenId }) => tokenId !== 0).map(({ connector, tokenId }) => ({ target: connector, params: [tokenId] }));
  const callsDataV3 = farms.filter(({ tokenId }) => tokenId !== 0).map(({ connector }) => ({ target: connector }))

  const [liquidityV3, stakingTokenDataV3] = await Promise.all([
    api.multiCall({ calls, abi: abi.farm.stakingTokenLiquidity, permitFailure: true }),
    api.multiCall({ calls: callsDataV3, abi: abi.farm.stakingTokenData, permitFailure: true }),
  ]);

  farms.forEach((_, index) => {
    const liquidity = liquidityV3[index];
    const data = stakingTokenDataV3[index];

    if (liquidity && data) {
      const sqrtPriceX96LowInit = Number(data.pricesData.sqrtPriceX96LowInit);
      const sqrtPriceX96UpInit = Number(data.pricesData.sqrtPriceX96UpInit);

      const avgPrice = (sqrtPriceX96ToPrice(sqrtPriceX96LowInit) + sqrtPriceX96ToPrice(sqrtPriceX96UpInit)) / 2;
      const tick = priceToTick(avgPrice);

      addUniV3LikePosition({
        api,
        token0: data.token0,
        token1: data.token1,
        liquidity,
        tickLower: data.tickLower,
        tickUpper: data.tickUpper,
        tick,
      });
    }
  });
};

const tvl = async (api) => {
  const { factory, USDEX_PLUS, gDEX } = CONFIG[api.chain];
  const vaultFarms = await getVaults(api, factory);
  const vaultConnectors = await getConnectors(api, factory, vaultFarms);
  const farms = await getVaultsDatas(api, vaultConnectors);
  const sortedFarms = groupBy(farms, ({ type }) => `${type}`);

  const lpv2Farms = Object.keys(sortedFarms)
    .filter((key) => !key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  const lpv3Farms = Object.keys(sortedFarms)
    .filter((key) => key.includes("ERC721"))
    .flatMap((key) => sortedFarms[key]);

  await Promise.all([
    lpv2Balances(api, lpv2Farms),
    lpv3Balances(api, lpv3Farms)
  ])

  if (USDEX_PLUS) api.removeTokenBalance(USDEX_PLUS);
  if (gDEX) api.removeTokenBalance(gDEX);
  return sumTokens2({ api, resolveLP: true });
};

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    methodology: `The TVL represents the total liquidity in the vaults, excluding Dex-finance's own tokens`,
    tvl };
})