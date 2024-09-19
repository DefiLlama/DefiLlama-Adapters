
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tradeVault = '0x8772bB60EA1BBA8a7729a90ff1907855FD55ba83'
const lpVault = '0xbC268D619b406bdfCA1B4AC30d50Ba30AB38E96f'
const portfolioVault = '0x9099824Be9aB2b691ce0E478853Cb15Fb81FF677'

const elfEth = '0xcC0f1B3083F7c5DC5b30bA16F3c1E58b7488808d'
const elfBTC = '0xd97dc692E2fB2857472AF4523394a1115cb6e666'
const elfARB = '0xBEac49C1704A1613696bb558A674ce30Fdcc1814'
const elfUSD = '0x70B8117b3177a7CE42BEe021E89625f27E45b98C'
const elfETHPEPE = '0x4E0E37Fa2705f9dA83D779C13d810798a4D70A88'
const elfETHWIF = '0x0948f8DbB76C4af0151AB3515efe98925EFC4BA2'
const elfARBTrumpWin = '0xBEac49C1704A1613696bb558A674ce30Fdcc1814'
const elfETHDOGS = '0x1791bBCDf53dcBEa3C49D4f1A733c461306cD45D'

const PEPE = '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00'
const WIF = '0xA1b91fe9FD52141Ff8cac388Ce3F10BFDc1dE79d'
const SOL = '0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07'
const AAVE = '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196'

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        tradeVault,
        lpVault,
        portfolioVault,
        elfEth,
        elfBTC,
        elfARB,
        elfUSD,
        elfETHPEPE,
        elfETHWIF,
        elfARBTrumpWin,
        elfETHDOGS
      ],
      tokens: [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.DAI,
        ADDRESSES.arbitrum.USDT,
        PEPE,
        WIF,
        SOL,
        AAVE
      ]
    })
  },
};