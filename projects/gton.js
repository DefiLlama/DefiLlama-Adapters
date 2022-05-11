const sdk = require("@defillama/sdk");
const axios = require("axios");
const retry = require("./helper/retry");
const { transformFantomAddress } = require("./helper/portedTokens");

const gton = "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4";
const stakingContract = "0xB0dAAb4eb0C23aFFaA5c9943d6f361b51479ac48";
const treasury = "0xB3D22267E7260ec6c3931d50D215ABa5Fd54506a";


async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformFantomAddress();

    const treasuryTokens = (
        await retry(
          async (bail) =>
            await axios.get(
              `https://api.covalenthq.com/v1/${250}/address/${treasury}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
            )
        )
      ).data.data.items.map((t) => t.contract_address);

    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: treasuryTokens.map((token) => ({
            target: token,
            params: [ treasury ],
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: "fantom",
    });

    sdk.util.sumMultiBalanceOf(balances, underlyingBalances, true, transform);

    delete balances['0x01e0e2e61f554ecaaec0cc933e739ad90f24a86d'];

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
        staking
    }
};