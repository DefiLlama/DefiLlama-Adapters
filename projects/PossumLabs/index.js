const sdk = require("@defillama/sdk");

const portalsContractAddress = "0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa";
const timeRiftContractAddress = "0x6df4EF024089ab148078fdD88f5BF0Ee63248D3E";
const hlpToken = "0x4307fbDCD9Ec7AEA5a1c2958deCaa6f316952bAb";
const flashToken = "0xc628534100180582E43271448098cb2c185795BD";

const portalAbi = {
    "inputs": [],
    "name": "totalPrincipalStaked",
    "outputs": [
        {
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
};

const timeRiftAbi = {
    "inputs": [],
    "name": "stakedTokensTotal",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
};

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const symbols = {};

    const portalsStaked = await sdk.api.abi.call({
        target: portalsContractAddress,
        abi: portalAbi,
        block: chainBlocks.arbitrum,
        chain: 'arbitrum',
        skipCache: true
    });

    const timeRiftStaked = await sdk.api.abi.call({
        target: timeRiftContractAddress,
        abi: timeRiftAbi,
        block: chainBlocks.arbitrum,
        chain: 'arbitrum',
        skipCache: true
    });

    sdk.util.sumSingleBalance(balances, 'arbitrum:' + hlpToken, portalsStaked.output);
    sdk.util.sumSingleBalance(balances, 'arbitrum:' + flashToken, timeRiftStaked.output);

    return balances;
}

module.exports = {
    methodology: "TVL is equal to the amount staked in the Portals and TimeRift contracts",
    arbitrum: {
        tvl
    },
};