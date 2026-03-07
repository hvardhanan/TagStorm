export interface Player {
    playerId: string;
    isAdmin: boolean;
    socketId?: string;
    x: number;
    y: number;
    isIt: boolean;
    isConnected: boolean;
}

export enum RoomStatus{
    LOBBY,
    PLAYING,
    CLOSED,
}

export interface Room{
    roomId: string;
    players: Player[];
    adminId: string | null;
    status: RoomStatus;
    selectedMap: string | null;
    currentItId: string | null;
    endTime?: number | undefined;
}

export interface JoinRoomType{
    roomId: string;
    playerId: string;
}