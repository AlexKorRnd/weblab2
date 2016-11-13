const COUNT_CELL_IN_ROW = 8;
const COLOR_BLACK_CELL = "#DB8700";
const COLOR_WHITE_CELL = "#FCD89D";

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 480;
document.body.appendChild(canvas);


var Color = {
    WHITE: 0,
    BLACK: 1
};

var colorWhite = Color.WHITE;
var colorBlack = Color.BLACK;

var Ceil = function Cell(figure, color) {
    this.figure = figure;
    this.color = color;
};

var Board = function () {
    this.ceils = [];
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
    };

    AbstractFigure.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                                        _lineNumber, _columnNumber) {
        return true;
    };

    Rook = function Rook(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265C", figureColor)
        } else {
            AbstractFigure.call(this, "\u2656", figureColor)
        }
    };

    Rook.prototype = Object.create(AbstractFigure.prototype);

    Rook.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                              _lineNumber, _columnNumber) {
        return oldLineNumber == _lineNumber || oldColumnNumber == _columnNumber;
    };

    Knight = function Knight(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265E", figureColor)
        } else {
            AbstractFigure.call(this, "\u2658", figureColor)
        }
    };

    Knight.prototype = Object.create(AbstractFigure.prototype);

    Knight.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                                _lineNumber, _columnNumber) {
        return ((Math.abs(oldLineNumber - _lineNumber) == 2)
                && (Math.abs(oldColumnNumber - _columnNumber) == 1)
            ) || ((Math.abs(oldLineNumber - _lineNumber) == 1)
            && (Math.abs(oldColumnNumber - _columnNumber) == 2));
    };

    Bishop = function Bishop(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265D", figureColor)
        } else {
            AbstractFigure.call(this, "\u2657", figureColor)
        }
    };

    Bishop.prototype = Object.create(AbstractFigure.prototype);

    Bishop.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                                _lineNumber, _columnNumber) {
        return ((Math.abs(oldLineNumber - _lineNumber) > 0)
            && (Math.abs(oldColumnNumber - _columnNumber) == 0))
            || ((Math.abs(oldLineNumber - _lineNumber) == 0)
            && (Math.abs(oldColumnNumber - _columnNumber) > 0))
    };

    King = function King(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265B", figureColor)
        } else {
            AbstractFigure.call(this, "\u2655", figureColor)
        }
    };

    King.prototype = Object.create(AbstractFigure.prototype);

    King.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                              _lineNumber, _columnNumber) {
        return Rook.isStepPossible(_lineNumber, _columnNumber)
            || Bishop.isStepPossible(_lineNumber, _columnNumber)
    };

    Queen = function Queen(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265A", figureColor)
        } else {
            AbstractFigure.call(this, "\u2654", figureColor)
        }
    };

    Queen.prototype = Object.create(AbstractFigure.prototype);

    Queen.prototype.isStepPossible = function (oldLineNumber, oldColumnNumber,
                                               _lineNumber, _columnNumber) {
        return ((Math.abs(oldLineNumber - _lineNumber) == 1)
            && (Math.abs(oldColumnNumber - _columnNumber) == 0))
            || ((Math.abs(oldLineNumber - _lineNumber) == 0)
            && (Math.abs(oldColumnNumber - _columnNumber) == 1))
    };

    Pawn = function Pawn(figureColor) {
        if (figureColor == Color.BLACK) {
            AbstractFigure.call(this, "\u265F", figureColor)
        } else {
            AbstractFigure.call(this, "\u2659", figureColor)
        }
    };

    Pawn.prototype = Object.create(AbstractFigure.prototype);

    Pawn.prototype.isStepPossible = function (board, oldLineNumber, oldColumnNumber,
                                              _lineNumber, _columnNumber) {
        var dif = 1;
        if ((this.figureColor == Color.BLACK && oldLineNumber == COUNT_CELL_IN_ROW - 1)
            || (this.figureColor == Color.WHITE && oldLineNumber == 2)) {
            dif = 2;
        }
        if ((board.ceils[_lineNumber][_columnNumber].figure.figureColor != this.figureColor)
            && ((Math.abs(oldLineNumber - _lineNumber) == 0)
            && (Math.abs(oldColumnNumber - _columnNumber) == 1))) {
            return true
        } else {
            return ((Math.abs(oldLineNumber - _lineNumber) == dif)
                && (Math.abs(oldColumnNumber - _columnNumber) == 0))
                || (board.ceils)
        }
    };
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

function drawFiguresOnBoard() {
    var cellWidth = canvas.width / COUNT_CELL_IN_ROW;
    var cellHeight = canvas.height / COUNT_CELL_IN_ROW;

    ctx.font = "bold 48px Arial";
    for (var i = COUNT_CELL_IN_ROW - 1; i >= 0; i--) {
        for (var j = 0; j < COUNT_CELL_IN_ROW; j++) {
            if (board.ceils[i][j].color == Color.BLACK) {
                ctx.fillStyle = COLOR_BLACK_CELL
            } else {
                ctx.fillStyle = COLOR_WHITE_CELL
            }
            var x = j * cellWidth;
            var y = (COUNT_CELL_IN_ROW - 1 - i) * cellHeight;
            ctx.fillRect(x, y, cellWidth, cellHeight);
            var curFigure = board.ceils[i][j].figure;
            if (curFigure != null) {
                ctx.strokeText(curFigure.symbol, x + cellWidth / 7, y + cellHeight * 6 / 7);
            }
        }

        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}



initFigures();
initFiguresOnBoard();
drawFiguresOnBoard();
