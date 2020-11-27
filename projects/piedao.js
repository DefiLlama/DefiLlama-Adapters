var Web3 = require('web3');
const utils = require('./helper/utils');
const BigNumber = require("bignumber.js");
const { returnDecimals, getTokenPricesFromString } = require("./helper/utils");
const pieABI = require("./config/piedao/abi/IPie.json");
const erc20ABI = require("./config/piedao/abi/ERC20.json");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

const pies = [
    // DEFI+S
    "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
    // // DEFI+L
    "0x78f225869c08d478c34e5f645d07a87d3fe8eb78",
    // // USD++
    "0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e",
    // // BTC++
    "0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd",
];

const stakingPools = {
    // DOUGH/ETH
    "0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E": {
        lpType: "balancer",
        // LP token (BPT)
        lp: "0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A",
        // Address in which the underlyings are deposited
        lpUnderlyingsAddress: "0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A",
        underlyings: [
            // WETH
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            // DOUGH
            "0xad32A8e6220741182940c5aBF610bDE99E737b2D"
        ]
    },
    // DOUGH/ETH (OLD)
    "0x8314337d2b13e1A61EadF0FD1686b2134D43762F": {
        lpType: "balancer",
        // LP token (BPT)
        lp: "0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A",
        // Address in which the underlyings are deposited
        lpUnderlyingsAddress: "0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A",
        underlyings: [
            // WETH
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            // DOUGH
            "0xad32A8e6220741182940c5aBF610bDE99E737b2D"
        ]
    },
    // DEFI+S/ETH
    "0x220f25C2105a65425913FE0CF38e7699E3992B97": {
        lpType: "balancer",
        // LP token (BPT)
        lp: "0x35333CF3Db8e334384EC6D2ea446DA6e445701dF",
        // Address in which the underlyings are deposited
        lpUnderlyingsAddress: "0x35333CF3Db8e334384EC6D2ea446DA6e445701dF",
        underlyings: [
            // WETH
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        ]
    },
    // DEFI+L/ETH
    "0xc1a116cb2d354503f9ec5cb436a3b213f377631d": {
        lpType: "balancer",
        // LP token (BPT)
        lp: "0xa795600590a7da0057469049ab8f1284baed977e",
        // Address in which the underlyings are deposited
        lpUnderlyingsAddress: "0xa795600590a7da0057469049ab8f1284baed977e",
        underlyings: [
            // WETH
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        ]
    }
}

async function fetch() {
    const tokenAmounts = {}

    async function pushTokenAmount(token, amount) {
        if(tokenAmounts[token] == undefined) {

            //create empty object
            tokenAmounts[token] = {
                decimals: 0,
                amount: 0,
                price: 0
            }

            const decimals = await returnDecimals(token);
            const price = (await getTokenPricesFromString(token)).data[token.toLowerCase()].usd;

            tokenAmounts[token].decimals = decimals;
            tokenAmounts[token].price = price;
        }

        tokenAmounts[token].amount += ((new BigNumber(amount)).div(10 ** tokenAmounts[token].decimals)).toNumber();
    }

    // Pies
    for (const pieAddress of pies) {
        const pie = new web3.eth.Contract(pieABI, pieAddress);

        const totalSupply = await pie.methods.totalSupply().call();
        const tokensAndAmounts = await pie.methods.calcTokensForAmount(totalSupply).call();

        for(let i = 0; i < tokensAndAmounts.tokens.length; i ++) {
            const token = tokensAndAmounts.tokens[i];
            const amount = tokensAndAmounts.amounts[i];
            await pushTokenAmount(token, amount);
        }
    }

    // Staking pools
    for (const stakingPoolAddress of Object.keys(stakingPools)) {
        const stakingPool = stakingPools[stakingPoolAddress];

        const lp = new web3.eth.Contract(erc20ABI, stakingPool.lp);

        const lpBalance = new BigNumber(await lp.methods.balanceOf(stakingPoolAddress).call());
        const lpTotalSupply = new BigNumber(await lp.methods.totalSupply().call());

        if(stakingPool.lpType == "balancer") {
            for(const underlying of stakingPool.underlyings) {

                const underlyingContract = new web3.eth.Contract(erc20ABI, underlying);
                const tokenAmount = new BigNumber(await underlyingContract.methods.balanceOf(stakingPool.lpUnderlyingsAddress).call());
                // console.log(tokenAmount.times(lpBalance).div(lpTotalSupply).toString());
                await pushTokenAmount(underlying, tokenAmount.times(lpBalance).div(lpTotalSupply));
            }
        } else {
            throw new Error("lpType not supported");
        }

    }

    let nav = 0;

    // Sum up nav
    for (const tokenAddress of Object.keys(tokenAmounts)) {
        const tokenAmount = tokenAmounts[tokenAddress];

        nav += tokenAmount.amount * tokenAmount.price;
    }

    return nav;
}

module.exports = {
    fetch
}
