import { createConfig } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { http as viemHttp } from 'viem';
import { SUPPORTED_CHAINS } from './chain';

const chainList = Object.values(SUPPORTED_CHAINS).map((c) => c.chain)

if (chainList.length === 0) {
  throw new Error('SUPPORTED_CHAINS must contain at least one chain')
}
const chains = chainList as [typeof chainList[0], ...typeof chainList]

const transports = Object.fromEntries(
  Object.values(SUPPORTED_CHAINS).map((c) => [c.chain?.id, viemHttp(c.rpcUrl)])
)

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    metaMask(),
  ],
  transports,
})