'use client'

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
    RefObject,
} from 'react';

import { ethers, Provider } from 'ethers';
import { GetParams } from '@/utils/Onboard';
import { ADDRESS } from '@/contract';
import { createEventListeners } from './create-event-listener';
import { useRouter } from 'next/navigation';
import { AVAXGods__factory, AVAXGods } from '@/typechain-types';
import { Battle } from "@/types";

interface Alert {
    status: boolean;
    type: 'success' | 'failure' | 'info';
    message: string;
}

interface BattleData {
    players: string[];
    pendingBattles: Battle[];
    activeBattle: Battle | null;
}

interface GlobalContextType {
    player1Ref: RefObject<HTMLDivElement | null>;
    player2Ref: RefObject<HTMLDivElement | null>;
    battleGround: string;
    setBattleGround: (bg: string) => void;
    contract: AVAXGods | null;
    gameData: BattleData;
    walletAddress: string;
    updateCurrentWalletAddress: () => Promise<void>;
    showAlert: Alert;
    setShowAlert: (alert: Alert) => void;
    battleName: string;
    setBattleName: (name: string) => void;
    errorMessage: string;
    setErrorMessage: (msg: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider that wraps the app and supplies global state
export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    // === STATE MANAGEMENT ===
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [battleGround, setBattleGround] = useState<string>('bg-astral');
    const [contract, setContract] = useState<AVAXGods | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [step, setStep] = useState<number>(1);
    const [gameData, setGameData] = useState<BattleData>({ players: [], pendingBattles: [], activeBattle: null });
    const [showAlert, setShowAlert] = useState<Alert>({ status: false, type: 'info', message: '' });
    const [battleName, setBattleName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [updateGameData, setUpdateGameData] = useState<number>(0);

    // === PLAYER REFS ===
    const player1Ref = useRef<HTMLDivElement | null>(null);
    const player2Ref = useRef<HTMLDivElement | null>(null);

    const router = useRouter();

    // === Load saved battleground from localStorage (on first load) ===
    useEffect(() => {
        const isBattleground = localStorage.getItem('battleground');

        if (isBattleground) {
            setBattleGround(isBattleground);
        } else {
            localStorage.setItem('battleground', battleGround);
        }
    }, []);

    // === Sync current onboarding step with URL params or wallet state ===
    useEffect(() => {
        const resetParams = async () => {
            const currentStep = await GetParams();
            setStep(currentStep.step);
        };

        (async () => {
            await resetParams();
        })();

        // Update step on chain or wallet change
        window?.ethereum?.on('chainChanged', resetParams);
        window?.ethereum?.on('accountsChanged', resetParams);
    }, []);

    // === Connect and store current wallet address ===
    const updateCurrentWalletAddress = async () => {
        const accounts = await window?.ethereum?.request({ method: 'eth_accounts' });
        if (accounts) setWalletAddress(accounts[0]);
    };

    // === Request wallet access and listen for account changes ===
    useEffect(() => {
        (async () => {
            await updateCurrentWalletAddress();
        })();

        window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);
    }, []);

    // === Set up ethers.js provider and contract instance ===
    useEffect(() => {
        const setSmartContractAndProvider = async () => {
            if (!window.ethereum) return;
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await newProvider.getSigner();
            const newContract = AVAXGods__factory.connect(ADDRESS, signer);

            setProvider(newProvider);
            setContract(newContract);
        };

        (async () => {
            await setSmartContractAndProvider();
        })();

    }, []);

    // === Listen for on-chain events once contract is ready and step is valid ===
    useEffect(() => {
        if (step === -1 && contract && provider) {
            createEventListeners({
                navigate: router.push,
                contract,
                walletAddress,
                setShowAlert,
                player1Ref,
                player2Ref,
                setUpdateGameData,
            });
        }
    }, [step, contract]);

    // === Fetch all battles from the contract and extract pending/active ones ===
    useEffect(() => {
        const fetchGameData = async () => {
            if (contract) {
                const fetchedBattles = await contract.getAllBattles();

                // Convert from raw contract output to Battle type
                const parsedBattles: Battle[] = fetchedBattles.map((battle): Battle => ({
                    name: battle.name,
                    battleStatus: Number(battle.battleStatus),
                    players: [battle.players[0], battle.players[1]],
                    winner: battle.winner,
                }));

                // Filter for pending battles
                const pendingBattles = parsedBattles.filter(b => b.battleStatus === 0);

                let activeBattle: Battle | null = null;

                // Identify current user's active battle (if any)
                for (const battle of parsedBattles) {
                    if (
                        battle.players.some(p => p.toLowerCase() === walletAddress.toLowerCase()) &&
                        battle.winner.startsWith('0x00')
                    ) {
                        activeBattle = battle;
                        break;
                    }
                }

                setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle, players: [] });
            }
        };

        (async () => {
            await fetchGameData();

        })();

    }, [contract, updateGameData]);

    // === Auto-hide alerts after 5 seconds ===
    useEffect(() => {
        if (showAlert?.status) {
            const timer = setTimeout(() => {
                setShowAlert({ status: false, type: 'info', message: '' });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    // === Show error messages as alerts if they occur ===
    useEffect(() => {
        if (errorMessage) {
            const parsedErrorMessage = errorMessage?.slice('execution reverted: '.length).slice(0, -1);

            if (parsedErrorMessage) {
                setShowAlert({
                    status: true,
                    type: 'failure',
                    message: parsedErrorMessage,
                });
            }
        }
    }, [errorMessage]);

    // === Provide all global context values to children ===
    return (
        <GlobalContext.Provider
            value={{
                player1Ref,
                player2Ref,
                battleGround,
                setBattleGround,
                contract,
                gameData,
                walletAddress,
                updateCurrentWalletAddress,
                showAlert,
                setShowAlert,
                battleName,
                setBattleName,
                errorMessage,
                setErrorMessage,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

// === Custom hook to consume GlobalContext safely ===
export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error('useGlobalContext must be used within a GlobalContextProvider');
    return context;
};
