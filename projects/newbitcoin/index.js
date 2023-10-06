const fetch = require("node-fetch");

const tvl = async () => {
  const resp = await fetch("https://perp-api.fprotocol.io/api/tvl");
  const rs = await resp.json();
  return rs.result
}

module.exports = {
  methodology: "New Bitcoin's Total Value Locked (TVL) can be calculated as the sum of the BTC amount locked in all creators' smart contracts. Every content creator has their own smart contract (this is similar to Uniswap's pool structure). Once a key holder buys key(s) of a creator, their purchased BTC is locked in the creator's contract.",
  fetch: tvl
} 