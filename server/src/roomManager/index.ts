interface Player {
    playerId: string;
    admin: boolean;
}
export class RoomManager {
    private rooms: Map<string, Player[]>;

    constructor() {
        this.rooms = new Map();
    }

    getRooms() {
        return this.rooms;
    }

    getRoom(roomId: string){
        return this.rooms.get(roomId);
    }

    createRoom(roomId: string, playerId: string){
        this.rooms.set(roomId, [{ playerId: playerId, admin: true }]);
    }

    joinRoom(roomId: string, playerId: string){
        const room = this.rooms.get(roomId);
        if(!room) {
            throw new Error("Room does not exist");
        }
        room.push({ playerId: playerId, admin: false });
        this.rooms.set(roomId, room);
    }

    exitRoom(roomId: string, playerId: string){
        const room = this.rooms.get(roomId);
        if(!room) {
            throw new Error("Room does not exist");
        }
        const updatedRoom = room.filter((player: Player) => player.playerId !== playerId);
        this.rooms.set(roomId, updatedRoom);
    }   
}

export const roomManager = new RoomManager();