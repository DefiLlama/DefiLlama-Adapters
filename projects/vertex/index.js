const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  "querier": "0x1693273B443699bee277eCbc60e2C8027E91995d",
  "feeCalculator": "0x2259440579447D0625a5E28dfF3E743d207e8890",
  "clearinghouse": "0xAE1ec28d6225dCE2ff787dcb8CE11cF6D3AE064f",
  "clearinghouseLiq": "0xca007C51Fc14eEA88252Cc4FD71e91E44026F020",
  "endpoint": "0xbbEE07B3e8121227AfCFe1E2B82772246226128e",
  "spotEngine": "0x32d91Af2B17054D575A7bF1ACfa7615f41CCEfaB",
  "perpEngine": "0xb74C78cca0FADAFBeE52B2f48A67eE8c834b5fd1"
}

const mantleConfig = {
  "querier": "0x71b50Ce0E7f7B920c1BAee3BDE00F2c3F7470395",
  //"feeCalculator": "",
  "clearinghouse": "0x5bcfC8AD38Ee1da5F45d9795aCaDf57D37FEC172",
  "clearinghouseLiq": "0x4b62c8179F85E399ce24fB279d44803F17118Aa4",
  "endpoint": "0x526D7C7ea3677efF28CB5bA457f9d341F297Fd52",
  "spotEngine": "0xb64d2d606DC23D7a055B770e192631f5c8e1d9f8",
  "perpEngine": "0x38080ee5fb939d045A9e533dF355e85Ff4f7e13D"
}

const seiConfig = {
  "querier": "0xecc3dE1cD86CB07c3763D21A45041791574964C2",
  //"feeCalculator": "",
  "clearinghouse": "0xaE1510367aA8d500bdF507E251147Ea50B22307F",
  "clearinghouseLiq": "0xa1a457b7bba489c3434D9Cb44b88101354CCF192",
  "endpoint": "0x2777268EeE0d224F99013Bc4af24ec756007f1a6",
  "spotEngine": "0x3E113cde3D6309e9bd45Bf7E273ecBB8b50ca127",
  "perpEngine": "0x0F54f46979C62aB73D03Da60eBE044c8D63F724f"
}

const baseConfig = {
  "querier": "0x57237f44e893468efDD568cA7dE1EA8A57d14c1b",
  "clearinghouse": "0xE46Cb729F92D287F6459bDA6899434E22eCC48AE",
  "clearinghouseLiq": "0xA35Cd71DDC7aab953377314a56a663E9706F1354",
  "endpoint": "0x92C2201D48481e2d42772Da02485084A4407Bbe2",
  "spotEngine": "0xe818be1DA4E53763bC77df904aD1B5A1C5A61626",
  "perpEngine": "0x5BD184F408932F9E6bA00e44A071bCCb8977fb47"
}

const sonicConfig = {
  "querier": "0xcC7895C391041231BfB5837A6923A4A26586d14f",
  "clearinghouse": "0x447c9aEe069F6A13007eb9D2d2a4Bb4Ad92AB721",
  "clearinghouseLiq": "0xd52e4Cb7D6e769a4957C9Da1bd33E0B12D956789",
  "endpoint": "0x2f5F835d778eBE8c28fC743E50EB9a68Ca93c2Fa",
  "spotEngine": "0xEa555556ab1973973e4f9d3378277Ab156de783d",
  "perpEngine": "0x9100770dE5268B969e540650D003D909d5012826"
}

const abstractConfig = {
  "querier": "0xC155f48b8212a7Dd16B336f1891c8E26D5DFE093",
  "clearinghouse": "0x1385bF2f06165cA0621aF047cF8666c256e1B1C2",
  "endpoint": "0x6B104c78D384D1C25CcEe2CA0698541e22eC60b2",
  "spotEngine": "0xA65B7Ae7A3a17B93dc382fA1487b4bc3BCEB6e3D",
  "perpEngine": "0x6950DD3d2da0cdc217ad56714c6BA0011171bcC4"
}

const avaxConfig = {
  "querier": "0xc523008CE1D7a5f4cc9f0a9a9c973aA19bE054BC",
  "clearinghouse": "0x7069798A5714c5833E36e70df8AeFAac7CEC9302",
  "endpoint": "0x36dc76c0C8FC6B4fFe73178C351BA5a3F2178eb3",
  "spotEngine": "0xCf0934104391eD43685Ae6aBf24F7CdE93F3Dfa8",
  "perpEngine": "0x207c0ef981b4F1FBDfccA88F025C917cFdF1e7C5"
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [config.clearinghouse, config.endpoint],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
    })
  },
  mantle: {
    tvl: sumTokensExport({
      owners: [mantleConfig.clearinghouse, mantleConfig.endpoint],
      tokens: [ADDRESSES.mantle.mETH, ADDRESSES.mantle.USDC, ADDRESSES.mantle.WETH, ADDRESSES.mantle.WMNT],
    })
  },
  sei: {
    tvl: sumTokensExport({
      owners: [seiConfig.clearinghouse, seiConfig.endpoint],
      tokens: [ADDRESSES.sei.USDC, ADDRESSES.sei.WSEI],
    })
  },
  base: {
    tvl: sumTokensExport({
      owners: [baseConfig.clearinghouse, baseConfig.endpoint],
      tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
    })
  },
  sonic: {
    tvl: sumTokensExport({
      owners: [sonicConfig.clearinghouse, sonicConfig.endpoint],
      tokens: [ADDRESSES.sonic.USDC_e, ADDRESSES.sonic.wS],
    })
  },
  abstract: {
    tvl: sumTokensExport({
      owners: [abstractConfig.clearinghouse, abstractConfig.endpoint],
      tokens: [ADDRESSES.abstract.USDC],
    })
  },
  avax: {
    tvl: sumTokensExport({
      owners: [avaxConfig.clearinghouse, avaxConfig.endpoint],
      tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.WAVAX],
    })
  }
}