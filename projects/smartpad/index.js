const sdk = require('@defillama/sdk')

const data = {
    aurora: {
      padTokenAddress: '0x0fAD0ED848A7A16526E8a7574e418B015Dbf41B5',
      stakingContractAddress: '0x3e2F9dE8c59CdCd1fff14963A9c0155410e8Bb07'
    },
    ethereum: {
      padTokenAddress: '0x5067006F830224960Fb419D7f25a3a53e9919BB0',
      stakingContractAddress: '0x105aaB1C3314D61282b4FBF598D07302cf731EF3'
    },
    polygon: {
      padTokenAddress: '0x0Ad2Eff7F37E0037B5E30C1947f31ABdf11461e4',
      stakingContractAddress: '0xa2269805f2Fd714ea0205d44c816cD0ea6f85BdC'
    },
}

const toNumber = (decimals, n) => Number(n)/Math.pow(10, decimals)

function getTVLFunction(chain)
{
    return async function tvl(timestamp, ethBlock, {[chain]: block}) {
        const balances = {};

        const chainData = data[chain];

        const balance = await sdk.api.erc20.balanceOf({
            block,
            chain,
            target: chainData.padTokenAddress,
            owner: chainData.stakingContractAddress
        });

        sdk.util.sumSingleBalance(balances, 'smartpad', toNumber(18, balance.output));

        return balances;
    }
}

module.exports={
    methodology: "All tokens locked in Smartpad.",
    ethereum: {
      staking: getTVLFunction('ethereum'),
      tvl: () => ({})
    },
    polygon: {
      staking: getTVLFunction('polygon'),
      tvl: () => ({})
    },
    aurora: {
      staking: getTVLFunction('aurora'),
      tvl: () => ({})
    }
}
