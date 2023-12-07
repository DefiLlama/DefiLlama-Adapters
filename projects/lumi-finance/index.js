const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const AMMContract = "0x71E66919Fdc2e8687909c8dfe7A451dCf313A332";
const Arb2CRV = "0x7f90122BF0700F9E7e1F688fe926940E8839F353";
const Arb2CRVGauge = "0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f";
const Arb2CRVLUAUSDLP = "0xD2239B95890018a8f52fFD17d7F94C3A82f05389";

async function tvl(time, ethBlock, _b, { api }) {
    // Auto convert 2crv-gauge to 2crv
    // The protocol will lock 2CRV in Gauge to earn additional CRV rewards.
    // Here we need to convert it so that we can get the actual 2CRV value
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: AMMContract,
        params: [Arb2CRV],
    });
    api.add(Arb2CRV, collateralBalance)

    return sumTokens2({
        tokens: [
            Arb2CRVLUAUSDLP
        ], owner: AMMContract, api
    })
}

module.exports = {
    methodology: `We count the 2CRV and 2CRVLUAUSD-LP on ${AMMContract}`,
    arbitrum: {
        tvl
    }
}