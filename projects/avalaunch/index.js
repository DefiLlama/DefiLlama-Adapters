const sdk = require('@defillama/sdk')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const {fixAvaxBalances} = require('../helper/portedTokens')

const xavaAddress = "0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4";
const stakingContracts = [
    "0xE82AAE7fc62547BdFC36689D0A83dE36FF034A68", // single staking
    "0xA6A01f4b494243d84cf8030d982D7EeB2AeCd329" // allocation proxy
];
const lp = "0x42152bDD72dE8d6767FE3B4E17a221D6985E8B25";
const farm = "0x6E125b68F0f1963b09add1b755049e66f53CC1EA";

async function tvl(){
    return {};
};
async function pool2(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.avax;
    const lpLocked = await sdk.api.erc20.balanceOf({
        target: lp,
        owner: farm,
        block,
        chain: 'avax'
    });
    const balances = {};
    await unwrapUniswapLPs(balances, [{
        token: lp,
        balance: lpLocked.output
    }], block, 'avax', addr=>`avax:${addr}`);
    fixAvaxBalances(balances);
    return balances;
};
async function staking(timestamp, ethBlock, chainBlocks){
    const block = chainBlocks.avax;
    const balances  = await sdk.api.abi.multiCall({
        block: block,
        chain: 'avax',
        calls: stakingContracts.map(c => ({
            target: xavaAddress,
            params: c
        })),
        abi: 'erc20:balanceOf'
      });
    let staking = {};
    staking[`avax:${xavaAddress}`] = balances.output.map(b => 
        b.output).reduce((a, b) => Number(a) + Number(b), 0)
    return staking;
};

module.exports={
    methodology: "Within pool2, it counts the XAVA-AVAX staked in the farm",
    tvl,
    pool2:{
        tvl:pool2
    },
    staking:{
        tvl:staking
    }
}
