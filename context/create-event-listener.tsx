import { AVAXGods } from "@/typechain-types";
import { playAudio, sparcle } from '@/utils/animation';
import { RefObject } from 'react';

const getCoords = (cardRef: RefObject<HTMLDivElement | null>) => {
    const rect = cardRef.current?.getBoundingClientRect();

    if (!rect) {
        return { pageX: 0, pageY: 0 };
    }

    const { left, top, width, height } = rect;

    return {
        pageX: left + width / 2,
        pageY: top + height / 2.25,
    };
};

const emptyAccount = '0x0000000000000000000000000000000000000000';

interface CreateEventListenersParams {
    navigate: (path: string) => void;
    contract: AVAXGods;
    walletAddress: string;
    setShowAlert: (alert: { status: boolean; type: "info" | "success" | "failure"; message: string }) => void;
    player1Ref: RefObject<HTMLDivElement | null>;
    player2Ref: RefObject<HTMLDivElement | null>;
    setUpdateGameData: (updater: (prev: number) => number) => void;
}

export const createEventListeners = ({
                                         navigate,
                                         contract,
                                         walletAddress,
                                         setShowAlert,
                                         player1Ref,
                                         player2Ref,
                                         setUpdateGameData,
                                     }: CreateEventListenersParams) => {
    contract.on(contract.getEvent("NewPlayer"), (owner) => {
        if (walletAddress.toLowerCase() === owner.toLowerCase()) {
            setShowAlert({
                status: true,
                type: "success",
                message: "Player has been successfully registered",
            });
        }
    });

    contract.on(contract.getEvent("NewBattle"), (battleName, player1, player2) => {
        if (
            walletAddress.toLowerCase() === player1.toLowerCase() ||
            walletAddress.toLowerCase() === player2.toLowerCase()
        ) {
            navigate(`/battle/${battleName}`);
        }
        setUpdateGameData((prev) => prev + 1);
    });

    contract.on(contract.getEvent("NewGameToken"), (owner) => {
        if (walletAddress.toLowerCase() === owner.toLowerCase()) {
            setShowAlert({
                status: true,
                type: "success",
                message: "Player game token has been successfully generated",
            });

            navigate("/create-battle");
        }
    });

    contract.on(contract.getEvent("BattleMove"), (...args) => {
        console.log("Battle move!", args);
    });

    contract.on(contract.getEvent("RoundEnded"), (damagedPlayers) => {
        damagedPlayers.forEach((player) => {
            const damaged = player.toLowerCase();
            if (damaged !== emptyAccount) {
                if (damaged === walletAddress.toLowerCase()) {
                    sparcle(getCoords(player1Ref));
                } else {
                    sparcle(getCoords(player2Ref));
                }
            } else {
                playAudio("/assets/sounds/defense.mp3");
            }
        });

        setUpdateGameData((prev) => prev + 1);
    });

    contract.on(contract.getEvent("BattleEnded"), (battleName, winner, loser) => {
        if (walletAddress.toLowerCase() === winner.toLowerCase()) {
            setShowAlert({ status: true, type: "success", message: "You won!" });
        } else if (walletAddress.toLowerCase() === loser.toLowerCase()) {
            setShowAlert({ status: true, type: "failure", message: "You lost!" });
        }

        navigate("/create-battle");
    });

};
