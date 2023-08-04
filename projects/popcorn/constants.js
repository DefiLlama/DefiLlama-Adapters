const ADDRESSES = require('../helper/coreAssets.json')
const ADDRESSES_ = {

  ethereum: {
    popLocker: "0xeEE1d31297B042820349B03027aB3b13a9406184",  // done
    rewardsEscrow: "0xb5cb5710044D1074097c17B7535a1cF99cBfb17F", // done
    butter: "0xdf203cefcd2422e4dca95d020cb9eb986788f7ae", // done
    butterV2: "0x109d2034e97ec88f50beebc778b5a5650f98c124", // done

    popUsdcUniswapPool: "0x9fEE77D8B5050A55c16D0446E6eAb06a6A24cd06",
    popUsdcGelatoLp: "0xbba11b41407df8793a89b44ee4b50afad4508555",
    popUsdcGelatoLpStaking: "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45",

    pop: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",

    usdc: ADDRESSES.ethereum.USDC,
    dai: ADDRESSES.ethereum.DAI,

    // for butter
    setBasicIssuanceModule: "0xd8EF3cACe8b4907117a45B0b125c68560532F94D",
    butterBatch: "0xCd979A9219DB9A353e29981042A509f2E7074D8B",

    ycrvFRAX: "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139",
    ycrvRai: "0x2D5D4869381C4Fce34789BC1D38aCCe747E295AE",
    ycrvMusd: "0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757",
    ycrvAlusd: "0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8",

    crvFRAXMetapool: "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
    crvRaiMetapool: "0x618788357D0EBd8A37e763ADab3bc575D54c2C7d",
    crvMusdMetapool: "0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6",
    crvAlusdMetapool: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",

    ycrvMim: "0x2DfB14E32e2F8156ec15a2c21c3A6c053af52Be8",

    // for threeX
    yCrv3Eur: "0x5AB64C599FcC59f0f2726A300b03166A395578Da",
    yCrvSUSD: "0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A",
    crv3EurMetapool: "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571",
    crvSUSDMetapool: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
    crvSUSD: "0xC25a3A3b969415c80451098fa907EC722572917F",
    threeX: "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3",
    
    vaultRegistry: '0x007318Dc89B314b47609C684260CfbfbcD412864',
    
  },
  arbitrum: {
    rewardsEscrow: "0x0c0991cb6e1c8456660a49aa200b71de6158b85c",
    pop: "0x68ead55c258d6fa5e46d67fc90f53211eab885be",

  },
  polygon: {
    pop: "0xc5b57e9a1e7914fda753a88f24e5703e617ee50c",
    usdc: ADDRESSES.polygon.USDC,
    popLocker: "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA",
    rewardsEscrow: "0xa82cAA79F35f7d6B6f1EC1971878F3474C894565",

    popUsdcGelatoLp: "0xe8654f2b0a038a01bc273a2a7b7c48a76c0e58c5",

    arrakisPool: "0x6dE0500211bc3140409B345Fa1a5289cb77Af1e4",
    arrakisPoolStaking: "0xd3836EF639A74EA7398d34c66aa171b1564BE4bc",

    vaultRegistry: '0x2246c4c469735bCE95C120939b0C078EC37A08D0'
  },
  bsc: {
    rewardsEscrow: "0x0C0991CB6e1c8456660A49aa200B71de6158b85C",
    pop: "0xE8647Ea19496E87c061bBAD79f457928b2F52b5a",
  },
}

module.exports = {
  ADDRESSES:ADDRESSES_
}