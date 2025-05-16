import { Liq } from "../utils/types";
import axios from "axios";
interface PositionHistory {
  transactionHash: string;
}

interface PositionMainOwner {
  address: string;
}

interface PositionMain {
  lastOwner: PositionMainOwner;
}

interface Position {
  tick: number;
  tickVersion: string;
  index: string;
  validator: string;
  recipient: string;
  amount: string;
  startPrice: string;
  liquidationPenalty: number;
  totalExpo: string;
  amountReceived: string;
  amountRemaining: string;
  profit: string;
  liquidationPrice: string | null;
  effectiveTickPrice: string | null;
  type: string;
  status: string;
  history: PositionHistory[];
  mainPosition: PositionMain;
}

interface ApiResponse {
  serverTimestamp: number;
  positions: Position[];
}

const WSTETH_KEY = "ethereum:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
const API_URL = "https://usdn-public.api.smardex.io/usdn/positions/open";
const API_KEY = process.env.SMARDEX_SUBGRAPH_API_KEY
const EXPLORER_BASE_URL = "https://smardex.io/usdn/explorer?search=";

const fetchOpenPositions = async (): Promise<Position[]> => {
    const response = await axios.get<ApiResponse>(API_URL, {
      headers: { "x-api-key": API_KEY },
    });
    
    if (response.data && response.data.positions && Array.isArray(response.data.positions)) {
      return response.data.positions;
    } else {
      return [];
    }
};

const calculateLiquidationPrice = (position: Position): number => {
  if (!position.startPrice || !position.totalExpo || !position.amountRemaining) {
    return 0;
  }
  const startPrice = parseFloat(position.startPrice) / 1e18;
  const totalExpo = parseFloat(position.totalExpo) / 1e18;
  const collateral = parseFloat(position.amountRemaining) / 1e18;
  const leverage = totalExpo / collateral;
  return startPrice - (startPrice / leverage);
};

const formatPosition = (position: Position): Liq => {
  const owner =
    position.mainPosition?.lastOwner?.address || '0x0000000000000000000000000000000000000000';
    
  const searchParam = position.history && position.history.length > 0 ? 
    position.history[position.history.length - 1].transactionHash : position.index;
    
  const liquidationPrice = calculateLiquidationPrice(position);

  return {
    owner,
    liqPrice: liquidationPrice,
    collateral: WSTETH_KEY,
    collateralAmount: position.amountRemaining,
    extra: {
      url: `${EXPLORER_BASE_URL}${searchParam}`,
    },
  };
};

const positions = async (): Promise<Liq[]> => {
    if(!process.env.SMARDEX_SUBGRAPH_API_KEY) {
      throw new Error("Missing SMARDEX_SUBGRAPH_API_KEY environment variable");
    }

    const positionsData = await fetchOpenPositions();
    
    if (!positionsData || positionsData.length === 0) {
      return [];
    }
    
    return positionsData.map(formatPosition);
};

module.exports = {
  ethereum: {
    liquidations: positions,
  },
};