


const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');


const cell_width = 40;
const offset_x = 10;
const offset_y = 10;


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

// 配列に直接アクセスする際は 大文字 を使用する
// 大文字: 0-indexed
// 小文字: 1-indexed

class Sudoku {
    constructor(){
        const numbers = new Array(9);
        for(let i=0; i<9; i++){
            const line = new Array(9);
            line.fill(0);
            numbers[i] = line;
        }
        
        const cand = new Array(9);
        for(let i=0; i<9; i++){
            const line = new Array(9);
            for(let j=0; j<9; j++){
                const c = new Array(9);
                c.fill(1);
                line[j] = c;
            }
            cand[i] = line;
        }

        // "numbers" is a 9x9 array.
        // Initialized with 0;
        this.numbers = numbers;

        // "cand" stands for candidates;
        // 9x9x9 array, initialized with 1;
        this.cand = cand;

        this.hasContradiction = false;
    }

    // Returns value of cell.
    // 1  <=  i,j  <=  9
    getNumber(i, j){
        const I = i-1;
        const J = j-1;
        return this.numbers[I][J];
    }

    getNumber_blockBased(block_i, block_j, i, j){
        const block_I = block_i-1;
        const block_J = block_j-1;
        return this.getNumber(block_I*3+i, block_J*3+j);
    }

    // Returns value of cell.
    // 1  <=  i,j  <=  9
    setNumber(i, j, number){
        const I = i-1;
        const J = j-1;
        const N = number-1;
        this.numbers[I][J] = number;


        this.deleteCandidatesRow(j, number);
        this.deleteCandidatesColumn(i, number);
        this.deleteCandidatesBlock(i, j, number);
        this.cand[I][J].fill(0);
        this.cand[I][J][N] = 1;
    }

    setNumber_blockBased(block_i, block_j, i, j, number){
        const block_I = block_i-1;
        const block_J = block_j-1;
        this.setNumber(block_I*3+i, block_J*3+j, number);
    }

    getCandidates(i, j, number){
        const I = i-1;
        const J = j-1;
        const N = number-1;
        return this.cand[I][J][N];
    }

    setCandidates(i, j, number){
        const I = i-1;
        const J = j-1;
        const N = number-1;
        this.cand[I][J][N] = 1;
    }

    setCandidates_blockBased(block_i, block_j, i, j, number){
        const block_I = block_i-1;
        const block_J = block_j-1;
        this.setCandidates(block_I*3+i, block_J*3+j, number);
    }

    getCandidates_blockBased(block_i, block_j, i, j, number){
        const block_I = block_i-1;
        const block_J = block_j-1;
        return this.getCandidates(block_I*3+i, block_J*3+j, number);
    }

    getCandidateList(i, j){
        const I = i-1;
        const J = j-1;
        return this.cand[I][J];
    }

    getCandidateList_blockBased(block_i, block_j, i, j){
        const block_I = block_i-1;
        const block_J = block_j-1;
        return this.getCandidateList(block_I*3+i, block_J*3+j);
    }

    deleteCandidates(i, j, number){
        const I = i-1;
        const J = j-1;
        const N = number-1;
        this.cand[I][J][N] = 0;
    }

    deleteCandidates_blockBased(block_i, block_j, i, j, number){
        const block_I = block_i-1;
        const block_J = block_j-1;
        this.deleteCandidates(block_I*3+i, block_J*3+j, number)
    }


    deleteCandidatesRow(j, number){
        const J = j-1;
        const N = number-1;
        for(let I=0; I<9; I++){
            this.cand[I][J][N] = 0;
        }
    }

    deleteCandidatesColumn(i, number){
        const I = i-1;
        const N = number-1;
        for(let J=0; J<9; J++){
            this.cand[I][J][N] = 0;
        }
    }

    deleteCandidatesBlock(i, j, number){
        const block_I = Math.floor((i-1)/3)*3;
        const block_J = Math.floor((j-1)/3)*3;
        const N = number-1;
        for(let I=0; I<3; I++){
            for(let J=0; J<3; J++){
                this.cand[block_I + I][block_J + J][N] = 0;
            }
        }
    }

    resetCandidates(){
        for(let I=0; I<9; I++){
            for(let J=0; J<9; J++){
                this.cand[I][J].fill(1);
            }
        }

        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j) > 0){
                    this.setNumber(i, j, this.getNumber(i, j));
                }
            }
        }
    }

    exportSudokuAsText(){
        let result = "";
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                result += this.getNumber(i, j);
            }
        }
        return result;
    }

    importSudokuFromText(string){
        const arr = string.split("").map(x=>{return parseInt(x)});
        if(arr.length != 81){
            console.error(arr);
            throw `Argment length must be 81. Actual value: ${arr.length}`;
        }

        for(let i=0; i<9; i++){
            this.numbers[i].fill(0);
            for(let j=0; j<9; j++){
                this.cand[i][j].fill(1);
            }
        }

        let index = 0;
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(arr[index]>=1 && arr[index]<=9){
                    this.setNumber(i, j, arr[index]);
                }
                index++;
            }
        }
        return arr;
    }

    clone(){
        const new_sudoku = new Sudoku();
        for(let I=0; I<9; I++){
            for(let J=0; J<9 ; J++){
                new_sudoku.numbers[I][J] = this.numbers[I][J];
            }
        }

        
        for(let I=0; I<9; I++){
            for(let J=0; J<9 ; J++){
                for(let N=0; N<9; N++){
                    new_sudoku.cand[I][J][N] = this.cand[I][J][N];
                }
            }
        }

        new_sudoku.hasContradiction = this.hasContradiction;

        return new_sudoku;
    }

    isSolved(){

        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j)==0){
                    return false;
                }
            }
        }
        return true;
    }

    isThereContradictionInCell(print_debug_log){
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                let count = 0;
                for(let n=1; n<=9; n++){
                    count += this.getCandidates(i, j, n);
                }
                if(count==0){
                    if(print_debug_log){
                        console.debug(`Contradiction (cell(${i}, ${j})): No numbers fit in this cell.`);
                        print(`Contradiction (cell(${i}, ${j})): No numbers fit in this cell.`);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    isThereContradictionInRow(print_debug_log){
        for(let i=1; i<=9; i++){
            for(let n=1; n<=9; n++){
                let count = 0;
                for(let j=1; j<=9; j++){
                    count += this.getCandidates(i, j, n);
                }
                if(count==0){
                    if(print_debug_log){
                        console.debug(`Contradiction (row ${i}): ${n} cannot be fit in this row.`);
                        print(`Contradiction (row ${i}): ${n} cannot be fit in this row.`);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    isThereContradictionInColumn(print_debug_log){
        for(let j=1; j<=9; j++){
            for(let n=1; n<=9; n++){
                let count = 0;
                for(let i=1; i<=9; i++){
                    count += this.getCandidates(i, j, n);
                }
                if(count==0){
                    if(print_debug_log){
                        console.debug(`Contradiction (column ${j}): ${n} cannot be fit in this column.`);
                        print(`Contradiction (column ${j}): ${n} cannot be fit in this column.`);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    isThereAlreadySameNumber(print_debug_log=true){
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                const n = this.getNumber(i, j);
                if(n==0){
                    continue;
                }

                // n > 0
                let count_row = 0;
                let count_column = 0;
                for(let k=1; k<=9; k++){
                    if(this.getNumber(i, k) == n){
                        count_row++;
                    }
                    if(this.getNumber(k, j) == n){
                        count_column++;
                    }
                }
                if(count_row>1){
                    if(print_debug_log){
                        console.warn(`Contradiction (row ${i}): ${n} is alrady in this row.`);
                        print(`Contradiction (row ${i}): ${n} is alrady in this row.`, 1);
                    }
                    return true;
                }
                if(count_column>1){
                    if(print_debug_log){
                        console.warn(`Contradiction (column ${j}): ${n} is alrady in this column.`);
                        print(`Contradiction (column ${j}): ${n} is alrady in this column.`, 1);
                    }
                    return true;
                }

                let count_block = 0;
                const block_i = Math.floor((i-1)/3) + 1;
                const block_j = Math.floor((j-1)/3) + 1;
                for(let u=1; u<=3; u++){
                    for(let v=1; v<=3; v++){
                        if(this.getNumber_blockBased(block_i, block_j, u, v) == n){
                            count_block++;
                        }
                    }
                }
                
                if(count_column>1){
                    if(print_debug_log){
                        console.warn(`Contradiction (block(${block_i}, ${block_j})): ${n} is alrady in this block.`);
                        print(`Contradiction (block(${block_i}, ${block_j})): ${n} is alrady in this block.`, 1);
                    }
                    return true;
                }
            }
        }

        return false;
    }

    isThereContradiction(print_debug_log=true){
        const C0 = this.isThereAlreadySameNumber(print_debug_log);
        const C1 = this.isThereContradictionInCell(print_debug_log);
        const C2 = this.isThereContradictionInRow(print_debug_log);
        const C3 = this.isThereContradictionInColumn(print_debug_log);

        if(C0==true || C1==true || C2==true || C3==true){
            this.hasContradiction = true;
            if(print_debug_log){
                console.warn(`Contradiction found. Exiting...`);
                print(`Contradiction found. Exiting...`);
            }
            return true;
        }else{
            return false;
        }
    }
}

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
            current_sudoku.resetCandidates();
            draw();
            break;
        default:
            current_sudoku.setNumber(cursor.i, cursor.j, 0);
            current_sudoku.resetCandidates();
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


let current_sudoku = new Sudoku();


const drawCandidatesHelperFunc = (i, j, n)=>{
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

const drawCandidates = (sudoku)=>{
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.getNumber(i, j) > 0){
                continue;
            }
            for(let n=1; n<=9; n++){
                if(sudoku.getCandidates(i, j, n) == 1){
                    drawCandidatesHelperFunc(i, j, n);
                }
            }
        }
    }
};

const draw = (drawCandidate = false)=>{
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawSheet();
    drawCursor();
    drawSudoku(current_sudoku);

    if(drawCandidate == true){
        drawCandidates(current_sudoku);
    }
};


const isSameArray = (arr1, arr2)=>{
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


//////////solver func

const solver = (_sudoku, print_debug_log=true, depth=0)=>{
    const sudoku = _sudoku.clone();

    while(true){
        if(sudoku.isThereContradiction(print_debug_log)==true){
            if(print_debug_log){
                console.warn("Contradiction.");
                print("Contradiction found", 1);
            }
            break;
        }

        let filled_cell = false;
        
        // most basic solving method
        filled_cell = solve_completion_column(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = solve_completion_row(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = solve_completion_block(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        // secodly basic solving method
        filled_cell = solve_deletion_Lv2(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        // thirdly basic solving method
        // This method may be difficult for human beings.
        filled_cell = solve_deletion_block(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = solve_deletion_column(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = solve_deletion_row(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = solve_deletion_cell(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        // advanced solving method
        filled_cell = limit_block_line(sudoku, print_debug_log); // 予約
        if(filled_cell == true){
            continue;
        }

        filled_cell = limit_row_ver1(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = limit_column_ver1(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = limit_block_ver1(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        
        // limit ver2
        filled_cell = limit_block_ver2(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = limit_row_ver2(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        filled_cell = limit_column_ver2(sudoku, print_debug_log);
        if(filled_cell == true){
            continue;
        }

        if(sudoku.isSolved()==true){
            if(print_debug_log){
                console.debug("Solved sudoku.");
                print("Solved sudoku.", 1);
            }
            return sudoku;
        }
    
        ///////////////////////////////////////////////////////////
        // Unable to solve with basic method.
        // Use assuming method.
    
        let i_copy = 0;
        let j_copy = 0;
        let num_min_cand = 10;
        LOOP: for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(sudoku.getNumber(i, j)==0){
                    let num_cand = 0;
                    for(let n=1; n<=9; n++){
                        num_cand += sudoku.getCandidates(i, j, n);
                    }
                    if(num_cand == 2){
                        i_copy = i;
                        j_copy = j;
                        num_min_cand = 2;
                        break LOOP;
                    }
                    if(num_min_cand >= num_cand){
                        i_copy = i;
                        j_copy = j;
                        num_min_cand = num_cand;
                    }
                }
            }
        }
        
        const ij_candidates = [];
        for(let n=1; n<=9; n++){
            if(sudoku.getCandidates(i_copy, j_copy, n) == 1){
                ij_candidates.push(n);
            }
        }
    
        let count_contradiction = 0;
        let count_solved = 0;
        const cand_contradiction = [];
        const cand_solved = [];
        for(let n of ij_candidates){
            const sudoku_copy = sudoku.clone();
            sudoku_copy.setNumber(i_copy, j_copy, n);
            
            /*if(print_debug_log){
                print(`Assuming: cell(${i_copy}, ${j_copy}) に ${n} が入ると仮定する`, 1);
                console.warn(`Assuming: cell(${i_copy}, ${j_copy}) に ${n} が入ると仮定する。depth=${depth}`);
            }*/
            
            const sudoku_result = solver(sudoku_copy, false, depth+1);
    
            if(sudoku_result.isThereContradiction(false)==true){
                cand_contradiction.push([i_copy, j_copy, n]);
                count_contradiction++;

                /*if(print_debug_log){
                    console.warn(`Contradiction found in assuming method. cell(${i_copy}, ${j_copy}) に ${n} は入らない。depth=${depth}`);
                    print(`Contradiction found in assuming method. cell(${i_copy}, ${j_copy}) に ${n} は入らない`, 1);
                }*/
            }
    
            if(sudoku_result.isSolved() == true){
                cand_solved.push(n);
                count_solved++;
                /*if(print_debug_log){
                    console.warn(`Assuming result: cell(${i_copy}, ${j_copy}) に ${n} を入れると数独は解ける。depth=${depth}`);
                    print(`Assuming result: cell(${i_copy}, ${j_copy}) に ${n} を入れると数独は解ける。`, 1);
                }*/
                
            }
        }
        if(count_contradiction==ij_candidates.length){
            current_sudoku = sudoku;
            draw(1);
            print(`Assuming result: cell(${i_copy}, ${j_copy}) 入る数字がない。(解けない数独)`, 2);
            throw `Assuming result: cell(${i_copy}, ${j_copy}) 入る数字がない。(解けない数独)。depth=${depth}`;
        }
        if(count_solved>1){
            current_sudoku = sudoku;
            draw(1);
            print(`Assuming result: cell(${i_copy}, ${j_copy}) に数字が複数はいりえる。(一意解が存在しない)`, 2);
            throw `Assuming result: cell(${i_copy}, ${j_copy}) に数字が複数はいりえる。(一意解が存在しない)。depth=${depth}`;
        }
        /*if(count_solved==1){
            console.warn(`Assuming result: cell(${i_copy}, ${j_copy}) に ${cand_solved[0]}} を入れると数独は解ける。(他の数字を入れると、どこかで矛盾が発生する)。depth=${depth}`);
            print(`Assuming result: cell(${i_copy}, ${j_copy}) に ${cand_solved[0]}} を入れると数独は解ける。(他の数字を入れると、どこかで矛盾が発生する)`, 1);
            sudoku.setNumber(i_copy, j_copy, cand_solved[0]);
            continue;
        }*/

        for(let e of cand_contradiction){
            const [i, j, n] = e;
            const sudoku_copy = sudoku.clone();
            sudoku_copy.setNumber(i_copy, j_copy, n);
            console.warn(`Assuming: これ以上は現在実装されている手段では解けない。`);
            print(`Assuming: これ以上は現在実装されている手段では解けない。`, 1);
            console.warn(`Assuming: cell(${i}, ${j}) に ${n} が入ると仮定する。depth=${depth}`);
            print(`Assuming: cell(${i}, ${j}) に ${n} が入ると仮定する。depth=${depth}`, 1);
            const result = solver(sudoku_copy, true, depth+1);
            result.isThereContradiction(true);

            console.warn(`Assuming: cell(${i}, ${j}) に ${n} を代入すると矛盾が発生する。depth=${depth}`);
            print(`Assuming: cell(${i}, ${j}) に ${n} を代入すると矛盾が発生する。depth=${depth}`, 1);
            console.warn(`Assuming: cell(${i}, ${j}) から ${n} の候補を除外する。depth=${depth}`);
            print(`Assuming: cell(${i}, ${j}) から ${n} の候補を除外する。`, 1);
        
            sudoku.deleteCandidates(i, j, n);
        }
        continue;

        ///////////////////////////////////////////////////////////
        // assuming end

        break;
    }

    

    return sudoku;
};

// Create 10x10 array
const createNumberCandArray = (sudoku, n) =>{
    const cand_array = [];
    for(let i=0; i<10; i++){
        cand_array.push([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    }

    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.getNumber(i, j) > 0){
                cand_array[i][j] = 0;
            }
            if(sudoku.getNumber(i, j) == n){
                // row and column
                for(let k=1; k<=9; k++){
                    cand_array[i][k] = 0;
                    cand_array[k][j] = 0;
                }

                // block
                const block_I = Math.floor((i-1)/3);
                const block_J = Math.floor((j-1)/3);
                for(let u=1; u<=3; u++){
                    for(let v=1; v<=3; v++){
                        cand_array[block_I*3 + u][block_J*3 + v] = 0;
                    }
                }

                break;
            }
        }
    }

    return cand_array;
};

const solve_deletion_Lv2 = (sudoku, print_debug_log=true) =>{
    for(let n=1; n<=9; n++){
        const cand_array = createNumberCandArray(sudoku, n);
        // block
        for(let block_I=0; block_I<3; block_I++){
            for(let block_J=0; block_J<3; block_J++){
                let i_copy = 0;
                let j_copy = 0;
                let count = 0;
                for(let i=1; i<=3; i++){
                    for(let j=1; j<=3; j++){
                        if(cand_array[block_I*3+i][block_J*3+j]==1){
                            i_copy = i;
                            j_copy = j;
                            count ++;
                        }
                    }
                }
                const i = i_copy;
                const j = j_copy;
                if(count == 1 && sudoku.getNumber(i, j)>0){
                    sudoku.setNumber(block_I*3+i, block_J*3+j, n);
                    if(print_debug_log){
                        console.debug(`deletion Lv.2 (block): cell(${block_I*3+i}, ${block_J*3+j}) = ${n}`);
                        print(`deletion Lv.2 (block): cell(${block_I*3+i}, ${block_J*3+j}) = ${n}`);
                    }
                    return true;
                }
            }
        }

        // row
        for(let i=1; i<=9; i++){
            let j_copy = 0;
            let count = 0;
            for(let j=1; j<=9; j++){
                if(cand_array[i][j]==1){
                    j_copy = j;
                    count++;
                }
            }
            const j = j_copy;
            if(count == 1 && sudoku.getNumber(i, j)>0){
                sudoku.setNumber(i, j, n);
                if(print_debug_log){
                    console.debug(`deletion Lv.2 (row): cell(${i}, ${j}) = ${n}`);
                    print(`deletion Lv.2 (row): cell(${i}, ${j}) = ${n}`);
                }
                return true;
            }
        }

        // column
        for(let j=1; j<=9; j++){
            let i_copy = 0;
            let count = 0;
            for(let i=1; i<=9; i++){
                if(cand_array[i][j]==1){
                    i_copy = i;
                    count++;
                }
            }
            const i = i_copy;
            if(count == 1 && sudoku.getNumber(i, j)>0){
                sudoku.setNumber(i, j, n);
                if(print_debug_log){
                    console.debug(`deletion Lv.2 (column): cell(${i}, ${j}) = ${n}`);
                    print(`deletion Lv.2 (column): cell(${i}, ${j}) = ${n}`);
                }
                return true;
            }
        }
    }

    return false;
};


class CandidateList {
    constructor(arg){
        // Argment is 9x9 array.

        this.candidate_list = arg;
    }

    getCandidates(i, number){
        const I = i-1;
        const N = number-1;
        return this.candidate_list[I][N];
    }

    setCandidates(i, number){
        const I = i-1;
        const N = number-1;
        this.candidate_list[I][N] = 1;
    }

    deleteCandidates(i, number){
        const I = i-1;
        const N = number-1;
        this.candidate_list[I][N] = 0;
    }
    
}

const limitVer2HelperFunc = cand_list => {

    const alliance_cand = [];
    for(let n=1; n<=9; n++){
        let count = 0;
        for(let u=1; u<=9; u++){
            count += cand_list.getCandidates(u, n);
        }
        if(count==2){
            alliance_cand.push(n);
        }
    }

    for(let i=0; i<alliance_cand.length-1; i++){
        const n1 = alliance_cand[i];
        for(let j=i+1; j<alliance_cand.length; j++){
            const n2 = alliance_cand[j];
            let u_copy = 0;
            let v_copy = 0;
            LOOP: for(let u=1; u<=8; u++){
                if(cand_list.getCandidates(u, n1)==0 || cand_list.getCandidates(u, n2)==0){
                    continue;
                }
                for(let v=u+1; v<=9; v++){
                    if(cand_list.getCandidates(v, n1)==1 || cand_list.getCandidates(v, n2)==1){
                        u_copy = u;
                        v_copy = v;
                        break LOOP;
                    }
                }
            }
            if(u_copy==0 || v_copy==0){
                continue;
            }
            const u = u_copy;
            const v = v_copy;
            
            let count1 = 0;
            let count2 = 0;
            
            for(let i=1; i<=9; i++){
                if(i==u || i==v){
                    continue;
                }
                count1 += cand_list.getCandidates(i, n1);
                count2 += cand_list.getCandidates(i, n2);
            }
            if(count1>0 || count2>0){
                continue;
            }

            let count11 = 0;
            let count22 = 0;

            for(let n=1; n<=9; n++){
                count11 += cand_list.getCandidates(u, n);
                count22 += cand_list.getCandidates(v, n);
            }
            if(count11>2 || count22>2){
                return [u, v, n1, n2];
            }
        }
    }




    return false;
};


// 2国同盟 var 2
const limit_block_ver2 = (sudoku, print_debug_log=true) =>{

    for(let block_i=1; block_i<=3; block_i++){
        for(let block_j=1; block_j<=3; block_j++){
            const input_array = [];

            for(let i=1; i<=3; i++){
                for(let j=1; j<=3; j++){
                    const list = sudoku.getCandidateList_blockBased(block_i, block_j, i, j);
                    input_array.push(list);
                }
            }
        
            const cand_list = new CandidateList(input_array);

            result = limitVer2HelperFunc(cand_list);
            if(result==false){
                continue;
            }
            // 2国同盟が成立
            const [u, v, n1, n2] = result;
            for(let n=1; n<=9; n++){
                if(n==n1 || n==n2){
                    continue;
                }
                cand_list.deleteCandidates(u, n);
                cand_list.deleteCandidates(v, n);
            }

            if(print_debug_log){
                console.debug(`二国同盟ver2: (block) cell(${(block_i-1)*3+Math.floor((u-1)/3)+1}, ${(block_j-1)*3+((u-1)%3)+1}), cell(${(block_i-1)*3+Math.floor((v-1)/3)+1}, ${(block_j-1)*3+((v-1)%3)+1}) = {${n1}, ${n2}}`);
                print(`二国同盟ver2: (block) cell(${(block_i-1)*3+Math.floor((u-1)/3)+1}, ${(block_j-1)*3+((u-1)%3)+1}), cell(${(block_i-1)*3+Math.floor((v-1)/3)+1}, ${(block_j-1)*3+((v-1)%3)+1}) = {${n1}, ${n2}}`);
            }

            return true;
        }
    }
    return false;
};


// 2国同盟 var 2
const limit_row_ver2 = (sudoku, print_debug_log=true) =>{

    for(let row=1; row<=9; row++){
        const input_array = [];

        for(let j=1; j<=9; j++){
            const list = sudoku.getCandidateList(row, j);
            input_array.push(list);
        }
    
        const cand_list = new CandidateList(input_array);
        
        result = limitVer2HelperFunc(cand_list);
        if(result==false){
            continue;
        }
        // 2国同盟が成立
        const [u, v, n1, n2] = result;
        for(let n=1; n<=9; n++){
            if(n==n1 || n==n2){
                continue;
            }
            cand_list.deleteCandidates(u, n);
            cand_list.deleteCandidates(v, n);
        }

        if(print_debug_log){
            console.debug(`二国同盟ver2: (row) cell(${row}, ${u}), cell(${row}, ${v}) = {${n1}, ${n2}}`);
            print(`二国同盟ver2: (row) cell(${row}, ${u}), cell(${row}, ${v}) = {${n1}, ${n2}}`);
        }

        return true;
    
    }
    return false;
};


// 2国同盟 var 2
const limit_column_ver2 = (sudoku, print_debug_log=true) =>{

    for(let column=1; column<=9; column++){
        const input_array = [];

        for(let j=1; j<=9; j++){
            const list = sudoku.getCandidateList(j, column);
            input_array.push(list);
        }
    
        const cand_list = new CandidateList(input_array);
    
    
        result = limitVer2HelperFunc(cand_list);
        if(result==false){
            continue;
        }
        // 2国同盟が成立
        const [u, v, n1, n2] = result;
        for(let n=1; n<=9; n++){
            if(n==n1 || n==n2){
                continue;
            }
            cand_list.deleteCandidates(u, n);
            cand_list.deleteCandidates(v, n);
        }

        if(print_debug_log){
            console.debug(`二国同盟ver2: (column) cell(${u}, ${column}), cell(${v}, ${column}) = {${n1}, ${n2}}`);
            print(`二国同盟ver2: (column) cell(${u}, ${column}), cell(${v}, ${column}) = {${n1}, ${n2}}`);
        }

        return true;
    }
    return false;
};



const limitVer1HelperFunc = cand_list =>{

    const alliance_cand = [];
    for(let u=1; u<=9; u++){
        let count = 0;
        for(let n=1; n<=9; n++){
            count += cand_list.getCandidates(u, n);
        }
        if(count==2){
            alliance_cand.push(u);
        }
    }


    for(let i=0; i<alliance_cand.length-1; i++){
        const u = alliance_cand[i];
        for(let j=i+1; j<alliance_cand.length; j++){
            const v = alliance_cand[j];
            let n1_copy = 0;
            let n2_copy = 0;
            LOOP: for(let n1=1; n1<=8; n1++){
                if(cand_list.getCandidates(u, n1)==0 || cand_list.getCandidates(v, n1)==0){
                    continue;
                }
                for(let n2=n1+1; n2<=9; n2++){
                    if(cand_list.getCandidates(u, n2)==1 || cand_list.getCandidates(v, n2)==1){
                        n1_copy = n1;
                        n2_copy = n2;
                        break LOOP;
                    }
                }
            }
            if(n1_copy==0 || n2_copy==0){
                continue;
            }
            const n1 = n1_copy;
            const n2 = n2_copy;
            
            let count1 = 0;
            let count2 = 0;
            
            for(let n=1; n<=9; n++){
                if(n==n1 || n==n2){
                    continue;
                }
                count1 += cand_list.getCandidates(u, n);
                count2 += cand_list.getCandidates(v, n);
            }
            if(count1>0 || count2>0){
                continue;
            }

            let count11 = 0;
            let count22 = 0;

            for(let i=1; i<=9; i++){
                count11 += cand_list.getCandidates(i, n1);
                count22 += cand_list.getCandidates(i, n2);
            }
            if(count11>2 || count22>2){
                return [u, v, n1, n2];
            }
        }
    }


    return false;
};


// 2国同盟 var 1
const limit_block_ver1 = (sudoku, print_debug_log=true) =>{

    for(let block_i=1; block_i<=3; block_i++){
        for(let block_j=1; block_j<=3; block_j++){
            const input_array = [];

            for(let i=1; i<=3; i++){
                for(let j=1; j<=3; j++){
                    const list = sudoku.getCandidateList_blockBased(block_i, block_j, i, j);
                    input_array.push(list);
                }
            }
        
            const cand_list = new CandidateList(input_array);
            result = limitVer1HelperFunc(cand_list);

            if(result==false){
                continue;
            }
            // 2国同盟が成立
            const [u, v, n1, n2] = result;
            for(let i=1; i<=9; i++){
                if(i==u || i==v){
                    continue;
                }
                cand_list.deleteCandidates(i, n1);
                cand_list.deleteCandidates(i, n2);
            }
            if(print_debug_log){
                console.debug(`二国同盟ver1: (block) cell(${(block_i-1)*3+Math.floor((u-1)/3)+1}, ${(block_j-1)*3+((u-1)%3)+1}), cell(${(block_i-1)*3+Math.floor((v-1)/3)+1}, ${(block_j-1)*3+((v-1)%3)+1}) = {${n1}, ${n2}}`);
                print(`二国同盟ver1: (block) cell(${(block_i-1)*3+Math.floor((u-1)/3)+1}, ${(block_j-1)*3+((u-1)%3)+1}), cell(${(block_i-1)*3+Math.floor((v-1)/3)+1}, ${(block_j-1)*3+((v-1)%3)+1}) = {${n1}, ${n2}}`);
            }

            return true;
        }
    }
    return false;
};


// 2国同盟 var 1
const limit_row_ver1 = (sudoku, print_debug_log=true) =>{

    for(let row=1; row<=9; row++){
        const input_array = [];

        for(let j=1; j<=9; j++){
            const list = sudoku.getCandidateList(row, j);
            input_array.push(list);
        }
    
        const cand_list = new CandidateList(input_array);
        
        result = limitVer1HelperFunc(cand_list);
        if(result==false){
            continue;
        }
        // 2国同盟が成立
        const [u, v, n1, n2] = result;
        for(let i=1; i<=9; i++){
            if(i==u || i==v){
                continue;
            }
            cand_list.deleteCandidates(i, n1);
            cand_list.deleteCandidates(i, n2);
        }
        if(print_debug_log){
            console.debug(`二国同盟ver1: (row) cell(${row}, ${u}), cell(${row}, ${v}) = {${n1}, ${n2}}`);
            print(`二国同盟ver1: (row) cell(${row}, ${u}), cell(${row}, ${v}) = {${n1}, ${n2}}`);
        }

        return true;
    
    }
    return false;
};


// 2国同盟 var 1
const limit_column_ver1 = (sudoku, print_debug_log=true) =>{

    for(let column=1; column<=9; column++){
        const input_array = [];

        for(let j=1; j<=9; j++){
            const list = sudoku.getCandidateList(j, column);
            input_array.push(list);
        }
    
        const cand_list = new CandidateList(input_array);
    
    
        result = limitVer1HelperFunc(cand_list);
        if(result==false){
            continue;
        }
        // 2国同盟が成立
        const [u, v, n1, n2] = result;
        for(let i=1; i<=9; i++){
            if(i==u || i==v){
                continue;
            }
            cand_list.deleteCandidates(i, n1);
            cand_list.deleteCandidates(i, n2);
        }
        if(print_debug_log){
            console.debug(`二国同盟ver1: (column) cell(${u}, ${column}), cell(${v}, ${column}) = {${n1}, ${n2}}`);
            print(`二国同盟ver1: (column) cell(${u}, ${column}), cell(${v}, ${column}) = {${n1}, ${n2}}`);
        }

        return true;
    }
    return false;
};



const limit_block_line = (sudoku, print_debug_log=true)=>{
    for(let number=1; number<=9; number++){
        for(let block_i=1; block_i<=3; block_i++){
            for(let block_j=1; block_j<=3; block_j++){
            

                let count = 0;
                const pos = [];
                for(let i=1; i<=3; i++){
                    for(let j=1; j<=3; j++){
                        if(sudoku.getCandidates_blockBased(block_i, block_j, i, j, number) == 1){
                            count++;
                            pos.push([i, j]);
                        }
                    }
                }

                if(count>3 || count<=1){
                    continue;
                }
                // count=2 or count=3 from here.

                if(pos[0][0] == pos[1][0]){
                    if(count==3 && pos[0][0]!=pos[2][0]){
                        continue;
                    }

                    const row = (block_i-1)*3 + pos[0][0];
                    const i = pos[0][0];
                    let count_row_cand = 0;
                    for(let j=1; j<=9; j++){
                        if(sudoku.getCandidates(row, j, number) == 1){
                            count_row_cand++;
                        }
                    }

                    if(count_row_cand>count){
                        for(let u=1; u<=9; u++){
                            sudoku.deleteCandidates(row, u, number);
                        }
                        for(let u=0; u<count; u++){
                            sudoku.setCandidates_blockBased(block_i, block_j, pos[u][0], pos[u][1], number);
                        }
                        if(print_debug_log){
                            console.debug(`Limitation : block(${block_i}, ${block_j}) -> row ${row} number: ${number}`);
                            print(`Limitation : block(${block_i}, ${block_j}) -> row ${row} number: ${number}`);
                        }
                        return true;
                    }
                }

                if(pos[0][1] == pos[1][1]){
                    if(count==3 && pos[0][1]!=pos[2][1]){
                        continue;
                    }

                    const column = (block_j-1)*3 + pos[0][1];
                    const j = pos[0][1];
                    let count_column_cand = 0;
                    for(let i=1; i<=9; i++){
                        if(sudoku.getCandidates(i, column, number) == 1){
                            count_column_cand++;
                        }
                    }

                    if(count_column_cand>count){
                        for(let u=1; u<=9; u++){
                            sudoku.deleteCandidates(u, column, number);
                        }
                        for(let u=0; u<count; u++){
                            sudoku.setCandidates_blockBased(block_i, block_j, pos[u][0], pos[u][1], number);
                        }
                        if(print_debug_log){
                            console.debug(`Limitation : block(${block_i}, ${block_j}) -> column ${column} number: ${number}`);
                            print(`Limitation : block(${block_i}, ${block_j}) -> column ${column} number: ${number}`);
                        }
                        return true;
                    }
                }
                
            }
        }
    }
    return false;
};


const solve_deletion_cell = (sudoku, print_debug_log=true) => {
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            let empty_index;
            let count = 0;
            for(let number=1; number<=9; number++){
                if(sudoku.getCandidates(i, j, number) == 1){
                    count++;
                    empty_index = number;
                }
            }

            if(count==1 && sudoku.getNumber(i, j)==0){
                // deletion
                sudoku.setNumber(i, j, empty_index);
                if(print_debug_log){
                    console.debug(`Deletion Lv.3 (cell(${i}, ${j})): cell(${i}, ${j})=${empty_index}`);
                    print(`Deletion Lv.3 (cell(${i}, ${j})): cell(${i}, ${j})=${empty_index}`);
                }
                return true;
            }
        }
    }
    return false;
};


const solve_deletion_block = (sudoku, print_debug_log=true) => {
    for(let number=1; number<=9; number++){
        for(let block_I=0; block_I<9; block_I+=3){
            for(let block_J=0; block_J<9; block_J+=3){
                let empty_block_i, empty_block_j;
                let count = 0;
                for(let block_i=1; block_i<=3; block_i++){
                    for(let block_j=1; block_j<=3; block_j++){
                        if(sudoku.getCandidates(block_I+block_i, block_J+block_j, number)==1){
                            //console.debug(`${block_I}, ${block_J}, ${block_i}, ${block_j}, `);
                            count++;
                            empty_block_i = block_i;
                            empty_block_j = block_j;
                        }
                    }
                }

                if(count==1 && sudoku.getNumber(block_I+empty_block_i, block_J+empty_block_j)==0){
                    // deletion
                    sudoku.setNumber(block_I+empty_block_i, block_J+empty_block_j, number);
                    if(print_debug_log){
                        console.debug(`Deletion Lv.3 (block (${block_I/3+1}, ${block_J/3+1})): cell(${block_I+empty_block_i}, ${block_J+empty_block_j})=${number}`);
                        print(`Deletion Lv.3 (block (${block_I/3+1}, ${block_J/3+1})): cell(${block_I+empty_block_i}, ${block_J+empty_block_j})=${number}`);
                    }
                    return true;
                }
            }
        }
    }
    return false;
};


const solve_deletion_row = (sudoku, print_debug_log=true) => {
    for(let number=1; number<=9; number++){
        for(let i=1; i<=9; i++){
            let empty_index;
            let count = 0;
            for(let j=1; j<=9; j++){
                if(sudoku.getCandidates(i, j, number)==1){
                    count++;
                    empty_index = j;
                }
            }

            if(count==1 && sudoku.getNumber(i, empty_index)==0){
                // deletion
                sudoku.setNumber(i, empty_index, number);
                if(print_debug_log){
                    console.debug(`Deletion Lv.3 (row ${i}): cell(${i}, ${empty_index})=${number}`);
                    print(`Deletion Lv.3 (row ${i}): cell(${i}, ${empty_index})=${number}`);
                }
                return true;
            }
        }
    }
    return false;
};


const solve_deletion_column = (sudoku, print_debug_log=true) => {
    for(let number=1; number<=9; number++){
        for(let j=1; j<=9; j++){
            let empty_index;
            let count = 0;
            for(let i=1; i<=9; i++){
                if(sudoku.getCandidates(i, j, number)==1){
                    count++;
                    empty_index = i;
                }
            }

            if(count==1 && sudoku.getNumber(empty_index, j)==0){
                // deletion
                sudoku.setNumber(empty_index, j, number);
                if(print_debug_log){
                    console.debug(`Deletion Lv.3 (column ${j}): cell(${empty_index}, ${j})=${number}`);
                    print(`Deletion Lv.3 (column ${j}): cell(${empty_index}, ${j})=${number}`);
                }
                return true;
            }
        }
    }
    return false;
};



const solve_completion_row = (sudoku, print_debug_log=true) => {
    for(let i=1; i<=9; i++){
        let count = 0;
        let empty_index = 0;
        for(let j=1; j<=9; j++){
            if(sudoku.getNumber(i, j) > 0){
                count++;
            }else{
                empty_index = j;
            }
        }

        if(count == 8){
            // completion
            let number = 45;
            for(let j=1; j<=9; j++){
                number -= sudoku.getNumber(i, j);
            }
            sudoku.setNumber(i, empty_index, number);

            if(print_debug_log){
                console.debug(`Completion (row ${i}): cell(${i}, ${empty_index})=${number}`);
                print(`Completion (row ${i}): cell(${i}, ${empty_index})=${number}`);
            }
            return true;
        }
    }
    
    return false;
};

const solve_completion_column = (sudoku, print_debug_log=true) => {
    for(let j=1; j<=9; j++){
        let count = 0;
        let empty_index = 0;
        for(let i=1; i<=9; i++){
            if(sudoku.getNumber(i, j) > 0){
                count++;
            }else{
                empty_index = i;
            }
        }

        if(count == 8){
            // completion
            let number = 45;
            for(let i=1; i<=9; i++){
                number -= sudoku.getNumber(i, j);
            }
            
            sudoku.setNumber(empty_index, j, number);
            if(print_debug_log){
                console.debug(`Completion (column ${j}): cell(${empty_index}, ${j})=${number}`);
                print(`Completion (column ${j}): cell(${empty_index}, ${j})=${number}`)
            }

            return true;
        }
    }

    return false;
};

const solve_completion_block = (sudoku, print_debug_log=true) => {
    for(let block_I=0; block_I<9; block_I+=3){
        for(let block_J=0; block_J<9; block_J+=3){
            let empty_block_i, empty_block_j;
            let count = 0;
            for(let block_i=1; block_i<=3; block_i++){
                for(let block_j=1; block_j<=3; block_j++){
                    if(sudoku.getNumber(block_I+block_i, block_J+block_j) > 0){
                        count++;
                    }else{
                        empty_block_i = block_i;
                        empty_block_j = block_j;
                    }
                }
            }
            
            if(count == 8){
                // completion
                let number = 45;
                for(let block_i=1; block_i<=3; block_i++){
                    for(let block_j=1; block_j<=3; block_j++){
                        number -= sudoku.getNumber(block_I+block_i, block_J+block_j);
                    }
                }
                sudoku.setNumber(block_I+empty_block_i, block_J+empty_block_j, number);
                
                if(print_debug_log){
                    console.debug(`Completion (block (${block_I/3}, ${block_J/3})): cell(${block_I+empty_block_i}, ${block_J+empty_block_j})=${number}`);
                    print(`Completion (block (${block_I/3}, ${block_J/3})): cell(${block_I+empty_block_i}, ${block_J+empty_block_j})=${number}`)
                }
                return true;

            }
        }
    }
    return false;
}

//////////end solver func


draw();

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
"080400000007010600500003040300002500001070000000500009005300007020008030000060900"