const config = {
    hyperliquid: {
        mHYPE: "0xdabb040c428436d41cecd0fb06bcfdbaad3a9aa8",
        HYPE: "0x0d01dc56dcaaca66ad901c959b4011ec",
        HYPE_DECIMALS: 8,
    },
};
const mHYPEAbi = require("./abis/mHYPE.json");

const WEI_DECIMALS = 18;

async function tvl(api) {
    const { mHYPE, HYPE, HYPE_DECIMALS } = config[api.chain]

    const exchangeRateToHype = await api.call({ 
        abi: mHYPEAbi.exchangeRate, 
        target: mHYPE 
    });

    const totalsupplyMHYPE = await api.call({ 
        abi: mHYPEAbi.totalSupply, 
        target: mHYPE 
    });

    const totalSupplyHypeInWei = totalsupplyMHYPE * exchangeRateToHype / 10 ** WEI_DECIMALS;
    const totalSupplyHype = (totalSupplyHypeInWei * (10 ** HYPE_DECIMALS)) / 10 ** WEI_DECIMALS;

    api.add(HYPE, totalSupplyHype);
}

Object.keys(config).forEach((chain) => {
    module.exports[chain] = {
        tvl,
    }
});