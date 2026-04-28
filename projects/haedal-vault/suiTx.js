const sui = require("../helper/chain/sui");

async function getVaultTokenBalance(packageId, typeParams, vaultId, poolId) {
    // Fetch initialSharedVersion for both shared objects
    const [vaultObj, poolObj] = await Promise.all([
        sui.call('sui_getObject', [vaultId, { showOwner: true }]),
        sui.call('sui_getObject', [poolId, { showOwner: true }]),
    ]);
    const vaultVersion = vaultObj?.owner?.Shared?.initial_shared_version;
    const poolVersion = poolObj?.owner?.Shared?.initial_shared_version;
    if (vaultVersion === undefined) throw new Error(`Vault ${vaultId} is not a shared Sui object`);
    if (poolVersion === undefined) throw new Error(`Pool ${poolId} is not a shared Sui object`);

    const txBlockBytes = sui.buildProgrammableMoveCallBytes({
        packageId,
        module: 'pool',
        functionName: 'get_vault_assets',
        typeArguments: typeParams,
        sharedObjects: [{
            objectId: vaultId,
            initialSharedVersion: vaultVersion,
            mutable: true
        }, {
            objectId: poolId,
            initialSharedVersion: poolVersion,
            mutable: true
        }],
    });
    const inspectionResult = await sui.devInspectTransactionBlock(txBlockBytes);

    if (inspectionResult?.effects?.status?.status !== 'success') {
        throw new Error(JSON.stringify(inspectionResult, null, 2));
    }

    const returnValues = inspectionResult?.results?.[0]?.returnValues;
    const coinAData = returnValues?.[0]?.[0];
    const coinBData = returnValues?.[1]?.[0];
    if (
        !Array.isArray(returnValues)
        || returnValues.length < 2
        || !Array.isArray(coinAData)
        || !Array.isArray(coinBData)
        || coinAData.length !== 8
        || coinBData.length !== 8
    ) {
        const payload = JSON.stringify({ returnValues, coinAData, coinBData, inspectionResult }, null, 2);
        throw new Error(`Unexpected get_vault_assets devInspect return payload before fromU64: ${payload}`);
    }
    const coinA = sui.fromU64(coinAData).toString();
    const coinB = sui.fromU64(coinBData).toString();
    return [coinA, coinB]
}

module.exports = {
    getVaultTokenBalance,
};
