const { treasuryExports } = require("../helper/treasury");

// from https://docs.uniswap.org/contracts/v4/deployments
module.exports = treasuryExports({
    ethereum: { owners: ["0x000000000004444c5dc75cB358380D2e3dE08A90"] },
    optimism: { owners: ["0x9a13f98cb987694c9f086b1f5eb990eea8264ec3"] },
    base: { owners: ["0x498581ff718922c3f8e6a244956af099b2652b2b"] },
    arbitrum: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
    polygon: { owners: ["0x67366782805870060151383f4bbff9dab53e5cd6"] },
    blast: { owners: ["0x1631559198a9e474033433b2958dabc135ab6446"] },
    zora: { owners: ["0x0575338e4c17006ae181b47900a84404247ca30f"] },
    wc: { owners: ["0xb1860d529182ac3bc1f51fa2abd56662b7d13f33"] },
    ink: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
    soneium: { owners: ["0x360e68faccca8ca495c1b759fd9eee466db9fb32"] },
    avax: { owners: ["0x06380c0e0912312b5150364b9dc4542ba0dbbc85"] },
    bsc: { owners: ["0x28e2ea090877bf75740558f6bfb36a5ffee9e9df"] },
})