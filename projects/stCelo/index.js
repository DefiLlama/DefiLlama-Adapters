const sdk = require('@defillama/sdk')

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

    const stCelo_contract_address = '0x4aAD04D41FD7fd495503731C5a2579e19054C432';

    const block = chainBlocks.celo

    const stCelo_pooled = await sdk.api.abi.call({
        abi: "uint256:getTotalCelo",
        target: stCelo_contract_address,
        block: block,
        chain: 'celo'
    })

    return {
        'celo': Number(stCelo_pooled.output) / 1e18
    };
}

module.exports = {
            methodology: 'TVL counts Celo staked by the protocol.',
    start: 14330000,
    celo: {
        tvl 
    }
}
