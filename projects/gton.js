const sdk = require("@defillama/sdk");
const axios = require("axios");
const retry = require("./helper/retry");
const { transformFantomAddress } = require("./helper/portedTokens");
const { sumTokens } = require("./helper/unwrapLPs");

const gton = "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4".toLowerCase();
const stakingContract = "0xB0dAAb4eb0C23aFFaA5c9943d6f361b51479ac48";
const treasury = "0xB3D22267E7260ec6c3931d50D215ABa5Fd54506a";
const fantomToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const chain = 'fantom'


async function tvl(timestamp, _block, { fantom: block}) {
    const balances = {};

    let treasuryTokens = (
        await retry(
          async (bail) =>
            await axios.get(
              `https://api.covalenthq.com/v1/${250}/address/${treasury}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
            )
        )
      ).data.data.items.map((t) => t.contract_address);
    
    treasuryTokens = treasuryTokens.map(a => a.toLowerCase()).filter(a => a !== fantomToken).map(a => [a, treasury])

    const fantomBalance = (await sdk.api.eth.getBalance({ target: treasury, block, chain})).output
    sdk.util.sumSingleBalance(balances, 'fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', fantomBalance)
    await sumTokens(balances, treasuryTokens, block, chain, undefined, { resolveLP: true })
    delete balances['fantom:'+gton];
    return balances;
};

async function staking(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformFantomAddress();

    const underlyingBalances = await sdk.api.abi.multiCall({
        target: gton,
        calls: [ stakingContract, treasury ].map(c => ({
            params: c
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: "fantom",
    });

    sdk.util.sumMultiBalanceOf(balances, underlyingBalances, true, transform);

    return balances;
};

module.exports = {
    fantom: {
        tvl,
        staking,
    }
};