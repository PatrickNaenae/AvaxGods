'use client';

import React, { useEffect } from 'react';
import { useGlobalContext } from '@/context';
import { CustomButton, PageHOC } from '@/components';
import styles from '@/styles';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
    const {
        contract,
        gameData,
        setShowAlert,
        setBattleName,
        setErrorMessage,
        walletAddress,
    } = useGlobalContext();

    useEffect(() => {
        if (gameData?.activeBattle?.battleStatus === 1) {
            router.push(`/battle/${gameData.activeBattle.name}`);
        }
    }, [gameData, router]);

    const handleClick = async (battleName: string) => {
        setBattleName(battleName);

        try {
            await contract?.joinBattle(battleName);
            setShowAlert({ status: true, type: 'success', message: `Joining ${battleName}` });
        } catch (error) {
            setErrorMessage((error as Error).message || 'Failed to join battle');
        }
    };

    if (!contract || !walletAddress) {
        return <div className="text-white text-center">Loading contract...</div>;
    }

    const joinableBattles = gameData.pendingBattles.filter(
        (battle) =>
            !battle.players.includes(walletAddress) &&
            battle.battleStatus !== 1
    );

    return (
        <>
            <h2 className={styles.joinHeadText}>Available Battles:</h2>

            <div className={styles.joinContainer}>
                {joinableBattles.length ? (
                    joinableBattles.map((battle, index) => (
                        <div key={battle.name + index} className={styles.flexBetween}>
                            <p className={styles.joinBattleTitle}>
                                {index + 1}. {battle.name}
                            </p>
                            <CustomButton title="Join" handleClick={() => handleClick(battle.name)} />
                        </div>
                    ))
                ) : (
                    <p className={styles.joinLoading}>Reload the page to see new battles</p>
                )}
            </div>

            <p className={styles.infoText} onClick={() => router.push('/create-battle')}>
                Or create a new battle
            </p>
        </>
    );
};

export default PageHOC(
    Page,
    <>
        Join <br /> a Battle
    </>,
    <>Join already existing battles</>
);
