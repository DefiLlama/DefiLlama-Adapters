const sdk = require('@defillama/sdk')
const { stakingUnknownPricedLP, staking } = require("../helper/staking");
const BigNumber = require('bignumber.js')

const chef = "0x58a8E42C071b9C9d049F261E75DE5568Ef81a427"
const wkava = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f";
const DAI = "0x765277EebeCA2e31912C9946eAe1021199B39C61";
const VARA = "0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73";
const MARE = "0xd86C8d4279CCaFbec840c782BcC50D201f277419";
const wkavausdc = "0x5C27a0D0e6d045b5113D728081268642060f7499"
const varausdc = "0x9bf1E3ee61cBe5C61E520c8BEFf45Ed4D8212a9A"
const mareusdc = "0x0e1bc1939D977c676Cd38cFF4B7e411C32b6d3ce"
const kfdusdc = "0x2877E675913F6e378849dbd505070157046C9088";

async function tvlKava(timestamp, block, chainBlocks)  {
    const wkavaTvl = await stakingUnknownPricedLP(chef, wkava, 'kava', wkavausdc)(timestamp, block, chainBlocks);
    const balances = {}
    const usdcTvl = await staking(chef, USDC, 'kava')(timestamp, block, chainBlocks);
    const daiTvl = await staking(chef, DAI, 'kava')(timestamp, block, chainBlocks);
    const varaTvl = await stakingUnknownPricedLP(chef, VARA, 'kava', varausdc)(timestamp, block, chainBlocks);
    const mareTvl = await stakingUnknownPricedLP(chef, MARE, 'kava', mareusdc)(timestamp, block, chainBlocks);

    const kfdusdcStakingLp = (await sdk.api.erc20.balanceOf({ target: kfdusdc, owner: chef,  block: chainBlocks.kava, chain: "kava", })).output
    const lpOfUSDC = (await sdk.api.erc20.balanceOf({ target: USDC, owner: kfdusdc,  block: chainBlocks.kava, chain: "kava", })).output
    const totalSupply = (await sdk.api.erc20.totalSupply({ target: kfdusdc,  block: chainBlocks.kava, chain: "kava", })).output
    const kfdusdcTvl =  BigNumber(lpOfUSDC).multipliedBy(2).multipliedBy(kfdusdcStakingLp).dividedBy(totalSupply).toFixed(0)
    
    sdk.util.sumSingleBalance(balances, USDC, kfdusdcTvl, 'kava')
    sdk.util.mergeBalances(balances, wkavaTvl);
    sdk.util.mergeBalances(balances, usdcTvl);
    sdk.util.mergeBalances(balances, daiTvl);
    sdk.util.mergeBalances(balances, varaTvl);
    sdk.util.mergeBalances(balances, mareTvl);

    return balances
}

module.exports = {
    kava: {
      tvl: tvlKava,
    },
  }