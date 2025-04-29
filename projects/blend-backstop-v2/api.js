const { BackstopConfig, BackstopToken, BackstopPool, BackstopPoolV2,  } = require("@blend-capital/blend-sdk");
const { nativeToScVal, rpc, Account, TransactionBuilder, Contract, scValToNative } = require("@stellar/stellar-sdk");
const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};
async function getTokenBalance(
  token_id,
  address
) {
  // account does not get validated during simulateTx
  const account = new Account('GANXGJV2RNOFMOSQ2DTI3RKDBAVERXUVFC27KW3RLVQCLB3RYNO3AAI4', '123');
  const tx_builder = new TransactionBuilder(account, {
    fee: '1000',
    timebounds: { minTime: 0, maxTime: 0 },
    networkPassphrase: network.passphrase,
  });
  tx_builder.addOperation(new Contract(token_id).call('balance', nativeToScVal(address, {type: 'address'})));
  const stellarRpc = new rpc.Server(network.rpc, network.opts);
  const scval_result = await stellarRpc.simulateTransaction(
    tx_builder.build()
  );
  if (scval_result == undefined) {
    throw Error(`unable to fetch balance for token: ${token_id}`);
  }
  if (rpc.Api.isSimulationSuccess(scval_result)) {
    const val = scValToNative(scval_result.result.retval);
    return val;
  } else {
    throw Error(`unable to fetch balance for token: ${token_id}`);
  }
}
async function tvl(api) {
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  let backstopTokeData = await BackstopToken.load(
    network,
    backstop.backstopTkn,
    backstop.blndTkn,
    backstop.usdcTkn
  );
  
  let totalBackstopTokens = await getTokenBalance(
    backstop.backstopTkn,
    BACKSTOP_ID
  );
  let totalBLND = Number(totalBackstopTokens) * backstopTokeData.blndPerLpToken / 1e7;
  let totalUSDC = Number(totalBackstopTokens) * backstopTokeData.usdcPerLpToken / 1e7;
  // backstop token is a 80% BLND 20% USDC Comet pool (Balancer v1 fork)
  api.addCGToken("usd-coin", totalUSDC);
  api.addCGToken('blend', totalBLND);
  return api.getBalances();
}

module.exports = {
  stellar: {
    tvl: () => ({}),
    pool2: tvl  
  },
};
