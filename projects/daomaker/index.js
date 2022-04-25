const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const DAO = "0x0f51bb10119727a7e5eA3538074fb341F56B09Ad";
const aUST = "0xa8De3e3c934e2A1BB08B010104CcaBBD4D6293ab";
const axios = require("axios");

async function fetchBalances(exports, contracts, transform, chainBlocks, chain) {
  const balances = await sdk.api.abi.multiCall({
    calls: Object.keys(contracts[chain]).map(c => ({
      target: contracts[chain][c].tokenAddress,
      params: [ contracts[chain][c].tokenHolder ]
    })),
    abi: "erc20:balanceOf",
    block: chainBlocks[chain],
    chain
  });

  sdk.util.sumMultiBalanceOf(exports, balances, false, transform);
};
// node test.js projects/daomaker/index.js
function tvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    const vestingContracts = (await axios.get("https://api.daomaker.com/get-all-vesting-contracts")).data;
    const clientVesting = {};
    for (const vestingContract of vestingContracts) {
        if (!clientVesting[vestingContract.chain_name]) {
            clientVesting[vestingContract.chain_name] = {};
        }
        clientVesting[vestingContract.chain_name][vestingContract.vesting_smart_contract_address] = {
            tokenHolder: vestingContract.vesting_smart_contract_address,
            tokenAddress: vestingContract.token_address
        };
    }

    await fetchBalances(
      balances, 
      clientVesting, 
      transform, 
      chainBlocks, 
      chain
    );

    if (contracts.stableCoinFarms[chain]) {
      await fetchBalances(
        balances, 
        contracts.stableCoinFarms, 
        transform, 
        chainBlocks, 
        chain
        );

      const aUSTBalance = (await sdk.api.abi.multiCall({
        calls: Object.keys(contracts.stableCoinFarms[chain]).map(c => ({
          target: aUST,
          params: [ contracts.stableCoinFarms[chain][c].tokenHolder ]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain
      })).output.map(b => b.output).reduce((a, b) => Number(a) + Number(b), 0);

      sdk.util.sumSingleBalance(
        balances, 
        "anchorust", 
        aUSTBalance / 10 ** 18
      );
    };

    return balances;

  };
};

const chainTVLObject = contracts.chains.reduce(
  (agg, chain) => ({ ...agg, [chain]: {tvl: tvl(chain) }}), {}
);

chainTVLObject.ethereum.staking = stakings(
  [ contracts.stakingContractEth ], 
  DAO
);

module.exports = {
  ...chainTVLObject
};