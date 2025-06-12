'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles';
import {
    ActionButton,
    Alert,
    Card,
    GameInfo,
    PlayerInfo,
} from '@/components';
import { useGlobalContext } from '@/context';
import {
    attack,
    defense,
    player01 as player01Icon,
    player02 as player02Icon,
} from '@/public/assets';
import { playAudio } from '@/utils/animation';
import { useRouter, useParams } from 'next/navigation';
import { Player } from '@/types';

const Page = () => {
    const {
        contract,
        gameData,
        battleGround,
        walletAddress,
        setErrorMessage,
        showAlert,
        setShowAlert,
        player1Ref,
        player2Ref,
    } = useGlobalContext();

    console.log(battleGround)

    const [player2, setPlayer2] = useState<Player>({
        playerAddress: '',
        playerName: '',
        mana: 0,
        health: 0,
    });

    const [player1, setPlayer1] = useState<Player>({
        playerAddress: '',
        playerName: '',
        mana: 0,
        health: 0,
    });

    const { battleName } = useParams();
    const router = useRouter();

    const battleId = typeof battleName === 'string' ? battleName : battleName?.[0] || '';

    useEffect(() => {
        const getPlayerInfo = async () => {
            try {
                if (!gameData.activeBattle || !contract) return;

                const players = gameData.activeBattle.players;
                const isPlayer1 = players[0].toLowerCase() === walletAddress.toLowerCase();

                const player01Address = isPlayer1 ? players[0] : players[1];
                const player02Address = isPlayer1 ? players[1] : players[0];

                const p1TokenData = await contract.getPlayerToken(player01Address);
                const player01 = await contract.getPlayer(player01Address);
                const player02 = await contract.getPlayer(player02Address);

                const p1Att = Number(p1TokenData.attackStrength);
                const p1Def = Number(p1TokenData.defenseStrength);
                const p1H = Number(player01.playerHealth);
                const p1M = Number(player01.playerMana);
                const p2H = Number(player02.playerHealth);
                const p2M = Number(player02.playerMana);

                setPlayer1({
                    ...player01,
                    att: p1Att,
                    def: p1Def,
                    health: p1H,
                    mana: p1M,
                });

                setPlayer2({
                    ...player02,
                    att: 'X',
                    def: 'X',
                    health: p2H,
                    mana: p2M,
                });
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                }
            }
        };

        getPlayerInfo();
    }, [contract, gameData, battleId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!gameData?.activeBattle) router.push('/');
        }, 2000);

        return () => clearTimeout(timer);
    }, [gameData, router]);

    const makeAMove = async (choice: number) => {
        playAudio(choice === 1 ? '/assets/sounds/attack.wav' : '/assets/sounds/defense.mp3');

        try {
            await contract?.attackOrDefendChoice(choice, battleId, { gasLimit: 200000 });

            setShowAlert({
                status: true,
                type: 'info',
                message: `Initiating ${choice === 1 ? 'attack' : 'defense'}`,
            });
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
    };

    if (!contract) {
        return <div className="text-white text-center">Loading battle...</div>;
    }

    return (
        <div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
            {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}

            <PlayerInfo player={player2} playerIcon={player02Icon} mt />

            <div className={`${styles.flexCenter} flex-col my-10`}>
                <Card
                    card={player2}
                    title={player2?.playerName as string}
                    cardRef={player2Ref}
                    playerTwo
                />

                <div className="flex items-center flex-row">
                    <ActionButton
                        imgUrl={attack}
                        handleClick={() => makeAMove(1)}
                        restStyles="mr-2 hover:border-yellow-400"
                    />

                    <Card
                        card={player1}
                        title={player1?.playerName as string}
                        cardRef={player1Ref}
                        restStyles="mt-3"
                    />

                    <ActionButton
                        imgUrl={defense}
                        handleClick={() => makeAMove(2)}
                        restStyles="ml-6 hover:border-red-600"
                    />
                </div>
            </div>

            <PlayerInfo player={player1} playerIcon={player01Icon} />
            <GameInfo />
        </div>
    );
};

export default Page;
