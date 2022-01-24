const sdk = require("@defillama/sdk");
const { getBlock } = require('./helper/getBlock');
const { transformOptimismAddress } = require('./helper/portedTokens');

const WBTC = "0x68f180fcce6836688e9084f035309e29bf0a2095";
const bitANT = "0x5029c236320b8f15ef0a657054b84d90bfbeded3";
const bitBTC = "0xc98b98d17435aa00830c87ea02474c5007e1f272";

const tvlContracts = [
    {
        address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
        token: WBTC
    }, {
        address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
        token: WBTC
    }
];

const stakingContracts = [
    {
        address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
        token: bitANT
    }, {
        address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
        token: bitANT
    }, {
        address: '0x03bBa86E68c7DD733703cbCD44072082aF702d85', // farmV2
        token: bitBTC
    }, {
        address: '0xEcbaFFaa5c4e94219f4C166DaC9D4A1520CAd827', // farmV3
        token: bitBTC
    }
];

async function findBalances(contracts, block) {
    const transform = await transformOptimismAddress();
    const balances = {};

    const balanceOfs = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: c.token,
            params: c.address
        })),
        abi: "erc20:balanceOf",
        block,
        chain: 'optimism'
    })).output;
    
    for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].token == bitBTC) {
            await sdk.util.sumSingleBalance(
                balances, 
                transform(WBTC), 
                balanceOfs[i].output / 10 ** 16
            );
        } else {
            await sdk.util.sumSingleBalance(
                balances, 
                transform(contracts[i].token), 
                balanceOfs[i].output
            );
        };
    };
    return balances;
};

async function tvl(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, 'optimism', chainBlocks);
    return await findBalances(tvlContracts, block);
};

async function staking(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, 'optimism', chainBlocks);
    return await findBalances(stakingContracts, block);
};

module.exports = {
    optimism: {
        tvl,
        staking
    }
};