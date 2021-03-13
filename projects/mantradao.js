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

        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin,wrapped-bitcoin,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token,aave,uniswap,sushi,havven,yearn-finance,dynamic-set-dollar,bondly,polkastarter,1inch,reserve-rights-token,royale,ftx-token,serum,balancer,curve-dao-token,uma,thorchain-erc20,frax,hegic,rhegic,88mph,zlot,zhegic,whiteheart,wrapped-nxm,renbtc,bancor,kyber-network,celsius-degree-token,cornichon,api3,matic-network,bao-finance,terrausd&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'));

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

        // Lending / borrowing
        // Zen assets
        const zenErc20 = [
            // zenUSDT -
            ['0xF76cc2dc02F56B27761dBdb7a62e2B1C4a22aFcd', 'tether'],
            // zenUSDC -
            ['0x0968c90198f08b67365840fa37631b29fe2aa9fc', 'usd-coin'],
            // zenWBTC -
            ['0x5b4463bbd7b2e870601e91161e0f1f7f84cde214', 'wrapped-bitcoin'],
            // zenCOMP -
            ['0x3f2e9a93428a22d2f4cacc3f184f1aad85054e1c', 'compound-governance-token'],
            // zenDAI -
            ['0x3bafa9cd93c7bdc07fd9609e95e04a8904eacf7d', 'dai'],
            // zenCREAM -
            ['0x66d696474784ded49b5d0a43e50bf59d63402d74', 'cream'],
            // zenOM -
            ['0xf533c78c0790676008d576c5cc2e63e0856ed4f0', 'mantra-dao'],
            // zenRFUEL -
            ['0x11c70caa910647d820bd014d676dcd97edd64a99', 'rio-defi'],
            // zenLINK -
            ['0x27d15446176b469ee7fbdec1e5a4b506fd77c0cd', 'chainlink'],
            // zenAAVE -
            ['0x57a8cb15e9575bf9bf80f3531183395703912f57', 'aave'],
            // zenUNI -
            ['0x391f902c8979050ba8036e3d61d13d79cf545db8', 'uniswap'],
            // zenSUSHI -
            ['0xb3c114d12cc260ff0a07a2cf22a910625367b403', 'sushi'],
            // zenSNX -
            ['0xc4bdaa3b4f2c9a78baa4442cd81874881850ff2e', 'havven'],
            // zenYFI -
            ['0xb595a7715d7d5a0252e5d3cdddfa2e1c7c1feebe', 'yearn-finance'],
            // zenDSD -
            ['0x1c1bb5efec38b1b01e0e72fa0c8521d695299b60', 'dynamic-set-dollar'],
            // zenBONDLY -
            ['0x53bafba543f8f1283ed5b21cafe7925c367ec3bd', 'bondly'],
            // zenPOLS -
            ['0x5b37c72dde4c4efc3e2eeff4107ef6eb61f5de10', 'polkastarter'],
            // zen1INCH -
            ['0x2ddfd56221568b6d4350b68432569a57bc1f9572', '1inch'],
            // zenRSR -
            ['0xa0998fc7dcf51169d97a74f0b0b7d97e4af8e873', 'reserve-rights-token'],
            // zenROYA -
            ['0x0e0055bf26f4bdde57b112112e5db25d56706580', 'royale'],
            // zenFTX -
            ['0x650D62FCB1F22A10a2b810BFe305C1312a24A367', 'ftx-token'],
            // zenSRM -
            ['0x290a565ec7C28557AE872de2f3a5Ce500F46A5d2', 'serum'],
            // zenBAL -
            ['0x31b992fda33C6c52c602cF379B9bBe1745A903f7', 'balancer'],
            // zenCRV -
            ['0x144bdF52690c59B510DA5DBc09BB5f145FbdB8E1', 'curve-dao-token'],
            // zenUMA -
            ['0x1BAdCB0833072B986c845681D3C73603Adc5bA54', 'uma'],
            // zenRUNE -
            ['0x3bdBd2B661560Bcdf59BDC74576f65E2F714b836', 'thorchain-erc20'],
            // zenFRAX -
            ['0xa8e31aD81D609ff616645849987feF30A3FfABd9', 'frax'],
            // zenHEGIC -
            ['0x15Fcfd53fec9B72cF3725649F3eC4603077ad21e', 'hegic'],
            // zenrHEGIC -
            ['0xB15e13Bc622315E29A7142fea3d0c67464B44e97', 'rhegic'],
            // zenMPH -
            ['0x4dD6D5D861EDcD361455b330fa28c4C9817dA687', '88mph'],
            // zenzLOT -
            ['0x8eC3E4978E531565A46C22fbE0423Be1BB8E1156', 'zlot'],
            // zenzHEGIC -
            ['0x0C91F1795e012BCEF586C925F747f23B0969B5eA', 'zhegic'],
            // zenWHITE -
            ['0xE3334e66634acF17B2b97ab560ec92D6861b25fa', 'whiteheart'],
            // zenWNXM -
            ['0xa07Be94D721DF448B63EC6C3160138A2b2619e1D', 'wrapped-nxm'],
            // zenRENBTC -
            ['0x7a665de4b80835295901dd84ece07e942a9fe400', 'renbtc'],
            // zenBNT -
            ['0x1b6d730a1dCAeB870BA3b0c6e51F801C1cCa0499', 'bancor'],
            // zenKNC -
            ['0x180087A6a87Fd6b09a78C9b9B87b71335906c61D', 'kyber-network'],
            // zenCEL -
            ['0xa6b8cbB493fe5682d627bdB9A6B361488086a2fD', 'celsius-degree-token'],
            // zenCORN -
            ['0x4E50972850822f8be8A034e23891B7063893Cc34', 'cornichon'],
            // zenAPI3 -
            ['0xA24c0E9195481821f9b5292E8c6A4209cc8cc3c9', 'api3'],
            // zenMATIC -
            ['0xa3968dAbF386D99F67c92c4E3c7cfDf2c0ccc396', 'matic-network'],
            // zenBAO -
            ['0x132E549262f2b2AD48AA306c3d389e55BB510419', 'bao-finance'],
            // zenUST -
            ['0xaB576bCBB0C3303C9e680fbFDeCa67e062eAE59c', 'terrausd'],
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
