const sdk = require('@defillama/sdk')
const { ethers } = require("ethers");
const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
  sc: { "inputs": [], "name": "sc", "outputs": [{ "internalType": "contract IStore", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
}

async function tvl(_, block) {
  const {output: logs} = await sdk.api.util.getLogs({
    target: "0x0150b57aa8cc6fcbc110f07eef0c85731d8aacf4", // vault factory
    topic: "VaultDeployed(address,bytes32,string,string)",
    keys: [],
    fromBlock: 15912005,
    toBlock: block,
  });

  let iface = new ethers.utils.Interface(['event VaultDeployed (address vault, bytes32 coverKey, string name, string symbol)'])
  const vaults = logs.map((log) => iface.parseLog(log).args.vault)
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.sc,
    calls: vaults.map(i => ({ target: i})),
    block,
  })
  const toa = tokens.map(i => ([i.output, i.input.target]))

  return sumTokens2({ tokensAndOwners: toa, block, })
}

module.exports = {
  methodology: "TVL consists of the total liquidity available in the cover pools",
  start: 1667260800, // Nov 01 2022 @ 12:00am (UTC)
  ethereum: { tvl },
};
