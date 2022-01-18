const sdk = require("@defillama/sdk");

const tokens = {
    IBFR: "0xa296aD1C47FE6bDC133f39555C1D1177BD51fBc5",
    POOL: "0x7338ee5535F1E0f1a210a6Ef6dB34f5357EB9860",
};

async function tvl(_timestamp, ethBlock, chainBlocks) {

    const ibfrV1 = (await sdk.api.erc20.balanceOf({
        target: tokens.IBFR,
        owner: '0xE6C2cDD466Eb1Fa6bDFDb8af1BD072d4A57734C2',
        block: chainBlocks["bsc"],
        chain: "bsc"
    })).output;

    const bnbV1 = (
        await sdk.api.eth.getBalance({
          target: tokens.POOL,
          block: chainBlocks["bsc"],
          chain: "bsc",
        })
      ).output;

    const balances = {
        'bsc:0xa296aD1C47FE6bDC133f39555C1D1177BD51fBc5': ibfrV1,
        'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': bnbV1
    }

    return balances
};


module.exports = {
    tvl,
    methodology: `TVL for Buffer is calculated by using the BNB deposited in the write pool and the iBFR deposited in the revenue share pool`
}