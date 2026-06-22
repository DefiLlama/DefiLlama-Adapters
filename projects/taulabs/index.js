const { getCuratorExport } = require("../helper/curators");

const configs = {
    methodology: 'Count all assets deposited in TAU Labs vaults.',
    blockchains: {
        ethereum: {
            erc4626: [
                '0xb0f56bb0bf13ee05fef8cd2d8df5ffdfcac7a74f',
                '0x6f66b845604dad6e80b2a1472e6cacbbe66a8c40',
                '0x43a32d4f6c582f281c52393f8f9e5ace1d4a1e68',
                '0xe48cdd5ecec5aa53e630a7b4df12f79067b68dac',
                '0x63103375659d0aa94e9f35df15be01a3dd1ae9c0',
                '0xc50b2d51fd1e2ac67a9c09eaf63c24ea2465c64b',
                '0xc2a119ea6de75e4b1451330321cb2474eb8d82d4',
                '0x60e36a79c3d21120350e39b5ea59ae26b75ae74c',
                '0xd36f53497507e948df9f277cf8c3ececb09a1c1d',
                '0x604117f0c94561231060f56cd2ddd16245d434c5',
                '0xad685fec2066d7f5436f5804882998ba79725706',
                '0xdf8a0d3c90462c4c9b5a8697c119fa67cb84a874',
                '0x5fe86b1adee4b18f6a8c55ea0bdbb55e2e445159'
            ],
        },
        flow: {
            erc4626: [
                '0xc52E820d2D6207D18667a97e2c6Ac22eB26E803c',
            ]
        },
        plasma: {
            erc4626: [
                '0x0a71624ab3e8101f78d95dfc81e0f1f31128ed7a',
            ]
        },
        base: {
            erc4626: [
                '0x01a6ff6eb333c1393ef424f5894b18367f1499a8',
                '0xe883426b4fc84a7f5cc86415cabbef43e73a4cc8'
            ]
        }
    }
}

module.exports = getCuratorExport(configs)