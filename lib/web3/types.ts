import { Chain } from "viem";

export interface ChainConfig {
  id: string;
  name: string;
  chain: Chain;
  chainString: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  logoUrl?: string;
  chainIdHex: string;
  layer?: string;
  parentChain?: string;
  coinId: string;
  isTestnet?: boolean;
}