const ADDRESSES = require("../helper/coreAssets.json");
const {
  sumTokens2,
} = require("../helper/unwrapLPs.js");
const {
  getStargateLpValues,
  getCompoundUsdcValues,
  _getLogs,
  unwrapCreamTokens,
  genericUnwrapCvxDeposit,
  _getFolioLogs,
  getFolioTotalAssets,
  _getStakingTokenLogs,
  getStakingTokenAssets,
} = require("./helper");

const chainConfigs = {
  ethereum: {
    deployerAddresses: [
      "0xFd6CC4F251eaE6d02f9F7B41D1e80464D3d2F377",
      "0x5c46b718Cd79F2BBA6869A3BeC13401b9a4B69bB",
      "0x1bd20253c49515d348dad1af70ff2c0473fea358",
      "0x15480f5b5ed98a94e1d36b52dd20e9a35453a38e",
      "0x43587CAA7dE69C3c2aD0fb73D4C9da67A8E35b0b",
      "0x2204ec97d31e2c9ee62ead9e6e2d5f7712d3f1bf"
    ],
    rsr: "0x320623b8E4fF03373931769A31Fc52A4E78B5d70",
    vault: "0xaedcfcdd80573c2a312d15d6bb9d921a01e4fb0f",
    fromBlock: 16680995,
    erc4626Wrapped: ["0xaa91d24c2f7dbb6487f61869cd8cd8afd5c5cab2"],
    subgraph_url: "https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-mainnet/api",
    folioDeployers: [
      { address: "0xaafb13a3df7ce70c140e40c959d58fd5cc443cba", startBlock: 21818973 },
      { address: "0x4c64ef51cb057867e40114dcfa3702c2955d3644", startBlock: 21848440 },
      { address: "0xBE3B47587cEeff7D48008A0114f51cD571beC63A", startBlock: 22897712 }
    ],
    governanceDeployers: [
      { address: "0xCB061c96Ff76E027ea99F73ddEe9108Dd6F0c212", startBlock: 21818973 },
      { address: "0xE926577a152fFD5f5036f88BF7E8E8D3652B558C", startBlock: 22081811 },
      { address: "0x5Bed18AcA50E6057E6658Fe8498004092EedCDcF", startBlock: 22897712 }
    ],
  },
  base: {
    deployerAddresses: [
      "0xf1B06c2305445E34CF0147466352249724c2EAC1",
      "0x9C75314AFD011F22648ca9C655b61674e27bA4AC",
      "0xfd18ba9b2f9241ce40cde14079c1cda1502a8d0a",
    ],
    rsr: "0xab36452dbac151be02b16ca17d8919826072f64a",
    fromBlock: 5000000,
    subgraph_url: "https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-base/api",
    folioDeployers: [
      { address: "0xe926577a152ffd5f5036f88bf7e8e8d3652b558c", startBlock: 25958000 },
      { address: "0xb8469986840bc9b7bb101c274950c02842755911", startBlock: 27803169 },
      { address: "0xA203AA351723cf943f91684e9F5eFcA7175Ae7EA", startBlock: 32733863 }
    ],
    governanceDeployers: [
      { address: "0xdBd9C5a83A3684E80D51fd1c00Af4A1fbfE03D14", startBlock: 25703976 },
      { address: "0x6a66E6E209C7120819cC033d9397E5022C22C872", startBlock: 27803169 },
      { address: "0x1A7D043c84fe781b6df046fEfCf673F71110208D", startBlock: 32733863 }
    ],
  },
  arbitrum: {
    deployerAddresses: [
      "0xfd7eb6b208e1fa7b14e26a1fb10ffc17cf695d68"
    ],
    rsr: "0xCa5Ca9083702c56b481D1eec86F1776FDbd2e594",
    fromBlock: 64464546,
    subgraph_url: "https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/reserve-arbitrum/api",
  },
  bsc: {
    folioDeployers: [
      { address: "0x100E0eFDd7a4f67825E1BE5f0493F8D2AEAc00bb", startBlock: 53679824 },
      { address: "0x5Bed18AcA50E6057E6658Fe8498004092EedCDcF", startBlock: 60701791 }
    ],
    governanceDeployers: [
      { address: "0xBD49CeAC629d7131B8A975B582AcDAeB5C049bAD", startBlock: 53679824 },
      { address: "0x270d928b9Ee38BAD93601D197256390b3c3C13Ec", startBlock: 60701791 }
    ],
  },
};

async function tvl(api) {
  const chain = api.chain;
  const config = chainConfigs[chain];

  if (!config) return;

  if (config.folioDeployers) {
    const folios = await _getFolioLogs(api, config.folioDeployers);
    await getFolioTotalAssets(api, folios);
  }

  if (!config.deployerAddresses) return;

  let { erc4626Wrapped = [] } = config;
  erc4626Wrapped = erc4626Wrapped.map((i) => i.toLowerCase());
  const ownerTokens = config.vault
    ? [
      [
        [
          ADDRESSES.ethereum.USDC, //usdc
          "0x8e870d67f660d95d5be530380d0ec0bd388289e1", //pax
          ADDRESSES.ethereum.TUSD, //tusd
          ADDRESSES.ethereum.BUSD, //busd
        ],
        config.vault,
      ],
    ]
    : [];
  const blacklistedTokens = [config.rsr];
  const fluxListWithOwner = [];
  const creationLogs = await _getLogs(api, config);

  const mains = creationLogs.map((i) => i.main);
  const rTokens = creationLogs.map((i) => i.rToken);

  const backingManagers = await api.multiCall({
    abi: "address:backingManager",
    calls: mains,
  });
  const basketHandlers = await api.multiCall({
    abi: "address:basketHandler",
    calls: mains,
  });
  const basketRes = await api.multiCall({
    abi: "function quote(uint192, uint8) view returns (address[], uint256[])",
    calls: basketHandlers.map((i) => ({ target: i, params: [0, 0] })),
  });

  let processedWrappers = new Set();
  let wrapperBalances = {};
  const allTokens = basketRes.flatMap(([tokens], i) => {
    ownerTokens.push([tokens, rTokens[i]]);
    ownerTokens.push([tokens, backingManagers[i]]);
    return tokens;
  });
  const allRTokens = basketRes.flatMap(([tokens], i) =>
    tokens.map(() => rTokens[i])
  );
  const allManagers = basketRes.flatMap(([tokens], i) =>
    tokens.map(() => backingManagers[i])
  );
  const allNames = await api.multiCall({ abi: "string:name", calls: allTokens, });


  const aTokenWrappersV2 = allTokens.filter((_, i) => allNames[i].startsWith("Static Aave") && allNames[i].includes("interest"));
  const aTokenWrappersV3 = allTokens.filter((_, i) => allNames[i].startsWith("Static Aave") && !allNames[i].includes("interest"));
  const cUsdcV3Wrappers = allTokens.filter((_, i) => allNames[i].startsWith("Wrapped cUSDCv3"));
  const cUsdtV3Wrappers = allTokens.filter((_, i) => allNames[i].startsWith("Wrapped cUSDTv3"));
  const morphoWrappers = allTokens.filter((_, i) => allNames[i].startsWith("Tokenised Morpho"));
  const stargateLpWrappers = allTokens.filter((_, i) => allNames[i].startsWith("Wrapped Stargate"));
  const cTokenWrappers = allTokens.filter(
    (_, i) => /^Compound.*Vault$/.test(allNames[i])
  );
    const convexTokensAndOwners = [];

  allTokens.forEach((token, i) => {
    if (!allNames[i].startsWith("Flux ")) return;
    fluxListWithOwner.push([token, allRTokens[i]]);
    fluxListWithOwner.push([token, allManagers[i]]);
    blacklistedTokens.push(token);
    return true;
  });

  allTokens.forEach((token, i) => {
    if (!allNames[i].endsWith("Convex Deposit")) return;
    blacklistedTokens.push(token);
    convexTokensAndOwners.push([token, allRTokens[i]]);
    convexTokensAndOwners.push([token, allManagers[i]]);
  });

  let cTokens = await api.multiCall({ abi: "address:underlying", calls: cTokenWrappers, });
  let aTokensV2 = await api.multiCall({ abi: "address:ATOKEN", calls: aTokenWrappersV2, });
  let aTokensV3 = await api.multiCall({ abi: "address:aToken", calls: aTokenWrappersV3, });
  let morphoUnderlyingTokens = await api.multiCall({ abi: "address:asset", calls: morphoWrappers, });
  let morphoUnderlyingBalances = await api.multiCall({ abi: "uint256:totalAssets", calls: morphoWrappers, });

  blacklistedTokens.push(
    ...aTokenWrappersV2,
    ...aTokenWrappersV3,
    ...stargateLpWrappers,
    ...cTokenWrappers,
    ...cUsdcV3Wrappers,
    ...cUsdtV3Wrappers,
    ...morphoWrappers,
  );

  cTokens.forEach((v, i) => ownerTokens.push([[v], cTokenWrappers[i]]));
  aTokensV2.forEach((v, i) => ownerTokens.push([[v], aTokenWrappersV2[i]]));
  aTokensV3.forEach((v, i) => ownerTokens.push([[v], aTokenWrappersV3[i]]));
  morphoUnderlyingTokens.forEach((v, i) =>
    api.add(v, morphoUnderlyingBalances[i])
  );

  if (stargateLpWrappers.length)
    await getStargateLpValues(
      api,
      stargateLpWrappers,
      processedWrappers,
      wrapperBalances
    );

  if (cUsdcV3Wrappers.length) {
    await getCompoundUsdcValues(
      api,
      cUsdcV3Wrappers,
      processedWrappers,
      wrapperBalances
    );
  }

  if (cUsdtV3Wrappers.length) {
    await getCompoundUsdcValues(
      api,
      cUsdtV3Wrappers,
      processedWrappers,
      wrapperBalances
    );
  }

  await genericUnwrapCvxDeposit(api, convexTokensAndOwners)
  await unwrapCreamTokens(api, fluxListWithOwner);

  await sumTokens2({ api, ownerTokens, blacklistedTokens });
}

async function staking(api) {
  const chain = api.chain;
  const config = chainConfigs[chain];
  const creationLogs = await _getLogs(api, config);
  const stRsrs = creationLogs.map((i) => i.stRSR);
  return sumTokens2({ api, owners: stRsrs, tokens: [config.rsr] });
}

async function indexStaking(api) {
  const chain = api.chain;
  const config = chainConfigs[chain];
  
  if (config.governanceDeployers) {
    const stakingTokenLogs = await _getStakingTokenLogs(api, config.governanceDeployers);
    await getStakingTokenAssets(api, stakingTokenLogs);
  }
}

async function combinedStaking(api) {
  const chain = api.chain;
  const config = chainConfigs[chain];
  
  if (config.rsr && config.deployerAddresses) {
    await staking(api);
  }
  
  if (config.governanceDeployers) {
    await indexStaking(api);
  }
}

module.exports = {
  ethereum: {
    tvl,
    staking: combinedStaking,
  },
  base: {
    tvl,
    staking: combinedStaking,
  },
  arbitrum: {
    tvl,
    staking,
  },
  bsc: {
    tvl,
    staking: indexStaking,
  },
  methodology: `TVL accounts for the underlying ERC20 collateral which back RTokens and Index Protocol folios. Staking includes both Reserve Protocol RSR staking and Index Protocol governance token staking.`,
};
