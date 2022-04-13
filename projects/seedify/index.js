const sdk = require("@defillama/sdk");
const { getBlock } = require('../helper/getBlock');
const { transformBscAddress } = require('../helper/portedTokens');
const { pool2 } = require("../helper/pool2");

const SFUND = "0x477bC8d23c634C154061869478bce96BE6045D12";
const pool2Token = "0x74fa517715c4ec65ef01d55ad5335f90dce7cc87";
const pool2Holder = "0x1F10564BAD9367CfF4247A138eBbA9a9aaeb789E";



const stakingContracts = [
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
];

async function findBalances(contracts, block) {
    const transform = await transformBscAddress();
    const balances = {};

    const balanceOfs = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: c.token,
            params: c.address
        })),
        abi: "erc20:balanceOf",
        block,
        chain: 'bsc'
    })).output;
    
    for (let i = 0; i < contracts.length; i++) {           
        
        sdk.util.sumSingleBalance(
            balances,
            transform(contracts[i].token),
            balanceOfs[i].output
        );
        
    };
    return balances;
};



async function staking(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, 'bsc', chainBlocks);
    return await findBalances(stakingContracts, block);
};

module.exports = {
    bsc: {
        tvl: () => ({}),
        pool2: pool2(pool2Holder, pool2Token, "bsc"),
        staking
    }
};