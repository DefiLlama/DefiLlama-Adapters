const RPC_ENDPOINT = "https://rpc.qubic.org"

module.exports = {
    timetravel: false, 
    qubic: { 
      tvl: async () => {
        const res = await fetch(`${RPC_ENDPOINT}/v1/latest-stats/`).then(r => r.json());
        return {'coingecko:qubic-network': res.data.burnedQus}
      }
    },
  };