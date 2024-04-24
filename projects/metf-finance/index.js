const abi = 'function balanceOf(address token) view returns (uint256)'
const pairPrice = 'function getPairPrice(address pair, uint256 amount) view returns (uint256 valueInMMF, uint256 valueInUSD)';
const valueOfAsset = 'function valueOfAsset(address asset, uint256 amount) view returns (uint256 valueInCRO, uint256 valueInUSD)'
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { pool2 } = require('../helper/pool2')

const treasury = "0xE25737b093626233877EC0777755c5c4081580be"
const MMF_METF_BOND = "0x127966303484140EF3692C49CfF154eaAe50cEe3"
const calculator = "0xa2B417088D63400d211A4D5EB3C4C5363f834764"

const ZERO = new BigNumber(0);
const ETHER = new BigNumber(10).pow(18);

const tokens = ["0x97749c9B61F878a880DfE312d2594AE07AEd7656",
    "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    "0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7"]

const LPs = ["0xbA452A1c0875D33a440259B1ea4DcA8f5d86D9Ae",
    "0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0",
    // "0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7", //moved to pool2
]

    
async function newTVL(timestamp, block, chainBlocks) {
    block = chainBlocks.cronos
    const balances = {}
    const prices = {}

    let data = await sdk.api.abi.multiCall({
        calls: LPs.map((address) => ({
            target: MMF_METF_BOND,
            params: [address, ETHER.toString()],
        })),
        block,
        abi: pairPrice,
        chain: "cronos",
    });

    data.output.forEach((call) => {
        let value = call && call.output && new BigNumber(call.output.valueInUSD);
        if (value) {
            prices[call.input.params[0]] = value.dividedBy(ETHER);
        }
    });

    let data3 = await sdk.api.abi.multiCall({
        calls: tokens.map((address) => ({
            target: calculator,
            params: [address, ETHER.toString()],
        })),
        block,
        abi: valueOfAsset,
        chain: "cronos",
    });
    data3.output.forEach((call) => {
        let value = call && call.output && new BigNumber(call.output.valueInUSD);
        if (value) {
            prices[call.input.params[0]] = value.dividedBy(ETHER);
        }
    });


    let data2 = await sdk.api.abi.multiCall({
        calls: [...tokens, ...LPs].map((address) => ({
            target: treasury,
            params: address,
        })),
        block,
        abi: abi,
        chain: "cronos",
    })

    data2.output.forEach((call) => {
        let value = call && call.output && new BigNumber(call.output);
        if (value) {
            if (prices[call.input.params[0]]) {
                balances[`cronos:${call.input.params[0]}`] = value.dividedBy(ETHER).multipliedBy(prices[call.input.params[0]])
            } else {
                balances[`cronos:${call.input.params[0]}`] = value.dividedBy(ETHER)
            }
        }
    });

    let tvlall = Object.values(balances).reduce((tvl, bn) => {
        return tvl.plus(bn)
    }, ZERO)

    return {
        tether: tvlall.toNumber(),
    };
}

async function staking(timestamp, block, chainBlocks) {
    block = chainBlocks.cronos
    const staked = (await sdk.api.abi.call({
        target: "0xb8df27c687c6af9afe845a2afad2d01e199f4878",
        params: "0x1A6aD4bac521a98556A4C0Da5946654c5DC7Ce0A", // masterchef
        abi: 'erc20:balanceOf',
        block: block,
        chain: 'cronos'
    })).output
    const balances = {
        ["cronos:0xb8df27c687c6af9afe845a2afad2d01e199f4878"]: staked
    }
    return balances
}


module.exports = {
    cronos: {
        tvl: newTVL,
        staking: staking,
        pool2: pool2("0xE25737b093626233877EC0777755c5c4081580be", "0xd7385f46FFb877d8c8Fe78E5f5a7c6b2F18C05A7")
    }
}