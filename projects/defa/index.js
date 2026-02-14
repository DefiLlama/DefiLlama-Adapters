const {
    Address,
    rpc,
    Account,
    TransactionBuilder,
    Networks,
    Contract,
    scValToNative,
    xdr,
  } = require("@stellar/stellar-sdk");
  
  // ================= CONFIG =================
  const SOROBAN_RPC_URL = "https://soroban-rpc.mainnet.stellar.gateway.fm";
  const LOGGER_CONTRACT_ADDRESS =
    "CDVVH3KWXWLVUO5OLLBBZSCZICV46PDKYA2G2HYBTWH4A6EJWTBRIXRK";
  const LOGGER_FUNCTION = "get_active_tvl";
  
  // =============== CORE LOGIC ===============
  async function getActiveTvl() {
    const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: true });
  
    const source = Address.fromString(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
    );
    const account = new Account(source.toString(), "0");
  
    const contract = new Contract(LOGGER_CONTRACT_ADDRESS);
  
    const tx = new TransactionBuilder(account, {
      fee: "500000",
      networkPassphrase: Networks.PUBLIC,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(contract.call(LOGGER_FUNCTION))
      .setTimeout(30)
      .build();
  
    const sim = await server.simulateTransaction(tx);
  
    if (!rpc.Api.isSimulationSuccess(sim)) {
      return 0;
    }
  
    // Handle both RPC return formats safely
    const retval =
      sim?.result?.retval ??
      sim?.result?.results?.[0]?.retval;
  
    if (!retval) return 0;
  
    try {
      let decoded;
  
      // Case 1: Already SCVal object
      if (typeof retval === "object") {
        decoded = scValToNative(retval);
      }
      // Case 2: Base64 string
      else if (typeof retval === "string") {
        const scVal = xdr.ScVal.fromXDR(retval, "base64");
        decoded = scValToNative(scVal);
      } else {
        return 0;
      }
  
      const tvl = Number(decoded);
      return Number.isFinite(tvl) ? tvl : 0;
    } catch {
      return 0;
    }
  }
  
  // ============== LLAMA EXPORT ==============
  async function tvl(api) {
    let activeTvl = 0;
  
    try {
      activeTvl = await getActiveTvl();
    } catch {
      activeTvl = 0;
    }
  
    // USDC has 7 decimals on Stellar
    api.addCGToken("usd-coin", activeTvl / 1e7);
    return api.getBalances();
  }
  
  module.exports = {
    timetravel: false,
    methodology:
      "Counts active invoice-backed liquidity via an on-chain Logger contract on Stellar Soroban.",
    stellar: {
      tvl,
    },
  };
  