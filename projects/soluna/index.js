const { LCDClient } = require('@terra-money/terra.js')
const retry = require('async-retry')

async function fetch() {
  const terra = new LCDClient({
    URL: "https://lcd.terra.dev/",
    chainID: "columbus-5",
  });

  const result = await retry(async bail => 
    terra.wasm.contractQuery(
      "terra1aug2pyftq4e85kq5590ud30yswnewa42n9fmr8",
      { total_deposit_amount: { } } // query msg
    )
  );
  
  return parseFloat(result.amount) / 10 ** 6;
}

module.exports = {
  fetch
}