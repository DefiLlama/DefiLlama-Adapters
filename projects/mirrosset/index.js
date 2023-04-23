const sdk = require('@defillama/sdk')
const USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"
const mUSDC = "0x79568bEfa9bF339e76bE12813cf7430018E1AB58"
const MortgagePool = "0xA6d5df932FFE35810389e00D1A3a698a44A14E85"
const InsurancePool = "0x587Abb291379Ea84AcE583aB07A13109b9B3F347"
const wkava = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const DAI = "0x765277EebeCA2e31912C9946eAe1021199B39C61";


async function tvlKava(timestamp, block, chainBlocks)  {
    const balances = {};
    const usdcInsPool = (await sdk.api.erc20.balanceOf({ target: USDC, owner: InsurancePool,  block: chainBlocks.kava, chain: "kava", })).output
    const mUSDCInsPool = (await sdk.api.erc20.balanceOf({ target: mUSDC, owner: InsurancePool,  block: chainBlocks.kava, chain: "kava", })).output
    const kavaInMorPool = (await sdk.api.eth.getBalance({ target: MortgagePool, block: chainBlocks.kava, chain: "kava", })).output

    sdk.util.sumSingleBalance(balances, USDC, usdcInsPool, 'kava')
    sdk.util.sumSingleBalance(balances, DAI, mUSDCInsPool, 'kava')
    sdk.util.sumSingleBalance(balances, wkava, kavaInMorPool, 'kava')

    return balances;

}


module.exports = {
    kava: {
      tvl: tvlKava,
    },
  }