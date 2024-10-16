const { default: BigNumber } = require("bignumber.js");

const contracts = [
    "0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB",
    "0x165D74d2DEFe37794371eB63c63999ab5620DBfB"
];

const TOKENS = [
    //"0x829e43f497b8873fA5c83FcF665b96A39a1FBeD6", // MCT doesn't support on Defillama
    "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd", // axlUSDC on Haqq
    "0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717"  // USDC on Haqq
];

async function tvl(api) {
    const balancesMap = {};

    for (let token of TOKENS) {
        for (let contract of contracts) {
            try {
                const balance = await api.call({
                    abi: 'erc20:balanceOf',
                    target: token,
                    params: [contract]
                });

                if (!balancesMap[token]) balancesMap[token] = BigNumber(0);
                balancesMap[token] = balancesMap[token].plus(BigNumber(balance));
            } catch (error) {
                console.error(`Failed to fetch balance for token ${token} at contract ${contract}:`, error);
            }
        }
    }

    Object.entries(balancesMap).forEach(([token, balance]) => {
        api.add(token, balance.toString());
    });

    return api.getBalances();
}

module.exports = {
    methodology: "TVL counts the tokens deposited in the MCT pools.",
    islm: { tvl },
};