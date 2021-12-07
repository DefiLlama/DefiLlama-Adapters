const { compoundExports } = require('../helper/compound');

const comptroller = {
    heco: "0x8955aeC67f06875Ee98d69e6fe5BDEA7B60e9770",
    bsc: "0x8Cd2449Ed0469D90a7C4321DF585e7913dd6E715",
    arbitrum: "0x3C13b172bf8BE5b873EB38553feC50F78c826284"
}

const ceth = {
    bsc: "0x14E134365F754496FBC70906b8611b8b49f66dd4",
    heco: "0x397c6D1723360CC1c317CdC9B2E926Ae29626Ff3",
}

const native = {
    bsc: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    heco: "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
}

const replacements = {
    "heco:0xA2F3C2446a3E20049708838a779Ff8782cE6645a": 'bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', // XRP
    "heco:0x843Af718EF25708765a8E0942F89edEae1D88DF0": 'bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47', // ADA
    "bsc:0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // BETH->WETH
    "heco:0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a": "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "heco:0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "heco:0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f": "0x6f259637dcd74c767781e37bc6133cd6a68aa161", // HT
    "heco:0xB6F4c418514dd4680F76d5caa3bB42dB4A893aCb": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // HECO-BETH -> BETH
    "heco:0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98": "0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
}

function transform(chain) {
    return addr => {
        const taddr= `${chain}:${addr}`
        return replacements[taddr] ?? taddr
    }
}

module.exports = {
    ...Object.keys(comptroller).reduce((exp, chain) => {
        exp[chain] = compoundExports(comptroller[chain], chain, ceth[chain], native[chain], transform(chain), symbol => ["MLP", "CLP", "SLP"].some(c => symbol.includes(c)))
        return exp
    }, {})
};
