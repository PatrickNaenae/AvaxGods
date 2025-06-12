'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles';
import { useGlobalContext } from '@/context';
import { CustomButton, CustomInput, GameLoad, PageHOC } from '@/components';
import { useRouter } from 'next/navigation';

const Page = () => {
    const {
        contract,
        gameData,
        battleName,
        setBattleName,
        setErrorMessage,
    } = useGlobalContext();

    const [waitBattle, setWaitBattle] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (gameData?.activeBattle?.battleStatus === 1) {
            router.push(`/battle/${gameData.activeBattle.name}`);
        } else if (gameData?.activeBattle?.battleStatus === 0) {
            setWaitBattle(true);
        }
    }, [gameData, router]);

    const handleClick = async () => {
        if (!battleName.trim()) return;

        try {
            await contract?.createBattle(battleName);
            setWaitBattle(true);
        } catch (error) {
            setErrorMessage((error as Error).message || 'Failed to create battle');
        }
    };

    if (!contract) {
        return <div className="text-white text-center">Loading contract...</div>;
    }

    return (
        <>
            {waitBattle && <GameLoad />}

            <div className="flex flex-col mb-5">
                <CustomInput
                    label="Battle"
                    placeHolder="Enter battle name"
                    value={battleName}
                    handleValueChange={setBattleName}
                />

                <CustomButton
                    title="Create Battle"
                    handleClick={handleClick}
                    restStyles="mt-6"
                />
            </div>

            <p className={styles.infoText} onClick={() => router.push('/join-battle')}>
                Or join already existing battles
            </p>
        </>
    );
};

export default PageHOC(
    Page,
    <>
        Create <br /> a new Battle
    </>,
    <>Create your own battle and wait for other players to join you</>
);
