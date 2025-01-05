const BN = require('bn.js');
const sdk = require('@defillama/sdk');

const atUSD = '0xc4af68Dd5b96f0A544c4417407773fEFDc97F58d';
const atETH = '0xc314b8637B05A294Ae9D9C29300d5f667c748baD';
const NAV = '0x5D3920CCC068039E5B6FE680CaB7Aa09fE8E053C';
const abi = 'function getNavByTimestamp(address,uint48) view returns (uint256 , uint48 )';

const tvl = async (api) => {
    const chainEth = 'ethereum';
    const chainGravity = 'gravity';

    const ethApi = new sdk.ChainApi({ chain: chainEth, timestamp: api.timestamp });
    const gravityApi = new sdk.ChainApi({ chain: chainGravity });

    await Promise.all([ethApi.getBlock(), gravityApi.getBlock()]);

    const [usdNav, ethNav, usdtSupply, ethSupply] = await Promise.all([
        ethApi.call({ target: NAV, params: [atUSD, api.timestamp], abi }),
        ethApi.call({ target: NAV, params: [atETH, api.timestamp], abi }),
        gravityApi.call({ abi: 'erc20:totalSupply', target: atUSD }),
        gravityApi.call({ abi: 'erc20:totalSupply', target: atETH }),
    ]);

    // Convert results to BN
    const usdNavBN = new BN(usdNav[0].toString());
    const ethNavBN = new BN(ethNav[0].toString());
    const usdtSupplyBN = new BN(usdtSupply.toString());
    const ethSupplyBN = new BN(ethSupply.toString());

    // Perform calculations
    const usdtResult = usdtSupplyBN.mul(usdNavBN).div(new BN('10').pow(new BN(30)));
    const ethResult = ethSupplyBN.mul(ethNavBN).div(new BN('10').pow(new BN(18)));

    // Add results to API
    api.add('0xdac17f958d2ee523a2206206994597c13d831ec7', usdtResult.toString());
    api.add('0x0000000000000000000000000000000000000000', ethResult.toString());
};

module.exports = {
    ethereum: {
        tvl: tvl,
    },
};