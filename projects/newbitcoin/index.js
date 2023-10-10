const WBTC = "0x111808AbE352c8003e0eFfcc04998EaB26Cebe3c";
const NEW_BITCOIN_CONTRACT = "0xea21fbBB923E553d7b98D14106A104665BA57eCd";
async function tvl(time, ethBlock, _b, { api }) {
  const wBal = await api.call({
    abi: 'erc20:balanceOf',
    target: WBTC,
    params: [NEW_BITCOIN_CONTRACT],
  });

  api.add(WBTC, wBal)
}

module.exports = {
  methodology: `We count the BTC on ${NEW_BITCOIN_CONTRACT}`,
  nos: {
    tvl
  }
}
