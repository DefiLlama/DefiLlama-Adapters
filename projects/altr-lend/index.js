const POLYGON_USDT_CONTRACT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

async function tvl(timestamp, _1, _2, { api }) {
  const query = `
    {
      loans(where: {id_not: "1", status: ACCEPTED, startTime_lte: "${timestamp}" }) {
        amount
      }
    }
    `;

  const res = await fetch(
    "https://api.thegraph.com/subgraphs/name/lucidao-developer/altr-lend",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );

  const { data } = await res.json();

  const tvl =
    data.loans
      ?.reduce((acc, curr) => acc + BigInt(curr.amount || 0), 0n)
      ?.toString() || "0";

  api.add(POLYGON_USDT_CONTRACT_ADDRESS, tvl);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Determined by querying from our public TheGraph the total USD value of all active loans",
  start: 1707874007,
  polygon: {
    tvl,
  },
};
