
const numberkey_canvas = document.getElementById('numberkeys');
const nkctx = numberkey_canvas.getContext('2d');

const nk_offset_x = offset_x;
const nk_offset_y = 5;

const drawNumberKeys = ()=>{

    // draw 1x9 cells
    nkctx.strokeStyle = 'rgb(170, 170, 170)';
    for(let i=0; i<9; i++){
        const j = 0;
        const x = i*cell_width + nk_offset_x;
        const y = j*cell_width + nk_offset_y;
        nkctx.strokeRect(x, y, cell_width, cell_width);
    }

    nkctx.fillStyle = 'rgb(50, 50, 50)';
    nkctx.font = '24pt Arial';
    for(let i=1; i<=9; i++){
        const j = 1;
        const x = (i-0.5)*cell_width + nk_offset_x - 8;
        const y = (j-0.5)*cell_width + nk_offset_y + 11;
    
        nkctx.fillText(i, x, y);
    }


    
};

numberkey_canvas.addEventListener('click', e=>{
    const rect = e.target.getBoundingClientRect();
    const mouse_x = e.clientX - rect.left;
    const i_float = (mouse_x - nk_offset_x)/cell_width;
    const i = Math.floor(i_float) + 1;
    
    
    current_sudoku.setNumber(cursor.i, cursor.j, i);
    current_sudoku.resetCandidate();
    user_action_history.push(current_sudoku.clone());
    draw();
});

drawNumberKeys();