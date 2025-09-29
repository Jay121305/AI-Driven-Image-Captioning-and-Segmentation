export enum State {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Success = 'SUCCESS',
  Error = 'ERROR',
}

export type AppState = State.Idle | State.Loading | State.Success | State.Error;

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}