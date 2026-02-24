const { rpc, Networks, Address, xdr, Asset, scValToNative } = require('@stellar/stellar-sdk');

const VAULTS_CONTRACT_ID = "CCUN4RXU5VNDHSF4S4RKV4ZJYMX2YWKOH6L4AKEKVNVDQ7HY5QIAO4UB";
const rpcUrl = 'https://soroban-rpc.creit.tech/';
const server = new rpc.Server(rpcUrl);

async function tvl(api) {
  const response = await server.getContractData(
    Asset.native().contractId(Networks.PUBLIC),
    xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('Balance'),
      new Address(VAULTS_CONTRACT_ID).toScVal(),
    ]),
    rpc.Durability.Persistent
  );
  const balance = scValToNative(response.val.value().val()).amount;
  const parsedBalance = Number(balance) / 1e7;
  api.addCGToken('stellar', parsedBalance);
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: `Takes the total amount of XLMs locked in the Vaults contract, the XLMs are the collateral of the issued assets by the protocol.`,
  stellar: {
    tvl,
  },
};
