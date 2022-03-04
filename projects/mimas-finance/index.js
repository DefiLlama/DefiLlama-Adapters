const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/unwrapLPs");
const { stakingUnknownPricedLP } = require("../helper/staking");
const BigNumber = require("bignumber.js");
const token = "0x10C9284E6094b71D3CE4E38B8bFfc668199da677";
const stakingContract = "0x268E2E1e5a465034Ee5742DA578feb41B228ad7B";

const mmCRO = "0xff024211741059a2540b01f5Be2e75fC0c1b3d82";
const tokenAndOwner = [
    ["0x062e66477faf219f25d27dced647bf57c3107d52","0xaFb3258b036F2715De4da6019e3bceDdD8B9D55E"], // WBTC
    ["0xe44fd7fcb2b1581822d0c862b68222998a0c299a","0x3f95131c2Cd1E38CdfeA27509CE511e6CAd945bf"], // ETH
    ["0xc21223249CA28397B4B6541dfFaEcC539BfF0c59","0x65dBb59AF50e27BB7F436e28A4d09AC465815C4a"], // USDC
    ["0x66e428c3f67a68878562e79A0234c1F83c208770","0xFe142347a1ef2f9D4Cb2396a0d7aAF7be4A5a19b"] // USDT
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.cronos;
    const chain = "cronos"
    const croBal = (await sdk.api.eth.getBalance({
        target: mmCRO,
        block,
        chain
    })).output;
    sdk.util.sumSingleBalance(balances, ["crypto-com-chain"], BigNumber(croBal).div(10 ** 18).toFixed(0));
    await sumTokens(balances, tokenAndOwner, block, chain, addr=>`cronos:${addr}`)
    return balances;
}

module.exports = {
    cronos: {
        tvl,
        staking: stakingUnknownPricedLP(stakingContract, token, "cronos", "0x67dC494D48665491194B2BF3596c04Efb8D0B564", addr=>`cronos:${addr}`)
    }
}
