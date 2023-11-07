const ADDRESSES = require('../helper/coreAssets.json');

const USDC_ADDRESS = ADDRESSES.ethereum.USDC;
const SWEEP_ADDRESS = '0xB88a5Ac00917a02d82c7cd6CEBd73E2852d43574';

const config = {
    ethereum: {
        fromBlock: 18017036,
    },
    arbitrum: {
        fromBlock: 124179091,
    },
    optimism: {
        fromBlock: 110684392,
    }
};

async function tvl(_a, _b, _c, { api }) {
    const totalSupply = await api.multiCall({ abi: 'uint256:totalSupply', calls: [SWEEP_ADDRESS] })
    const supplyInUSD = await api.multiCall({
        abi: 'function convertToUSD(uint256) external view returns(uint256)',
        calls: [{ target: SWEEP_ADDRESS, params: totalSupply }]
    })

    return { [USDC_ADDRESS]: supplyInUSD }
}

Object.keys(config).forEach((chain) => {
    module.exports[chain] = { tvl };
});
