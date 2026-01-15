const ADDRESSES = require('../helper/coreAssets.json')
const { hexToBytes, toU64, textToBytes, desU64 } = require('./bytes');
const sui = require("../helper/chain/sui");

const DUMMY_SENDER = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ProgrammableTransactionIndex = 0;
const ObjectIndex = 1;
const SharedObjectIndex = 1;
const MoveCallIndex = 0;
const StructIndex = 7;
const InputIndex = 1;

async function getVaultTokenBalance(packageId, typeParams, vaultId, poolId) {

    const txBlockBytes = buildGetVaultAssetsTxBytes(packageId, typeParams, vaultId, poolId);

    const inspectionResult = await sui.call(
        'sui_devInspectTransactionBlock',
        [DUMMY_SENDER, Buffer.from(txBlockBytes).toString('base64')],
        { withMetadata: true }
    );

    if (inspectionResult?.effects?.status?.status !== 'success') {
        throw new Error(JSON.stringify(inspectionResult, null, 2));
    }

    const returnValues = inspectionResult.results[0].returnValues;
    const coinAData = returnValues[0][0];
    const coinBData = returnValues[1][0];
    const coinA = desU64(Uint8Array.from(coinAData)).toString();
    const coinB = desU64(Uint8Array.from(coinBData)).toString();
    return [coinA, coinB]
}

function buildGetVaultAssetsTxBytes(packageId, typeParams, vaultId, poolId) {
    const kind = {
        "ProgrammableTransaction": {
            "inputs": [{
                "Object": {
                    "SharedObject": {
                        "objectId": vaultId,
                        "initialSharedVersion": 0,
                        "mutable": true
                    }
                },
            }, {
                "Object": {
                    "SharedObject": {
                        "objectId": poolId,
                        "initialSharedVersion": 0,
                        "mutable": true
                    }
                },
            }],
            "commands": [{
                "MoveCall": {
                    "package": packageId,
                    "module": "pool",
                    "function": "get_vault_assets",
                    "typeArguments": typeParams,
                    "arguments": [{
                        "Input": 0,
                    }, {
                        "Input": 1,
                    }]
                }
            }]
        }
    };

    const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
    const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

    const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
        const parsed = parseSuiAddress(t);
        return {
            address: parsed.address,
            module: parsed.module,
            name: parsed.name,
            typeParams: parsed.typeParams || []
        };
    });

    let bytes = [
        ProgrammableTransactionIndex,
        kind.ProgrammableTransaction.inputs.length,
    ];

    bytes = bytes.concat([
        ObjectIndex,
        SharedObjectIndex,
        ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
        ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
        kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
    ]);

    bytes = bytes.concat([
        ObjectIndex,
        SharedObjectIndex,
        ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
        ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
        kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
    ]);

    bytes = bytes.concat([
        kind.ProgrammableTransaction.commands.length,
        MoveCallIndex,
        ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
        moduleArg.length,
        ...moduleArg,
        functionArg.length,
        ...functionArg,
    ]);

    bytes = bytes.concat([
        typeArgs.length,
    ]);

    for (const typeArg of typeArgs) {
        const typeModule = textToBytes(typeArg.module);
        const typeName = textToBytes(typeArg.name);

        bytes = bytes.concat([
            StructIndex,
            ...hexToBytes(typeArg.address),
            typeModule.length,
            ...typeModule,
            typeName.length,
            ...typeName,
            typeArg.typeParams.length,
        ]);
    }
    bytes = bytes.concat([
        kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
        InputIndex,
        kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
        0,
        InputIndex,
        kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
        0,
    ]);

    return Uint8Array.from(bytes);
}

function parseSuiAddress(str) {
    const STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;
    const structMatch = str.match(STRUCT_REGEX);
    if (structMatch) {
        return {
            address: structMatch[1],
            module: structMatch[2],
            name: structMatch[3],
            typeParams: [],
        };
    }

    throw new Error(`Encountered unexpected token when parsing type args for ${str}`);
}

module.exports = {
    getVaultTokenBalance,
};
