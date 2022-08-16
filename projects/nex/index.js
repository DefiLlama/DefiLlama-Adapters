const sdk = require('@defillama/sdk');
const axios = require('axios')

const { transformAuroraAddress } = require("../helper/portedTokens");

const auroraApiEndpoint = 'https://stats.nex.market/api/tokens'
const auroraVault = '0x5827094484b93989D1B75b12a57989f49e3b88B0';

const auroraTVL = async (timestamp, block, chainBlocks) => {
    const transform = await transformAuroraAddress();
    const balances = {};
    const allTokens = (await axios.get(auroraApiEndpoint)).data;
    const tokenBalances = await sdk.api.abi.multiCall({
        block: chainBlocks.aurora,
        calls: allTokens.map(token => ({
            target: token,
            params: [auroraVault]
        })),
        abi: 'erc20:balanceOf',
        chain: 'aurora',
    });
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);
    return balances;
};

module.exports = {
  aurora:{
    tvl: auroraTVL
  }
};