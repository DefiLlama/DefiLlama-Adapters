const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport, nullAddress } = require("../helper/sumTokens");

//ETH

const vault1eth = "0x894107b7b5051409f279e8300774b2f62febe057"
const vault2eth = "0xD2238E8c085E5059F8DFC52256530210bc7250F6"
const vault3eth = "0x7B8FDfCf79E72a9a8e656958647D139C0e16EA19"
const vault4eth = "0xfe83475880d3592833249baaacfec5ed51e29d82"
const vault5eth = "0x873089bC765a1C0AFAd48e34fCd305d17D81be87"
const vault6eth = "0x450aD18B4442ce2972Af2a7A12439984db4Afaf9"
const vault7eth = "0x763a0ca93af05ade98a52dc1e5b936b89bf8b89a"

const portx = "0x104F3152D8ebFC3f679392977356962Ff36566aC"

//BSC CHAIN

const vault1bsc = "0x2cd90158baae285010a5ed7c549c2e5b4c0715f4";
const vault2bsc = "0x873089bC765a1C0AFAd48e34fCd305d17D81be87"

//Polygon

const vault1poly= "0xc07cd7fcda887119bff8e1eed2256ad433bee125";
const vault2poly = "0x873089bC765a1C0AFAd48e34fCd305d17D81be87"

//Fantom

const vault1ftm= "0xc30da5144d1b9f47ff86345fee14fe2da94c7203";
const vault2ftm = "0x873089bC765a1C0AFAd48e34fCd305d17D81be87"


const config = {
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.BUSD,
        "0x8B3870Df408fF4D7C3A26DF852D41034eDa11d81",
        "0x0000000DE40dfa9B17854cBC7869D80f9F98D823",
        // "0x42Baf1f659D765C65ADE5BB7E08eb2C680360d9d", //CORNOPIA 
        // "0xBb3A8FD6Ec4bF0FDc6Cd2739b1e41192D12B1873", OBI 
        "0x3496B523e5C00a4b4150D6721320CdDb234c3079",
        "0x5F0bc16D50F72d10b719dBF6845DE2E599eb5624",
        "0x7659CE147D0e714454073a5dd7003544234b6Aa0",
        "0x80D55c03180349Fff4a229102F62328220A96444",
        "0xD567B5F02b9073aD3a982a099a23Bf019FF11d1c",
        "0x4674a4F24C5f63D53F22490Fb3A08eAAAD739ff8",
        "0x2653891204F463fb2a2F4f412564b19e955166aE",
        "0x43A96962254855F16b925556f9e97BE436A43448",
        "0x4da0C48376C277cdBd7Fc6FdC6936DEE3e4AdF75",
        "0x8E0fE2947752BE0d5ACF73aaE77362Daf79cB379",
        "0xFe459828c90c0BA4bC8b42F5C5D44F316700B430"
     ],
    owners: [vault1eth, vault2eth, vault3eth, vault4eth, vault5eth, vault6eth, vault7eth],
    ownTokens: [portx],
  },
  bsc: {
    tokens: [ 
        nullAddress,
        "0x5B6bf0c7f989dE824677cFBD507D9635965e9cD3",
        ADDRESSES.bsc.USDC,
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.BTCB,
        ADDRESSES.bsc.WBNB,
        "0xF93f6b686f4A6557151455189a9173735D668154"
     ],
    owners: [vault1bsc, vault2bsc],
  },
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.USDC,
        ADDRESSES.polygon.BUSD,
        ADDRESSES.polygon.USDT,
        "0x04d80CdF20285d5Ac590BBAd97C887b9C6781774",
        "0x0000000000004946c0e9F43F4Dee607b0eF1fA1c",
        "0xa5Eb60CA85898f8b26e18fF7c7E43623ccbA772C"
     ],
    owners: [vault1poly, vault2poly],
  },
  fantom: {
    tokens: [ 
        nullAddress,
        "0x40DF1Ae6074C35047BFF66675488Aa2f9f6384F3",
        "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355"
     ],
    owners: [vault1ftm, vault2ftm],
  },
  cardano: {
    owners: [
      'addr1xxcqzje930yw0hykwhf0a89l62dmjwqqpfzdsppf8rhv9rg2czf3yffs8ar450sw50w4xn3pxxwvkz25s4ygh7pjq23ql4slcu', // multi sig cold storage
      'addr1v9nygflpcedeg004tfghu9hdxhg29sv9550sdyvvu4gxepq5ps9ra', // hot bridge address 1
      'addr1vxku68zc6wrewfkrdaduw2t8yj7nsh0z6mg8vwuxh7pwjxckzjkjq' // hot bridge address 2
    ],
  }
}

Object.keys(config).forEach(chain => {
  const {owners, tokens} = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens })
  }
})