const { ethers } = require('ethers');
const { getBlock } = require('../helper/http');

const chain = 'acala';
const euphrates = '0x7Fe92EC600F15cD25253b421bc151c51b0276b7D';
const ldotAddr = '0x0000000000000000000100000000000000000003';
const wtdotAddr = '0xe1bD4306A178f86a9214c39ABCD53D021bEDb0f9';

const ETH_RPC_ACALA = 'https://eth-rpc-acala.aca-api.network';
const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
];
const wtdotAbi = [
    "function withdrawRate() view returns (uint256)",
];

const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_ACALA);

const getErc20Balances = async (address, tokenAddrs, blockTag) => {
    let balances = {};
    for (const tokenAddr of tokenAddrs) {
        const token = new ethers.Contract(tokenAddr, erc20Abi, provider);
        const [balance, decimals] = await Promise.all([
            token.balanceOf(address, { blockTag }),
            token.decimals({ blockTag })
        ]);

        balances[tokenAddr] = ethers.utils.formatUnits(balance, decimals);
    }

    return balances;
};

const getWtdotRate = async (blockTag) => {
    const wtdot = new ethers.Contract(wtdotAddr, wtdotAbi, provider);
    const rate = await wtdot.withdrawRate({ blockTag });

    return rate / 1e18;
}

async function tvl(timestamp) {
    const block = await getBlock(timestamp, chain, {});

    const [balances, exchangeRate] = await Promise.all([
        getErc20Balances(euphrates, [ldotAddr, wtdotAddr], block),
        getWtdotRate(block),
    ]);

    const dotAmount = balances[wtdotAddr] * exchangeRate;

    const res = {
        "liquid-staking-dot": balances[ldotAddr],
        polkadot: dotAmount,
    }

    return res;
}

module.exports = {
    timetravel: true,
    start: 1695657600,
    methodology: 'total ldot and tdot locked in the euphrates contract',
    acala: {
        tvl,
    }
}