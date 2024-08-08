class NotYourTurnError extends Error {
  constructor() {
    super("It's not your turn");
    this.name = "NotYourTurnError";
    this.statusCode = 400;
  }
}

class PieceInTheWayError extends Error {
  constructor() {
    super("Piece in the way");
    this.name = "PieceInTheWayError";
    this.statusCode = 422;
  }
}

class CannotNavigateError extends Error {
  constructor() {
    super("Cannot navigate to square");
    this.name = "CannotNavigateError";
    this.statusCode = 422;
  }
}
class GameInactiveError extends Error {
  constructor() {
    super("The game is inactive");
    this.name = "GameInactiveError";
    this.statusCode = 403; // Forbidden
  }
}
module.exports = {
  NotYourTurnError,
  PieceInTheWayError,
  CannotNavigateError,
  GameInactiveError,
};
