const sdk = require("@defillama/sdk");

const abi = require("./abi.json");

const { staking } = require("../helper/staking");

const BigNumber = require('bignumber.js')

const { unwrapBalancerPool } = require('../helper/unwrapLPs')

const AURA_BOOSTER = "0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10"

const AURA_BOOSTER_2 = "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234"

const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"

const addresses = {

  aura: "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf",

  auraLocker: "0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC",

  bal: "0xba100000625a3754423978a60c9317c58a424e3d",

  veBal: "0xC128a9954e6c874eA3d62ce62B468bA073093F25",

  auraDelegate: "0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2",

  bal80eth20: "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56",

};

async function tvl(_, block) {

    try {

        let pools = await Promise.all([AURA_BOOSTER, AURA_BOOSTER_2].map(async (booster) => {

            const poolList = await sdk.api2.abi.fetchList({

                target: booster,

                block,

                itemAbi: abi.poolInfo,

                lengthAbi: abi.poolLength,

            });

            if (!Array.isArray(poolList)) {

                console.error(`Unexpected data format for pool list: ${JSON.stringify(poolList)}`);

                return [];

            }

            return poolList;

        }));

        pools = pools.flat();

        // Additional input validation and error handling can be added as needed

        const poolIds = (await sdk.api.abi.multiCall({

            calls: pools.map(pool => ({ target: pool.lptoken })),

            abi: abi.getPoolId,

            block,

        })).output;

        const poolTokensInfo = (await sdk.api.abi.multiCall({

            calls: poolIds.map(poolId => ({ target: BALANCER_VAULT, params: poolId.output })),

            abi: abi.getPoolTokens,

            block

        })).output;

        const balancesInStaking = (await sdk.api.abi.multiCall({

            calls: pools.map(pool => ({ target: pool.token, params: pool.crvRewards })),

            abi: 'erc20:balanceOf',

            block

        })).output;

        const totalSupplies = (await sdk.api.abi.multiCall({

            calls: pools.map(pool => ({ target: pool.lptoken })),

            abi: 'erc20:totalSupply',

            block

        })).output;

        let balances = {}

        const { output: veBalTotalSupply } = await sdk.api.erc20.totalSupply({ target: addresses.veBal, block })

       
