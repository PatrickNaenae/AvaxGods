declare global {
  interface Window {
    ethereum?: {

      isMetaMask?: boolean;
      chainId: string;
      request: (args: {
        method: string;
        params?: unknown[] | object;
      }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

function isEthereum(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

function getChainID(): number {
  if (isEthereum()) {
    return parseInt(window.ethereum!.chainId, 16);
  }
  return 0;
}

async function handleConnection(accounts: string[]): Promise<string[]> {
  if (accounts.length === 0) {
    return await window.ethereum!.request({ method: 'eth_requestAccounts' });

  }
  return accounts;
}

async function requestAccount(): Promise<string> {
  let currentAccount = '0x0';
  if (isEthereum() && getChainID() !== 0) {
    let accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[];
    accounts = await handleConnection(accounts);
    currentAccount = accounts[0];
  }
  return currentAccount;
}

async function requestBalance(currentAccount: string): Promise<{ currentBalance: number; err: boolean }> {
  let currentBalance = 0;
  if (isEthereum()) {
    try {
      const balanceHex = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [currentAccount, 'latest'],
      }) as string;

      currentBalance = parseInt(balanceHex, 16) / 1e18;

      return { currentBalance, err: false };
    } catch (err) {
      return { currentBalance, err: true };
    }
  }
  return { currentBalance, err: true };
}

interface GetParamsResponse {
  isError: boolean;
  message: string;
  step: number;
  balance: number;
  account: string;
}

export const GetParams = async (): Promise<GetParamsResponse> => {
  const response: GetParamsResponse = {
    isError: false,
    message: '',
    step: -1,
    balance: 0,
    account: '0x0',
  };

  if (!isEthereum()) {
    response.step = 0;
    return response;
  }

  const currentAccount = await requestAccount();
  if (currentAccount === '0x0') {
    response.step = 1;
    return response;
  }

  response.account = currentAccount;

  if (getChainID() !== 43113) {
    response.step = 2;
    return response;
  }

  const { currentBalance, err } = await requestBalance(currentAccount);
  if (err) {
    response.isError = true;
    response.message = 'Error fetching balance!';
    return response;
  }

  response.balance = currentBalance;

  if (currentBalance < 0.2) {
    response.step = 3;
    return response;
  }

  return response;
};

export async function SwitchNetwork(): Promise<void> {
  try {
    await window?.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xA869',
        chainName: 'Fuji C-Chain',
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18,
        },
        rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://testnet.snowtrace.io'],
      }],
    });
  } catch (error) {
    console.error(error);
  }
}
