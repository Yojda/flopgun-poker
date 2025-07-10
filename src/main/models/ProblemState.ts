export interface ProblemState {
  id: number;
  problem_id: number;
  user_id: number;
  state: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateProblemStateRequest {
  problem_id: number;
  user_id: number;
  state: string;
}

export interface UpdateProblemStateRequest {
  state: string;
}

