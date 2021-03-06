const COUNT_CELL_IN_ROW = 8;
const COLOR_BLACK_CELL = "#DB8700";
const COLOR_WHITE_CELL = "#FCD89D";

const FIELD_SIZE = 480;
const FIELD_TOP_MARGIN = 30;
const FIELD_LEFT_MARGIN = 30;
const CEIL_SIZE = FIELD_SIZE / COUNT_CELL_IN_ROW;

const BLACK_ROOK_SYMBOL = "\u265C";
const WHITE_ROOK_SYMBOL = "\u2656";

const BLACK_KNIGHT_SYMBOL = "\u265E";
const WHITE_KNIGHT_SYMBOL = "\u2658";

const BLACK_BISHOP_SYMBOL = "\u265D";
const WHITE_BISHOP_SYMBOL = "\u2657";

const BLACK_KING_SYMBOL = "\u265B";
const WHITE_KING_SYMBOL = "\u2655";

const BLACK_QUEEN_SYMBOL = "\u265A";
const WHITE_QUEEN_SYMBOL = "\u2654";

const BLACK_PAWN_SYMBOL = "\u265F";
const WHITE_PAWN_SYMBOL = "\u2659";

const INFO_TEXT_POSITION_X = 50;
const PROMOTION_FIGURES_POSITION_X = 130;
const INFO_TEXT_POSITION_Y = FIELD_SIZE + FIELD_TOP_MARGIN * 2 + 20;
const PROMOTION_FIGURES_POSITION_Y = FIELD_SIZE + FIELD_TOP_MARGIN * 2 + 80;

const COOKIE_WHITE_FIGURE_PLAYER_NAME = ".whiteFigurePlayerName";
const COOKIE_BLACK_FIGURE_PLAYER_NAME = ".blackFigurePlayerName";
const COOKIE_RESULT_TABLE = ".resultTable";
const DEFAULT_COOKIE_EXPIRES_DAYS = 10;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = FIELD_SIZE + 60;
canvas.height = FIELD_SIZE + 140;

var step = 0;

var Color = {
    WHITE: 0,
    BLACK: 1
};

var GameStatus = {
    PREPARING: 0,
    STARTED: 1,
    OFFERING_DRAW: 2,
    FINISHED: 3
};

var colorWhite = Color.WHITE;
var colorBlack = Color.BLACK;

var curGameStatus = GameStatus.PREPARING;

var promotionFigures = [];

var Ceil = function Cell(figure, color) {
    this.figure = figure;
    this.color = color;
    this.isPosibleStep = false;
    this.isCastlingMove = false;
    this.isEnpassantMove = false;
};

var Board = function () {
    this.ceils = [];
    this.isPromotionMode = false;
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        this.ceils[i] = [];
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if ((i + j) % 2 == 0) {
                this.ceils[i][j] = new Ceil(null, colorBlack);
            } else {
                this.ceils[i][j] = new Ceil(null, colorWhite);
            }

        }
    }
};

var board = new Board();

var Rook;
var Knight;
var Bishop;
var King;
var Queen;
var Pawn;

var User = function (name) {
    this.name = name;
    this.points = 0;
};

var ResultsTable = function () {
    this.users = [];
};


function initFigures() {
    var AbstractFigure = function (symbol, figureColor) {
        this.symbol = symbol;
        this.figureColor = figureColor;
        this.hasBeenMoved = false;
    };

    Rook = function Rook(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_ROOK_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_ROOK_SYMBOL, figureColor)
        }
    };

    function isSimpleKillPossible(board, figureColor, line, column) {
        var figureInCell = board.ceils[line][column].figure;
        return figureInCell != null && figureInCell.figureColor != figureColor;
    }

    Rook.prototype = Object.create(AbstractFigure.prototype);

    Rook.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber, figureColor) {
        var _figureColor = figureColor == null ? this.figureColor : figureColor;
        for (var curLine = oldLineNumber + 1; curLine < COUNT_CELL_IN_ROW; curLine++) {
            if (board.ceils[curLine][oldColumnNumber].figure == null) {
                board.ceils[curLine][oldColumnNumber].isPosibleStep = true;
            } else {
                board.ceils[curLine][oldColumnNumber].isPosibleStep = isSimpleKillPossible(board, _figureColor, curLine, oldColumnNumber);
                break;
            }
        }
        for (curLine = oldLineNumber - 1; curLine >= 0; curLine--) {
            if (board.ceils[curLine][oldColumnNumber].figure == null) {
                board.ceils[curLine][oldColumnNumber].isPosibleStep = true;
            } else {
                board.ceils[curLine][oldColumnNumber].isPosibleStep = isSimpleKillPossible(board, _figureColor, curLine, oldColumnNumber);
                break;
            }
        }
        for (var curColumn = oldColumnNumber + 1; curColumn < COUNT_CELL_IN_ROW; curColumn++) {
            if (board.ceils[oldLineNumber][curColumn].figure == null) {
                board.ceils[oldLineNumber][curColumn].isPosibleStep = true;
            } else {
                board.ceils[oldLineNumber][curColumn].isPosibleStep = isSimpleKillPossible(board, _figureColor, oldLineNumber, curColumn);
                break;
            }
        }
        for (curColumn = oldColumnNumber - 1; curColumn >= 0; curColumn--) {
            if (board.ceils[oldLineNumber][curColumn].figure == null) {
                board.ceils[oldLineNumber][curColumn].isPosibleStep = true;
            } else {
                board.ceils[oldLineNumber][curColumn].isPosibleStep = isSimpleKillPossible(board, _figureColor, oldLineNumber, curColumn);
                break;
            }
        }
    };

    Knight = function Knight(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_KNIGHT_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_KNIGHT_SYMBOL, figureColor)
        }
    };

    Knight.prototype = Object.create(AbstractFigure.prototype);

    Knight.prototype.checkPossibleStep = function (board, oldLineNumber, oldColumnNumber) {
        return isSimpleKillPossible(board, this.figureColor, oldLineNumber, oldColumnNumber)
            || (board.ceils[oldLineNumber][oldColumnNumber].figure == null);
    };

    Knight.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber) {
        if (oldLineNumber >= 2) {
            if (oldColumnNumber >= 1) {
                board.ceils[oldLineNumber - 2][oldColumnNumber - 1].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber - 2, oldColumnNumber - 1)
            }
            if (oldColumnNumber < COUNT_CELL_IN_ROW - 1) {
                board.ceils[oldLineNumber - 2][oldColumnNumber + 1].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber - 2, oldColumnNumber + 1)
            }
        }
        if (oldLineNumber < COUNT_CELL_IN_ROW - 2) {
            if (oldColumnNumber >= 1) {
                board.ceils[oldLineNumber + 2][oldColumnNumber - 1].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber + 2, oldColumnNumber - 1)
            }
            if (oldColumnNumber < COUNT_CELL_IN_ROW - 1) {
                board.ceils[oldLineNumber + 2][oldColumnNumber + 1].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber + 2, oldColumnNumber + 1)
            }
        }
        if (oldColumnNumber >= 2) {
            if (oldLineNumber >= 1) {
                board.ceils[oldLineNumber - 1][oldColumnNumber - 2].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber - 1, oldColumnNumber - 2)
            }
            if (oldLineNumber < COUNT_CELL_IN_ROW - 1) {
                board.ceils[oldLineNumber + 1][oldColumnNumber - 2].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber + 1, oldColumnNumber - 2)
            }
        }
        if (oldColumnNumber < COUNT_CELL_IN_ROW - 2) {
            if (oldLineNumber >= 1) {
                board.ceils[oldLineNumber - 1][oldColumnNumber + 2].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber - 1, oldColumnNumber + 2)
            }
            if (oldLineNumber < COUNT_CELL_IN_ROW - 1) {
                board.ceils[oldLineNumber + 1][oldColumnNumber + 2].isPosibleStep =
                    this.checkPossibleStep(board, oldLineNumber + 1, oldColumnNumber + 2)
            }
        }
    };

    Bishop = function Bishop(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_BISHOP_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_BISHOP_SYMBOL, figureColor)
        }
    };

    Bishop.prototype = Object.create(AbstractFigure.prototype);

    Bishop.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber, figureColor) {
        var _figureColor = figureColor == null ? this.figureColor : figureColor;
        for (var i = oldLineNumber + 1, j = oldColumnNumber + 1;
             (i < COUNT_CELL_IN_ROW) && (j < COUNT_CELL_IN_ROW); i++, j++) {
            if (board.ceils[i][j].figure == null) {
                board.ceils[i][j].isPosibleStep = true;
            } else {
                board.ceils[i][j].isPosibleStep = isSimpleKillPossible(board, _figureColor, i, j);
                break;
            }
        }
        for (i = oldLineNumber - 1, j = oldColumnNumber - 1;
             (i >= 0) && (j >= 0); i--, j--) {
            if (board.ceils[i][j].figure == null) {
                board.ceils[i][j].isPosibleStep = true;
            } else {
                board.ceils[i][j].isPosibleStep = isSimpleKillPossible(board, _figureColor, i, j);
                break;
            }
        }
        for (i = oldLineNumber - 1, j = oldColumnNumber + 1;
             (i >= 0) && (j < COUNT_CELL_IN_ROW); i--, j++) {
            if (board.ceils[i][j].figure == null) {
                board.ceils[i][j].isPosibleStep = true;
            } else {
                board.ceils[i][j].isPosibleStep = isSimpleKillPossible(board, _figureColor, i, j);
                break;
            }
        }
        for (i = oldLineNumber + 1, j = oldColumnNumber - 1;
             (i < COUNT_CELL_IN_ROW) && (j >= 0); i++, j--) {
            if (board.ceils[i][j].figure == null) {
                board.ceils[i][j].isPosibleStep = true;
            } else {
                board.ceils[i][j].isPosibleStep = isSimpleKillPossible(board, _figureColor, i, j);
                break;
            }
        }
    };

    King = function King(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_KING_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_KING_SYMBOL, figureColor)
        }
    };

    King.prototype = Object.create(AbstractFigure.prototype);

    King.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber) {
        Rook.prototype.generatePossibleMoves(board, oldLineNumber, oldColumnNumber, this.figureColor);
        Bishop.prototype.generatePossibleMoves(board, oldLineNumber, oldColumnNumber, this.figureColor)
    };

    Queen = function Queen(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_QUEEN_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_QUEEN_SYMBOL, figureColor)
        }
    };

    Queen.prototype = Object.create(AbstractFigure.prototype);

    Queen.prototype.isKillPossible = function (board, oldLineNumber, oldColumnNumber,
                                               newLineNumber, newColumnNumber) {
        // проверяем можем ли взять фигуру забывая о возможном шахе
        var _isKillPossible = isSimpleKillPossible(board, this.figureColor, newLineNumber, newColumnNumber);
        if (_isKillPossible) {
            // а теперь проверяем не приведет ли это взятие к шаху
            return !this.isChessStep(board, oldLineNumber, oldColumnNumber,
                newLineNumber, newColumnNumber)
        }
        return _isKillPossible;
    };

    Queen.prototype.isChessStep = function (board, oldLineNumber, oldColumnNumber,
                                            newLineNumber, newColumnNumber) {
        var tempBoard = getCopyBoardWithFigures(board);
        makeStep(tempBoard, this, oldLineNumber, oldColumnNumber, newLineNumber, newColumnNumber);

        /* console.log("пробуем походить " + getColorString(this.figureColor) + " королем на " + newLineNumber + " строку "
         + newColumnNumber + " столбец");*/
        var otherColor;
        if (this.figureColor == Color.WHITE) {
            otherColor = Color.BLACK;
        } else {
            otherColor = Color.WHITE;
        }
        //  console.log("Генерируем ходы противоположных фигур для проверки сохранит ли ход нашим королем шах");
        generateAllFiguresPossibleSteps(tempBoard, otherColor);
        var otherQueenIndex = findOppositeQueenIndex(board, this.figureColor);
        var isOtherQueenNear = Math.abs(newLineNumber - otherQueenIndex.line)
            + Math.abs(newColumnNumber - otherQueenIndex.column) == 1;
        // console.log("Привел ли наш ход к близости с другим королем? " + isOtherQueenNear);
        return tempBoard.ceils[newLineNumber][newColumnNumber].isPosibleStep && !isOtherQueenNear;
    };

    Queen.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber) {
        var startLine = oldLineNumber - 1;
        if (startLine < 0) startLine = 0;
        var startColumn = oldColumnNumber - 1;
        if (startColumn < 0) startColumn = 0;
        for (var i = startLine; (i <= oldLineNumber + 1) && (i < COUNT_CELL_IN_ROW); i++)
            for (var j = startColumn; (j <= oldColumnNumber + 1) && (j < COUNT_CELL_IN_ROW); j++) {
                var curCeil = board.ceils[i][j];
                if (curCeil.figure == null) {
                    curCeil.isPosibleStep = !this.isChessStep(board, oldLineNumber, oldColumnNumber, i, j);
                    if (curCeil.isPosibleStep) {
                        //   console.log("Этот ход не привел к шаху");
                    } else {
                        //   console.log("Этот ход привел к шаху");
                    }
                } else {
                    curCeil.isPosibleStep = this.isKillPossible(board, oldLineNumber, oldColumnNumber, i, j);
                    if (curCeil.isPosibleStep) {
                        //   console.log("Взятие фигуры позволило уйти от шаха");
                    } else {
                        //  console.log("Взятие фигуры НЕ позволило уйти от шаха");
                    }

                }
            }

        if (!this.hasBeenMoved) {
            // короткая рокировка
            if (board.ceils[oldLineNumber][5].figure == null
                && board.ceils[oldLineNumber][6].figure == null
                && board.ceils[oldLineNumber][7].figure instanceof Rook
                && !board.ceils[oldLineNumber][7].figure.hasBeenMoved) {
                board.ceils[oldLineNumber][6].isPosibleStep = true;
                board.ceils[oldLineNumber][6].isCastlingMove = true;
            }
            // длинная рокировка
            if (board.ceils[oldLineNumber][1].figure == null
                && board.ceils[oldLineNumber][2].figure == null
                && board.ceils[oldLineNumber][3].figure == null
                && board.ceils[oldLineNumber][0].figure instanceof Rook
                && !board.ceils[oldLineNumber][0].figure.hasBeenMoved) {
                board.ceils[oldLineNumber][1].isPosibleStep = true;
                board.ceils[oldLineNumber][1].isCastlingMove = true;
            }
        }
    };

    Pawn = function Pawn(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, BLACK_PAWN_SYMBOL, figureColor)
        } else {
            AbstractFigure.call(this, WHITE_PAWN_SYMBOL, figureColor)
        }
    };

    Pawn.prototype = Object.create(AbstractFigure.prototype);

    Pawn.prototype.generatePossibleMoves = function (board, oldLineNumber, oldColumnNumber) {
        if (this.figureColor == Color.BLACK) {
            if (oldLineNumber == 1) {
                board.ceils[3][oldColumnNumber].isPosibleStep =
                    board.ceils[3][oldColumnNumber].figure == null;
            }
            if (oldLineNumber < COUNT_CELL_IN_ROW - 1) {
                board.ceils[oldLineNumber + 1][oldColumnNumber].isPosibleStep =
                    board.ceils[oldLineNumber + 1][oldColumnNumber].figure == null;
                if (oldColumnNumber < COUNT_CELL_IN_ROW - 1) {
                    board.ceils[oldLineNumber + 1][oldColumnNumber + 1].isPosibleStep =
                        isSimpleKillPossible(board, this.figureColor, oldLineNumber + 1, oldColumnNumber + 1)
                        || board.ceils[oldLineNumber + 1][oldColumnNumber + 1].isEnpassantMove;
                }
                if (oldColumnNumber > 0) {
                    board.ceils[oldLineNumber + 1][oldColumnNumber - 1].isPosibleStep =
                        isSimpleKillPossible(board, this.figureColor, oldLineNumber + 1, oldColumnNumber - 1)
                        || board.ceils[oldLineNumber + 1][oldColumnNumber - 1].isEnpassantMove;
                }
            }
        } else {
            if (oldLineNumber == COUNT_CELL_IN_ROW - 2) {
                board.ceils[4][oldColumnNumber].isPosibleStep =
                    board.ceils[4][oldColumnNumber].figure == null;
            }
            if (oldLineNumber > 0) {
                board.ceils[oldLineNumber - 1][oldColumnNumber].isPosibleStep =
                    board.ceils[oldLineNumber - 1][oldColumnNumber].figure == null;
                if (oldColumnNumber <= COUNT_CELL_IN_ROW - 2) {
                    board.ceils[oldLineNumber - 1][oldColumnNumber + 1].isPosibleStep =
                        isSimpleKillPossible(board, this.figureColor, oldLineNumber - 1, oldColumnNumber + 1)
                        || board.ceils[oldLineNumber - 1][oldColumnNumber + 1].isEnpassantMove;
                }
                if (oldColumnNumber > 0) {
                    board.ceils[oldLineNumber - 1][oldColumnNumber - 1].isPosibleStep =
                        isSimpleKillPossible(board, this.figureColor, oldLineNumber - 1, oldColumnNumber - 1)
                        || board.ceils[oldLineNumber - 1][oldColumnNumber - 1].isEnpassantMove;
                }
            }
        }
    };
}

function getColorString(color) {
    if (color == Color.WHITE) {
        return "white";
    } else {
        return "black";
    }
}

function initFiguresOnBoard() {
    board.ceils[7][0].figure = new Rook(colorWhite);
    board.ceils[7][1].figure = new Knight(colorWhite);
    board.ceils[7][2].figure = new Bishop(colorWhite);
    board.ceils[7][3].figure = new King(colorWhite);
    board.ceils[7][4].figure = new Queen(colorWhite);
    board.ceils[7][5].figure = new Bishop(colorWhite);
    board.ceils[7][6].figure = new Knight(colorWhite);
    board.ceils[7][7].figure = new Rook(colorWhite);
    for (var i = 0; i <= COUNT_CELL_IN_ROW - 1; i++) {
        board.ceils[6][i].figure = new Pawn(colorWhite);
    }

    board.ceils[0][0].figure = new Rook(colorBlack);
    board.ceils[0][1].figure = new Knight(colorBlack);
    board.ceils[0][2].figure = new Bishop(colorBlack);
    board.ceils[0][3].figure = new King(colorBlack);
    board.ceils[0][4].figure = new Queen(colorBlack);
    board.ceils[0][5].figure = new Bishop(colorBlack);
    board.ceils[0][6].figure = new Knight(colorBlack);
    board.ceils[0][7].figure = new Rook(colorBlack);
    for (i = 0; i <= COUNT_CELL_IN_ROW - 1; i++) {
        board.ceils[1][i].figure = new Pawn(colorBlack);
    }
}

function updateGameWindow() {
    resetPossibleMoves(board);
    clearCircles(board);
    drawFiguresOnBoard();

    var curStepColor = getColorFigureMovesInThisStep();

    console.log("step = " + step);
    if (!board.isPromotionMode && curGameStatus == GameStatus.STARTED)
        step++;

    if (!board.isPromotionMode) {
        clearBottomInfoContainer();
        drawStepInformation();
    }

    if ((step > 1) && isChess(board, curStepColor)) {
        if (isChessMate(board, curStepColor)) {
            showCheckMateInfo("Шах и мат!");
            var winner = new User(getPlayerNameByFigureColor(getColorFigureMovesInThisStep()));
            var loser = new User(getPlayerNameByFigureColor(getOtherColor(getColorFigureMovesInThisStep())));
            winner.points += 1;
            onFinishGameEvent(winner, loser);
            return;
        } else {
            showCheckMateInfo("Шах!")
        }
    }


    drawCeilsSymbols();
}

function drawCeilsSymbols() {
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#000";
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        var y = FIELD_TOP_MARGIN + i * CEIL_SIZE + CEIL_SIZE / 2 + 5;
        var line = (COUNT_CELL_IN_ROW - i).toString();
        ctx.fillText(line, 10, y);
        ctx.fillText(line, FIELD_SIZE + FIELD_LEFT_MARGIN + 10, y);
        var x = FIELD_LEFT_MARGIN + i * CEIL_SIZE + CEIL_SIZE / 2 - 5;
        var column = convertColumnToChar(i);
        ctx.fillText(column, x, 20);
        ctx.fillText(column, x, FIELD_SIZE + FIELD_TOP_MARGIN + 20);
    }
}

var Index = function (line, column) {
    this.line = line;
    this.column = column;
};


function findOppositeQueenIndex(board, curStepColor) {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            var figure = board.ceils[i][j].figure;
            if ((figure != null) && (figure instanceof Queen)
                && (figure.figureColor != curStepColor)) {
                return new Index(i, j);
            }
        }
}

// проверяем на шах
function isChess(board, curStepColor) {
    var tempBoard = getCopyBoardWithFigures(board);
    var oppositeQueenIndex = findOppositeQueenIndex(board, curStepColor);
    console.log("проверяем поставили ли " + getColorString(curStepColor) + " фигуры шах");
    generateAllFiguresPossibleSteps(tempBoard, curStepColor);
    var oppositeQueenCeil = tempBoard.ceils[oppositeQueenIndex.line][oppositeQueenIndex.column];
    return oppositeQueenCeil.isPosibleStep;
}


// перед проверкой на мат нужно вызвать проверку на шах
function isChessMate(board, curStepColor) {
    console.log("проверяем поставили ли " + getColorString(curStepColor) + " фигуры мат");
    var queenIndex = findOppositeQueenIndex(board, curStepColor);
    return !mayQueenEscapeMateOwnStep(board, queenIndex.line, queenIndex.column,
            board.ceils[queenIndex.line][queenIndex.column].figure)
        && !mayEscapeFromMateByKillOtherFigure(board, getOtherColor(curStepColor))
}

function mayEscapeFromMateByKillOtherFigure(board, curStepColor) {
    var newBoard = getCopyBoardWithFigures(board);
    console.log("Проверяем можем ли мы уйти от мата взяв фигуру");
    console.log("генерируем ходы для " + getColorString(curStepColor) + " фигур");
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            var figure = board.ceils[i][j].figure;
            if (figure != null && figure.figureColor == curStepColor && !(figure instanceof Queen)) {
                console.log("Сгенерированы ходы для " + figure.symbol);
                figure.generatePossibleMoves(newBoard, i, j);
                if (makePossibleMovesEscapeMate(newBoard, figure, i, j)) {
                    return true;
                }
                resetPossibleMoves(newBoard);
            }
        }
    return false;
}

function getOtherColor(color) {
    if (color == Color.WHITE) {
        return Color.BLACK;
    } else {
        return Color.WHITE;
    }
}

function makePossibleMovesEscapeMate(board, figure, oldLine, oldColumn) {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].isPosibleStep) {
                if (mayMoveEscapeMate(board, figure, oldLine, oldColumn, i, j)) {
                    console.log("Ход  " + getStepString(oldLine, oldColumn) + " -> " + getStepString(i, j)
                        + " позволил уйти от шаха");
                    return true;
                }
            }
        }
    return false;
}

function getStepString(line, column) {
    return convertColumnToChar(column) + (COUNT_CELL_IN_ROW - line)
}

function convertColumnToChar(column) {
    return String.fromCharCode('A'.charCodeAt(0) + column)
}

function mayMoveEscapeMate(board, figure, oldLine, oldColumn, newLine, newColumn) {
    console.log("Совершаем ход " + getStepString(oldLine, oldColumn) + " -> " + getStepString(newLine, newColumn));
    makeStep(board, figure, oldLine, oldColumn, newLine, newColumn);
    return !isChess(board, getOtherColor(figure.figureColor))
}

function showCheckMateInfo(text) {
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#f00";
    ctx.fillText(text, INFO_TEXT_POSITION_X + 100, INFO_TEXT_POSITION_Y + 25);
}

function generateAllFiguresPossibleSteps(board, figureColor) {
    console.log("генерируем ходы для " + getColorString(figureColor) + " фигур");
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            var figure = board.ceils[i][j].figure;
            if (figure != null && figure.figureColor == figureColor && !(figure instanceof Queen)) {
                figure.generatePossibleMoves(board, i, j);
            }
        }
}

// проверяем может ли король уйти от мата своим ходом
function mayQueenEscapeMateOwnStep(board, queenLine, queenColumn, queen) {
    var newBoard = getCopyBoardWithFigures(board);
    queen.generatePossibleMoves(newBoard, queenLine, queenColumn);
    var mayQueenEscapeMateOwnStep = false;
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (newBoard.ceils[i][j].isPosibleStep && !board.ceils[i][j].isPosibleStep) {
                mayQueenEscapeMateOwnStep = true;
            }
        }
    return mayQueenEscapeMateOwnStep;
}

function makeStep(board, figure, oldLine, oldColumn, newLine, newColumn) {
    board.ceils[oldLine][oldColumn].figure = null;
    board.ceils[newLine][newColumn].figure = figure;
}

function getCopyBoardWithFigures(board) {
    var copyBoard = new Board();
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            copyBoard.ceils[i][j].figure = board.ceils[i][j].figure
        }
    }
    return copyBoard;
}

function drawFiguresOnBoard() {
    ctx.font = "bold 48px Arial";
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].color == Color.BLACK) {
                ctx.fillStyle = COLOR_BLACK_CELL
            } else {
                ctx.fillStyle = COLOR_WHITE_CELL
            }
            var x = j * CEIL_SIZE + FIELD_LEFT_MARGIN;
            var y = i * CEIL_SIZE + FIELD_TOP_MARGIN;
            ctx.fillRect(x, y, CEIL_SIZE, CEIL_SIZE);
            var curFigure = board.ceils[i][j].figure;
            if (curFigure != null) {
                if (curFigure.figureColor == Color.BLACK) {
                    ctx.fillStyle = "#000";
                } else {
                    ctx.fillStyle = "#fff";
                }
                ctx.fillText(curFigure.symbol, x + CEIL_SIZE / 7, y + CEIL_SIZE * 6 / 7);
            }
        }


    }

    ctx.rect(FIELD_LEFT_MARGIN, FIELD_TOP_MARGIN, FIELD_SIZE, FIELD_SIZE);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

}

function getColorFigureMovesInThisStep() {
    return step % 2 == 1 ? Color.WHITE : Color.BLACK;
}

function drawStepInformation() {
    var text = getColorFigureMovesInThisStep() == Color.WHITE ? "Ходят белые" : "Ходят черные";
    if (curGameStatus != GameStatus.STARTED) {
        text = "";
    }
    document.getElementById('step_info').textContent = text;
}

function findLineByCoordY(y) {
    return Math.floor((y - FIELD_TOP_MARGIN) / CEIL_SIZE);
}

function findColumnByCoordX(x) {
    return Math.floor((x - FIELD_LEFT_MARGIN) / CEIL_SIZE);
}

var clickedFigure = null;
var oldLine;
var oldColumn;
var newLine;
var newColumn;

function onClickListener(event) {
    var coords = relMouseCoords(event, canvas);
    var canvasX = coords.x;
    var canvasY = coords.y;
    if ((canvasX > FIELD_LEFT_MARGIN) && (canvasX < FIELD_SIZE + FIELD_LEFT_MARGIN)
        && (canvasY > FIELD_TOP_MARGIN)) {
        if (curGameStatus == GameStatus.OFFERING_DRAW) {
            alert("Вам предложена ничья. Согласитесь или откажитесь на этот результат")
        }
        if (curGameStatus != GameStatus.STARTED) {
            return;
        }
        if (canvasY < FIELD_SIZE + FIELD_TOP_MARGIN && !board.isPromotionMode) {
            processOnBoardClick(canvasX, canvasY);
        }
        if (board.isPromotionMode) {
            processOnPromotionFigureClick(canvasX, canvasY)
        }
    }
}

function processOnBoardClick(canvasX, canvasY) {
    console.log("processOnBoardClick");
    if (clickedFigure == null) {
        oldLine = findLineByCoordY(canvasY);
        oldColumn = findColumnByCoordX(canvasX);
        var figure = board.ceils[oldLine][oldColumn].figure;
        if (figure.figureColor == getColorFigureMovesInThisStep()) {
            clickedFigure = figure;
            clickedFigure.generatePossibleMoves(board, oldLine, oldColumn);

            if (hasPossibleSteps()) {
                drawPossibleSteps(board);
            } else {
                clickedFigure = null;
            }
        }
    } else {
        newLine = findLineByCoordY(canvasY);
        newColumn = findColumnByCoordX(canvasX);
        if (board.ceils[newLine][newColumn].isPosibleStep) {
            makeStep(board, clickedFigure, oldLine, oldColumn, newLine, newColumn);
            clickedFigure.hasBeenMoved = true;

            if (board.ceils[newLine][newColumn].isCastlingMove) {
                processingCastling(newLine, newColumn)
            }

            if (board.ceils[newLine][newColumn].isEnpassantMove) {
                board.ceils[newLine][newColumn].isEnpassantMove = false;
                if (clickedFigure.figureColor == Color.WHITE) {
                    // берем черную пешку
                    board.ceils[newLine + 1][newColumn].figure = null;
                } else {
                    board.ceils[newLine - 1][newColumn].figure = null;
                }
            } else {
                // взятие на проходе упущено
                resetEnPassant();
            }

            if (clickedFigure instanceof Pawn) {
                if (Math.abs(newLine - oldLine) == 2) {
                    checkEnPassant(newLine, newColumn);
                }
                if (newLine == 0) {
                    board.isPromotionMode = true;
                    drawPromotionFigures(Color.WHITE);
                }
                if (newLine == 7) {
                    board.isPromotionMode = true;
                    drawPromotionFigures(Color.BLACK);
                }

            }

            console.log("Шаг " + getStepString(oldLine, oldColumn) + " -> "
                + getStepString(newLine, newColumn));

            clickedFigure = null;
            updateGameWindow();
        }
    }
}

function hasPossibleSteps() {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].isPosibleStep) {
                return true;
            }
        }
    }
    return false;
}

function processOnPromotionFigureClick(canvasX, canvasY) {
    if ((canvasX > PROMOTION_FIGURES_POSITION_X) && (canvasX < PROMOTION_FIGURES_POSITION_X + CEIL_SIZE * 4)
        && (canvasY > INFO_TEXT_POSITION_Y) && (canvasY < INFO_TEXT_POSITION_Y + CEIL_SIZE)) {
        var number = Math.floor((canvasX - PROMOTION_FIGURES_POSITION_X) / CEIL_SIZE);
        board.ceils[newLine][newColumn].figure = promotionFigures[number];
        promotionFigures = [];
        board.isPromotionMode = false;
        clearBottomInfoContainer();
        updateGameWindow();
    }

}

function checkEnPassant(newLine, newColumn) {
    var figure;
    if (newColumn > 0) {
        figure = board.ceils[newLine][newColumn - 1].figure;
        if (figure instanceof Pawn && figure.figureColor != clickedFigure.figureColor) {
            if (clickedFigure.figureColor == Color.BLACK) {
                board.ceils[newLine - 1][newColumn].isEnpassantMove = true;
            } else {
                board.ceils[newLine + 1][newColumn].isEnpassantMove = true;
            }
        }
    }
    if (newColumn < COUNT_CELL_IN_ROW - 1) {
        figure = board.ceils[newLine][newColumn + 1].figure;
        if (figure instanceof Pawn && figure.figureColor != clickedFigure.figureColor) {
            if (clickedFigure.figureColor == Color.BLACK) {
                board.ceils[newLine + 1][newColumn].isEnpassantMove = true;
            } else {
                board.ceils[newLine + 1][newColumn].isEnpassantMove = true;
            }
        }
    }
}


function resetEnPassant() {
    board.ceils[2].forEach(function (item, i, arr) {
        arr[i].isEnpassantMove = false;
    });
    board.ceils[5].forEach(function (item, i, arr) {
        arr[i].isEnpassantMove = false;
    })
}

// обработка рокировки
function processingCastling(newLine, newColumn) {
    board.ceils[newLine][newColumn].isCastlingMove = false;
    // короткая рокировка
    if (newColumn == 6) {
        // перемещаем ладью
        board.ceils[newLine][5].figure = board.ceils[newLine][7].figure;
        board.ceils[newLine][7].figure = null;
    }
    // длинная рокировка
    if (newColumn == 1) {
        // перемещаем ладью
        board.ceils[newLine][2].figure = board.ceils[newLine][0].figure;
        board.ceils[newLine][0].figure = null;
    }
}


function drawPossibleSteps(board) {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].isPosibleStep) {
                var circleX = FIELD_LEFT_MARGIN + j * CEIL_SIZE + CEIL_SIZE / 2;
                var circleY = FIELD_TOP_MARGIN + i * CEIL_SIZE + CEIL_SIZE / 2;
                drawCircle(circleX, circleY);

            }
        }
    }
}


function drawCircle(x, y, color) {
    if (color == null) {
        color = 'green'
    }
    var radius = 10;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

function clearCircles(board) {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++)
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            var color = board.ceils[i][j].color == Color.BLACK ? COLOR_BLACK_CELL : COLOR_WHITE_CELL;
            drawCircle(color)
        }
}

function resetPossibleMoves(board) {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            board.ceils[i][j].isPosibleStep = false;
        }
    }
}

function relMouseCoords(event, canvas) {
    var canvasX = event.x;
    var canvasY = event.y;

    canvasX -= canvas.offsetLeft;
    canvasY -= canvas.offsetTop;
    return {x: canvasX, y: canvasY}
}


function drawPromotionFigures(colorFigure) {
    var x = INFO_TEXT_POSITION_X;
    var y = INFO_TEXT_POSITION_Y;

    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Выберите фигуру, в которую превратится пешка", x, y);
    ctx.font = "bold 48px Arial";
    x = PROMOTION_FIGURES_POSITION_X;
    y = PROMOTION_FIGURES_POSITION_Y;

    promotionFigures[0] = new Rook(colorFigure);
    promotionFigures[1] = new Knight(colorFigure);
    promotionFigures[2] = new Bishop(colorFigure);
    promotionFigures[3] = new King(colorFigure);

    for (var i = 0; i < promotionFigures.length; i++) {
        if (i % 2 == 0) {
            ctx.fillStyle = COLOR_BLACK_CELL
        } else {
            ctx.fillStyle = COLOR_WHITE_CELL
        }
        ctx.fillRect(x, INFO_TEXT_POSITION_Y + 10, CEIL_SIZE, CEIL_SIZE);
        if (colorFigure == Color.BLACK) {
            ctx.fillStyle = "#000";
        } else {
            ctx.fillStyle = "#fff";
        }
        ctx.fillText(promotionFigures[i].symbol, x + 5, y);
        x += CEIL_SIZE;
    }
}

function onStartGameEvent() {
    var whiteFiguresPlayerName = document.getElementById("whiteFiguresPlayerName").value;
    var blackFiguresPlayerName = document.getElementById("blackFiguresPlayerName").value;
    document.getElementById('offerDrawBtn').style.display = 'block';
    document.getElementById('admit_defeat').style.display = 'block';
    document.getElementById('newGameBtn').style.display = 'block';
    curGameStatus = GameStatus.STARTED;
    createCookie(COOKIE_WHITE_FIGURE_PLAYER_NAME, whiteFiguresPlayerName, DEFAULT_COOKIE_EXPIRES_DAYS);
    createCookie(COOKIE_BLACK_FIGURE_PLAYER_NAME, blackFiguresPlayerName, DEFAULT_COOKIE_EXPIRES_DAYS);
    document.getElementById('setUserNamesBtn').style.display = 'none';
    updateGameWindow();
}

function clearBottomInfoContainer() {
    ctx.clearRect(FIELD_LEFT_MARGIN, FIELD_SIZE + FIELD_TOP_MARGIN, FIELD_SIZE, canvas.height - FIELD_SIZE)
}

document.addEventListener("click", onClickListener);

function onAdmitDefeatEvent() {
    console.log("onAdmitDefeatEvent");
    var loser = new User(getPlayerNameByFigureColor(getColorFigureMovesInThisStep()));
    var winner = new User(getPlayerNameByFigureColor(getOtherColor(getColorFigureMovesInThisStep())));
    winner.points += 1;
    onFinishGameEvent(winner, loser)
}

function onNewGameEvent() {
    document.getElementById('setUserNamesBtn').style.display = 'block';
    document.getElementById('newGameBtn').style.display = 'none';
    curGameStatus = GameStatus.PREPARING;
    board = new Board();
    document.getElementById("whiteFiguresPlayerName").value = "";
    document.getElementById("blackFiguresPlayerName").value = "";
    initGame();
}

function onOfferDrawEvent() {
    curGameStatus = GameStatus.OFFERING_DRAW;
    document.getElementById('offerDrawBtn').style.display = 'none';
    document.getElementById('agreeDrawBtn').style.display = 'block';
    document.getElementById('refuseDrawBtn').style.display = 'block';
}

function onRefusedDrawEvent() {
    curGameStatus = GameStatus.STARTED;
    document.getElementById('offerDrawBtn').style.display = 'block';
    document.getElementById('agreeDrawBtn').style.display = 'none';
    document.getElementById('refuseDrawBtn').style.display = 'none';
}

function onAgreeDrawEvent() {
    var user1 = new User(getPlayerNameByFigureColor(getColorFigureMovesInThisStep()));
    var user2 = new User(getPlayerNameByFigureColor(getOtherColor(getColorFigureMovesInThisStep())));
    user1.points += 0.5;
    user2.points += 0.5;
    onFinishGameEvent(user1, user2)
}

function onFinishGameEvent(user1, user2) {
    curGameStatus = GameStatus.FINISHED;
    //updateGameWindow();
    var resultsTable = getResultsTableFromCookie();
    saveResultToCookie(resultsTable, user1, user2);
    showResultsTable(resultsTable);
}


function getPlayerNameByFigureColor(color) {
    switch (color) {
        case Color.WHITE :
            return readCookie(COOKIE_WHITE_FIGURE_PLAYER_NAME);
        case Color.BLACK :
            return readCookie(COOKIE_BLACK_FIGURE_PLAYER_NAME);
        default:
            return null;
    }
}


function showResultsTable(resultsTable) {
    resultsTable.users.sort(function(user1, user2) {
        return parseFloat(user2.points) - parseFloat(user1.points);
    });
    resultsTable.users.forEach(function (item, i, arr) {
        console.log("userName = " + item.name + " points = " + item.points);
    });
    //document.getElementById('gameWindow').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    fillTable(resultsTable);
}

function fillTable(resultsTable) {
    var table = document.getElementById('resultTable');

    for (var i = 0; i < resultsTable.users.length; i++) {
        var row = table.insertRow(i);
        row.insertCell(0).innerHTML = (i+1) + ".";
        row.insertCell(1).innerHTML = resultsTable.users[i].name;
        row.insertCell(2).innerHTML = resultsTable.users[i].points;
    }
}

function findUserByName(array, name) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === name) {
            return array[i];
        }
    }
    return null;
};

function saveResultToCookie(resultsTable, _user1, _user2) {
    var user1 = findUserByName(resultsTable.users, _user1.name);
    if (user1 == null) {
        user1 = _user1;
        resultsTable.users.push(user1);
    } else {
        user1.points += _user1.points;
    }
    var user2 = findUserByName(resultsTable.users, _user2.name);
    if (user2 == null) {
        user2 = _user2;
        resultsTable.users.push(user2);
    } else {
        user2.points += _user2.points;
    }
    createCookie(COOKIE_RESULT_TABLE, JSON.stringify(resultsTable))
};


function getResultsTableFromCookie() {
    var resultsTableJson = readCookie(COOKIE_RESULT_TABLE);
    if (resultsTableJson == null) {
        return new ResultsTable();
    }
    return JSON.parse(resultsTableJson);
}

function createCookie(name, value, days) {
    console.log("createCookie: name = " + name + "  value = " + value);
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


function initGame() {
    step = 0;
    initFigures();
    initFiguresOnBoard();
    updateGameWindow();
}

initGame();

