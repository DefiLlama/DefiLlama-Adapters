const {treasuryExports, nullAddress} = require("../helper/treasury");

const treasuryContractsArbitrum = [
    "0x00dB9c5d0BF9B27dBaBb8A032cE7f9689cB1bB62",//flatmoneyMarketMaking
    "0x09493AEb0778A797F84BA578166540dBf8Df46cc",//treasury
    "0x26f7cbd49A4DC3321780AE8e7e0cb460f55a7511",//protocolTreasury
    "0xfbd2b4216f422dc1eee1cff4fb64b726f099def5",//torosManager
    "0xEd8329400c75434BdC4B2D394A6E60300D7D15C4",//lamaPay
    "0x13471A221D6A346556723842A1526C603Dc4d36B",//dhedgeDAO
    "0x86cA569eeF865f255e10d91E1C7b094a1737eeAe",//treasury

];

const treasuryContractsBase = [
    "0x9Dd44870aaD13320fcfD9C43b95D54B02f2aE646",//flatmoneyMarketMaking
    "0x4A83129Ce9C8865EF3f91Fc87130dA25b64F9100",//dhedgeDAO
    "0xd4e9313252a529dac2c74c87f41abc7641e023af",//treasury
    "0x5619AD05b0253a7e647Bd2E4C01c7f40CEaB0879",//torosManager
    "0xEE27793EBAf6a446c74C2cDd23Bba615e9472264",//protocolTreasury

];

const treasuryContractsEthereum = [
    "0x5F526A59BC92b4547aB0b044538412958347227b",//treasury
    "0xB76E40277B79B78dFa954CBEc863D0e4Fd0656ca",//dhedgeDAO
    "0xff44b48abad9cb7a2485f829e5c9a4d1cee623c9",//protocolTreasury
    "0xcdaec252ce9c176eb76d1e0ed7caa75c47ff96d1",//treasury

];

const treasuryContractsOptimism = [
    "0x90b1a66957914EbbE7a8df254c0c1E455972379C",//dhedgeDAO
    "0x19B6584cA17D3B50E298327dA83Ff36C6EFb71E5",//treasury
    "0x352Fb838A3ae9b0ef2f0EBF24191AcAf4aB9EcEc",//treasury
    "0x813123a13d01d3f07d434673fdc89cbba523f14d",//torosManager
    "0xD857e322351Dc56592e3D9181FBF65034EF4aef2",//protocolTreasury
    "0xe68d18f1e5766a2da140605fe635e3d55b9b422d",//treasury
];


const treasuryContractsPolygon = [
    "0x6583f33895B538DFdeeE234F2D34dF1033655de1",//treasury
    "0x6f005cbceC52FFb28aF046Fd48CB8D6d19FD25E3",//protocolTreasury
    "0xc715Aa67866A2FEF297B12Cb26E953481AeD2df4",//dhedgeDAO
    "0x72d33a83f2b31d31aaeb65e3ac7c06a8de0c8062",//treasury
    "0x090e7fbd87a673ee3d0b6ccacf0e1d94fb90da59",//torosManager
];

const DHT_ETHEREUM = "0xca1207647ff814039530d7d35df0e1dd2e91fa84";
const DHT_ARBITRUM = "0x8038f3c971414fd1fc220ba727f2d4a0fc98cb65";
const DHT_OPTIMISM = "0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151";
const DHT_POLYGON = "0x8c92e38eca8210f4fcbf17f0951b198dd7668292";
const DHT_BASE = "0x54bc229d1cb15f8b6415efeab4290a40bc8b7d84";

const MTA_ETHEREUM = "0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2";
const MTA_OPTIMISM = "0x929b939f8524c3be977af57a4a0ad3fb1e374b50";
const MTA_POLYGON = "0xf501dd45a1198c2e1b5aef5314a68b9006d842e0";

module.exports = treasuryExports({
    isComplex: true,
    complexOwners: [...treasuryContractsEthereum, ...treasuryContractsArbitrum, ...treasuryContractsBase, ...treasuryContractsOptimism, ...treasuryContractsPolygon],
    ethereum: {
        tokens: [nullAddress],
        owners: treasuryContractsEthereum,
        ownTokens: [DHT_ETHEREUM, MTA_ETHEREUM],
    },

    arbitrum: {
        tokens: [nullAddress],
        owners: treasuryContractsArbitrum,
        ownTokens: [DHT_ARBITRUM],
    },
    base: {
        tokens: [nullAddress],
        owners: treasuryContractsBase,
        ownTokens: [DHT_BASE],
    },
    optimism: {
        tokens: [nullAddress],
        owners: treasuryContractsOptimism,
        ownTokens: [DHT_OPTIMISM, MTA_OPTIMISM],
    },
    polygon: {
        tokens: [nullAddress],
        owners: treasuryContractsPolygon,
        ownTokens: [DHT_POLYGON, MTA_POLYGON],
    }

})