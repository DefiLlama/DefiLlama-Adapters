var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/uma/abis.js');
const CERC = require('./config/mantra-dao/CERC20.json');
const CETH = require('./config/mantra-dao/CETH.json');

async function fetch() {

    try {

        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin,wrapped-bitcoin,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

        // Helper to get lending supply
        async function returnSupply(token, address, abi) {
            let contract = new web3.eth.Contract(abi, token);
            let decimals = await contract.methods.decimals().call();
            let supply = await contract.methods.totalSupply().call();
            balance = await new BigNumber(supply).div(10 ** decimals).toFixed(2);
            return parseFloat(balance);
        }

        var tvl = 0;

        // Staking and pool assets
        const stakingAssets = [
            // sOM - Staked OM
            { contract: '0x9E15Ad979919bB4db331Bfe864475Ae3BFFebA93', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // RFUEL - Staked RFUEL
            { contract: '0xE8F063c4dC60B2F6c2C900d870ddcDae7DaAb7F6', token: '0xaf9f549774ecedbd0966c52f250acc548d3f36e5', price: 'rio-defi'},
            // OM Mantra pool - Staked OM in mantra pool
            { contract: '0x1a22188b5F6faf7253a3DefCC576884c0FF50a91', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
        ]

        // Lending assets
        const zenErc20 = [
            // ZEN USDT - Lending USDT
            ['0xF76cc2dc02F56B27761dBdb7a62e2B1C4a22aFcd', 'tether'],
            // ZEN USDC - Lending USDC
            ['0x0968c90198f08b67365840fa37631b29fe2aa9fc', 'usd-coin'],
            // ZEN WBTC - Lending WBTC
            ['0x5b4463bbd7b2e870601e91161e0f1f7f84cde214', 'wrapped-bitcoin'],
            // ZEN COMP - Lending COMP
            ['0x3f2e9a93428a22d2f4cacc3f184f1aad85054e1c', 'compound-governance-token'],
            // ZEN DAI - Lending DAI
            ['0x3bafa9cd93c7bdc07fd9609e95e04a8904eacf7d', 'dai'],
            // ZEN CREAM - Lending CREAM
            ['0x66d696474784ded49b5d0a43e50bf59d63402d74', 'cream'],
            // ZEN OM - Lending OM
            ['0xf533c78c0790676008d576c5cc2e63e0856ed4f0', 'mantra-dao'],
            // ZEN RFUEL - Lending RFUEL
            ['0x11c70caa910647d820bd014d676dcd97edd64a99', 'rio-defi'],
            // ZEN LINK - Lending LINK
            ['0x27d15446176b469ee7fbdec1e5a4b506fd77c0cd', 'chainlink']
        ]

         let stakingAssetCalc = await Promise.all(stakingAssets.map(async (asset) => {
            try {
                let balance = await utils.returnBalance(asset.token, asset.contract);
                //console.log(balance)
                tvl += (parseFloat(balance) * price_feed.data[asset.price].usd)
            } catch (error) {
                //console.log(error)
            }
        }))


         let ETHlendingCalc = await new Promise(async (resolve, reject) => {
            // ZEN ETH - Lending ETH
            var contract = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            var token = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            balance = await returnSupply(token, contract, CETH);
            tvl += (parseFloat(balance) * price_feed.data['ethereum'].usd)
            resolve(0)
        })

        let zeen  = await Promise.all(zenErc20.map(async (asset) => {
            try {
                // ZEN erc lending assets
                var contract = asset[0];
                var token = asset[0];
                balance = await returnSupply(token, contract, CERC);
                tvl += (parseFloat(balance) * price_feed.data[asset[1]].usd)
            } catch (error) {
                //console.log(error)
            }
        }))

        return tvl;

        // Promise.all([stakingAssetCalc, ETHlendingCalc, ERC20lendingCalc]).then((values) => {
        //     console.log('tvl',tvl)
        //     return tvl;
        // });

    } catch (error) {
        //console.log(error)
    }



}


module.exports = {
  fetch
}
