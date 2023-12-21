const config = {
  polygon: {
    SolidWorldManager: "0xe967aEBdbf137C2ddD4aaF076E87177c4EBEB851",
    ForwardContractBatchToken: "0x029090aC92b0BAAF20Ccef615BAfD268f08Db8fA",
    pools: [
      {
        crispToken: "0xEF6Ab48ef8dFe984FAB0d5c4cD6AFF2E54dfdA14",
        hypervisor: "0x4a39cBb8198376AB08c24e596fF5E668c3ca269E",
        stakingContract: "0xaD7Ce5Cf8E594e1EFC6922Ab2c9F81d7a0E14337"
      },
      {
        crispToken: "0x672688C6Ee3E750dfaA4874743Ef693A6f2538ED",
        hypervisor: "0x27420e641CE96a6C0191dbFA0A9500eaCe33531d",
        stakingContract: "0xaD7Ce5Cf8E594e1EFC6922Ab2c9F81d7a0E14337"
      }
    ]
  }
};

module.exports = {
  config
};
