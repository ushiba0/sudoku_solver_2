


const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');


const cell_width = 40;
const offset_x = 10;
const offset_y = 10;

const sudoku_procedure = [];
const sudoku_log = [];

const cursor = {i: -40, j: -400};


// drawSheet
// Draw 9x9 sudoku sheet.
const drawSheet = ()=>{


    // draw 9x9 cells
    context.strokeStyle = 'rgb(170, 170, 170)';
    for(let i=0; i<9; i++){
        for(let j=0; j<9; j++){

            const x = i*cell_width + offset_x;
            const y = j*cell_width + offset_y;
            context.strokeRect(x, y, cell_width, cell_width);
        }
    }

    // Draw 3x3 blocks.
    context.strokeStyle = 'rgb(0, 0, 0)';
    for(let i=0; i<3; i++){
        for(let j=0; j<3; j++){
            const x = i*cell_width*3 + offset_x;
            const y = j*cell_width*3 + offset_y;
            context.strokeRect(x, y, cell_width*3 , cell_width*3 );
        }
    }
};


const drawNumberInCell = (i, j, number)=>{
    context.fillStyle = 'rgb(0, 255, 0)';
    context.font = '24pt Arial';

    // i, j の順番が逆になっている
    const x = (j-0.5)*cell_width + offset_x - 8;
    const y = (i-0.5)*cell_width + offset_y + 11;

    context.fillText(number, x, y);

};


const drawCursor = ()=>{
    
    context.strokeStyle = 'rgb(0, 0, 255)';

    const x = (cursor.j-1)*cell_width + offset_x;
    const y = (cursor.i-1)*cell_width + offset_y;

    context.strokeRect(x, y, cell_width, cell_width);
};


const moveCursor = (i, j) => {
    cursor.i += i;
    cursor.j += j;
    cursor.i = Math.min(Math.max(~~cursor.i, 1), 9);
    cursor.j = Math.min(Math.max(~~cursor.j, 1), 9);

    draw();
};


document.body.addEventListener("keydown", event =>{
    //console.log(event)
    switch(event.key){
        case "ArrowLeft": // left
            moveCursor(0, -1);
            break;
        case "ArrowUp": // up
            moveCursor(-1, 0);
            break;
        case "ArrowRight": // right
            moveCursor(0, 1);
            break;
        case "ArrowDown": // down
            moveCursor(1, 0);
            break;
        case "1": case "2": case "3": 
        case "4": case "5": case "6": 
        case "7": case "8": case "9": 
            current_sudoku.setNumber(cursor.i, cursor.j, parseInt(event.key));
            current_sudoku.resetCandidate();
            user_action_history.push(current_sudoku.clone());
            draw();
            break;
        default:
            current_sudoku.setNumber(cursor.i, cursor.j, 0);
            current_sudoku.resetCandidate();
            draw();
            return;
    }
});


canvas.addEventListener('click', e=>{
    const rect = e.target.getBoundingClientRect();
    const mouse_x = e.clientX - rect.left;
    const mouse_y = e.clientY - rect.top;
    const j_float = (mouse_x - offset_x)/cell_width;
    const i_float = (mouse_y - offset_y)/cell_width;
    const i = Math.floor(i_float) + 1;
    const j = Math.floor(j_float) + 1;
    console.debug(`mouse click: cell(${i}, ${j})`);

    cursor.i = i;
    cursor.j = j;
    draw();
});


const drawSudoku = (sudoku)=>{
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.getNumber(i, j) > 0){
                drawNumberInCell(i, j, sudoku.getNumber(i, j));
            }
        }
    }
};


let current_sudoku = new QuickSudoku();


const drawCandidateHelperFunc = (i, j, n)=>{
    const suboffset_x = ((n-1)%3 * 1/3 + 1/6) * cell_width;
    const suboffset_y = (Math.floor((n-1)/3) * 1/3 + 1/6) * cell_width;
    const cand_circle_radius = cell_width/8;
    
    // i,j の順番が逆
    const x = (j-1)*cell_width + offset_x + suboffset_x;
    const y = (i-1)*cell_width + offset_y + suboffset_y;
    context.beginPath();
    context.arc(x, y, cand_circle_radius, 0, Math.PI*2, false);
    context.fill();
};

const drawCandidate = (sudoku)=>{
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.getNumber(i, j) > 0){
                continue;
            }
            for(let n=1; n<=9; n++){
                if(sudoku.getCandidate(i, j, n) == 1){
                    drawCandidateHelperFunc(i, j, n);
                }
            }
        }
    }
};

const draw = (__drawCandidate = false)=>{
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawSheet();
    drawCursor();
    drawSudoku(current_sudoku);

    if(__drawCandidate == true){
        drawCandidate(current_sudoku);
    }
};


const _isSameArray = (arr1, arr2)=>{
    if(arr1.length!=9 || arr2.length!=9){
        throw "argment must be arrays with length 9"
    }
    for(let i=0; i<9; i++){
        if(arr1[i] != arr2[i]){
            return false;
        }
    }
    return true;
};


window.onload = ()=>{
    //current_sudoku.importSudokuFromText("000070102040500000700019060000000037034000000060350004120800000000060009079102800");
    draw();
};


// 初級例題
"650103409703506002001049508000010005437200801810304700000470010000050007000638200"

// 中級例題
"008051400000000050500690008000004062904307085060809004400200030000100600010000800"
"200050000400000000910470206085019704000000508704005002030568400070002000000000603"

// 上級例題
"600342000000000000013000400000003256040020070720001040400680030160000508530000000"
"006009070004000000000010000000080000000000062010350900007004300080000500000002000"
"000000600000095200007000000000370090020040000600000800200008000004000030000000070"
"038000090000080007540000802400000105700800000010000020800410000000063000005000070"

// 超上級例題
"090000070000002603040807000021000000000000560700000030000761000900050100005030000"
"000070102040500000700019060000000037034000000060350004120800000000060009079102800"


// 世界一難しい数独
"005300000800000020070010500400005300010070006003200080060500009004000030000009700"
"800000000003600000070090200050007000000045700000100030001000068008500010090000400"
"080000150406509080000008000000000000002040003300801000900070000600000004150000090"