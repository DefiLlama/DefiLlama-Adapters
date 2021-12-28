const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const abi = require('./abi.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DATA_PROVIDERS = {
    ETHEREUM: '0x8F5273c5aa638e946BC5dD2171Ae9E9184C75228',
    BSC: '0xa450547F27F0947760C9C818d9fd2CD51DFA7441',
};

function _tvlByChain(chainName, dataProviderAddress) {
    return async function tvl(timestamp, ethBlock, chainBlocks) {
        const block = chainBlocks[chainName];
        const transform = (chainName == 'ethereum' ? (a => a) : await transformBscAddress())
        const {output: reservesData} = await sdk.api.abi.call({
            target: dataProviderAddress,
            abi: abi.find(abi => abi.name === 'getReservesData'),
            params: [ZERO_ADDRESS],
            block,
            chain: chainName,
        });

        const [reserves] = reservesData;
        const totalSupply = await sdk.api.abi.multiCall({
            abi: 'erc20:totalSupply',
            calls: reserves.map(reserve => ({target: reserve.depositTokenAddress})),
            block,
            chain: chainName,
        });

        let balances = {};
        totalSupply.output.forEach((call, index) => {
            const tokenAddress = reserves[index].underlyingAsset;
            const tokenBalance = call.output;

            sdk.util.sumSingleBalance(balances, transform(tokenAddress), tokenBalance);
        })

        if ('bsc:0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B' in balances) {
            balances['tron'] = balances['bsc:0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B'] / 10 ** 18;
            delete balances['bsc:0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B'];
        };
        if ('0x8E16bf47065Fe843A82f4399bAF5aBac4E0822B7' in balances) {
            balances['filecoin'] = balances['0x8E16bf47065Fe843A82f4399bAF5aBac4E0822B7'] / 10 ** 18;
            delete balances['0x8E16bf47065Fe843A82f4399bAF5aBac4E0822B7'];
        };

        return balances;
    }
}

const ethereum = _tvlByChain('ethereum', DATA_PROVIDERS.ETHEREUM);
const bsc = _tvlByChain('bsc', DATA_PROVIDERS.BSC);

module.exports = {
    name: 'Augmented Finance',
    website: 'https://augmented.finance',
    token: 'AGF',
    category: 'lending',
    start: 13339609, // Oct-02-2021 11:33:05 AM +UTC
    ethereum: {
        tvl: ethereum,
    },
    bsc: {
        tvl: bsc,
    },
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
    tvl: sdk.util.sumChainTvls([ethereum, bsc])
}
