

const draw_1 = document.getElementById("draw");
draw_1.addEventListener("click", e=>{
    e.preventDefault();
    draw(1);
});

let sudoku_backup;
const start_solve = document.getElementById("start_solve");
start_solve.addEventListener("click", e=>{
    e.preventDefault();

    //////
    // save to local storage
    const history_index = parseInt(localStorage.getItem('history_index')) || 0;
    const sudoku_string = current_sudoku.exportSudokuAsText();
    if(sudoku_string!=localStorage.getItem(`history${history_index}`)){
        localStorage.setItem(`history${history_index+1}`, sudoku_string);
        localStorage.setItem(`history_index`, `${history_index+1}`);
        referring_index = history_index+1;
    }
    /////

    logging = false;
    sudoku_backup = current_sudoku.clone();
    const sudoku_clone = current_sudoku.clone();
    user_action_history.push(sudoku_clone);
    sudoku_answer_temp = current_sudoku.test();
    
    logging = true;
    current_sudoku = quickSolver(current_sudoku);
    draw();

    for(const sudoku_status of sudoku_procedure){
        print(sudoku_status.message, sudoku_status.severity)
    }
});


const delete_btn = document.getElementById("delete");
delete_btn.addEventListener("click", e=>{
    e.preventDefault();
    current_sudoku.setNumber(cursor.i, cursor.j, 0);
    current_sudoku.resetCandidate();
    const sudoku_clone = current_sudoku.clone();
    user_action_history.push(sudoku_clone);
    draw();
});


const reset = document.getElementById("reset");
reset.addEventListener("click", e=>{
    e.preventDefault();
    current_sudoku = new QuickSudoku();

    user_action_history.push(new QuickSudoku);
    draw();
});


const user_action_history = [];

const back_btn = document.getElementById("back");
back_btn.addEventListener("click", e=>{
    e.preventDefault();
    
    if(user_action_history.length==0){
        current_sudoku = new QuickSudoku();
        user_action_history.push(new QuickSudoku());
        draw();
        return;
    }

    current_sudoku = user_action_history.pop();
    
    draw();
});



let logging = false;

let sudoku_answer_temp = new QuickSudoku();
document.getElementById("a_test").addEventListener("click", e=>{
    current_sudoku = new QuickSudoku();
    current_sudoku.importSudokuFromText("000070102040500000700019060000000037034000000060350004120800000000060009079102800");
    draw()
    e.preventDefault();
});



const history_btn = document.getElementById("history");
let referring_index = parseInt(localStorage.getItem('history_index')) || 0;
history_btn.addEventListener("click", e=>{
    e.preventDefault();

    const history_index = parseInt(localStorage.getItem('history_index')) || 0;
    if(history_index<1){
        return;
    }

    if(referring_index<1){
        return;
    }


    const sudoku_string = localStorage.getItem(`history${referring_index}`);
    current_sudoku = new QuickSudoku();
    current_sudoku.importSudokuFromText(sudoku_string);
    referring_index -= 1;

    user_action_history.push(current_sudoku.clone());
    draw();
});