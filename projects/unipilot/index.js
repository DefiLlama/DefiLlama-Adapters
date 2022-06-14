const sdk = require("@defillama/sdk");
const unipilotActiveFactory = '0x4b8e58d252ba251e044ec63125e83172eca5118f'

const { getChainTransform } = require("../helper/portedTokens");
const getPositionDetails = require("./abis/getPositionDetails.json");

function protocolTvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};

    const vaultLogs = (await sdk.api.util.getLogs({
      target: unipilotActiveFactory,
      topic: 'VaultCreated(address,address,uint24,address)',
      keys: [],
      fromBlock: 14495907,
      toBlock: block,
    })).output;

    const vaults = {};

    for (let log of vaultLogs) {
      vaults[`0x${log.topics[3].substr(-40)}`] = {
        token0Address: `0x${log.topics[1].substr(-40)}`,
        token1Address: `0x${log.topics[2].substr(-40)}`,
      }
    }

    const vaultCalls = [];
    const balanceCalls = [];

    for (let vault of Object.keys(vaults)) {
      vaultCalls.push({
        target: vault,
      });
      balanceCalls.push({
        target: vaults[vault].token0Address,
        params: vault,
      });
      balanceCalls.push({
        target: vaults[vault].token1Address,
        params: vault,
      });
    }

    //get vault reserves(amount, fees) from contract
    const vaultReserves = await sdk.api.abi.multiCall({
      chain,
      abi: getPositionDetails,
      calls: vaultCalls,
      block: chainBlocks[chain],
    });

    //get vault balances (remaining asset)
    const vaultBalances = await sdk.api.abi.multiCall({
      chain,
      abi: "erc20:balanceOf",
      calls: balanceCalls,
      block: chainBlocks[chain],
    });

    const chainTransform = await getChainTransform(chain);

    //sum vault reserves (amount+fees)
    for (let reserve of vaultReserves.output) {
      let vaultAddress = reserve.input.target;
      let address0 = vaults[vaultAddress].token0Address;
      let address1 = vaults[vaultAddress].token1Address;

      //amount
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address0),
        reserve.output.amount0
      );
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address0),
        reserve.output.fees0
      );

      //fees
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address1),
        reserve.output.amount1
      );
      sdk.util.sumSingleBalance(
        balances,
        chainTransform(address1),
        reserve.output.fees1
      );
    }

    //vsum vault balances
    sdk.util.sumMultiBalanceOf(balances, vaultBalances, true);

    return balances;
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: protocolTvl("ethereum"),
  },
};
