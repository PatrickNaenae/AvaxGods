import React from 'react';
import Tilt from 'react-parallax-tilt';

import styles from '@/styles';
import { allCards } from '@/public/assets';
import Image from "next/image";
import {Player} from "@/types";

interface Props {
    card: Player
    title: string;
    restStyles?: string;
    cardRef: React.RefObject<HTMLDivElement | null>;
    playerTwo?: boolean
}

const generateRandomCardImage = () => allCards[Math.floor(Math.random() * (allCards.length - 1))];

const img1 = generateRandomCardImage();
const img2 = generateRandomCardImage();

const Card = ({ card, title, restStyles, cardRef, playerTwo }: Props) => (
    <Tilt>
        <div ref={cardRef} className={`${styles.cardContainer} ${restStyles}`}>
            <Image src={playerTwo ? img2 : img1} width={150} height={150} alt="ace_card" className={styles.cardImg} />

            <div className={`${styles.cardPointContainer} sm:left-[21.2%] left-[22%] ${styles.flexCenter}`}>
                <p className={`${styles.cardPoint} text-yellow-400`}>{card.att}</p>
            </div>
            <div className={`${styles.cardPointContainer} sm:right-[14.2%] right-[15%] ${styles.flexCenter}`}>
                <p className={`${styles.cardPoint} text-red-700`}>{card.def}</p>
            </div>

            <div className={`${styles.cardTextContainer} ${styles.flexCenter}`}>
                <p className={styles.cardText}>{title}</p>
            </div>
        </div>
    </Tilt>
);

export default Card;