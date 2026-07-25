const { getLogs2 } = require("../helper/cache/getLogs");

const config = {
    "ethereum": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 24650849,
    },
    "avax": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 80312789,
    },
    "arbitrum": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 441493793,
    },
};

const tvl = async (api) => {
    // Market Vaults
    const { factoryFromBlock, factoryAddress } = config[api.chain];

    const marketDeployedLogs = await getLogs2({
        api,
        target: factoryAddress,
        eventAbi: "event MarketDeployed((address seniorTranche, address juniorTranche, address kernel, address accountant) roycoMarket, (string seniorTrancheName, string seniorTrancheSymbol, string juniorTrancheName, string juniorTrancheSymbol, address seniorTrancheImplementation, address juniorTrancheImplementation, address kernelImplementation, address accountantImplementation, bytes seniorTrancheInitializationData, bytes juniorTrancheInitializationData, bytes kernelInitializationData, bytes accountantInitializationData, bytes32 seniorTrancheProxyDeploymentSalt, bytes32 juniorTrancheProxyDeploymentSalt, bytes32 kernelProxyDeploymentSalt, bytes32 accountantProxyDeploymentSalt, (address target, bytes4[] selectors, uint64[] roles)[] roles) params)",
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
};

module.exports = {
    methodology: "TVL is computed by reading MarketDeployed events from the Royco V2 factory and summing totalAssets() across senior and junior tranches.",
    ethereum: { tvl },
    avax: { tvl },
    arbitrum: { tvl },
}
