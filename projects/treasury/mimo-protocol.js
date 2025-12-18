const ADDRESSES  = require("../helper/coreAssets.json")
const { nullAddress, treasuryExports } = require("../helper/treasury");

const TREASURY = {
    arbitrum: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    avax: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    base: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    berachain: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    bsc: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    ethereum:  "0x25Fc7ffa8f9da3582a36633d04804F0004706F9b",
    fantom:'0x174162ddecE9d0b7B68fd945e38c3372C4C818ba',
    hyperliquid: "0x5C1232b4F5fdb34d487C934ADF5d4e5c01fE34be",
    ink: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    opitmism: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    polygon: "0x2046c0416A558C40cb112E5ebB0Ca764c3C5c32a",
    scroll: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    sei: "0x1AD681fa147f35AB7B35c7a289B1938Bc0171e8b",
    sonic: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    unichain: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95",
    xdai: "0xC5201FFE258a95Af986E7cD1fcaD54f3f63f2C95"
}

const BOUGHT_BACK_MIMO= {
    ethereum: "0x3De64eed7A43C40E33dc837dec1119DcA0a677b4",
    polygon: "0x6fb6a0a35b33e230d0149d49858e1a313a2ad4a7",
    fantom: "0xA67FC89D5312812D3413A83418fc75ff78148a7E",
}

const MIMO = {
    ethereum: "0x90b831fa3bebf58e9744a14d638e25b4ee06f9bc",
    polygon: "0xadac33f543267c4d59a8c299cf804c303bc3e4ac",
    fantom: "0x1d1764f04de29da6b90ffbef372d1a45596c4855",
}


const PRL = {
    arbitrum: "0xfD28f108e95f4D41daAE9dbfFf707D677985998E",
    base: "0xfD28f108e95f4D41daAE9dbfFf707D677985998E",
    ethereum: "0x6c0aeceeDc55c9d55d8B99216a670D85330941c3",
    optimism: "0xfD28f108e95f4D41daAE9dbfFf707D677985998E",
    polygon: "0x7790dd69aa10eD3f1271E41CD7222D2a7d2D5948",
    sonic: "0xfD28f108e95f4D41daAE9dbfFf707D677985998E"
}

const USDp = {
    arbitrum: "0x76A9A0062ec6712b99B4f63bD2b4270185759dd5",
    avax: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
    base: "0x76A9A0062ec6712b99B4f63bD2b4270185759dd5",
    berachain: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
    bsc: "0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c",
    ethereum:  "0x9B3a8f7CEC208e247d97dEE13313690977e24459",
    hyperliquid: "0xBE65F0F410A72BeC163dC65d46c83699e957D588",
    ink: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
    opitmism: "0x90337e484B1Cb02132fc150d3Afa262147348545",
    polygon: "0x1250304F66404cd153fA39388DDCDAec7E0f1707",
    scroll: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
    sei: "0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c",
    sonic: "0x08417cdb7F52a5021bB4eb6E0deAf3f295c3f182",
    unichain: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4",
    xdai: "0x9eE1963f05553eF838604Dd39403be21ceF26AA4"
}

const sUSDp = {
    avax: "0x9d92c21205383651610f90722131655a5b8ed3e0",
    base: "0x472eD57b376fE400259FB28e5C46eB53f0E3e7E7",
    ethereum:  "0x0d45b129dc868963025Db79A9074EA9c9e32Cae4",
    hyperliquid: "0x9B3a8f7CEC208e247d97dEE13313690977e24459",
    sonic: "0xe8a3DA6f5ed1cf04c58ac7f6A7383641e877517b",

}

const PAR = {
    ethereum: "0x68037790A0229e9Ce6EaA8A99ea92964106C4703",
}

module.exports = treasuryExports({
    arbitrum: {
        tokens: [
            nullAddress,
            USDp.arbitrum
        ],
        owners: [TREASURY.arbitrum],
        ownTokens: [PRL.arbitrum]
    },
    avax: {
        tokens: [
            nullAddress,
            USDp.avax,
            sUSDp.avax
        ],
        owners: [TREASURY.avax],
        ownTokens: []
    },
    base: {
        tokens: [
            nullAddress,
            "0xefd0248d2c05075815e0c38f0bd9c1645706df3f",// stakeDAO sdSPECTRA
            "0x3bcf4e84c32d90bb309eab58d97b70372c84bc2c",// BPT USDp-USDC
            USDp.base,
            sUSDp.base
        ],
        owners: [TREASURY.base],
        ownTokens: [PRL.base]
    },
    berachain: {
        tokens: [
            nullAddress,
            USDp.berachain
        ],
        owners: [TREASURY.berachain],
        ownTokens: []
    },
    bsc: {
        tokens: [
            nullAddress,
            USDp.bsc
        ],
        owners: [TREASURY.bsc],
        ownTokens: []
    },
    ethereum: {
        tokens: [
            nullAddress,
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.CRV,
            ADDRESSES.ethereum.USDC,
            "0xba100000625a3754423978a60c9317c58a424e3D",//BAL
            ADDRESSES.ethereum.cvxCRV,
            "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D",//LQTY
            "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68",//INV
            "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5",//PSP
            PAR.ethereum,
            "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",//3CRV
            "0x4104b135DBC9609Fc1A9490E61369036497660c8",//APY
            "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF",//AURA
            "0x1846c6cbe0d433e152fa358e5ff27968e18bce7c",// BPT 80PRL-20WETH
            USDp.ethereum,
            sUSDp.ethereum
        ],
        owners: [TREASURY.ethereum, BOUGHT_BACK_MIMO.ethereum],
        ownTokens: [PRL.ethereum, MIMO.ethereum]
    },
    fantom: {
        tokens: [
            nullAddress,
            ADDRESSES.fantom.USDC
        ],
        owners: [TREASURY.fantom, BOUGHT_BACK_MIMO.fantom],
        ownTokens: [MIMO.fantom,],
      },
    hyperliquid: {
        tokens: [
            nullAddress,
            USDp.hyperliquid,
            sUSDp.hyperliquid
        ],
        owners: [TREASURY.hyperliquid],
        ownTokens: []
    },
    ink: {
        tokens: [
            nullAddress,
            USDp.ink
        ],
        owners: [TREASURY.ink],
        ownTokens: []
    },
    optimism: {
        tokens: [
            nullAddress,
            USDp.opitmism
        ],
        owners: [TREASURY.opitmism],
        ownTokens: [PRL.optimism]
    },
    polygon: {
        tokens: [
            nullAddress,
            ADDRESSES.polygon.USDC,
            USDp.polygon
        ],
        owners: [TREASURY.polygon, BOUGHT_BACK_MIMO.polygon],
        ownTokens: [PRL.polygon, MIMO.polygon]
    },
    scroll: {
        tokens: [
            nullAddress,
            USDp.scroll
        ],
        owners: [TREASURY.scroll],
        ownTokens: []
    },
    sei: {
        tokens: [
            nullAddress,
            USDp.sei
        ],
        owners: [TREASURY.sei],
        ownTokens: []
    },
    sonic: {
        tokens: [
            nullAddress,
            ADDRESSES.sonic.USDC_e,// usde
            "0x80eede496655fb9047dd39d9f418d5483ed600df",// frxUSD
            "0x0732606cb924d617e2130582704e2d8e2db520a1",// BPT-Gami_scUSD-USDp
            "0x5e0de78aa8f62cba470039ff545423f726c606c4",// USDpfrxUSD
            USDp.sonic,
            sUSDp.sonic
        ],
        owners: [TREASURY.sonic],
        ownTokens: [PRL.sonic]
    },
    unichain: {
        tokens: [
            nullAddress,
            USDp.unichain
        ],
        owners: [TREASURY.unichain],
        ownTokens: []
    },
    xdai: {
        tokens: [
            nullAddress,
            USDp.xdai
        ],
        owners: [TREASURY.xdai],
        ownTokens: []
    }
})