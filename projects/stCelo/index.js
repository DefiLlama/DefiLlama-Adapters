const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");
const { getBlock } = require('../helper/getBlock');

async function tvl(timestamp, ethBlock, chainBlocks) {

    /*
        StakedCelo is an open source liquid staking protocol on Celo. It encourages stakers of CELO to participate further in the Celo 
        community by engaging across other applications in the Celo ecosystem. StakedCelo allows users to deposit CELO and receive receipt 
        utility tokens—stCELO —in return. Active participants in the protocol can stake deposited CELO, which allows Epoch Rewards associated 
        with staking to be received by the protocol as a smart contract. These rewards are shared equally among all holders of stCELO, but are not 
        released to the participants at the time of staking. At any point in time, a user can choose to withdraw their assets from the protocol by 
        returning the stCELO and receiving the corresponding CELO (including any accrued rewards). The protocol is completely non-custodial, meaning 
        that no one can ever withdraw a user’s funds besides that user.
        More info here: https://stcelo.xyz/connect
    */

    const mento_contract_address = '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9';
    const mento_locked_contract_address = '0x246f4599eFD3fA67AC44335Ed5e749E518Ffd8bB';

    const block = chainBlocks.celo

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

    return {
        'celo': Number(mento_pooled.output) / 1e18 + Number(mento_locked_pooled.output) / 1e18
    };
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL counts Celo deposited as collateral to mint cUSD.',
    start: 14330000,
    celo: { 
        tvl 
    },
}
