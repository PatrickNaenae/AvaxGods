'use client';

import React, { useEffect, useState } from 'react';
import { CustomButton, CustomInput, PageHOC } from '@/components';
import { useGlobalContext } from '@/context';
import { useRouter } from 'next/navigation';

const Page = () => {
    const { contract, walletAddress, gameData, setShowAlert, setErrorMessage } = useGlobalContext();
    const [playerName, setPlayerName] = useState('');
    const router = useRouter();

    useEffect(() => {
        const createPlayerToken = async () => {
            const playerExists = await contract?.isPlayer(walletAddress);
            const playerTokenExists = await contract?.isPlayerToken(walletAddress);

            if (playerExists && playerTokenExists) {
                router.push('/create-battle');
            }
        };

        if (contract && walletAddress) createPlayerToken();
    }, [contract, walletAddress]);

    useEffect(() => {
        if (gameData.activeBattle) {
            router.push(`/battle/${gameData.activeBattle.name}`);
        }
    }, [gameData]);

    const handleClick = async () => {
        try {
            const playerExists = await contract?.isPlayer(walletAddress);

            if (!playerExists) {
                await contract?.registerPlayer(playerName, playerName, { gasLimit: 500000 });

                setShowAlert({
                    status: true,
                    type: 'info',
                    message: `${playerName} is being summoned!`,
                });

                setTimeout(() => router.push('/create-battle'), 8000);
            }
        } catch (error) {
            setErrorMessage((error as Error).message || 'Failed to register player');
        }
    };

    return contract && walletAddress ? (
        <div className="flex flex-col">
            <CustomInput
                label="Name"
                placeHolder="Enter your player name"
                value={playerName}
                handleValueChange={setPlayerName}
            />
            <CustomButton title="Register" handleClick={handleClick} restStyles="mt-6" />
        </div>
    ) : (
        <div className="text-white text-center">Connecting to contract...</div>
    );
};

export default PageHOC(
    Page,
    <>
        Welcome to Avax Gods <br /> a Web3 NFT Card Game
    </>,
    <>
        Connect your wallet to start playing <br /> the ultimate Web3 Battle Card Game
    </>,
);
