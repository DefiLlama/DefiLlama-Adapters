const CONTRACTS = [
  {
    address: "0xe73191C7D3a47E45780c76cB82AE091815F4C8F9",
    startingBlock: 4124234,
  },
  {
    address: "0xbe1Be54f6251109d5fB2532b85d7eE9Cb375C43f",
    startingBlock: 4860484,
  },
  {
    address: "0x33544082114fF42974B2965e057e24AC52b75871",
    startingBlock: 7299774,
  },
];

async function tvl(_timestamp, block, _2, { api }) {
  const balances = await Promise.all(
    CONTRACTS.map((c) =>
      block >= c.startingBlock
        ? api.call({
            abi: "erc20:totalSupply",
            target: c.address,
          })
        : Promise.resolve(0)
    )
  );

  api.addTokens(
    CONTRACTS.map((c) => c.address),
    balances
  );
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Value of all Canto wrapped in CSR protocol",
  start: 4124234,
  canto: {
    tvl,
  },
};
