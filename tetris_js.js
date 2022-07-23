
// DOM
const $playground = document.querySelector(".playground > ul");
const $gametext = document.querySelector(".game-text");
const $scoreDisplay = document.querySelector(".score");
const $restartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// Variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
const BLOCKS = {
    //x : col, y: row [x, y]
    tree: [
        [[2, 1], [0, 1], [1, 0], [1, 1]],
        [[1, 2], [0, 1], [1, 0], [1, 1]],
        [[1, 2], [0, 1], [2, 1], [1, 1]],
        [[2, 1], [1, 2], [1, 0], [1, 1]],
    ],
    square: [
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
    bar: [
        [[1, 0], [2, 0], [3, 0], [4, 0]],
        [[2, -1], [2, 0], [2, 1], [2, 2]],
        [[1, 0], [2, 0], [3, 0], [4, 0]],
        [[2, -1], [2, 0], [2, 1], [2, 2]],
    ],
    zee: [
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[0, 1], [1, 0], [1, 1], [0, 2]],
        [[0, 1], [1, 1], [1, 2], [2, 2]],
        [[2, 0], [2, 1], [1, 1], [1, 2]],
    ],
    elLeft: [
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [0, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [2, 0], [1, 1], [1, 2]],
    ],
    elRight: [
        [[1, 0], [2, 0], [1, 1], [1, 2]],
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
    ],

}


const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 4,
}
function init(){ // 게임 초기 세팅
    tempMovingItem = { ...movingItem};
    for (let i = 0; i<GAME_ROWS; i++) {
        prependNewLine();
    }
    generateNewBlock();
}
init();
function prependNewLine(){ // 게임판 1줄 생성
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0 ; j<10; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    $playground.prepend(li);
}

function renderBlocks(moveType="") { // 블록을 게임판에 생성
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");        
    })
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = $playground.childNodes[y] ? $playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable){
            target.classList.add(type, "moving")
        }else{
            tempMovingItem = { ...movingItem}
            if(moveType === "retry"){
                clearInterval(downInterval)
                showGameoverText()
            }
            setTimeout(() => {
                renderBlocks('retry');
                if(moveType === "top"){
                    seizeBlock();
                }
            }, 0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}
function seizeBlock(){ // 블록을 밑에 고정시키는 함수
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");  
        moving.classList.add("seized")      
    })
    checkMatch()
    
}
function checkMatch(){
    const childNodes = $playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove()
            prependNewLine()
            score += 100;
            $scoreDisplay.innerText = score;
        }
    })
    generateNewBlock();
}

function generateNewBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)

    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem}
    renderBlocks()
}

function checkEmpty(target) { // 타겟이 null인지 확인
    if(!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}
function showGameoverText(){
    $gametext.style.display = "flex"
}

function moveBlock(movetype, amount){
    tempMovingItem[movetype] += amount;
    renderBlocks(movetype)
}
function changeDirection(){
    tempMovingItem.direction += 1;
    if (tempMovingItem.direction === 4){
        tempMovingItem.direction = 0
    }
    renderBlocks();
}
function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(() => {
      moveBlock("top", 1);  
    }, 10)
}

// event handling
document.addEventListener("keydown", e => {
    switch(e.keyCode){
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
})
$restartButton.addEventListener("click", () => {
    $playground.innerHTML = "";
    $gametext.style.display = "none";
    init()
})