const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");

const BLOOD_TOKEN_ADDR = "0x07709260f6C431bc2CB1480F523F4F7c639a5155";
const FOUNTAIN_ADDR = "0x028c7738353a939E654bBDf5Bd57EbB17755cfa0";
const VAULT_ADDR = "0xD7656b90263f6ceaB35370d37f08fD1aEc19A421";

const chain = 'klaytn'
let balanceResolve

function getTvlPromise(key) {
  return async (ts, _block, chainBlocks) => {
    if (!balanceResolve)
      balanceResolve = getTvl(ts, _block, chainBlocks)
    return (await balanceResolve)[key]
  }
}
async function getTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const transform = await getChainTransform(chain);

  const balances = {
    staking: {},
    pool2: {},
    tvl: {}
  }

  const { output: klayBalance } = await sdk.api.eth.getBalance({ target: FOUNTAIN_ADDR, block, chain})
  const { output: bldBalance } = await sdk.api.erc20.balanceOf({ target: BLOOD_TOKEN_ADDR, owner: FOUNTAIN_ADDR, block, chain})
  const { output: stakingBalance } = await sdk.api.erc20.balanceOf({ target: BLOOD_TOKEN_ADDR, owner: VAULT_ADDR, block, chain})

  const pool2Balance = klayBalance * 2 / 10 ** 18
  const bloodPrice = klayBalance / bldBalance
  const staking = stakingBalance * bloodPrice / 10 ** 18
  sdk.util.sumSingleBalance(balances.pool2, 'klay-token', pool2Balance )
  sdk.util.sumSingleBalance(balances.staking, 'klay-token', staking )

  return balances
}

module.exports = {
  klaytn:
    ['tvl', 'staking', 'pool2']
      .reduce((acc, key) => ({ ...acc, [key]: getTvlPromise(key) }), {}),
};
