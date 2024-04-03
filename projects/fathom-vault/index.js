const sdk = require("@defillama/sdk");

const getDefaultQueueAbi = {
    "constant": true,
    "inputs": [],
    "name": "getDefaultQueue",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
};

const getVaultsAbi = {
    "constant": true,
    "inputs": [],
    "name": "getVaults",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
};

const chain = 'xdc';

const FathomVaultFactoryAddress = "0x0c6e3fd64D5f33eac0DCCDd887A8c7512bCDB7D6";
const FXD = '0x49d3f7543335cf38Fa10889CCFF10207e22110B5';

const fetchFXDBalances = async (timestamp, block, chainBlocks) => {
    const balances = {};
    const blockXdc = chainBlocks[chain];

    const vaultAddressesResult = await sdk.api.abi.call({
        target: FathomVaultFactoryAddress,
        abi: getVaultsAbi,
        block: blockXdc,
        chain,
    });

    const vaultAddresses = vaultAddressesResult.output;

    const queueAddresses = await Promise.all(vaultAddresses.map(async (vaultAddress) => {
        const result = await sdk.api.abi.call({
            target: vaultAddress,
            abi: getDefaultQueueAbi,
            block: blockXdc,
            chain,
        });
        return result.output;
    }));

    const flattenedQueueAddresses = queueAddresses.flat();

    const allAddresses = [...vaultAddresses, ...flattenedQueueAddresses];

    for (const address of allAddresses) {
        const balance = await sdk.api.erc20.balanceOf({
            target: FXD,
            owner: address,
            block: blockXdc,
            chain,
        });

        sdk.util.sumSingleBalance(balances, `${chain}:${FXD}`, balance.output);
    }

    return balances;
};

module.exports = {
    xdc: {
        tvl: sdk.util.sumChainTvls([
            fetchFXDBalances,
        ]),
    },
};

