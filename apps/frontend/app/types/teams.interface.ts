export interface Team {
    id: string;
    name: string;
    captainName: string;
    captainEmail: string;
    members: string[];
    city: string;
    organization: string;
    telegram: string;
    discord: string;
    createdAt?: string
}

export type CreateTeamPayload = {
    name: string
    captainName: string
    city?: string
    organization?: string
    telegram?: string
    discord?: string
    members?: string[]
}