const { staking } = require('../helper/staking')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {transformHarmonyAddress} = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')

const wagmiAddresses = {
  staking: "0x95066025af40F7f7832f61422802cD1e13C23753",
  wagmi: "0x0dc78c79B4eB080eaD5C1d16559225a46b580694",
  treasury: "0x1A9Be7D6f94D3Ba8c37568E08D8D8780AAD128E6"
}

const wagmiReserves = {
  single: {
    dai: "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339",
    ust: "0x224e64ec1BDce3870a6a6c777eDd450454068FEC"
  },
  lp: {
    wagmiDai: "0xb8F4c06dD0C2f9eb5e67B4FAA2d56Ff3543d6765",
    wagmiUst: "0xd7E332b4C9f97eA6D05Db8C38F133307ad8847F3"
  }
}

async function tvl(time, ethBlock, chainBlocks) {
  const balances = {}
  const transform = await transformHarmonyAddress()
  const block = await getBlock(time, "harmony", chainBlocks, true)

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [wagmiReserves.single.dai, false],
      [wagmiReserves.lp.wagmiDai, true],
      [wagmiReserves.single.ust, false],
      [wagmiReserves.lp.wagmiUst, true],
    ],
    [wagmiAddresses.treasury],
    block,
    "harmony",
    transform
  );

  return balances;
}

module.exports = {
  harmony: {
    tvl,
    staking: staking(wagmiAddresses.staking, wagmiAddresses.wagmi, "harmony")
  },
  methodology:
    "Counts tokens in the treasury for tvl and staked WAGMI for staking",
};
