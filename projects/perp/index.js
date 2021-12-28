const sdk = require("@defillama/sdk");
const {transformXdaiAddress} = require('../helper/portedTokens');
const { staking } = require("../helper/staking");

const insuranceFund = "0x8C29F6F7fc1999aB84b476952E986F974Acb3824"
const clearingHouse = "0x5d9593586b4B5edBd23E7Eba8d88FD8F09D83EBd"
const usdcXdai = "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"

const perpToken = "0xbC396689893D065F41bc2C6EcbeE5e0085233447"
const stakingContract = "0x0f346e19F01471C02485DF1758cfd3d624E399B4"

async function xdai(_timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: usdcXdai,
            params: insuranceFund
        },{
            target: usdcXdai,
            params: clearingHouse
        }],
        block: chainBlocks.xdai,
        abi: "erc20:balanceOf",
        chain: 'xdai'
    });
    const usdc = await (await transformXdaiAddress())(usdcXdai);
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[0].output)
    sdk.util.sumSingleBalance(balances, usdc, underlyingBalances.output[1].output)

    return balances
}

module.exports = {
    ethereum: {
        staking: staking(stakingContract, perpToken)
    },
    xdai: {
        tvl: xdai
    },
    optimism:{
        tvl: staking("0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60", "0x7f5c764cbc14f9669b88837ca1490cca17c31607", "optimism")
    },

}