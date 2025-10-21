const {sumTokens2} = require("../helper/unknownTokens");

async function tvl(api) {
    const {R2USD, USDC} = config[api.chain]
    const collateralBalance = await api.call({
        abi: 'erc20:totalSupply',
        target: R2USD,
        params: [],
    });

    api.add(USDC, collateralBalance)
}

const config = {
    ethereum: {R2USD: '0x878706A8d521298f881A34Dc513b3EdE7a2490C7', USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},
    bsc: {R2USD: '0x740269008634785Ae4d973dB88aB46BA4e1dEc55', USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'}
}

Object.keys(config).forEach(chain => {

    module.exports[chain] = {tvl, methodology: 'Track the total supply of the R2USD token, which is continuously minted or burned in accordance with USDC.'}
})