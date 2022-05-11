const sdk = require('@defillama/sdk');
const abi = require('./ABI.json');
const {getTokens} = require('../helper/getTokens');
const {getChainTransform} = require('../helper/portedTokens');

const CONTRACTS = {
    ethereum: {
        STAKING: '0xee6a649aa3766bd117e12c161726b693a1b2ee20',
        RAIL: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
        TREASURY: '0xc851fbe0f07a326ce0326ccc70c2a62732e74d6c',
        PROXY: '0xbf0Af567D60318f66460Ec78b464589E3f9dA48e',
    },

    bsc: {
        STAKING: '0x753f0F9BA003DDA95eb9284533Cf5B0F19e441dc',
        RAIL: '0x3F847b01d4d498a293e3197B186356039eCd737F',
        TREASURY: '0x19B620929f97b7b990801496c3b361CA5dEf8C71',
        PROXY: '0xCe567352AeE08F11682B71D58685eb9b01ea045a',
    },

    polygon: {
        STAKING: '0x9AC2bA4bf7FaCB0bbB33447e5fF8f8D63B71dDC1',
        RAIL: '0x92A9C92C215092720C731c96D4Ff508c831a714f',
        TREASURY: '0x7C956dB76b4Bd483F96fcE6beA3615f263aFD333',
        PROXY: '0x61ca7a0346a10cea849910C29617ac316461AD76',
    },
};

function getTVLFunc(contractAddress, chain) {
    return async function(timestamp, block) {
        const chainTransform = await getChainTransform(chain);
        const balances = {};
        const tokens = await getTokens(contractAddress);
        const result = await sdk.api.abi.multiCall({
            calls: tokens.map(t => ({target: t, params: contractAddress})),
            abi: 'erc20:balanceOf',
            block: block,
            chain
        });

        for(const r of result.output) {
            if(r.success && r.output && r.output !== '0') {
                balances[chainTransform(r.input.target)] = r.output;
            }
        }

        return balances;
   }
}

function getStakingFunc(stackingContractAddress, chain) {
    return async function staking(timestamp, blockEth, chainBlocks) {
        const chainTransform = await getChainTransform(chain);
        const block = chainBlocks[chain] || blockEth;
        const balances = {};

        const railAddress = chainTransform(CONTRACTS[chain].RAIL);
        try {
            const interval = await sdk.api.abi.call({
                target: stackingContractAddress,
                abi: abi['intervalAtTime'],
                params: timestamp,
                block: block,
	        chain
            });

            const railTVL = await sdk.api.abi.call({
                target: stackingContractAddress,
                abi: abi['globalsSnapshotAt'],
                params: [interval.output, 0],
                block: block,
	        chain
            });

            balances[railAddress] = railTVL.output.totalStaked;
        } catch (e) {
            console.log("Failed to obtain staking info", e);
            balances[railAddress] = 0;
        }

        return balances;
    }
}

function getChainTVL(chain) {
    return {
        staking: getStakingFunc(CONTRACTS[chain].STAKING, chain),
        treasury: getTVLFunc(CONTRACTS[chain].TREASURY, chain),
        tvl: getTVLFunc(CONTRACTS[chain].PROXY, chain),
    };
}

module.exports = {
    ethereum: getChainTVL('ethereum'),
    bsc: getChainTVL('bsc'),
    polygon: getChainTVL('polygon'),
}

