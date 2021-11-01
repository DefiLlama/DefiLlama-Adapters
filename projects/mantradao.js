const Web3 = require('web3');
const web3 = require('./config/web3.js');
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const utils = require('./helper/utils');
const abis = require('./config/abis.js').abis;
const CERC = require('./config/mantra-dao/CERC20.json');
const CETH = require('./config/mantra-dao/CETH.json');
const LP_STAKING = require('./config/mantra-dao/LP_STAKING.json');
const UNI_LP = require('./config/mantra-dao/UNI_LP.json');
const PANCAKE_LP = require('./config/mantra-dao/PANCAKE_LP.json');
const QUICK_LP = require('./config/mantra-dao/QUICK_LP.json');

const web3bsc = new Web3('https://bsc-dataseed1.binance.org:443');
const web3polygon = new Web3('https://speedy-nodes-nyc.moralis.io/915f60cde0d3e95599501fa2/polygon/mainnet');

let tvlTotal = 0;

async function fetchETH() {
        var tvlETH = 0;
        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,weth,tether,usd-coin,mist,wrapped-bitcoin,blockbank,roseon-finance,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token,aave,uniswap,sushi,havven,yearn-finance,dynamic-set-dollar,bondly,polkastarter,1inch,reserve-rights-token,royale,ftx-token,serum,balancer,curve-dao-token,uma,thorchain-erc20,frax,hegic,rhegic,88mph,zlot,zhegic,whiteheart,wrapped-nxm,renbtc,bancor,kyber-network,celsius-degree-token,cornichon,api3,matic-network,bao-finance,terrausd,lepricon,royale,finxflo,daoventures,the-graph,0x,omisego,injective-protocol,badger-dao,rook,utrust,alpha-finance,rari-governance-token,polkafoundry,raze-network,kylin-network,labs-group,paid-network,dragonbite,b-cube-ai,alpha-impact,media-licensing-token,refinable,wbnb,greenheart-cbd,enjincoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'));

        // Helper to get lending supply on ETH
        async function returnSupplyETH(token, address, abi) {
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

        // ETH Staking and pool assets
        const stakingAssetsETH = [
            // sOM POOL 1 - Staked OM
            { contract: '0x9E15Ad979919bB4db331Bfe864475Ae3BFFebA93', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // sOM POOL 2 - Staked OM
            { contract: '0xa01892d97e9c8290c2c225fb0b756bfe26bc9802', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // RFUEL Pool 1 - Staked RFUEL
            { contract: '0xE8F063c4dC60B2F6c2C900d870ddcDae7DaAb7F6', token: '0xaf9f549774ecedbd0966c52f250acc548d3f36e5', price: 'rio-defi'},
            // RFUEL Pool 2 - Staked RFUEL
            { contract: '0x456DF576962289256A92290C9E48EE116B8Cb413', token: '0xaf9f549774ecedbd0966c52f250acc548d3f36e5', price: 'rio-defi'},
            // L3P - Staked Lepricon
            { contract: '0xdbc34d084393ed8d7b750FfCCea5A139EC7b9349', token: '0xdef1da03061ddd2a5ef6c59220c135dec623116d', price: 'lepricon'},
            // ROYA - Staked royale
            { contract: '0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9', token: '0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB', price: 'royale'},
            // Finxflo - Staked Finxflo
            { contract: '0x6BcDC61A7A6d86f7b7B66d461b7eF7fa268571a0', token: '0x8a40c222996f9F3431f63Bf80244C36822060f12', price: 'finxflo'},
            // PKF - Staked Polkafoundry
            { contract: '0x1dfdb0fb85402dc7f8d72d92ada8fbbb3ffc8633', token: '0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d', price: 'polkafoundry'},
            // RAZE - Staked Raze
            { contract: '0x2d0ea72db9f9a63f4b185eab1ca74137d808ebfa', token: '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac', price: 'raze-network'},
            // KYL - Staked KYL
            { contract: '0x6ae05b5db520011bf76645ebb4d6a697e5b3774b', token: '0x67b6d479c7bb412c54e03dca8e1bc6740ce6b99c', price: 'kylin-network'},
            // LABS Pool 1 - Staked LABS
            { contract: '0x6f0db359309CAD297D2e7952a4F5f081bDC1e373', token: '0x8b0e42f366ba502d787bb134478adfae966c8798', price: 'labs-group'},
            // LABS Pool 2 - Staked LABS
            { contract: '0xb96e42c0de658ca26048b0e200f9a1e05ad89e0f', token: '0x8b0E42F366bA502d787BB134478aDfAE966C8798', price: 'labs-group'},
            // OM Mantra pool - Staked OM in mantra pool
            { contract: '0x1a22188b5F6faf7253a3DefCC576884c0FF50a91', token: '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d', price: 'mantra-dao'},
            // Bondly staking
            { contract: '0x39621A555554A7FF77F2b64185c53E04C90cD540', token: '0xd2dda223b2617cb616c1580db421e4cfae6a8a85', price: 'bondly'},
            // BITE staking
            { contract: '0xa571309B1267676568Bf9f155606a08790896Fe2', token: '0x4eED0fa8dE12D5a86517f214C2f11586Ba2ED88D', price: 'dragonbite'},
            // BCUBE staking
            { contract: '0xb19b94d53D362CDfC7360C951a85ca2c1d5400BA', token: '0x93C9175E26F57d2888c7Df8B470C9eeA5C0b0A93', price: 'b-cube-ai'},
            // IMPACT staking
            { contract: '0x6DdF7743f56Efa60a4834AFEd16B2dc13308f13e', token: '0xFAc3f6391C86004289A186Ae0198180fCB4D49Ab', price: 'alpha-impact'}
        ]

        // ETH LP Staking
        const lpStakingAssetsETH = [
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
            // ROYA-ETH LP staking
            {
                contract: '0x55e0F2cE66Fa8C86ef478fa47bA0bE978eFC2647',
                pairAddress: '0x6d9d2427cfa49e39b4667c4c3f627e56ae586f37',
                token1: '0x4Cd4c0eEDb2bC21f4e280d0Fe4C45B17430F94A9',
                price1: 'royale',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // OM V1-ETH LP Staking
            {
                contract: '0x659236870915601d8B581e4355BD822483Fe5739',
                pairAddress: '0x99b1db3318aa3040f336fb65c55400e164ddcd7f',
                token1: '0x2baecdf43734f22fd5c152db08e3c27233f0c7d2',
                price1: 'mantra-dao',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // BONDLY-ETH LP staking
            {
                contract: '0x4D081F600b480b0Ce8b422FBa3a5ea1Fb4b36b3B',
                pairAddress: '0x9dc696f1067a6b9929986283f6d316be9c9198fd',
                token1: '0xd2dda223b2617cb616c1580db421e4cfae6a8a85',
                price1: 'bondly',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // BONDLY-USDT LP staking
            {
                contract: '0x3dd713aafb46cb359c8711f4783836ba2e3e426c',
                pairAddress: '0xdc43e671428b4e7b7848ea92cd8691ac1b80903c',
                token1: '0xd2dda223b2617cb616c1580db421e4cfae6a8a85',
                price1: 'bondly',
                token2: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                price2: 'usdt'
            },
            // BITE-ETH LP staking
            {
                contract: '0xb12f0CbcC89457d44323139e6Bb0526Fd82f12F2',
                pairAddress: '0x1f07f8e712659087914b96db4d6f6e4fee32285e',
                token1: '0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d',
                price1: 'dragonbite',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // BITE-ETH LP staking w/ tollbooth
            {
                contract: '0x18Ba986ED3128fc7E3E86a09E902436e900a899c',
                pairAddress: '0x1f07f8e712659087914b96db4d6f6e4fee32285e',
                token1: '0x4eed0fa8de12d5a86517f214c2f11586ba2ed88d',
                price1: 'dragonbite',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // BBANK-ETH LP staking
            {
                contract: '0x6406788d1CD4fdD823ef607A924c00a4244a841d',
                pairAddress: '0x2a182e532a379cb2c7f1b34ce3f76f3f7d3596f7',
                token1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price1: 'weth',
                token2: '0xf4b5470523ccd314c6b9da041076e7d79e0df267',
                price2: 'blockbank'
            },
            // RAZE-ETH LP staking
            {
                contract: '0xe2a80A76B084B51CFAe5B2C3e0FF5232e0408201',
                pairAddress: '0x4fc47579ecf6aa76677ee142b6b75faf9eeafba8',
                token1: '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac',
                price1: 'raze-network',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            },
            // IMPACT-ETH LP staking
            {
                contract: '0x7c82127b14C69C05fa482B7B079A59F2d114d333',
                pairAddress: '0xa3053da613e5312c9e4b50edfb85f5a512c556d7',
                token1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price1: 'weth',
                token2: '0xfac3f6391c86004289a186ae0198180fcb4d49ab',
                price2: 'alpha-impact'
            },
            // BCUBE-ETH LP staking
            {
                contract: '0xFF964d0bf9f81c401932A6B975EAE54129712eE5',
                pairAddress: '0xc62bf2c79f34ff24e2f97982af4f064161ed8949',
                token1: '0x93c9175e26f57d2888c7df8b470c9eea5c0b0a93',
                price1: 'b-cube-ai',
                token2: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                price2: 'weth'
            }
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

        await Promise.all(stakingAssetsETH.map(async (asset) => {
            // ETH STAKING ASSETS
                let balance = await utils.returnBalance(asset.token, asset.contract);
                tvlETH += (parseFloat(balance) * price_feed.data[asset.price].usd)
        }))

        await Promise.all(lpStakingAssetsETH.map(async (pair) => {
            // ETH LP STAKING ASSETS
                let lpTokenPrice = await getPriceOfUniPair(pair)
                let balance = await utils.returnBalance(pair.pairAddress, pair.contract);
                tvlETH += (parseFloat(balance) * lpTokenPrice)
        }))

        await new Promise(async (resolve, reject) => {
            // ZEN ETH - Lending ETH
            var contract = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            var token = '0x4f905f75f5576228ed2d0ea508fb0c32a0696090';
            balance = await returnSupplyETH(token, contract, CETH);
            tvlETH += (parseFloat(balance) * price_feed.data['ethereum'].usd)
            resolve(0)
        })

        await Promise.all(zenErc20.map(async (asset) => {
                // ZEN erc lending assets
                var contract = asset[0];
                var token = asset[0];
                balance = await returnSupplyETH(token, contract, CERC);

                tvlETH += (parseFloat(balance) * price_feed.data[asset[1]].usd)
        }))

        tvlTotal += tvlETH;

        return tvlETH;
}

async function fetchBSC() {
        var tvlBSC = 0;
        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,weth,tether,usd-coin,mist,wrapped-bitcoin,blockbank,roseon-finance,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token,aave,uniswap,sushi,havven,yearn-finance,dynamic-set-dollar,bondly,polkastarter,1inch,reserve-rights-token,royale,ftx-token,serum,balancer,curve-dao-token,uma,thorchain-erc20,frax,hegic,rhegic,88mph,zlot,zhegic,whiteheart,wrapped-nxm,renbtc,bancor,kyber-network,celsius-degree-token,cornichon,api3,matic-network,bao-finance,terrausd,lepricon,royale,finxflo,daoventures,the-graph,0x,omisego,injective-protocol,badger-dao,rook,utrust,alpha-finance,rari-governance-token,polkafoundry,raze-network,kylin-network,labs-group,paid-network,dragonbite,b-cube-ai,alpha-impact,media-licensing-token,refinable,wbnb,greenheart-cbd,enjincoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'));

        async function returnBalanceBSC(token, address) {
            let contract = new web3bsc.eth.Contract(abis.minABI, token);
            let decimals = await contract.methods.decimals().call();
            let balance = await contract.methods.balanceOf(address).call();
            balance = await new BigNumber(balance).div(10 ** decimals).toFixed(2);
            return parseFloat(balance);
        }

        async function getPriceOfPancakePair(pair) {
            let lpTokenPrice = 0
            const token1price = price_feed.data[pair.price1].usd
            let pancakePairContractService = new web3bsc.eth.Contract(PANCAKE_LP, pair.pairAddress);
            let decimals = await pancakePairContractService.methods.decimals().call();
            const totalSupplyScaledDown = await pancakePairContractService.methods.totalSupply().call() / 10 ** decimals;
            const token1Supply = await pancakePairContractService.methods.getReserves().call();
            const token1SupplyScaledDown = token1Supply._reserve0 / 10 ** decimals;
            lpTokenPrice = ((token1SupplyScaledDown * token1price) / totalSupplyScaledDown) * 2;
            return lpTokenPrice;
        };

        // BSC Staking and pool assets
        const stakingAssetsBSC = [
            // ROSN staking
            { contract: '0x7dd79e93dba1d677574d0b5e99721f2e4b45e297', token: '0x651cd665bd558175a956fb3d72206ea08eb3df5b', price: 'roseon-finance'},
            // BONDLY staking
            { contract: '0x004c0908518e19aa8b27a55c171564097fa3c354', token: '0x96058f8c3e16576d9bd68766f3836d9a33158f89', price: 'bondly'},
            // MLT staking
            { contract: '0xF0185520Cc773502f0f208433ca178f2f57157A9', token: '0x4518231a8fdf6ac553b9bbd51bbb86825b583263', price: 'media-licensing-token'},
            // OM staking
            { contract: '0xEfc2d65302eb6345A7C0e212B791e0d45C2C3c91', token: '0xf78d2e7936f5fe18308a3b2951a93b6c4a41f5e2', price: 'mantra-dao'}
        ]

        // BSC LP Staking
        const lpStakingAssetsBSC = [
            // FINE-BNB LP staking
            {
                contract: '0xF25897a7EDf1Dfa9C65f5DB7Ec4Bad868873805B',
                pairAddress: '0xC309a6d2F1537922E06f15aA2eb21CaA1b2eEDb6',
                token1: '0x4e6415a5727ea08aae4580057187923aec331227',
                price1: 'refinable',
                token2: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price2: 'wbnb'
            },
            // OM-BNB LP staking
            {
                contract: '0xcbf42ace1dbd895ffdcabc1b841488542626014d',
                pairAddress: '0x49837a48abde7c525bdc86d9acba39f739cbe22c',
                token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price1: 'wbnb',
                token2: '0xf78d2e7936f5fe18308a3b2951a93b6c4a41f5e2',
                price2: 'mantra-dao'
            },
            // CBD-BNB LP staking
            {
                contract: '0x92fCe8AfFB2A68d418BaDF8E360E0CDe06c39356',
                pairAddress: '0x0b49580278b403ca13055bf4d81b6b7aa85fd8b9',
                token1: '0x0e2b41ea957624a314108cc4e33703e9d78f4b3c',
                price1: 'greenheart-cbd',
                token2: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price2: 'wbnb'
            },
            // BBANK-BNB LP staking
            {
                contract: '0x1E8BC897bf03ebac570Df7e5526561f8a42eCe05',
                pairAddress: '0x538e61bd3258304e9970f4f2db37a217f60436e1',
                token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price1: 'wbnb',
                token2: '0xf4b5470523ccd314c6b9da041076e7d79e0df267',
                price2: 'blockbank'
            },
            // BONDLY-BNB LP staking
            {
                contract: '0xD862866599CA681c492492E1B7B9aB80066f2FaC',
                pairAddress: '0xb8b4383b49d451bbea63bc4421466e1086da6f18',
                token1: '0x96058f8c3e16576d9bd68766f3836d9a33158f89',
                price1: 'bondly',
                token2: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                price2: 'wbnb'
            },
            // MIST-BNB LP staking
            {
                contract: '0x4F905f75F5576228eD2D0EA508Fb0c32a0696090',
                pairAddress: '0x5a26eb7c9c72140d01039eb172dcb8ec98d071bd',
                token1: '0x68e374f856bf25468d365e539b700b648bf94b67',
                price1: 'mist',
                token2: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price2: 'wbnb'
            },
            // ROSN-BNB LP staking
            {
                contract: '0x5B4463bBD7B2E870601e91161e0F1F7f84CDE214',
                pairAddress: '0x5548bd47293171d3bc1621edccd953bcc9b814cb',
                token1: '0x651Cd665bD558175A956fb3D72206eA08Eb3dF5b',
                price1: 'roseon-finance',
                token2: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price2: 'wbnb'
            },
            // MLT-BNB LP staking
            {
                contract: '0x398a5FEE22E0dEb67dA1bD15FA4841b6Aa64c471',
                pairAddress: '0x560b96f81a2190ff6ac84ebfd17788bab3679cbc',
                token1: '0x4518231a8fdf6ac553b9bbd51bbb86825b583263',
                price1: 'media-licensing-token',
                token2: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
                price2: 'wbnb'
            }
        ]

        await Promise.all(stakingAssetsBSC.map(async (asset) => {
            // BSC STAKING ASSETS
                let balance = await returnBalanceBSC(asset.token, asset.contract);
                tvlBSC += (parseFloat(balance) * price_feed.data[asset.price].usd)
        }))

        await Promise.all(lpStakingAssetsBSC.map(async (pair) => {
            // BSC LP STAKING ASSETS
                let lpTokenPrice = await getPriceOfPancakePair(pair)
                let balance = await returnBalanceBSC(pair.pairAddress, pair.contract);
                tvlBSC += (parseFloat(balance) * lpTokenPrice)
        }))

        tvlTotal += tvlBSC;

        return tvlBSC;

}

async function fetchPolygon() {
        var tvlPolygon = 0;
        var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,weth,tether,usd-coin,mist,wrapped-bitcoin,blockbank,roseon-finance,dai,cream,chainlink,mantra-dao,rio-defi,compound-governance-token,aave,uniswap,sushi,havven,yearn-finance,dynamic-set-dollar,bondly,polkastarter,1inch,reserve-rights-token,royale,ftx-token,serum,balancer,curve-dao-token,uma,thorchain-erc20,frax,hegic,rhegic,88mph,zlot,zhegic,whiteheart,wrapped-nxm,renbtc,bancor,kyber-network,celsius-degree-token,cornichon,api3,matic-network,bao-finance,terrausd,lepricon,royale,finxflo,daoventures,the-graph,0x,omisego,injective-protocol,badger-dao,rook,utrust,alpha-finance,rari-governance-token,polkafoundry,raze-network,kylin-network,labs-group,paid-network,dragonbite,b-cube-ai,alpha-impact,media-licensing-token,refinable,wbnb,greenheart-cbd,enjincoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'));

        async function returnBalancePOLYGON(token, address) {
            let contract = new web3polygon.eth.Contract(abis.minABI, token);
            let decimals = await contract.methods.decimals().call();
            let balance = await contract.methods.balanceOf(address).call();
            balance = await new BigNumber(balance).div(10 ** decimals).toFixed(2);
            return parseFloat(balance);
        }

        async function getPriceOfQuickPair(pair) {
            let lpTokenPrice = 0
            const token1price = price_feed.data[pair.price1].usd
            let quickPairContractService = new web3polygon.eth.Contract(QUICK_LP, pair.pairAddress);
            let decimals = await quickPairContractService.methods.decimals().call();
            const totalSupplyScaledDown = await quickPairContractService.methods.totalSupply().call() / 10 ** decimals;
            const token1Supply = await quickPairContractService.methods.getReserves().call();
            const token1SupplyScaledDown = token1Supply._reserve0 / 10 ** decimals;
            lpTokenPrice = ((token1SupplyScaledDown * token1price) / totalSupplyScaledDown) * 2;
            return lpTokenPrice;
        };

        const stakingAssetsPOLYGON = [
            //OM staking
            { contract: '0xCdD0f77A2A158B0C7cFe38d00443E9A4731d6ea6', token: '0xc3ec80343d2bae2f8e680fdadde7c17e71e114ea', price: 'mantra-dao'}
        ]

        // POLYGON  LP Staking
        const lpStakingAssetsPOLYGON = [
            // OM-WETH LP staking
            {
                contract: '0xCBf42Ace1dBD895FFDCaBC1b841488542626014d',
                pairAddress: '0xff2bbcb399ad50bbd06debadd47d290933ae1038',
                token1: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                price1: 'weth',
                token2: '0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea',
                price2: 'mantra-dao'
            }
        ]

        await Promise.all(stakingAssetsPOLYGON.map(async (asset) => {
            // POLYGON STAKING ASSETS
                let balance = await returnBalancePOLYGON(asset.token, asset.contract);
                tvlPolygon += (parseFloat(balance) * price_feed.data[asset.price].usd)
        }))

        await Promise.all(lpStakingAssetsPOLYGON.map(async (pair) => {
            // POLYGON LP STAKING ASSETS
                let lpTokenPrice = await getPriceOfQuickPair(pair)
                let balance = await returnBalancePOLYGON(pair.pairAddress, pair.contract);
                tvlPolygon += (parseFloat(balance) * lpTokenPrice)
        }))

        tvlTotal += tvlPolygon;

        return tvlPolygon;

}

module.exports = {
    ethereum: {
        fetch: fetchETH
    },
    bsc: {
        fetch: fetchBSC
    },
    polygon: {
        fetch: fetchPolygon
    },
    fetch: async ()=>((await fetchETH())+(await fetchBSC())+(await fetchPolygon()))
}