const axios = require("axios");
const {
  Address,
  Account,
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  scValToNative,
} = require("@stellar/stellar-sdk");

// ===== CONFIG =====
const SOROBAN_RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";
const NETWORK_PASSPHRASE = Networks.PUBLIC;

const LOGGER_CONTRACT_ADDRESS =
  "CBEWJH5HJJZ6LB77MOKAB7B4MQTYAHVSFG437HWBXC6K2YEL2CYVLW3D";

const LOGGER_FUNCTION = "get_active_tvl";

// Standard dummy source account for Soroban simulations
const SOURCE_ACCOUNT =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

// RPC server
const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: true });

async function getActiveTvl() {
  const account = new Account(SOURCE_ACCOUNT, "0");

  const contract = new Contract(LOGGER_CONTRACT_ADDRESS);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(LOGGER_FUNCTION))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error(
      `Soroban simulation failed: ${JSON.stringify(sim, null, 2)}`
    );
  }

  const retval = sim.result?.retval;
  if (!retval) return 0;

  return scValToNative(retval);
}

module.exports = {
  getActiveTvl,
};
