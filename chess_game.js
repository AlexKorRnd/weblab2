
const COUNT_CELL_IN_ROW = 8;
const COLOR_BLACK_CELL = "#000000";
const COLOR_WHITE_CELL = "#FFFFFF";

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 480;
document.body.appendChild(canvas);

var cellWidth = canvas.width / COUNT_CELL_IN_ROW;
var cellHeight = canvas.height / COUNT_CELL_IN_ROW;
for (var i = COUNT_CELL_IN_ROW; i > 0; i--) {
    for (var j = 1; j <= COUNT_CELL_IN_ROW; j++) {
        if (i + j % 2 == 0) {
            ctx.fillStyle = COLOR_BLACK_CELL
        } else {
            ctx.fillStyle = COLOR_WHITE_CELL
        }
        ctx.fillRect((j - 1) * cellWidth, (COUNT_CELL_IN_ROW - i) * cellHeight, cellWidth, cellHeight)
    }
}

// ctx.beginPath();
// ctx.rect(20, 40, 50, 50);
// ctx.fillStyle = "#000";
// ctx.fill();
// ctx.closePath();
//
// ctx.beginPath();
// ctx.arc(140, 60, 20, 0, Math.PI*2, true);
// ctx.fillStyle = "green";
// ctx.fill();
// ctx.closePath();
//
// ctx.beginPath();
// ctx.rect(160, 10, 100, 40);
// ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
// ctx.stroke();
// ctx.closePath();