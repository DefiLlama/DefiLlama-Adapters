const sdk = require('@defillama/sdk')

async function bsctvl(timestamp, ethBlock, chainBlocks) {

    const nestVault = '0x65e7506244CDdeFc56cD43dC711470F8B0C43beE';
    const NEST_token = '0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7'

    const strat_bal = (
        await sdk.api.abi.call({
          abi: 'erc20:balanceOf',
          target: NEST_token,
          params: nestVault,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;

    return {
        'nest': Number(strat_bal) / 1e18
    };
}

async function ethtvl(timestamp, ethBlock, chainBlocks) {

    const eth_nestVault = '0x12858F7f24AA830EeAdab2437480277E92B0723a';
    const ETH_NEST_token = '0x04abEdA201850aC0124161F037Efd70c74ddC74C'

    const eth_strat_bal = (
        await sdk.api.abi.call({
          abi: 'erc20:balanceOf',
          target: ETH_NEST_token,
          params: eth_nestVault,
          chain: "ethereum",
          block: ethBlock,
        })
      ).output;

    return {
        'nest': Number(eth_strat_bal) / 1e18
    };
}

module.exports = {
            methodology: 'TVL counts NEST tokens used as collateral by the protocol.',
    bsc: {
        tvl: bsctvl 
    },
    ethereum: {
        tvl: ethtvl
    }
}