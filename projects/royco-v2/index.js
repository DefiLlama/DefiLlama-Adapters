const { getLogs } = require("../helper/cache/getLogs");

const config = {
    "ethereum": {
        factoryAddress: "0xD567cCbb336Eb71eC2537057E2bCF6DB840bB71d",
        factoryFromBlock: 24385420,
    },
    "avax": {
        factoryAddress: "0xD567cCbb336Eb71eC2537057E2bCF6DB840bB71d",
        factoryFromBlock: 77273727,
    },
};

// Reserve addresses -- balances held by multisigs and earn vaults
// that are not deposited into Royco Market Vaults
const reserves = {
    "ethereum": [
        {
            owner: "0x170ff06326ebb64bf609a848fc143143994af6c8", // Multisig
            tokens: [
                "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", // aaveUSDC (Aave v3)
            ],
        },
        {
            owner: "0xcd9f5907f92818bc06c9ad70217f089e190d2a32", // Earn vault
            tokens: [
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
            ],
        },
    ],
};

const tvl = async ({ api, chain }) => {
    // Market Vaults
    const { factoryFromBlock, factoryAddress } = config[chain];

    const marketDeployedLogs = await getLogs({
        api,
        target: factoryAddress,
        eventAbi: "event MarketDeployed((address seniorTranche, address juniorTranche, address kernel, address accountant) roycoMarket, (string seniorTrancheName, string seniorTrancheSymbol, string juniorTrancheName, string juniorTrancheSymbol, bytes32 marketId, address seniorTrancheImplementation, address juniorTrancheImplementation, address kernelImplementation, address accountantImplementation, bytes seniorTrancheInitializationData, bytes juniorTrancheInitializationData, bytes kernelInitializationData, bytes accountantInitializationData, bytes32 seniorTrancheProxyDeploymentSalt, bytes32 juniorTrancheProxyDeploymentSalt, bytes32 kernelProxyDeploymentSalt, bytes32 accountantProxyDeploymentSalt, (address target, bytes4[] selectors, uint64[] roles)[] roles) params)",
        onlyArgs: true,
        fromBlock: factoryFromBlock,
    });

    const seniorTranches = marketDeployedLogs.map(log => log.roycoMarket.seniorTranche);
    const juniorTranches = marketDeployedLogs.map(log => log.roycoMarket.juniorTranche);

    const totalAssetsAbi = "function totalAssets() view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";

    const seniorAssets = await api.multiCall({ abi: 'address:asset', calls: seniorTranches });
    const juniorAssets = await api.multiCall({ abi: 'address:asset', calls: juniorTranches });
    const stTotalAssets = await api.multiCall({ abi: totalAssetsAbi, calls: seniorTranches });
    const jtTotalAssets = await api.multiCall({ abi: totalAssetsAbi, calls: juniorTranches });

    stTotalAssets.forEach((result, i) => {
        api.add(seniorAssets[i], BigInt(result.stAssets));
    });

    jtTotalAssets.forEach((result, i) => {
        api.add(juniorAssets[i], BigInt(result.jtAssets));
    });

    // Reserves — multisig and earn vaults
    const chainReserves = reserves[chain];
    if (chainReserves) {
        await api.sumTokens({
            tokensAndOwners: chainReserves.flatMap(({ owner, tokens }) =>
                tokens.map(token => [token, owner])
            ),
        });
    }
};

module.exports = {
    methodology: "TVL is computed by reading MarketDeployed events from the Royco V2 factory and summing totalAssets() across senior and junior tranches.",
    ethereum: { tvl },
    avax: { tvl },
}