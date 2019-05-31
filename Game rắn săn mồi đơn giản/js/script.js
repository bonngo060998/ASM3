
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');



// Lấy chiều rộng và chiều cao từ canvas
var width = canvas.width;
var height = canvas.height;

// Tính toán chiều rộng và chiều cao
var blockSize = 10;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

// Điểm bắt đầu là 0
var score = 0;

// Sữ dụng cho thời gian chờ trong animation
var timeoutId = null;

// Tạo biết thời gian của animation và tốc độ của animation
var animationTime = 100;
var animationSpeed = 5;

var directions = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};

//Vẽ đường viền của game
var drawBorder = function () {
	ctx.fillStyle = 'yellow';
	ctx.fillRect(0, 0, width, blockSize);
	ctx.fillRect(0, height - blockSize, width, blockSize);
	ctx.fillRect(0, 0, blockSize, height);
	ctx.fillRect(width - blockSize, 0, blockSize, height);
};


// Hiển thị điểm số hiện tại của người chơi ở góc trên bên trái
var drawScore = function () {
	ctx.font = '20px Courier';
	ctx.fillStyle = 'green';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillText('Score: ' + score, blockSize, blockSize);
};

	// Được gọi khi trò chơi kết thúc, tức là khi con rắn đập vào tường hoặc tự đâm vào thân
var gameOver = function () {
	// Stop the animation
	clearTimeout(timeoutId);

	$('body').off('keydown');

	ctx.font = '60px Courier';
	ctx.fillStyle = 'yellow';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('Game Over', width / 2, height / 2);
};

// Tạo một hình tròn là thức ăn của rắn
var circle = function (x, y, radius, fillCircle) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);

	if (fillCircle) { 
		ctx.fill(); 
	} else { 
		ctx.stroke(); 
	} 
};
//Tạo đối tượng block gồm thuộc tính hàng và cột
var Block = function (col, row) {
	this.col = col;
	this.row = row;
};


// vẽ một khối(hình vuông
Block.prototype.drawSquare = function (color) {
	var x = this.col * blockSize;
	var y = this.row * blockSize;
	ctx.fillStyle = color;
	ctx.fillRect(x, y, blockSize, blockSize);
};

// Vẽ một hình tròn
Block.prototype.drawCircle = function (color) {
	var centerX = this.col * blockSize + blockSize / 2;
	var centerY = this.row * blockSize + blockSize / 2;

	ctx.fillStyle = color;
	circle(centerX, centerY, blockSize / 2, true);
};

//Kiểm tra Nếu hai đối tượng (this and otherBlock) có cùng col và hàng, thì chúng ở cùng một vị trí.
Block.prototype.equal = function (otherBlock) {
	return this.col === otherBlock.col && this.row === otherBlock.row;
};

/* Đối tượng rắn - lưu trữ vị trí của rắn dưới dạng một mảng gọi là 'phân đoạn', trong đó
 * sẽ chứa một loạt các đối tượng khối. Để di chuyển con rắn, chúng tôi sẽ tạo một khối mới cho
 * bắt đầu mảng phân đoạn và loại bỏ khối ở cuối mảng. Các
 * phần tử đầu tiên của mảng phân đoạn sẽ đại diện cho đầu của con rắn.
*/
var Snake = function () {
	this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
	this.direction = 'right';
	this.nextDirection = 'right';
};

// Vẽ snake bằng cách lặp qua từng khối trong mảng phân đoạn của nó gọi phương thức drawSapes
Snake.prototype.draw = function () {
	this.segments[0].drawSquare('Green');
	for (var i = 1; i < this.segments.length; i++) {
		this.segments[i].drawSquare('Blue');
		if (i % 2) {
			this.segments[i].drawSquare('Yellow');
		}
	}
};

Snake.prototype.move = function () {
	var head = this.segments[0];
	var newHead = null;

	this.direction = this.nextDirection;

	if (this.direction === 'right') {
		newHead = new Block(head.col + 1, head.row);
	} else if (this.direction === 'down') {
		newHead = new Block(head.col, head.row + 1);
	} else if (this.direction === 'left') {
		newHead = new Block(head.col - 1, head.row);
	} else if (this.direction === 'up') {
		newHead = new Block(head.col, head.row - 1);
	}

	if (this.checkCollision(newHead)) {
		gameOver();
		return;
	}

	this.segments.unshift(newHead);

	if (newHead.equal(apple.position)) {
		score++;
		apple.move();
		animationTime -= animationSpeed;
	} else {
		this.segments.pop();
	}
};

// * Phát hiện va chạm
Snake.prototype.checkCollision = function (head) {
	var leftCollision = (head.col === 0);
	var topCollision = (head.row === 0);
	var rightCollision = (head.col === widthInBlocks - 1);
	var bottomCollision = (head.row === heightInBlocks - 1);

	var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;
	var selfCollision = false;

	for (var i = 0; i < this.segments.length; i++) {
		if (head.equal(this.segments[i])) {
			selfCollision = true;
		}
	}

	return wallCollision || selfCollision;
};

/* * Cập nhật hướng của con rắn và ngăn người chơi thực hiện lần lượt
* con rắn ngay lập tức chạy vào chính nó. * / */
Snake.prototype.setDirection = function (newDirection) {
	if (this.direction === 'up' && newDirection === 'down') {
		return;
	} else if (this.direction === 'right' && newDirection === 'left') {
		return;
	} else if (this.direction === 'down' && newDirection === 'up') {
		return;
	} else if (this.direction === 'left' && newDirection === 'right') {
		return;
	}

	this.nextDirection = newDirection;
};

// Tạo một apple
var Apple = function () {
	this.position = new Block(10, 10);
};

// Vẽ quả táo bằng phương pháp drawCircle
Apple.prototype.draw = function () {
	this.position.drawCircle('LimeGreen');
};

// Di chuyển quả táo đến một vị trí mới ngẫu nhiên
Apple.prototype.move = function () {
	// Prevent positioning the apple to a block that part of the snake is already occupying
	for (var i = 0; i < snake.segments.length; i++) {
		while (this.position.equal(snake.segments[i])) {
			var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
			var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
			this.position = new Block(randomCol, randomRow);
		}
	}
};

var snake = new Snake();
var apple = new Apple();

var gameLoop = function () {
	ctx.clearRect(0, 0, width, height);
	drawScore();
	snake.move();
	snake.draw();
	apple.draw();
	drawBorder();

	timeoutId = setTimeout(gameLoop, animationTime);
};

	gameLoop();
function reloadgame(){
	location.reload();
}

// Xữ lí sự kiện key down
$('body').keydown(function (event) {
	var newDirection = directions[event.keyCode];

	if (newDirection !== undefined) {
		snake.setDirection(newDirection);
	}
});