

const draw_1 = document.getElementById("draw");
draw_1.addEventListener("click", e=>{
    e.preventDefault();
    draw(1);
});

let sudoku_backup;
const start_solve = document.getElementById("start_solve");
start_solve.addEventListener("click", e=>{
    e.preventDefault();

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
