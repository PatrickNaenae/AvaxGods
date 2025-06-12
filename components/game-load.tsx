import React from 'react';

import CustomButton from './custom-button';
import { useGlobalContext } from '@/context';
import { player01, player02 } from '@/public/assets';
import styles from '../styles';
import {useRouter} from "next/navigation";
import Image from "next/image";

const GameLoad = () => {
    const { walletAddress } = useGlobalContext();
    const router = useRouter()


    return (
        <div className={`${styles.flexBetween} ${styles.gameLoadContainer}`}>
            <div className={styles.gameLoadBtnBox}>
                <CustomButton
                    title="Choose Battleground"
                    handleClick={() => router.push('/battleground')}
                    restStyles="mt-6"
                />
            </div>

            <div className={`flex-1 ${styles.flexCenter} flex-col`}>
                <h1 className={`${styles.headText} text-center`}>
                    Waiting for a <br /> worthy opponent...
                </h1>
                <p className={styles.gameLoadText}>
                    Protip: while you're waiting, choose your preferred battleground
                </p>

                <div className={styles.gameLoadPlayersBox}>
                    <div className={`${styles.flexCenter} flex-col`}>
                        <Image src={player01} width={250} height={250} alt="player 1" className={styles.gameLoadPlayerImg} />
                        <p className={styles.gameLoadPlayerText}>
                            {walletAddress?.slice(0, 30)}
                        </p>
                    </div>

                    <h2 className={styles.gameLoadVS}>Vs</h2>

                    <div className={`${styles.flexCenter} flex-col`}>
                        <Image src={player02} width={250} height={250} alt="player 1" className={styles.gameLoadPlayerImg} />
                        <p className={styles.gameLoadPlayerText}>??????????</p>
                    </div>
                </div>

                <div className="mt-10">
                    <p className={`${styles.infoText} text-center mb-5`}>OR</p>

                    <CustomButton
                        title="Join other battles"
                        handleClick={() => router.push('/join-battle')}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameLoad;