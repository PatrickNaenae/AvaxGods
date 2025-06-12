import React from 'react';

import styles from '@/styles';
import Image, {StaticImageData} from "next/image";

interface Props {
    imgUrl: StaticImageData;
    handleClick: () => void;
    restStyles: string
}

const ActionButton = ({ imgUrl, handleClick, restStyles }: Props) => (
    <div
        className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
        onClick={handleClick}
    >
        <Image src={imgUrl} alt="action_img" width={200} height={200} className={styles.gameMoveIcon} />
    </div>
);

export default ActionButton;