const ADDRESSES = require('../helper/coreAssets.json')
const {hexToBytes, toU64, textToBytes, fromU64} = require('./bytes');
const sui = require("../helper/chain/sui");

const DUMMY_SENDER = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ProgrammableTransactionIndex = 0;
const ObjectIndex = 1;
const SharedObjectIndex = 1;
const MoveCallIndex = 0;
const StructIndex = 7;
const InputIndex = 1;

async function getPoolTokenBalance(tokenAddress, bridgeAddress, bridgeId) {
    const txBlockBytes = buildGetPoolBalanceTxBytes(tokenAddress, bridgeAddress, bridgeId);

    const inspectionResult = await sui.call(
        'sui_devInspectTransactionBlock',
        [DUMMY_SENDER, Buffer.from(txBlockBytes).toString('base64')],
        {withMetadata: true}
    );

    if (inspectionResult?.effects?.status?.status !== 'success') {
        throw new Error(JSON.stringify(inspectionResult, null, 2));
    }

    const results = inspectionResult.results;
    if (!results || !Array.isArray(results) || results.length === 0) {
        return '0';
    }
    const [data] = results.pop().returnValues.pop();
    return fromU64(data);
}

function buildGetPoolBalanceTxBytes(tokenAddress, packageId, bridgeId) {
    const kind = {
        "ProgrammableTransaction": {
            "inputs": [{
                "Object": {
                    "SharedObject": {
                        "objectId": bridgeId,
                        "initialSharedVersion": 472519562,
                        "mutable": false
                    }
                }
            }],
            "commands": [{
                "MoveCall": {
                    "package": packageId,
                    "module": "bridge_interface",
                    "function": "pool_balance",
                    "typeArguments": [tokenAddress],
                    "arguments": [{
                        "Input": 0,
                    }],
                }
            }]
        }
    };

    const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
    const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);
    const typeArg0 = parseSuiAddress(kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments[0]);
    const typeArg0_Module = textToBytes(typeArg0.module);
    const typeArg0_Name = textToBytes(typeArg0.name);
    const bytes = Uint8Array.from([ProgrammableTransactionIndex,
        kind.ProgrammableTransaction.inputs.length,
        ObjectIndex,
        SharedObjectIndex,
        ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
        ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
        kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
        kind.ProgrammableTransaction.commands.length,
        MoveCallIndex,
        ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
        moduleArg.length,
        ...moduleArg,
        functionArg.length,
        ...functionArg,
        kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.length,
        StructIndex,
        ...hexToBytes(typeArg0.address),
        typeArg0_Module.length,
        ...typeArg0_Module,
        typeArg0_Name.length,
        ...typeArg0_Name,
        typeArg0.typeParams.length,
        kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
        InputIndex,
        kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
        0
    ]);

    return bytes;
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
    getPoolTokenBalance,
};
