const sdk = require("@defillama/sdk");

const BLOOD_TOKEN_ADDR = "0x07709260f6C431bc2CB1480F523F4F7c639a5155";
const FOUNTAIN_ADDR = "0x028c7738353a939E654bBDf5Bd57EbB17755cfa0";
const VAULT_ADDR = "0xD7656b90263f6ceaB35370d37f08fD1aEc19A421";

async function staking(api) {

  const { output: klayBalance } = await sdk.api2.eth.getBalance({ target: FOUNTAIN_ADDR, ...api })
  const [bldBalance, stakingBalance] = await api.multiCall({ abi: 'erc20:balanceOf', calls: [FOUNTAIN_ADDR, VAULT_ADDR], target: BLOOD_TOKEN_ADDR })

  const bloodPrice = klayBalance / bldBalance
  const staking = stakingBalance * bloodPrice / 1e18
  api.addCGToken('klay-token', staking)
}

async function pool2(api) {
  const { output: klayBalance } = await sdk.api2.eth.getBalance({ target: FOUNTAIN_ADDR, ...api })
  const pool2Balance = klayBalance * 2 / 1e18
  api.addCGToken('klay-token', pool2Balance)
}

module.exports = {
  klaytn: {
    tvl: () => ({}), staking, pool2,
  }
};
