const {
    Address,
    rpc,
    TransactionBuilder,
    Networks,
    Account,
    Contract,
    scValToNative,
  } = require("@stellar/stellar-sdk");
  
  // ====== CONFIG (TESTNET for now) ======
  const LOGGER_CONTRACT_ADDRESS =
    "CBEWJH5HJJZ6LB77MOKAB7B4MQTYAHVSFG437HWBXC6K2YEL2CYVLW3D";
  
  // Use a Soroban RPC that matches the network you’re testing
  // (If your team is using a different testnet RPC, replace this URL)
  const SOROBAN_RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";
  const NETWORK_PASSPHRASE = Networks.PUBLIC;
  
  const LOGGER_FUNCTION = "get_active_tvl";
  
  // RPC client
  const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: true });
  
  async function getActiveTvl() {
    // Dummy source account is fine for simulateTransaction.
    // It doesn't need to exist or have a real sequence.
    const sourceAddress = Address.fromString(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    const account = new Account(sourceAddress.toString(), "0");
  
    const contract = new Contract(LOGGER_CONTRACT_ADDRESS);
  
    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(contract.call(LOGGER_FUNCTION))
      .setTimeout(30)
      .build();
  
    const sim = await server.simulateTransaction(tx);
  
    // Blend-style check: accept only simulation success
    if (!rpc.Api.isSimulationSuccess(sim)) {
      const err = rpc.Api.isSimulationError(sim)
        ? JSON.stringify(sim, null, 2)
        : "Unknown simulation result";
      throw new Error(`Soroban simulation failed: ${err}`);
    }
  
    const retval = sim.result?.retval;
    if (!retval) throw new Error("No return value from contract call");
  
    // This will likely be BigInt (or number) depending on the contract type
    return scValToNative(retval);
  }
  
  module.exports = {
    getActiveTvl,
  };
  