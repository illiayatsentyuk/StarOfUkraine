export interface RoomInfo {
  roomId: string;
  clients: Set<string>;
  createdAt: Date;
  lastActivity: Date;
}
