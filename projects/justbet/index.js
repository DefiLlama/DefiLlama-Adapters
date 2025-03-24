var ethers = require("ethers");
const { vaultAdapterAbi, lockV2Abi } = require('./abis')
const { fetchWinrPrice, convertToUsd } = require('./helper')

const WINR_LOCKV2_CONTRACT = "0x7f3E35B41BDF7DBA6a90661918d0EfDDC6C15c3C";
const WINR_VAULT_ADAPTER_CONTRACT = "0xc942b79E51fe075c9D8d2c7501A596b4430b9Dd7";

const JUSTBET_BANKROLL_INDEXES = [
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000006',
    '0x0000000000000000000000000000000000000013',
    '0x0000000000000000000000000000000000000014',
    '0x0000000000000000000000000000000000000015',
    '0x0000000000000000000000000000000000000019'
];

const tvl = async (api) => {
    try {
        const [poolsDetails, lockStats, price] = await Promise.all([
            api.call({
                abi: vaultAdapterAbi,
                target: WINR_VAULT_ADAPTER_CONTRACT,
                params: [JUSTBET_BANKROLL_INDEXES]
            }),
            api.call({
                abi: lockV2Abi,
                target: WINR_LOCKV2_CONTRACT
            }),
            fetchWinrPrice()
        ])
    
        const [details, amounts] = [poolsDetails[0], poolsDetails[1]];
        const pools = [];
    
        details.forEach((detail, index) => {
            pools.push({
                detail: detail,
                amount: amounts[index]
            });
        });
    
        const poolTvl = pools.reduce((acc, data) => {
            const poolSupply = convertToUsd(
                data.detail.bankrollTokenAddress,
                data.amount.bankrollTokenPrice,
                data.amount.bankrollAmount
            );
            acc += poolSupply;
            return acc;
        }, 0);
    
        const winrPrice = price.stats.reverse()[0][1];
        const totalWINRLocked = lockStats[1];
        
        const stakedWinr = ethers.formatEther(totalWINRLocked, 18) * winrPrice;
        const tvl = poolTvl + stakedWinr;

        return tvl;
    } catch (error) {
        return {}
    }
}

module.exports = {
    winr: {
        tvl
    },
};
