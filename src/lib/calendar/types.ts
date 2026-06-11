export type CalendarTeam = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
};

export type CalendarMatch = {
  id: string;
  match_number: number;
  kickoff: string;
  stage: string;
  group_letter: string | null;
  home_score: number | null;
  away_score: number | null;
  finished: boolean;
  status: string;
  home_team: CalendarTeam | null;
  away_team: CalendarTeam | null;
};

export type CalendarPrediction = {
  match_id: string;
  home_score: number | null;
  away_score: number | null;
};

export type CalendarOtherPrediction = {
  match_id: string;
  user_id: string;
  home_score: number;
  away_score: number;
};

export type CalendarParticipant = {
  user_id: string;
  display_name: string;
};

export type TournamentDay = {
  dateKey: string;
  date: Date;
  matches: CalendarMatch[];
  hasLive: boolean;
  phase: string;
  matchday?: number;
};
