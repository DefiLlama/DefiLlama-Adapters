const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryAlgorand = "Q5Q5FC5PTYQIUX5PGNTEW22UJHJHVVUEMMWV2LSG6MGT33YQ54ST7FEIGA";
const treasuryAvalanche = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasuryEthereum = "0xd09cab631f02C8D8cE7009b3aA228bdF4aAC67BD";
const treasuryBase = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";
const treasuryBinanceSmartChain= "0xbf694bDFF7d4A0311863765e1f79A5C4f185e7d1";
const treasuryArbitrum = "0xd09cab631f02C8D8cE7009b3aA228bdF4aAC67BD";
const treasuryPolygon = "0x4095f3c4bF6D6505Bd32cFFE0918863Ebb6b2Df2";

module.exports = treasuryExports({
    algorand: {
        tokens: [
            ADDRESSES.algorand.ALGO,   // ALGO
            '971381860',               // fALGO
            ADDRESSES.algorand.USDC,
            '971384592',               // fUSDC
            ADDRESSES.algorand.GALGO,
            '971383839',               // fgALGO
            ADDRESSES.algorand.GOBTC,
            '971386173',               // fgoBTC
            '1058926737',              // WBTC
            '1067295154',              // fWBTC
            ADDRESSES.algorand.GOETH,
            '971387073',               // fgoETH
            '887406851',               // WETH
            '1067295558',              // fWETH
            '1134696561',              // xALGO
            '2611138444',              // fxALGO
            '246519683',               // SILVER$
            '1258524381',              // fSILVER$
            '227855942',               // EURS
            '1247054501',              // fEURS
            '246516580',               // GOLD$
            '1258524377',              // fGOLD$
            '887648583',               // SOL
            '1166980820',              // fSOL
            '893309613',               // WAVAX
            '1166979636',              // fWAVAX
            '1200094857',              // LINK
            '1216437148',              // fLINK
            ADDRESSES.algorand.USDT,
            '971385312',               // fUSDt
            ADDRESSES.algorand.OPUL,
            '1044269355',              // fOPUL
            ADDRESSES.algorand.GARD,
            '1060587336',              // fGARD
            '1163259470',              // MPL
            '1166982296',              // fMPL
        ],
        owners: [treasuryAlgorand],
        ownTokens: [],
    },
    avax: {
        tokens: [
            nullAddress,
            '0x0259617bE41aDA4D97deD60dAf848Caa6db3F228', // fAVAX
            ADDRESSES.avax.USDt,
            ADDRESSES.avax.USDC,
            '0x88f15e36308ED060d8543DA8E2a5dA0810Efded2', // fUSDC
            ADDRESSES.avax.SAVAX,
            '0x7033105d1a527d342bE618ab1F222BB310C8d70b', // fsAVAX
            ADDRESSES.avax.WETH_e,
            '0x795CcF6f7601edb41E4b3123c778C56F0F19389A', // fwETH_ava
            ADDRESSES.avax.BTC_b,
            '0x1C51AA1516e1156d98075F2F64e259906051ABa9', // fBTCb_ava
            '0xbc78D84Ba0c46dFe32cf2895a19939c86b81a777', // SolvBTC
            '0x307bCEC89624660Ed06C97033EDb7eF49Ab0EB2D', // fSolvBTC
            ADDRESSES.avax.JOE,
            '0x5e5a2007a8D613C4C98F425097166095C875e6eE', // fJOE
            '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3', // ggAVAX
            '0xAdA5Be2A259096fd11D00c2b5c1181843eD008DC', // fggAVAX
            '0xB6DF8914C084242A19A4C7fb15368be244Da3c75', // fETH_eth
            '0x51958ed7B96F57142CE63BB223bbd9ce23DA7125', // fETH_base
            '0x9936812835476504D6Cf495F4F0C718Ec19B3Aff', // fwBTC_eth
            '0x9eD81F0b5b0E9b6dE00F374fFc7f270902576EF7', // fcbBTC_base
            '0x89970d3662614a5A4C9857Fcc9D9C3FA03824fe3', // fBNB
            '0x18031B374a571F9e060de41De58Abb5957cD5258', // fETHB_bsc
            '0xC2FD40D9Ec4Ae7e71068652209EB75258809e131', // fBTCB_bsc
            '0x44E0d0809AF8Ee37BFb1A4e75D5EF5B96F6346A3', // fETH_arbitrum
            '0x1177A3c2CccDb9c50D52Fc2D30a13b2c3C40BCF4', // fARB
            '0x481cF0c02BF17a33753CE32f1931ED9990fFB40E', // fPOL
            '0x7054254933279d93D97309745AfbFF9310cdb570', // fwBTC_pol
            '0x88Ae56886233C706409c74c3D4EA9A9Ac1D65ab2', // fwETH_pol
        ],
        owners: [treasuryAvalanche],
        ownTokens: [],
    },
    ethereum: {
        tokens: [
            nullAddress,
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.WBTC,
            '0x7A56E1C57C7475CCf742a1832B028F0456652F97', // SolvBTC
        ],
        owners: [treasuryEthereum],
        ownTokens: [],
    },
    base: {
        tokens: [
            nullAddress,
            ADDRESSES.base.USDC,
            ADDRESSES.base.cbBTC,
            '0x3B86Ad95859b6AB773f55f8d94B4b9d443EE931f', // SolvBTC
        ],
        owners: [treasuryBase],
        ownTokens: [],
    },
    bsc: {
        tokens: [
            nullAddress,
            ADDRESSES.bsc.BTCB,
            ADDRESSES.bsc.ETH,
            '0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7', // SolvBTC
        ],
        owners: [treasuryBinanceSmartChain],
        ownTokens: [],
    },
    arbitrum: {
        tokens: [
            nullAddress,
            ADDRESSES.arbitrum.USDC_CIRCLE,
            ADDRESSES.arbitrum.ARB,
            '0x3647c54c4c2C65bC7a2D63c0Da2809B399DBBDC0', // SolvBTC
        ],
        owners: [treasuryArbitrum],
        ownTokens: [],
    },
    polygon: {
        tokens: [
            nullAddress,
            ADDRESSES.polygon.USDC_CIRCLE,
            ADDRESSES.polygon.WBTC,
            ADDRESSES.polygon.WETH_1,
        ],
        owners: [treasuryPolygon],
        ownTokens: [],
    },
})