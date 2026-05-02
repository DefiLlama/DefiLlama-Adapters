// cian yield layer
const config = {
  ethereum: {
    rawVaults: [
      "0xB13aa2d0345b0439b064f26B82D8dCf3f508775d",
      "0xd87a19fF681AE98BF10d2220D1AE3Fbd374ADE4e",
      "0x9fdDAD44eD6b77e6777dC1b16ee4FCcCBaF0A019",
      "0x6c77bdE03952BbcB923815d90A73a7eD7EC895D1",
      "0xcc7E6dE27DdF225E24E8652F62101Dab4656E20A",
      "0xd4Cc9b31e9eF33E392FF2f81AD52BE8523e0993b",
      "0x3D086B688D7c0362BE4f9600d626f622792c4a20",
      "0x8D76e7847dFbEA6e9F4C235CADF51586bA3560A2",

      // LST
      "0xcDd374F491fBF3f4FcF6E9023c99043774005137",
      "0xB8c0c50D255B93f5276549cbA7F4bf78751A5D34",
      "0x88508306E43FCe43F7f2c1e7D73c88cf6a523f6C",
      "0xD34f59E172cF3915f56C96A3037Ac554A7399D77", // PYUSD Optimized Long-Short (variant 1)

      // sei
      // "0x7fF67093231CE8DBC70c0A65b629ed080e66a7F0", // pumpbtc
      "0xe5DfcE87E75e92C61aeD31329716Cf3D85Cd9C8c" // ylBTCLST

    ],
    preVaults: [
      "0x6dD1736E15857eE65889927f40CE3cbde3c59Cb2", // rseth
      // "0x83B5ab43b246F7afDf465103eb1034c8dfAf36f2", // pumpbtc  - more tokens are in this vault atm compared to total supply of pumpBTC
      "0xf7cb66145c5Fbc198cD4E43413b61786fb12dF95", // unibtc
      "0xC8C3ABB76905caD1771448B5520F052FE83e8B0E", // wbeth
      "0xEFe4c96820F24c4BC6b2D621fD5FEb2B46adC1Df", // usda
      "0xe4794e30AA190baAA953D053fC74b5e50b3575d7", // susda
      "0x0186b03AC7C14a90d04D2b1e168869F618D149c5", // ylpumpbtc
      "0x16c6B81Eb1B148326dc6D0bFCE472f68F3518187", // ylunibtc
      "0x8073588bdfe8DBf0375e57425A29E8dC4003C3E6", // ylrseth
      "0x0A9Ea3a5A26ac80535046F0Fd004523CF5c03bb5", // wsteth
      "0xc71FB1bC07a65375121cdea87AD401207dD745b8", // ylBTCLST
    ]
  },
  optimism: {
    rawVaults: ["0x907883da917ca9750ad202ff6395C4C6aB14e60E"]
  },
  bsc: {
    rawVaults: ["0xEa5f10A0E612316A47123D818E2b597437D19a17"]
  },
  arbitrum: {
    rawVaults: ["0xE946Dd7d03F6F5C440F68c84808Ca88d26475FC5", "0xED5f727107BdAC99443bAE317E0eF38239719e87", '0x15cbFF12d53e7BdE3f1618844CaaEf99b2836d2A']
  },
  base: {
    rawVaults: ["0x9B2316cfe980515de7430F1c4E831B89a5921137"]
  },
  scroll: {
    rawVaults: ["0xEa5f10A0E612316A47123D818E2b597437D19a17"]
  },
  mantle: {
    rawVaults: [
      "0x6B2BA8F249cC1376f2A02A9FaF8BEcA5D7718DCf",
      "0x74D2Bef5Afe200DaCC76FE2D3C4022435b54CdbB"
    ]
  }
};

const abis = {
  getVaultParams: "function getVaultParams() view returns (tuple(address underlyingToken, string name, string symbol, uint256 marketCapacity, uint256 managementFeeRate, uint256 managementFeeClaimPeriod, uint256 maxPriceUpdatePeriod, uint256 revenueRate, uint256 exitFeeRate, address admin, address rebalancer, address feeReceiver, address redeemOperator))"
}

const tvl = async (api) => {
  const { rawVaults, preVaults = [] } = config[api.chain]
  const vaults = [...new Set(rawVaults.map(i => i.toLowerCase()))]
  const [vaultParams, assets, rawStrategies] = await Promise.all([
    api.multiCall({ abi: abis.getVaultParams, calls: preVaults }),
    api.multiCall({ abi: 'address:asset', calls: preVaults }),
    api.multiCall({ abi: 'address[]:strategies', calls: preVaults })
  ])

  const seenRebalancers = new Set();

  for (const [index, _preVault] of preVaults.entries()) {
    const redeemOperator = vaultParams[index].redeemOperator;
    const asset = assets[index];
    const strategies = rawStrategies[index];
    if (!redeemOperator || !asset || !strategies) continue;

    const rebalancers = await api.multiCall({
      calls: strategies,
      abi: 'address:rebalancer',
      permitFailure: true,
    });

    if (!rebalancers) continue;

    const uniqueRebalancers = [...new Set(rebalancers.filter(r => !!r))];

    for (const rebalancer of uniqueRebalancers) {
      if (seenRebalancers.has(rebalancer)) continue;
      seenRebalancers.add(rebalancer);

      const balances = await api.multiCall({
        calls: rawVaults.map((v) => ({ target: v, params: [rebalancer] })),
        abi: 'erc20:balanceOf',
      });

      rawVaults.forEach((v, i) => {
        const balance = Number(balances[i]);
        if (balance > 0) {
          api.add(v, -balance);
        }
      });
    }
  }
  
  if (api.chain === 'ethereum') {
    await api.sumTokens({ token: '0xc152d5A599F83B3d0098cbAdb23FcE95F27Ff30B', owner: '0x821d2e44984168d278C698fD742d5138c01bAAA2' })
  }
  
  return await api.erc4626Sum({ calls: [...vaults, ...preVaults], isOG4626: true, permitFailure: true })
}

Object.keys(config).forEach((chain) => {
  module.exports.doublecounted = true
  module.exports[chain] = { tvl }
})
