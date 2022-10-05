import { CHAIN } from "../../helper/chains";
import { univ2Adapter } from "../../helper/getUniSubgraphVolume";

const adapters = univ2Adapter({
  [CHAIN.MOONRIVER]: 'https://api.thegraph.com/subgraphs/name/toadguy/padswap-subgraph-moonriver',
  [CHAIN.BSC]: 'https://api.thegraph.com/subgraphs/name/d1stsys/padswap-backup-2',
  [CHAIN.MOONBEAN]: 'https://api.thegraph.com/subgraphs/name/toadguy/padswap-subgraph-moonbeam',
}, {});

export default adapters;
