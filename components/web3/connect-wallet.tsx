import * as React from 'react';
import {
  type Connector,
  useConnect,
  useAccount,
  useSignMessage,
  useDisconnect,
} from "wagmi";
import { get, set } from 'idb-keyval';
import { toast } from '@/components/ui/toast';
import { SpinnerIcon } from '@phosphor-icons/react';
import { useWalletIcon } from '@/lib/web3/use-web3';

export const WALLET_ICON_CACHE_PREFIX = 'wallet-icon-';
const WALLET_INFO_CACHE_KEY = 'connected-wallet-info';

interface ConnectWalletProps {
  onClose: () => void;
  onWalletVerified?: (walletInfo: { address: string; signature: string; nonce: string }) => void;
}

type WalletStep = 'select' | 'connecting' | 'sign';

interface CachedWalletInfo {
  name: string;
  iconBase64?: string;
}

interface WalletSelectionStepProps {
  onClose: () => void;
  connectors: readonly Connector[];
  onConnect: (connector: Connector) => void;
  isPending: boolean;
  isResumeMode?: boolean;
  cachedWalletInfo?: CachedWalletInfo | null;
}

interface ConnectingStepProps {
  onClose: () => void;
  connector: Connector | null;
}

interface SignatureStepProps {
  onClose: () => void;
  onBack: () => void;
  onSign: () => void;
  address?: string;
  connector: Connector | null;
  cachedWalletInfo?: CachedWalletInfo | null;
  isLoading: boolean;
}

interface WalletOptionProps {
  connector: Connector;
  onConnect: (connector: Connector) => void;
}

// Simple nonce generation function
const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Create verification message
const createVerificationMessage = (address: string, nonce: string): string => {
  return `Please sign this message to verify ownership of your wallet.\n\nWallet Address: ${address}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
};

const getWalletIconId = (connector: Connector): string => {
  const baseName = connector.name.split(/[\s(-]/)[0].toLowerCase();
  
  if (connector.name.toLowerCase().includes('walletconnect')) {
    return 'walletconnect';
  }
  
  return baseName;
};

function WalletSelectionStep({ 
  connectors, 
  onConnect,
  isResumeMode = false,
  cachedWalletInfo
}: WalletSelectionStepProps) {
  const { address } = useAccount();

  return (
    <div className="p-4 w-full mx-auto overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="text-text">
          <div className="text-lg font-medium mb-1">
            {isResumeMode ? "Complete Wallet Verification" : "Connect Wallet"}
          </div>
          <p className="text-sm opacity-60">
            {isResumeMode 
              ? `You have a connected wallet (${address?.slice(0, 6)}...${address?.slice(-4)}) that needs signature verification. Click "Continue with Connected Wallet" to verify ownership.`
              : "Choose your preferred wallet provider"
            }
          </p>
        </div>
      </div>
      
      {isResumeMode && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <button
            onClick={() => onConnect(connectors[0])}
            className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {cachedWalletInfo?.iconBase64 && (
              <img 
                src={cachedWalletInfo.iconBase64}
                alt={cachedWalletInfo.name}
                className="w-5 h-5 mr-2"
              />
            )}
            {!cachedWalletInfo?.iconBase64 && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
            Continue with {cachedWalletInfo?.name || 'Connected Wallet'}
          </button>
        </div>
      )}
      
      <div className="space-y-3 mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {isResumeMode ? "Or connect a different wallet:" : "Available wallets:"}
        </div>
        {connectors.map((connector) => (
          <WalletOption
            key={connector.uid}
            connector={connector}
            onConnect={onConnect}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectingStep({ connector }: ConnectingStepProps) {
  const walletIconId = connector ? getWalletIconId(connector) : null;
  const { data: walletIconBase64, isLoading } = useWalletIcon(walletIconId);

  return (
    <div className="p-4 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="text-text">
          <div className="text-lg font-medium mb-1">Connect Wallet</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
            <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>

            <div className="w-12 h-12 flex items-center justify-center">
              {walletIconBase64 && !isLoading ? (
                <img 
                  src={walletIconBase64}
                  alt={connector?.name} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {connector?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Awaiting Confirmation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accept the connection request in {connector?.name}
          </p>
        </div>
      </div>
    </div>
  );
}

function SignatureStep({
  onBack, 
  onSign, 
  address, 
  connector, 
  cachedWalletInfo,
  isLoading 
}: SignatureStepProps) {
  const walletName = cachedWalletInfo?.name || connector?.name || 'Wallet';
  const walletIcon = cachedWalletInfo?.iconBase64;
  
  const walletIconId = !walletIcon && connector ? getWalletIconId(connector) : null;
  const { data: fetchedWalletIcon } = useWalletIcon(walletIconId);
  
  const walletIconBase64 = walletIcon || fetchedWalletIcon;

  return (
    <div className="p-4 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="text-text">
          <div className="text-lg font-medium mb-1">Verify Wallet Ownership</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center relative">
            {isLoading && (
              <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            )}
            
            <div className="w-12 h-12 flex items-center justify-center">
              {walletIconBase64 ? (
                <img 
                  src={walletIconBase64}
                  alt={walletName} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {walletName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isLoading ? 'Awaiting Confirmation' : 'Signature Required'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading 
              ? `Accept the signature request in ${walletName}`
              : `Sign a message to verify ownership of your wallet`
            }
          </p>
        </div>

        <div className="w-full p-4 bg-background-tertiary/50 rounded-lg mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Connected Wallet</div>
          <div className="font-mono text-sm break-all">{address}</div>
        </div>

        <div className="flex space-x-3 w-full">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={onSign}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-4 h-4" />
                <span>Signing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Sign Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletOption({ connector, onConnect }: WalletOptionProps) {
  const walletIconId = getWalletIconId(connector);
  const { data: walletIconBase64, isLoading } = useWalletIcon(walletIconId);

  const handleClick = (): void => {
    onConnect(connector);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center py-2 px-3 border border-border rounded-lg transition-all hover:bg-accent"
    >
      <div className="w-8 h-8 mr-3 flex-shrink-0">
        {walletIconBase64 && !isLoading ? (
          <img 
            src={walletIconBase64}
            alt={connector.name} 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {walletIconId.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-900 dark:text-white">
          {connector.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connect
        </p>
      </div>
      
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}

export function ConnectWallet({ onClose, onWalletVerified }: ConnectWalletProps) {
  const { connectors, connect, isPending, error } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessage, isPending: isSignPending, error: signError } = useSignMessage();

  const [currentStep, setCurrentStep] = React.useState<WalletStep>('select');
  const [connectingConnector, setConnectingConnector] = React.useState<Connector | null>(null);
  const [nonceData, setNonceData] = React.useState<{nonce: string, message: string} | null>(null);
  const [cachedWalletInfo, setCachedWalletInfo] = React.useState<CachedWalletInfo | null>(null);
  
  const [isSigningProcess, setIsSigningProcess] = React.useState<boolean>(false);

  React.useEffect(() => {
    const loadCachedWalletInfo = async () => {
      try {
        const cached = await get(WALLET_INFO_CACHE_KEY);
        if (cached) {
          setCachedWalletInfo(cached);
        }
      } catch (error) {
        console.error('Error loading cached wallet info:', error);
      }
    };
    
    loadCachedWalletInfo();
  }, []);

  React.useEffect(() => {
    if (error) {
      setConnectingConnector(null);
      setCurrentStep('select');
      setIsSigningProcess(false);
  
      const messageLines = error.message.split('\n');
      const detailsLine = messageLines.find((line) =>
        line.startsWith('Details:')
      );
  
      const userMessage = detailsLine
        ? detailsLine.replace('Details:', '').trim()
        : error.message;
  
      toast({
        title: userMessage,
        status: "error",
      })
    }
  }, [error]);

  React.useEffect(() => {
    if (signError) {
      const errorMessage = signError.message || 'Failed to sign message';
      toast({
        title: errorMessage,
        status: "error",
      })
      setIsSigningProcess(false);
    }
  }, [signError]);

  React.useEffect(() => {
    const prepareSignature = async () => {
      if (isConnected && address && connectingConnector && currentStep === 'connecting') {
        try {
          const walletInfo: CachedWalletInfo = {
            name: connectingConnector.name
          };
          
          const walletIconId = getWalletIconId(connectingConnector);
          const iconCacheKey = `${WALLET_ICON_CACHE_PREFIX}${walletIconId}`;
          const cachedIcon = await get(iconCacheKey);
          
          if (cachedIcon) {
            walletInfo.iconBase64 = cachedIcon;
          }
          
          await set(WALLET_INFO_CACHE_KEY, walletInfo);
          setCachedWalletInfo(walletInfo);

          // Generate nonce and create verification message
          const nonce = generateNonce();
          const message = createVerificationMessage(address, nonce);
          
          setNonceData({ nonce, message });
          setCurrentStep('sign');
        } catch (error) {
          console.error('Error preparing signature:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to prepare signature';
          toast({
            title: errorMessage,
            status: "error",
          })
          setConnectingConnector(null);
          setCurrentStep('select');
          setIsSigningProcess(false);
        }
      }
    };
  
    prepareSignature();
  }, [isConnected, address, connectingConnector, currentStep]);
  
  const handleConnect = (connector: Connector): void => {
    if (isConnected && (isSigningProcess || cachedWalletInfo)) {
      const prepareSignature = async () => {
        try {
          if (!address) return;
          
          // Generate nonce and create verification message
          const nonce = generateNonce();
          const message = createVerificationMessage(address, nonce);
          
          setNonceData({ nonce, message });
          setCurrentStep('sign');
        } catch (error) {
          console.error('Error preparing signature:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to prepare signature';
          toast({
            title: errorMessage,
            status: "error",
          })
          setIsSigningProcess(false);
        }
      };
      
      prepareSignature();
      return;
    }
  
    setConnectingConnector(connector);
    setCurrentStep('connecting');
    setIsSigningProcess(true);
    connect({ connector });
  };

  const handleSign = (): void => {
    if (!address || !nonceData) return;

    signMessage(
      { message: nonceData.message },
      {
        onSuccess: async (signature) => {
          try {
            // Call the callback with verified wallet info instead of saving to database
            if (onWalletVerified) {
              onWalletVerified({
                address,
                signature,
                nonce: nonceData.nonce
              });
            }

            toast({
              title: "Wallet verified successfully",
              status: "success",
            })
            
            await set(WALLET_INFO_CACHE_KEY, null);
            setCachedWalletInfo(null);
            setIsSigningProcess(false);
            
            setTimeout(() => {
              onClose();
              resetState();
            }, 1000);

          } catch (error) {
            console.error('Error verifying wallet:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to verify wallet';
            toast({
              title: errorMessage,
              status: "error",
            })
            setIsSigningProcess(false);
          }
        },
        onError: (error) => {
          console.error('Error signing message:', error);
          const errorMessage = error.message || 'Failed to sign message';
          toast({
            title: errorMessage,
            status: "error",
          })
          setIsSigningProcess(false);
        }
      }
    );
  };

  const handleBack = (): void => {
    if (currentStep === 'connecting') {
      setCurrentStep('select');
      setConnectingConnector(null);
      setIsSigningProcess(false);
      if (isConnected) {
        disconnect();
      }
    } else if (currentStep === 'sign') {
      setCurrentStep('select');
      setNonceData(null);
      setConnectingConnector(null);
      clearWalletCache();
      if (isConnected) {
        disconnect();
        setIsSigningProcess(false);
      }
    }
  };

  const handleClose = (): void => {
    if (!isConnected || !isSigningProcess) {
      resetState();
      clearWalletCache();
    }
    onClose();
  };

  const clearWalletCache = async (): Promise<void> => {
    try {
      await set(WALLET_INFO_CACHE_KEY, null);
      setCachedWalletInfo(null);
    } catch (error) {
      console.error('Error clearing wallet cache:', error);
    }
  };

  const resetState = (): void => {
    setCurrentStep('select');
    setConnectingConnector(null);
    setNonceData(null);
    setIsSigningProcess(false);
  };

  if (currentStep === 'connecting') {
    return <ConnectingStep 
      onClose={handleClose}
      connector={connectingConnector}
    />;
  }

  if (currentStep === 'sign') {
    return <SignatureStep 
      onClose={handleClose}
      onBack={handleBack}
      onSign={handleSign}
      address={address}
      connector={connectingConnector}
      cachedWalletInfo={cachedWalletInfo}
      isLoading={isSignPending}
    />;
  }

  return (
    <WalletSelectionStep 
      onClose={handleClose}
      connectors={connectors}
      onConnect={handleConnect}
      isPending={isPending}
      isResumeMode={isConnected && (isSigningProcess || cachedWalletInfo !== null)}
      cachedWalletInfo={cachedWalletInfo}
    />
  );
}