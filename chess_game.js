const COUNT_CELL_IN_ROW = 8;
const COLOR_BLACK_CELL = "#DB8700";
const COLOR_WHITE_CELL = "#FCD89D";

const FIELD_SIZE = 480;
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
const INFO_TEXT_POSITION_Y = FIELD_SIZE + 20;
const PROMOTION_FIGURES_POSITION_Y = FIELD_SIZE + 80;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = FIELD_SIZE;
canvas.height = FIELD_SIZE + 100;
//document.body.appendChild(canvas);

var step = 0;

var Color = {
    WHITE: 0,
    BLACK: 1
};

var colorWhite = Color.WHITE;
var colorBlack = Color.BLACK;

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

        console.log("пробуем походить " + getColorString(this.figureColor) + " королем на " + newLineNumber + " строку "
            + newColumnNumber + " столбец");
        var otherColor;
        if (this.figureColor == Color.WHITE) {
            otherColor = Color.BLACK;
        } else {
            otherColor = Color.WHITE;
        }
        console.log("Генерируем ходы противоположных фигур для проверки сохранит ли ход нашим королем шах");
        generateAllFiguresPossibleSteps(tempBoard, otherColor);
        return tempBoard.ceils[newLineNumber][newColumnNumber].isPosibleStep;
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
                        console.log("Этот ход не привел к шаху");
                    } else {
                        console.log("Этот ход привел к шаху");
                    }
                } else {
                    curCeil.isPosibleStep =  this.isKillPossible(board, oldLineNumber, oldColumnNumber, i, j);
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
                board.ceils[oldLineNumber + 2][oldColumnNumber].isPosibleStep =
                    board.ceils[oldLineNumber + 2][oldColumnNumber].figure == null;
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
                board.ceils[COUNT_CELL_IN_ROW - 4][oldColumnNumber].isPosibleStep =
                    board.ceils[oldLineNumber - 4][oldColumnNumber].figure == null;
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
    }  else {
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
    step++;
    if ((step > 1) && isChess(board, curStepColor)) {
        if (isChessMate(board, curStepColor)) {
            showCheckMateInfo("Шах и мат!");
            return;
        } else {
            showCheckMateInfo("Шах!")
        }
    } else {
        clearBottomInfoContainer();
    }
    if (!board.isPromotionMode) {

        drawStepInformation();
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
    var oppositeQueenIndex = findOppositeQueenIndex(board, curStepColor);
    return !mayQueenEscapeMateOwnStep(board, oppositeQueenIndex.line, oppositeQueenIndex.column,
        board.ceils[oppositeQueenIndex.line][oppositeQueenIndex.column].figure);
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
                figure.generatePossibleMoves(board, i, j)
            }
        }
}

// проверяем может ли король уйти от мата своим ходом
function mayQueenEscapeMateOwnStep(board, oppositeQueenLine, oppositeQueenColumn, queen) {
    var newBoard = getCopyBoardWithFigures(board);
    queen.generatePossibleMoves(newBoard, oppositeQueenLine, oppositeQueenColumn);
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
            var x = j * CEIL_SIZE;
            var y = i * CEIL_SIZE;
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

        ctx.rect(0, 0, FIELD_SIZE, FIELD_SIZE);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

function getColorFigureMovesInThisStep() {
    return step % 2 == 1 ? Color.WHITE : Color.BLACK;
}

function drawStepInformation() {
    var text = getColorFigureMovesInThisStep() == Color.WHITE ? "Ходят белые" : "Ходят черные";
    document.getElementById('step_info').textContent = text;
}

function findLineByCoordY(y) {
    return Math.floor(y / CEIL_SIZE);
}

function findColumnByCoordX(x) {
    return Math.floor(x / CEIL_SIZE);
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
    if ((canvasX > 0) && (canvasX < FIELD_SIZE) && (canvasY > 0)) {
        if (canvasY < FIELD_SIZE && !board.isPromotionMode) {
            processOnBoardClick(canvasX, canvasY);
        }
        if (board.isPromotionMode) {
            processOnPromotionFigureClick(canvasX, canvasY)
        }
    }
}

function processOnBoardClick(canvasX, canvasY) {
    if (clickedFigure == null) {
        oldLine = findLineByCoordY(canvasY);
        oldColumn = findColumnByCoordX(canvasX);
        var figure = board.ceils[oldLine][oldColumn].figure;
        if (figure.figureColor == getColorFigureMovesInThisStep()) {
            clickedFigure = figure;
            clickedFigure.generatePossibleMoves(board, oldLine, oldColumn);

            if (hasPossibleSteps()) {
                drawPossibleSteps();
            } else {
                clickedFigure = null;
            }
        }
    } else {
        newLine = findLineByCoordY(canvasY);
        newColumn = findColumnByCoordX(canvasX);
        if (board.ceils[newLine][newColumn].isPosibleStep) {
            makeStep(board, clickedFigure, oldLine, oldColumn, newLine, newColumn);
           /* board.ceils[oldLine][oldColumn].figure = null;
            board.ceils[newLine][newColumn].figure = clickedFigure;*/
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


function drawPossibleSteps() {
    for (var i = 0; i < COUNT_CELL_IN_ROW; i++) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].isPosibleStep) {
                var circleX = j * CEIL_SIZE + CEIL_SIZE / 2;
                var circleY = i * CEIL_SIZE + CEIL_SIZE / 2;
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

function clearBottomInfoContainer() {
    ctx.clearRect(0, FIELD_SIZE, FIELD_SIZE, canvas.height - FIELD_SIZE)
}

document.addEventListener("click", onClickListener);

initFigures();
initFiguresOnBoard();
updateGameWindow();


