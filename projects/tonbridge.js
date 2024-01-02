const sdk = require("@defillama/sdk");
const axios = require('axios');
const burl = 'https://token-indexer.broxus.com/v1/root_contract/root_address/0:';
const tokenMap = {
    'eb2ccad2020d9af9cec137d3146dde067039965c13a27d97293c931dae22b2b9': 'dai',
    'a519f99bb5d6d51ef958ed24d337ad75a1c770885dcd42d51d6663f9fcdacfb2': 'tether',
    'c37b3fafca5bf7d3704b081fde7df54f298736ee059bf6d32fac25f5e6085bf6': 'usd-coin',
    '2ba32b75870d572e255809b7b423f30f36dd5dea075bd5f026863fceb81f2bcf': 'wrapped-bitcoin',
    '59b6b64ac6798aacf385ae9910008a525a84fc6dcf9f942ae81f8e8485fe160d': 'weth',
    //'1e6e1b3674b54753864af7b15072566ce632965bd83bab431a8ff86d68cf1657': 'UNIV2-usdt-wton',
    'efed9f9a7e6c455ee60829fd003b2f42edda513c6f19a484f916b055e9aa58d2': 'frax',
    'c14e2f026feaae0f99b92c04ee421051a782fff60156ac8a586a12f63d7facef': 'frax-share',
    //'f48054939064d686a9ad68d96d9ab79e409b095557c06ab7f073097dade7057f': 'dartflex',
    //'00ca16398f314a9b3bed582dc69582515d866ededb6c4e18190f63b305cedf91': NA
    'a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d': 'everscale',
    'b2e341c01da068d43cfa0eae6dae36b12b476e55cf2c3eeb002689f44b9ddef9': 'aave',
    'bc77ba7f3cbbebcca393e85ed479ef44df63cdee4fb572c3e0f904fb9fc63e25': 'compound-governance-token',
    '7dd7ae82835848dc6b490515ec4034968a8ceff893a6d5f31ab3cdfcfb79bbb6': 'curve-dao-token',
    '6b2baa777b89da66dddaf9f1602142987b13ca565bbb170da929ea945f5ce9fb': 'stasis-eurs',
    //'387609364f765017fa3fa5815e08d420e054c88a86426cd6d5aaf2a1ee46ff5a': 'torn',
    'e114f1f7d21ac6566d988c983315e0cdd5bee7b43c08918537d1117dea7e4534': 'yearn-finance',
    '3c66e3e0ce0a909ce8779b31509db773e544132d8fa6f6641c00bce257c79d9c': '1inch',
    //'bf1c7c0e8a187d9d5ba6069bf768b69a982df8b22ef8430b31dcc4f97263507e': 'dartflex'
};

async function tvl() {
    const balances = {};
    const tokenAddresses = Object.keys(tokenMap);
    for (let i = 0; i < tokenAddresses.length; i++) {
        const supply = (await axios.get(burl + tokenAddresses[i])).data.totalSupply;
        balances[tokenMap[tokenAddresses[i]]] = supply
    }
    return balances;
}

function evm(chain, target) {
    return async (timestamp, block, chainBlocks) => {
        return { everscale: (await sdk.api.abi.call({
            target,
            abi: 'erc20:totalSupply',
            block: chainBlocks[chain],
            chain,
        })).output / 10 ** 9 };
    };
}

module.exports = {
    timetravel: false,
    everscale: {
        tvl
    },
    bsc: {
        tvl: evm('bsc', '0x0A7e7D210C45c4abBA183C1D0551B53AD1756ecA')
    },
    ethereum: {
        tvl: evm('ethereum', '0x29d578CEc46B50Fa5C88a99C6A4B70184C062953')
    },
    avax:{
        tvl: evm('avax', '0x1ffefd8036409cb6d652bd610de465933b226917')
    },
    milkomeda: {
        tvl: evm('milkomeda', '0x1ffEFD8036409Cb6d652bd610DE465933b226917')
    },
    polygon: {
        tvl: evm('polygon', '0x1ffEFD8036409Cb6d652bd610DE465933b226917')
    },
    fantom: {
        tvl: evm('fantom', '0x1ffEFD8036409Cb6d652bd610DE465933b226917')
    },
    hallmarks:[
        [1651881600, "UST depeg"],
      ],
};