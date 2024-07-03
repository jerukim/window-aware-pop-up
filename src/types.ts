export type Position = 'bottom' | 'left' | 'top' | 'right'

export type Positions =
  | [Position]
  | [Position, Position]
  | [Position, Position, Position]
  | [Position, Position, Position, Position]
