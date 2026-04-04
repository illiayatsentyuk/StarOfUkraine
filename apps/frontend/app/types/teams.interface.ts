export interface Team {
    id: string;
    teamName: string;
    captainName: string;
    captainEmail: string;
    members: string[];
    city: string;
    organization: number;
    telegram: number;
    discord: number;
    createdAt?: string
}