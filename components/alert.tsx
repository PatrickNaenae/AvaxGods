import React from 'react';

import { AlertIcon } from '@/public/assets';
import styles from '@/styles';

type AlertType = 'info' | 'success' | 'failure';

interface Props {
    type: AlertType;
    message: string;
}

const Alert = ({ type, message }: Props) => (
    <div className={`${styles.alertContainer} ${styles.flexCenter}`}>
        <div className={`${styles.alertWrapper} ${styles[type]}`} role="alert">
            <AlertIcon type={type} /> {message}
        </div>
    </div>
);

export default Alert;