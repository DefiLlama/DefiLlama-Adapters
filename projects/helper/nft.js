const sdk = require('@defillama/sdk')
const { nullAddress, sumTokens2 } = require('./unwrapLPs')
const { latestAnswer } = require("./abis/chainlink.json")

const nftPriceFeeds = {
  ethereum: [
    {   // Art Blocks
      token: "0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a",
      oracle: "0xEbF67AB8cFF336D3F609127E8BbF8BD6DD93cd81",
    },
    {   // Azuki
      token: "0xed5af388653567af2f388e6224dc7c4b3241c544",
      oracle: "0xA8B9A447C73191744D5B79BcE864F343455E1150",
    },
    {   // BAKC
      token: "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623",
      oracle: "0x17297f67e84b4fD7301161398F87a7f22a44DA7f",
    },
    {   // BAYC
      token: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      oracle: "0x352f2Bc3039429fC2fe62004a1575aE74001CfcE",
    },
    {   // Beanz
      token: "0x306b1ea3ecdf94aB739F1910bbda052Ed4A9f949",
      oracle: "0x5524b79F4E2D1289fcCc8Aa78eaE34D8C6daBE37",
    },
    {   // CloneX
      token: "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b",
      oracle: "0x021264d59DAbD26E7506Ee7278407891Bb8CDCCc",
    },
    {   // Cool Cats
      token: "0x1A92f7381B9F03921564a437210bB9396471050C",
      oracle: "0xF49f8F5b931B0e4B4246E4CcA7cD2083997Aa83d",
    },
    {   // Cryptoadz
      token: "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6",
      oracle: "0xFaA8F6073845DBe5627dAA3208F78A3043F99bcA",
    },
    {   // Cryptodickbutts
      token: "0x42069ABFE407C60cf4ae4112bEDEaD391dBa1cdB",
      oracle: "0x22Ab04060Bb1891b84F19334076B051240BA92E1",
    },
    {   // Cryptopunks
      token: "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6",
      oracle: "0x01B6710B01cF3dd8Ae64243097d91aFb03728Fdd",
    },
    {   // Cyberbrokers
      token: "0x892848074ddeA461A15f337250Da3ce55580CA85",
      oracle: "0x2d6696be4fce9c6707dea0c328a7842aea80ed51",
    },
    {   // Decentraland
      token: "0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d",
      oracle: "0xf0294D938624859Ea5705C6F4Cb2436cc840d04b",
    },
    {   // Digidaigaku
      token: "0xd1258DB6Ac08eB0e625B75b371C023dA478E94A9",
      oracle: "0x071FE3f051cA7D41fF1Cd08A94368B0d0703f9b1",
    },
    {   // Doodles
      token: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
      oracle: "0x027828052840a43Cc2D0187BcfA6e3D6AcE60336",
    },
    {   // Forgotten Rune Wizards Cult
      token: "0x521f9C7505005CFA19A8E5786a9c3c9c9F5e6f42",
      oracle: "0x4da2765FFCFC0eEd625F450B9A1A1C89c919DbE8",
    },
    {   // Goblin Town
      token: "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e",
      oracle: "0x11a67a301b80BC9b8cC0A5826b84876fb8542CaF",
    },
    {   // LobsterDAO
      token: "0x026224A2940bFE258D0dbE947919B62fE321F042",
      oracle: "0xd2fa1CAcF83C9889f215d0492BFceE717D149a6e",
    },
    {   // MAYC
      token: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
      oracle: "0x1823C89715Fe3fB96A24d11c917aCA918894A090",
    },
    {   // Meebits
      token: "0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7",
      oracle: "0x29Ea94760f211A338eCef4a31F09d8Cef1795755",
    },
    {   // Milady
      token: "0x5Af0D9827E0c53E4799BB226655A1de152A425a5",
      oracle: "0xf04205d907aD314c717EFec0d2D3d97626130E19",
    },
    {   // Moonbirds
      token: "0x23581767a106ae21c074b2276d25e5c3e136a68b",
      oracle: "0x16De3b3D1620675D7BD240abEf4CE4F119462Bbd",
    },
    {   // Nouns
      token: "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03",
      oracle: "0x363B6E3648847B988B7C8E3A306e0881BdEE24Bd",
    },
    {   // Otherdeed
      token: "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258",
      oracle: "0xAa6128fAdBd64aAd55d2A235827d976508649509",
    },
    {   // Pudgy Penguins
      token: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
      oracle: "0xaC9962D846D431254C7B3Da3AA12519a1E2Eb5e7",
    },
    {   // Sandbox Land
      token: "0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38",
      oracle: "0xa62b4828a9f4b2e3cba050c6befdd8f0a0056af4",
    },
    {   // VeeFriends
      token: "0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb",
      oracle: "0x35bf6767577091E7f04707c0290b3f889e968307",
    },
    {   // World of Women
      token: "0xe785e82358879f061bc3dcac6f0444462d4b5330",
      oracle: "0xDdf0B85C600DAF9e308AFed9F597ACA212354764",
    },
  ]
}

async function getNFTPrices({chain = 'ethereum', block} = {}) {
  const feeds = nftPriceFeeds[chain]
  const calls = feeds.map(i => ({ target: i.oracle}))
  const { output } = await sdk.api.abi.multiCall({
    abi: latestAnswer,
    calls,
    chain, block,
  })
  const prices = {}
  output.forEach((data, i) => prices[feeds[i].token.toLowerCase()] = data.output)
  return prices
}

async function sumNFTTokens({ chain = 'ethereum', block, owners = [], tokens, balances = {} }) {
  if (!tokens) tokens = nftPriceFeeds[chain].map(i => i.token)
  const balances1 = await sumTokens2({ chain, block, owners, tokens, transformAddress: i => i.toLowerCase() })
  const prices = await getNFTPrices({ chain, block, })
  Object.entries(balances1).forEach(([token, balance]) => {
    const price = prices[token]
    if (price)  sdk.util.sumSingleBalance(balances,nullAddress, balance * price, chain)
  })
  return balances
}

module.exports = {
  nftPriceFeeds,
  getNFTPrices,
  sumNFTTokens,
}