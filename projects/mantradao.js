const web3 = require('./config/web3.js');
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/uma/abis.js');
const CERC = require('./config/mantra-dao/CERC20.json');
const CETH = require('./config/mantra-dao/CETH.json');
const LP_STAKING = require('./config/mantra-dao/LP_STAKING.json');
const UNI_LP = require('./config/mantra-dao/UNI_LP.json');

async function fetch() {

    try {
        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,weth,tether,usd-coin,wrapped-bitcoin,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token,aave,uniswap,sushi,havven,yearn-finance,dynamic-set-dollar,bondly,polkastarter,1inch,reserve-rights-token,royale,ftx-token,serum,balancer,curve-dao-token,uma,thorchain-erc20,frax,hegic,rhegic,88mph,zlot,zhegic,whiteheart,wrapped-nxm,renbtc,bancor,kyber-network,celsius-degree-token,cornichon,api3,matic-network,bao-finance,terrausd,lepricon,royale,finxflo,daoventures,the-graph,0x,omisego,injective-protocol,badger-dao,rook,utrust,alpha-finance,rari-governance-token,polkafoundry,raze-network,kylin-network,labs-group,paid-network,enjincoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'));

        // Helper to get lending supply
        async function returnSupply(token, address, abi) {
            let contract = new web3.eth.Contract(abi, token);
            let decimals = await contract.methods.decimals().call();
            let supply = await contract.methods.totalSupply().call();
            balance = await new BigNumber(supply).div(10 ** decimals).toFixed(2);
            return parseFloat(balance);
        }

        async function getPriceOfUniPair(pair) {
            let lpTokenPrice = 0
            const token1price = price_feed.data[pair.price1].usd
            let uniPairContractService = new web3.eth.Contract(UNI_LP, pair.pairAddress);
            let decimals = await uniPairContractService.methods.decimals().call();
            const totalSupplyScaledDown = await uniPairContractService.methods.totalSupply().call() / 10 ** decimals;
            const token1Supply = await uniPairContractService.methods.getReserves().call();
            const token1SupplyScaledDown = token1Supply._reserve0 / 10 ** decimals;
            lpTokenPrice = ((token1SupplyScaledDown * token1price) / totalSupplyScaledDown) * 2;
            return lpTokenPrice;
        };

        var tvl = 0;

        // Staking and pool assets
        const stakingAssets = [
            // sOM POOL 1 - Staked OM
            { contract: '0x9E15Ad979919bB4db331Bfe864475Ae3BFFebA93', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // sOM POOL 2 - Staked OM
            { contract: '0xa01892d97e9c8290c2c225fb0b756bfe26bc9802', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // RFUEL - Staked RFUEL
            { contract: '0xE8F063c4dC60B2F6c2C900d870ddcDae7DaAb7F6', token: '0xaf9f549774ecedbd0966c52f250acc548d3f36e5', price: 'rio-defi'},
            // L3P - Staked Lepricon
            { contract: '0xdbc34d084393ed8d7b750FfCCea5A139EC7b9349', token: '0xdef1da03061ddd2a5ef6c59220c135dec623116d', price: 'lepricon'},
            // ROYA - Staked royale
            { contract: '0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9', token: '0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB', price: 'royale'},
            // Finxflo - Staked Finxflo
            { contract: '0x6BcDC61A7A6d86f7b7B66d461b7eF7fa268571a0', token: '0x8a40c222996f9F3431f63Bf80244C36822060f12', price: 'finxflo'},
            // PKF - Staked Polkafoundry
            { contract: '0x1dfdb0fb85402dc7f8d72d92ada8fbbb3ffc8633', token: '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac', price: 'polkafoundry'},
            // RAZE - Staked Raze
            { contract: '0x2d0ea72db9f9a63f4b185eab1ca74137d808ebfa', token: '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac', price: 'raze-network'},
            // KYL - Staked KYL
            { contract: '0x6ae05b5db520011bf76645ebb4d6a697e5b3774b', token: '0x67b6d479c7bb412c54e03dca8e1bc6740ce6b99c', price: 'kylin-network'},
            // LABS - Staked LABS
            { contract: '0x6f0db359309CAD297D2e7952a4F5f081bDC1e373', token: '0x8b0e42f366ba502d787bb134478adfae966c8798', price: 'labs-group'},
            // OM Mantra pool - Staked OM in mantra pool
            { contract: '0x1a22188b5F6faf7253a3DefCC576884c0FF50a91', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
        ]

        // LP Staking
        const lpStakingAssets = [
            // LABS-ETH UNI LP simple staking
            { 
                contract: '0x5f81a986611C600a3656d9adc202283186C6121D', 
                pairAddress: '0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83',
                token1: '0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83', 
                price1: 'labs-group',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
                price2: 'weth'
            },
            // LABS-ETH UNI LP staking with exit tollbooth 
            { 
                contract: '0xfc8e3b55897d8cef791451bbe69b204b9c58fc8a', 
                pairAddress: '0x2d9fd51e896ff0352cb6d697d13d04c2cb85ca83',
                token1: '0x2D9FD51E896Ff0352Cb6D697D13D04C2CB85CA83', 
                price1: 'labs-group',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
                price2: 'weth'
            },
            // MANTRA DAO OM-ETH LP staking
            { 
                contract: '0x91fe14df53eae3a87e310ec6edcdd2d775e1a23f', 
                pairAddress: '0xe46935ae80e05cdebd4a4008b6ccaa36d2845370',
                token1: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', 
                price1: 'mantra-dao',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
                price2: 'weth'
            },
            // ROYA ROYA-ETH LP staking
            { 
                contract: '0x55e0F2cE66Fa8C86ef478fa47bA0bE978eFC2647', 
                pairAddress: '0x6d9d2427cfa49e39b4667c4c3f627e56ae586f37',
                token1: '0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9', 
                price1: 'royale',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 
                price2: 'weth'
            },
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
            // zenDVG 
            ['0x07d22cd5d483b1242518d5cd26b21b552f0cfcdb', 'daoventures'],
            // zenGRT 
            ['0x90ea640fd96b10d79b95166ea9d4b5fb2fb4f4be', 'the-graph'],
            // zenOX 
            ['0x33a9f9bace23cfb8dad597a564d055ad415648ff', '0x'],
            // zenOMG 
            ['0x7283fe6ae81f39d07850b78f282037b65448a2bc', 'omisego'],
            // zenINJ 
            ['0xd7756be9aedc211a9d5677d7d67295e6d7dd86c7', 'injective-protocol'],
            // zenBADGER 
            ['0x4a5b823592c2a1e95502c0b55afba2397e71799d', 'badger-dao'],
            // zenROOK 
            ['0xf9aea09993e1a43b5f7dcdbd67cda89690a51491', 'rook'],
            // zenUTK 
            ['0x8fb35c58e48660a29c80452d3c7bf98fe81de921', 'utrust'],
            // zenALPHA 
            ['0x49a39e062aaf28950f9d0d5fd423dfb3175c0bb1', 'alpha-finance'],
            // zenRGT 
            ['0x223f6fc2696beeb0d096a72b8db674e6bd520398', 'rari-governance-token'],
            // zenFXF 
            ['0x01A8F03E4EFb1ceF12D796d21468C5903A6ed5D6', 'finxflo'],
            // zenKYL
            ['0x6A4e7Daf7E1244944BDA17390B1ec5F44C9DF671', 'kylin-network'],
            // zenPAID
            ['0x2dD28391d7552363eED30eb172116cf3E13ECa23', 'paid-network'],
            // zenENJ
            ['0x25942b9496282ce18c3B8d8c722ccF8e5112b252', 'enjincoin'],
            // zenLABS
            ['0xaaB14c2115aaD338cEDb93e423834897651a3Ee2', 'labs-group'],
        ]

        await Promise.all(stakingAssets.map(async (asset) => {
            // STAKING ASSETS
            try {
                let balance = await utils.returnBalance(asset.token, asset.contract);
                tvl += (parseFloat(balance) * price_feed.data[asset.price].usd)
            } catch (error) {
                console.log(error)
            }
        }))


        await Promise.all(lpStakingAssets.map(async (pair) => {
            // LP STAKING ASSETS
            try {
                let lpTokenPrice = await getPriceOfUniPair(pair)
                let balance = await utils.returnBalance(pair.pairAddress, pair.contract);
                tvl += (parseFloat(balance) * lpTokenPrice)
            } catch (error) {
                console.log(error)
            }
        }))


        await new Promise(async (resolve, reject) => {
            // ZEN ETH - Lending ETH
            var contract = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            var token = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            balance = await returnSupply(token, contract, CETH);
            tvl += (parseFloat(balance) * price_feed.data['ethereum'].usd)
            resolve(0)
        })

        await Promise.all(zenErc20.map(async (asset) => {
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

        console.log(tvl)

        return tvl;

    } catch (error) {
        //console.log(error)
    }
}

module.exports = {
  fetch
}
