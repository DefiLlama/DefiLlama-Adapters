const config = require("./config")
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