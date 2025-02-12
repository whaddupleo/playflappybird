//setting board details
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//make birb. width/height ratio = 17/12
let birdWidth = 34; 
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImage;

//bird obj with 4 attributes: X,Y,width,height
let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipe array
let pipeArray = [];
//width/height ratio is 1/8
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX =-2;//pipes moving to the left by velocity of -2
let velocityY = 0;
let gravity = 0.2;

let gameOver = false;
let score = 0;
let highScore = 0;

//sound effects
let pointsfx = new Audio();
pointsfx.src = "./audio/sfx_point.wav";

let deathsfx = new Audio();
deathsfx.src = "./audio/sfx_die.wav";

let hitsfx = new Audio();
hitsfx.src = "./audio/sfx_hit.wav";

window.onload = function() {
    board = document.getElementById("board"); //access the canvas element in html called board
    //set board width and height
    board.width = boardWidth;
    board.height = boardHeight;
    //access to drawing on the canvas
    context = board.getContext("2d");



    //load images
    birdImage = new Image();
    birdImage.src = "./images/flappybird3.png";
    //actively loading here
    birdImage.onload = function() {
    context.drawImage(birdImage,bird.x,bird.y,bird.width,bird.height);
    }

    //load top and botom pipes
    topPipeImg = new Image();
    topPipeImg.src = "./images/toppipe.png"

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./images/bottompipe.png"

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //run 'placePipes' function every 1.5s
    document.addEventListener("keydown", moveBird);
}

//updates the frames in the game
function update() {
    requestAnimationFrame(update);
    if(gameOver) {
        
        if(bird.y < boardHeight) {
        context.clearRect(0,0,board.width, board.height);
        velocityY += gravity;
        bird.y = bird.y = Math.max(bird.y + velocityY, 0); //appply gravity to current bird.y, limit the bird.y to top of canvas
        context.drawImage(birdImage,bird.x,bird.y,bird.width,bird.height);

        for(let i = 0; i<pipeArray.length;i++) {
            let pipe = pipeArray[i];
            //pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y,pipe.width,pipe.height);
        }

        
        }
        if(score > highScore) {
            highScore = score;
        }
        context.fillText("Score: " + score, 10, 25);
        context.fillText("High Score: " + highScore, 5, 90);

        context.fillText("GAME OVER", 180, 90);
        return;
    }
    //clear previous frame to prevent stacking
    context.clearRect(0,0,board.width, board.height);
    velocityY += gravity;
    bird.y = bird.y = Math.max(bird.y + velocityY, 0); //appply gravity to current bird.y, limit the bird.y to top of canvas
    //draw bird
    context.drawImage(birdImage,bird.x,bird.y,bird.width,bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        deathsfx.currentTime = 0;
        deathsfx.play();
    }

    //draw pipes
    for(let i = 0; i<pipeArray.length;i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y,pipe.width,pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width) {
            pointsfx.currentTime = 0;
            pointsfx.play();
            score+= 0.5;
            pipe.passed = true;
        }
        if (detectCollision(bird, pipe)) {
            hitsfx.currentTime = 0;
            hitsfx.play();
            deathsfx.currentTime = 0;
            deathsfx.play();
            
            gameOver = true;
        }
    }
    //clear pipes once they clear the left side
    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from pipe array
    }
    //score
    context.fillStyle = 'white';
    context.font = "10px 'Press Start 2P'";
    context.fillText("Score: " + score, 10, 25);

}

function placePipes() {
    if(gameOver) {
        return;
    }
    //random variable for y position
    let randomPipeY = pipeY-pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;
    //making topPipe obj with 6 attributes
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    //add obj to the array
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "touchstart") {
        velocityY = -6;

        if(gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && 
            a.x + a.width > b.x && 
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

