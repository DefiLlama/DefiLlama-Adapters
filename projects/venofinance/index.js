const sdk = require('@defillama/sdk')

async function tvl(timestamp, ethBlock, chainBlocks) {


    const lcro_contract_address = '0x9Fae23A2700FEeCd5b93e43fDBc03c76AA7C08A6';

    const block = chainBlocks.cronos

    const cro_pooled = await sdk.api.abi.call({
        abi: "uint256:getTotalPooledCro",
        target: lcro_contract_address,
        block: block,
        chain: 'cronos'
    })

    return {
        'crypto-com-chain': Number(cro_pooled.output) / 1e18
    };
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL counts CRO staked by the protocol.',
    cronos: {
        tvl 
    }
}