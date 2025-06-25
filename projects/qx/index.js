const RPC_ENDPOINT = "https://rpc.qubic.org"
const QearnAddress = "BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARMID";

module.exports = {
    timetravel: false, 
    qubic: { 
      tvl: async () => {
        const res = await fetch(`${RPC_ENDPOINT}/v1/balances/${QearnAddress}`).then(r => r.json());
        return {'coingecko:qubic-network': res.balance.balance }
      }
    },
  };