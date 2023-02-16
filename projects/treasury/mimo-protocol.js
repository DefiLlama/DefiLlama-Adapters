const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x25Fc7ffa8f9da3582a36633d04804F0004706F9b";
const treasury1 = "0x3De64eed7A43C40E33dc837dec1119DcA0a677b4";

const treasurypolygon = "0x2046c0416A558C40cb112E5ebB0Ca764c3C5c32a";
const treasurypolygon1 = "0x6fb6a0a35b33e230d0149d49858e1a313a2ad4a7";

const treasuryfantom = "0x174162ddecE9d0b7B68fd945e38c3372C4C818ba";
const treasuryfantom1 = "0xA67FC89D5312812D3413A83418fc75ff78148a7E";

const MIMO = "0x90b831fa3bebf58e9744a14d638e25b4ee06f9bc";
const MIMOpolygon = "0xadac33f543267c4d59a8c299cf804c303bc3e4ac";
const MIMOfantom = "0x1d1764f04de29da6b90ffbef372d1a45596c4855";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//USDT
        '0xD533a949740bb3306d119CC777fa900bA034cd52',//CRV
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
        '0xba100000625a3754423978a60c9317c58a424e3D',//BAL
        '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7',//cvxCRV
        '0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D',//LQTY
        '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',//INV
        '0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5',//PSP
        '0x68037790A0229e9Ce6EaA8A99ea92964106C4703',//PAR
        '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',//3CRV
        '0x4104b135DBC9609Fc1A9490E61369036497660c8',//APY
        '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',//AURA

     ],
    owners: [treasury, treasury1, treasurypolygon, treasurypolygon1, treasuryfantom, treasuryfantom1],
    ownTokenOwners: [treasury, treasury1,treasurypolygon, treasurypolygon1, treasuryfantom, treasuryfantom1 ],
    ownTokens: [MIMO, MIMOfantom, MIMOpolygon],
  },
  polygon: {
    tokens: [
        nullAddress,
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'//USDC
    ]
  },
  fantom: {
    tokens: [
        nullAddress,
        '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'//USDC
    ]
  }
})