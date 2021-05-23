

const draw_1 = document.getElementById("draw_1");
draw_1.addEventListener("click", ()=>{
    draw(1);
});

let sudoku_backup;
const start_solve = document.getElementById("start_solve");
start_solve.addEventListener("click", ()=>{
    sudoku_backup = current_sudoku.clone();
    current_sudoku = solver(current_sudoku);
    draw();
});

const reset = document.getElementById("reset");
reset.addEventListener("click", ()=>{
    current_sudoku = sudoku_backup.clone();
    draw();
});