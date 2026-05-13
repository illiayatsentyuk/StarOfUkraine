export interface BroadcastPayload {
  message?: string;
}

export interface MessagePayload {
  message?: string;
}

export interface TaskSubmittedPayload {
  tournamentId: string;
  taskId: string;
  teamId: string;
  submissionId: string;
}

export interface SubmissionEvaluatedPayload {
  tournamentId: string;
  submissionId: string;
  taskId: string;
  juryId: string;
  totalScore: number;
  finalised: boolean;
}
