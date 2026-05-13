import { TournamentService } from './apps/backend/src/tournament/tournament.service';
console.log('Method exists:', typeof (TournamentService.prototype as any).validateTournamentDates);
