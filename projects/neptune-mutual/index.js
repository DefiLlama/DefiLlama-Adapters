const sdk = require('@defillama/sdk')
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const abi = {
  sc: { "inputs": [], "name": "sc", "outputs": [{ "internalType": "contract IStore", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
}

async function tvl(_, block, _1, { api }) {
  const logs = await getLogs({
    api,
    target: "0x0150b57aa8cc6fcbc110f07eef0c85731d8aacf4", // vault factory
    topic: "VaultDeployed(address,bytes32,string,string)",
    fromBlock: 15912005,
    eventAbi: 'event VaultDeployed (address vault, bytes32 coverKey, string name, string symbol)',
  });

  const vaults = logs.map((log) => log.args.vault)
  const tokens = await api.multiCall({
    abi: abi.sc,
    calls: vaults,
  })
  const toa = tokens.map((token, i) => ([token, vaults[i]]))

  return sumTokens2({ tokensAndOwners: toa, block, })
}

module.exports = {
  methodology: "TVL consists of the total liquidity available in the cover pools",
  start: 1667260800, // Nov 01 2022 @ 12:00am (UTC)
  ethereum: { tvl },
};
