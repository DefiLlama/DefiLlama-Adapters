const BN = require('bn.js');
const sdk = require('@defillama/sdk');

const atUSD = '0xc4af68Dd5b96f0A544c4417407773fEFDc97F58d';
const atETH = '0xc314b8637B05A294Ae9D9C29300d5f667c748baD';

const NAV = '0x5D3920CCC068039E5B6FE680CaB7Aa09fE8E053C';

const abi = 'function getNavByTimestamp(address,uint48) view returns (uint256 , uint48 )';

const getAtUSDNav = async (timestamp) => {
    const chain = 'ethereum';
    const ethApi = new sdk.ChainApi({ chain, timestamp });
    await ethApi.getBlock();
    const vault = await ethApi.call({ target: NAV, params: [atUSD, timestamp], abi });
    return new BN(vault[0].toString());
};

const getAtETHNav = async (timestamp) => {
    const chain = 'ethereum';
    const ethApi = new sdk.ChainApi({ chain, timestamp });
    await ethApi.getBlock();
    const vault = await ethApi.call({ target: NAV, params: [atETH, timestamp], abi });
    return new BN(vault[0].toString());
};

const tvl = async (api) => {
    const usdNav = await getAtUSDNav(api.timestamp);
    const ethNav = await getAtETHNav(api.timestamp);

    const chain = 'gravity';
    const gravityApi = new sdk.ChainApi({ chain });
    await gravityApi.getBlock();
    const usdtSupply = new BN(
        (await gravityApi.call({
            abi: 'erc20:totalSupply',
            target: atUSD,
        })).toString()
    );
    const ethSupply = new BN(
        (await gravityApi.call({
            abi: 'erc20:totalSupply',
            target: atETH,
        })).toString()
    );



    const usdtResult = usdtSupply.mul(usdNav).div(new BN('10').pow(new BN(30)));
    const ethResult = ethSupply.mul(ethNav).div(new BN('10').pow(new BN(18)));


    api.add('0xdac17f958d2ee523a2206206994597c13d831ec7', usdtResult.toString());
    api.add('0x0000000000000000000000000000000000000000', ethResult.toString());
};

module.exports = {
    ethereum: {
        tvl: tvl,
    },
};