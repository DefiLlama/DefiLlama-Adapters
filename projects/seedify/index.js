const { pool2 } = require("../helper/pool2");
const { stakings } = require("../helper/staking");

const SFUND = { 
    bsc: "0x477bC8d23c634C154061869478bce96BE6045D12", 
    arbitrum: "0x560363bda52bc6a44ca6c8c9b4a5fadbda32fa60",
    ethereum: "0x560363bda52bc6a44ca6c8c9b4a5fadbda32fa60"
}

const pool2Token = "0x74fa517715c4ec65ef01d55ad5335f90dce7cc87";
const pool2Holder = "0x1F10564BAD9367CfF4247A138eBbA9a9aaeb789E";

const stakingContracts = { 
    bsc: [
        {
            address: '0xb667c499b88AC66899E54e27Ad830d423d9Fba69', // 7day
            token: SFUND
        }, {
            address: '0x027fC3A49383D0E7Bd6b81ef6C7512aFD7d22a9e', // 14day
            token: SFUND
        }, {
            address: '0x8900475BF7ed42eFcAcf9AE8CfC24Aa96098f776', // 30day
            token: SFUND
        }, {
            address: '0x66b8c1f8DE0574e68366E8c4e47d0C8883A6Ad0b', // 60day
            token: SFUND
        }, {
            address: '0x5745b7E077a76bE7Ba37208ff71d843347441576', // 90day
            token: SFUND
        },
        {
            address: '0xf420f0951f0f50f50c741f6269a4816985670054', // 180day
            token: SFUND
        },
        {
            address: '0x60b9f788f4436f0b5c33785b3499b2ee1d8dbfd4', // 30day
            token: SFUND
        }, {
            address: '0x5b384955ac3460c996402bf03736624a33e55273', // 90day
            token: SFUND
        }, {
            address: '0xd01650999bb5740f9bb41168401e9664b28ff47f', // 180day
            token: SFUND
        }, {
            address: '0x89aaab217272c89da91825d9effbe65ded384859', // 270day
            token: SFUND
        }, {
            address: '0x71d058369d39a8488d8e9f5fd5b050610ca788c0', // FARM
            token: SFUND
        },
    ], 
    arbitrum: [
        {
            address: '0x1d22275d58a836f8307c306110deafe22e360877', // 30day
            token: SFUND
        }, {
            address: '0xaae4355b30e18879a12e4e22283da901af47d6cd', // 90day
            token: SFUND
        }, {
            address: '0x9f07a4cf035f14c0160db2d7d94eb5a41f114805', // 180day
            token: SFUND
        }, {
            address: '0xc30be140f8ada0fdb0c97377c98ddbe8b343679a', // 270day
            token: SFUND
        }, {
            address: '0xc30be140f8ada0fdb0c97377c98ddbe8b343679a', // FARM
            token: SFUND
        }
    ],
    ethereum:[
        {
            address: '0x1d22275d58a836f8307c306110deafe22e360877', // 30day
            token: SFUND
        }, {
            address: '0xbcc572d3f2f619b082794a96a848a23c2a752fcf', // 90day
            token: SFUND
        }, {
            address: '0x453bbf5ad5011a89390a1e96042a19d5f4892754', // 180day
            token: SFUND
        }, {
            address: '0x569399bfca76e7664cec6510adc75f2811be2c5c', // 270day
            token: SFUND
        }, {
            address: '0x92572249d487a99c0ed746ee36aaf22a66c4ab67', // FARM
            token: SFUND
        },
    ]
};

module.exports = {}
Object.keys(stakingContracts).forEach(chain => {
    module.exports[chain] = {
        tvl: () => ({}),
        pool2: chain === "bsc" ? pool2(pool2Holder, pool2Token) : () => ({}),
        staking: stakings(stakingContracts[chain].map(i => i.address), SFUND[chain])
    }
});