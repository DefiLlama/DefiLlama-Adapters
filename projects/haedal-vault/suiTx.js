const sui = require("../helper/chain/sui");

async function getVaultTokenBalance(packageId, typeParams, vaultId, poolId) {
    const [vaultVersion, poolVersion] = await Promise.all([
        sui.getInitialSharedVersion(vaultId),
        sui.getInitialSharedVersion(poolId),
    ]);

    const txBlockBytes = sui.buildProgrammableMoveCallBytes({
        packageId,
        module: 'pool',
        functionName: 'get_vault_assets',
        typeArguments: typeParams,
        sharedObjects: [
            { objectId: vaultId, initialSharedVersion: vaultVersion, mutable: true },
            { objectId: poolId, initialSharedVersion: poolVersion, mutable: true },
        ],
    });

    const inspectionResult = await sui.devInspectTransactionBlock(txBlockBytes);

    const returnValues = inspectionResult?.results?.[0]?.returnValues;
    const coinAData = returnValues?.[0]?.[0];
    const coinBData = returnValues?.[1]?.[0];
    if (!Array.isArray(coinAData) || !Array.isArray(coinBData) || coinAData.length !== 8 || coinBData.length !== 8) {
        throw new Error(`Unexpected get_vault_assets return: ${JSON.stringify(returnValues)}`);
    }
    return [sui.fromU64(coinAData).toString(), sui.fromU64(coinBData).toString()];
}

module.exports = {
    getVaultTokenBalance,
};
