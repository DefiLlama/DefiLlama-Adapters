const sdk = require('@defillama/sdk');

const GDAI = "0xd85E038593d7A098614721EaE955EC2022B9B91B";
const GDAI_VAULT = "0xb4ff7E61F825A5B80E20F6070fCC959Ea136Ed88";
const GNS = "0x18c11FD286C5EC11c3b683Caa813B77f5163A122";
const GNS_STAKING = "0x6B8D3C08072a020aC065c467ce922e3A36D3F9d6";
const VOLTGNS = "0x39ff5098081FBE1ab241c31Fe0a9974FE9891d04";

const STAKING_INFO_ABI = {
    "inputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "name": "users",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "stakedTokens",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "debtDai",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "stakedNftsCount",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "totalBoostTokens",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "harvestedRewardsDai",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
};

async function tvl(_, _1, _2, { api }) {
    const balances = {};

    const gdaiAmount = await api.call({
        abi: "erc20:balanceOf",
        target: GDAI,
        params: [GDAI_VAULT]
    });
    const gnsAmount = (await api.call({
        abi: STAKING_INFO_ABI,
        target: GNS_STAKING,
        params: [VOLTGNS]
    }))[0];

    await sdk.util.sumSingleBalance(balances, GDAI, gdaiAmount, api.chain);
    await sdk.util.sumSingleBalance(balances, GNS, gnsAmount, api.chain);

    return balances;
}

module.exports = {
    timetravel: true,
    methodology: "counts the tokens used as collateral in vaults for VOLT stablecoin loans",
    arbitrum: {
        tvl,
    }
};