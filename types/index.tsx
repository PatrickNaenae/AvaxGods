export interface Player {
     playerAddress?: string;
     playerName?: string;
     mana?: number;
     health?: number;
     att?: number | string;
     def?: number | string;
}

export interface Battle {
     name: string;
     battleStatus: number;
     players: [string, string];
     winner: string;
     // moves: [number, number];
}

