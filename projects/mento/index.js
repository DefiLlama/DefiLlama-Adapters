const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");
const { getBlock } = require('../helper/getBlock');

async function tvl(timestamp, ethBlock, chainBlocks) {

    /*
        Mento is an automated market maker (AMM) type of decentralized exchange that’s native to the Celo platform. It’s responsible 
        for helping the Celo Dollar (cUSD) maintain its peg to the USD. When demand for the stablecoin increases the Celo protocol 
        mints cUSD and ‘sells’ them for CELO (Celo’s native asset) via Mento. The CELO assets are used as cUSD collateral and are 
        stored in the Celo reserve. This all happens on-chain. If demand for cUSD decreases then the reverse process happens. 
        Mento arbitrage opportunities arise in cases where there’s cUSD/USD depeg. This incentive for traders should help 
        restore the cUSD/USD peg.
        More info here: https://medium.com/celoorg/zooming-in-on-the-celo-expansion-contraction-mechanism-446ca7abe4f
    */

    const mento_contract_address = '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9';
    const mento_locked_contract_address = '0x246f4599eFD3fA67AC44335Ed5e749E518Ffd8bB';

    const block = await getBlock(timestamp, 'celo', chainBlocks)

    const mento_pooled = await sdk.api.eth.getBalance({
        target: mento_contract_address,
        block,
        chain: 'celo'
    })

    const mento_locked_pooled = await sdk.api.eth.getBalance({
        target: mento_locked_contract_address,
        block,
        chain: 'celo'
    })

    console.log()

    return {
        'celo': Number(mento_pooled.output)/1e18 + Number(mento_locked_pooled.output)/1e18
    };
}

module.exports = {
    methodology: 'TVL counts Celo deposited as collateral to mint cUSD.',
    tvl,
}
