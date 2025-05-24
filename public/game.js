const socket = io();

const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

let playerNumber; // 0 or 1
// Vertical position (Y) of the paddles
let paddleY = 200;
let opponentY = 200;

const paddleWidth = 10, paddleHeight = 80;
// Ball state (position (x, y), velocity (vx vy), radius)
let ball = { x: 300, y: 200, vx: 4, vy: 2, radius: 8 };


const leftX = 10;
const rightX = canvas.width - paddleWidth - 10;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.beginPath(); // start a new path. Reset the current path
    // arc(x, y, radius, startAngle, endAngle). Angle 0 radians to 2π radians (full circle)
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill(); // Fill the circle with the current fill style

    // Player paddle
    ctx.fillRect(playerNumber === 0 ? leftX : rightX, paddleY, paddleWidth, paddleHeight);

    // Opponent paddle
    ctx.fillRect(playerNumber === 0 ? rightX : leftX, opponentY, paddleWidth, paddleHeight);
}

function update() {
    if (playerNumber === 0) {
        // Player 0 controls the ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off bottom and top walls
        if (ball.y <= 0 || ball.y >= canvas.height)
            ball.vy *= -1;

        // Send ball position to server so opponent can see it
        socket.emit("ballData", ball);
    }

    draw();
    requestAnimationFrame(update);
}

function handleInput(e) {
    // Use touch events for mobile
    e.preventDefault();
    if (e.touches) {
        paddleY = e.touches[0].clientY - paddleHeight / 2;
    } else {
        paddleY = e.clientY - paddleHeight / 2;
    }

    socket.emit("paddleMove", { y: paddleY });
}

// Debug
socket.on("connect", () => {
    console.log("Connected to server with id:", socket.id);
});

// Receive player number from server
socket.on("playerNumber", (num) => {
    playerNumber = num;

    canvas.addEventListener("mousemove", handleInput);
    canvas.addEventListener("touchmove", handleInput);

    update();
});

socket.on("opponentMove", (data) => {
    opponentY = data.y;
});

socket.on("ballData", (data) => {
    ball = data;
});
