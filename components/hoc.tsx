import React, {JSX} from 'react';

import Alert from './alert';
import { useGlobalContext } from '@/context';
import styles from '@/styles';
import {useRouter} from "next/navigation";
import Image from "next/image";

const PageHOC = (Component: React.ComponentType, title: JSX.Element, description: JSX.Element) => () => {
    const { showAlert } = useGlobalContext();
    const router = useRouter();

    return (
        <div className={styles.hocContainer}>
            {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}

            <div className={styles.hocContentBox}>
                <Image src="/assets/logo.svg" width={24} height={24} alt="logo" className={styles.hocLogo} onClick={() => router.push('/')} />

                <div className={styles.hocBodyWrapper}>
                    <div className="flex flex-row w-full">
                        <h1 className={`flex ${styles.headText} head-text`}>{title}</h1>
                    </div>

                    <p className={`${styles.normalText} my-10`}>{description}</p>

                    <Component />
                </div>

                <p className={styles.footerText}>Made with 💜 by Patrick Naenae</p>
            </div>

            <div className="flex flex-1">
                <Image src="/assets/background/hero-img.jpg" width={200} height={200} alt="hero-img" className="w-full xl:h-full object-cover" />
            </div>
        </div>
    );
};

export default PageHOC;