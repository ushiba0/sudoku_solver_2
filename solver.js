

const quickSolver = (__sudoku, print_debug_log=false, depth=0)=>{
    const sudoku = __sudoku.clone();

    LOOP_SOLVE:
    while(true){
        if(sudoku.hasContradiction(print_debug_log).status==true){
            if(print_debug_log){
                console.warn("Contradiction.");
                print("Contradiction found", 1);
            }

            if(depth==0){
                current_sudoku=sudoku
                print(`この数独は解けません。depth=0`);
                throw `この数独は解けません。depth=0`;
            }else{
                sudoku.containsContradiction = 1;
                return sudoku;
            }
        }

        let result;
        
        // most basic solving method
        result = _solve_deletion_column_Lv1(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_row_Lv1(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_block_Lv1(sudoku);
        if(result.status == true){
            continue;
        }

        // secodly basic solving method
        result = _solve_deletion_cell_Lv2(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_block_Lv2(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_row_Lv2(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_column_Lv2(sudoku);
        if(result.status == true){
            continue;
        }

        // thirdly basic solving method
        // This method may be difficult for human beings.
        result = _solve_deletion_cell_Lv3(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_block_Lv3(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_row_Lv3(sudoku);
        if(result.status == true){
            continue;
        }

        result = _solve_deletion_column_Lv3(sudoku);
        if(result.status == true){
            continue;
        }

        // advanced solving method
        result = __limit_block_line(sudoku); // 予約
        if(result.status == true){
            continue;
        }

        result = __limit_row_block(sudoku); // 予約
        if(result.status == true){
            continue;
        }

        result = __limit_column_block(sudoku); // 予約
        if(result.status == true){
            continue;
        }

        for(const num_countries of [2,3,4,5,6,7]){
            result = _limit_row_ver1(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
            
            result = _limit_column_ver1(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
            
            result = _limit_block_ver1(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
            
            result = _limit_row_ver2(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
            
            result = _limit_column_ver2(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
            
            result = _limit_block_ver2(sudoku, num_countries);
            if(result.status == true){
                continue LOOP_SOLVE;
            }
        }

        if(sudoku.isSolved()==true){
            new SudokuStatus(true, `Solved sudoku.`, 2, false, sudoku);
            return sudoku;
        }
        
    
        ///////////////////////////////////////////////////////////
        // Unable to solve this sudoku with basic method.
        // Using assuming method.
        
        new SudokuStatus(true, "これ以上は通常の手段では解けない。", 2, false, sudoku)
        
        let i_copy = 0;
        let j_copy = 0;
        let num_min_cand = 10;
        let ij_Candidate = [];
        LOOP:
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                const n_list = sudoku.getN_ListInCell(i, j);
                // 空のマスだった場合の処理
                if(n_list.length>1){
                    if(n_list.length==2){
                        i_copy = i;
                        j_copy = j;
                        num_min_cand = 2;
                        ij_Candidate = n_list;
                        break LOOP;
                    }
                    if(num_min_cand >= n_list.length){
                        i_copy = i;
                        j_copy = j;
                        num_min_cand = n_list.length;
                        ij_Candidate = n_list;
                    }
                }
            }
        }
        
        
        const n_answer = sudoku_answer_temp.getNumber(i_copy, j_copy);
        for(let x=0; x<ij_Candidate.length; x++){
            if(ij_Candidate[x]==n_answer){
                const temp = ij_Candidate[x];
                ij_Candidate[x] = ij_Candidate[ij_Candidate.length-1];
                ij_Candidate[ij_Candidate.length-1] = temp;
            }
        }
    
        let count_solved = 0;
        const cand_solved = [];
        for(let n of ij_Candidate){
            const sudoku_copy = sudoku.clone();
            sudoku_copy.setNumber(i_copy, j_copy, n);
            current_sudoku=sudoku;
            new SudokuStatus(true,
                `Assuming: cell(${i_copy}, ${j_copy})=${n} と仮定する。depth=${depth}`,
                2, true, sudoku
            );
            // 仮定法の実行
            const sudoku_result = quickSolver(sudoku_copy, false, depth+1);

            if(sudoku_result.hasContradiction().status==true){
                new SudokuStatus(true,
                    `Assuming: cell(${i_copy}, ${j_copy})=${n} と仮定すると矛盾が発生して数独が解けない。よって cell(${i_copy}, ${j_copy}) に ${n} は入らない。depth=${depth}`,
                    2, true, sudoku
                );
                sudoku.deleteCandidate(i_copy, j_copy, n);
                continue LOOP_SOLVE;
            }
    
            if(sudoku_result.isSolved() == true){
                cand_solved.push(n);
                count_solved++;
            }

            if(sudoku_result.no_unique_solution == true){
                sudoku.no_unique_solution = true;
                return sudoku;
            }
        }

        if(count_solved>1){
            new SudokuStatus(true,
                `Assuming result: cell(${i_copy}, ${j_copy}) に数字が複数はいりえる。(一意解が存在しない)`,
                2, true, sudoku
            );
            sudoku.no_unique_solution = true;
            return sudoku;
            
            //throw "";
        }
        
        continue;
        
        ///////////////////////////////////////////////////////////
        // assuming end

        break;
    }

    return sudoku;
};



const _solve_deletion_row_Lv1 = (sudoku) => {
    for(let i=1; i<=9; i++){
        if(sudoku.countNumbersInRow(i) == 8){
            // completion
            for(let j=1; j<=9; j++){
                if(sudoku.getNumber(i, j)==0){
                    const n_list = sudoku.getN_ListInCell(i, j);
                    if(n_list.length!=1){
                        throw "we should not reach here"
                    }
                    sudoku.setNumber(i, j, n_list[0]);
                    return new SudokuStatus(true, 
                        `Deletion Lv.1 (row ${i}): cell(${i}, ${j})=${n_list[0]}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    
    return new SudokuStatus(false);
};


const _solve_deletion_column_Lv1 = (sudoku) => {
    for(let j=1; j<=9; j++){
        if(sudoku.countNumbersInColumn(j) == 8){
            // completion
            for(let i=1; i<=9; i++){
                if(sudoku.getNumber(i, j)==0){
                    const n_list = sudoku.getN_ListInCell(i, j);
                    if(n_list.length!=1){
                        throw "we should not reach here"
                    }
                    sudoku.setNumber(i, j, n_list[0]);
                    return new SudokuStatus(true, 
                        `Deletion Lv.1 (column ${j}): cell(${i}, ${j})=${n_list[0]}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_block_Lv1 = (sudoku) => {
    for(let block_i of [1,2,3]){
        for(let block_j of [1,2,3]){
            if(sudoku.countNumbersInBlock(block_i, block_j)==8){
                // completion
                for(let i of [1,2,3]){
                    for(let j of [1,2,3]){
                        if(sudoku.getNumber_blockBased(block_i, block_j, i, j)==0){
                            const n_list = sudoku.getN_ListInCell((block_i-1)*3+i, (block_j-1)*3+j);
                            if(n_list.length!=1){
                                throw "we should not reach here"
                            }
                            sudoku.setNumber_blockBased(block_i, block_j, i, j, n_list[0]);
                            return new SudokuStatus(true, 
                                `Deletion Lv.1 (block (${block_i}, ${block_j})): cell(${(block_i-1)*3+i}, ${(block_j-1)*3+j})=${n_list[0]}`,
                                4, true, sudoku
                            );
                        }
                    }
                }
            }
        }
    }
    return new SudokuStatus(false);
}




///////////////////////////////////////////////////////////////////////
const _solve_deletion_Lv2 = (sudoku) =>{
    for(let n=1; n<=9; n++){
        const cand_array = sudoku.createCandidateArray(n);
        // block
        for(let block_i_offset=0; block_i_offset<9; block_i_offset+=3){
            for(let block_j_offset=0; block_j_offset<9; block_j_offset+=3){
                let i_copy = 0;
                let j_copy = 0;
                let count = 0;
                for(let i=1; i<=3; i++){
                    for(let j=1; j<=3; j++){
                        if(cand_array[block_i_offset+i][block_j_offset+j]==1){
                            i_copy = i;
                            j_copy = j;
                            count ++;
                        }
                    }
                }
                const i = i_copy;
                const j = j_copy;
                if(count == 1 && sudoku.getNumber(i, j)>0){
                    sudoku.setNumber(block_i_offset+i, block_j_offset+j, n);
                    return new SudokuStatus(true, 
                        `Deletion Lv.2 (block): cell(${block_i_offset+i}, ${block_j_offset+j}) = ${n}`,
                        4, true, sudoku
                    );
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
                return new SudokuStatus(true, 
                    `Deletion Lv.2 (row): cell(${i}, ${j}) = ${n}`,
                    4, true, sudoku
                );
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
                return new SudokuStatus(true, 
                    `Deletion Lv.2 (column): cell(${i}, ${j}) = ${n}`,
                    4, true, sudoku
                );
            }
        }
    }

    return new SudokuStatus(false);
};


const _solve_deletion_cell_Lv2 = (sudoku) => {
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.shadow.countCandidateInCell(i, j)==1 && sudoku.getNumber(i, j)==0){
                // deletion
                const n = sudoku.getN_ListInCell(i, j)[0];
                sudoku.setNumber(i, j, n);
                return new SudokuStatus(true,
                    `Deletion Lv.2 (cell(${i}, ${j})): cell(${i}, ${j})=${n}`,
                    4, true, sudoku
                );
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_block_Lv2 = (sudoku) => {
    for(const block_i of [1,2,3]){
        for(const block_j of [1,2,3]){
            for(let n=1; n<=9; n++){
                if(sudoku.shadow.countCandidateInBlock(block_i, block_j, n)==1){
                    const [i, j] = sudoku.getN_ListInBlock(block_i, block_j, n)[0];
                    if(sudoku.getNumber_blockBased(block_i, block_j, i, j)==0){
                        // deletion
                        sudoku.setNumber_blockBased(block_i, block_j, i, j, n);
                        return new SudokuStatus(true,
                            `Deletion Lv.2 (block (${block_i}, ${block_j})): cell(${(block_i-1)*3+i}, ${(block_j-1)*3+j})=${n}`,
                            4, true, sudoku
                        );
                    }
                }
            }
        }
    }
    return new SudokuStatus(false);
};

const _solve_deletion_row_Lv2 = (sudoku) => {
    for(let n=1; n<=9; n++){
        for(let i=1; i<=9; i++){
            if(sudoku.shadow.countCandidateInRow(i, n)==1){
                const j = sudoku.getN_ListInRow(i, n)[0];
                if(sudoku.getNumber(i, j)==0){
                    // deletion
                    sudoku.setNumber(i, j, n);
                    return new SudokuStatus(true,
                        `Deletion Lv.2 (row ${i}): cell(${i}, ${j})=${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_column_Lv2 = (sudoku) => {
    for(let n=1; n<=9; n++){
        for(let j=1; j<=9; j++){
            if(sudoku.shadow.countCandidateInColumn(j, n)==1){
                const i = sudoku.getN_ListInColumn(j, n)[0];
                if(sudoku.getNumber(i, j)==0){
                    // deletion
                    sudoku.setNumber(i, j, n);
                    return new SudokuStatus(true,
                        `Deletion Lv.2 (column ${j}): cell(${i}, ${j})=${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};

/////////////////////////////////////////////////////////////////



const _solve_deletion_cell_Lv3 = (sudoku) => {
    for(let i=1; i<=9; i++){
        for(let j=1; j<=9; j++){
            if(sudoku.countCandidateInCell(i, j)==1 && sudoku.getNumber(i, j)==0){
                // deletion
                const n = sudoku.getN_ListInCell(i, j)[0];
                sudoku.setNumber(i, j, n);
                return new SudokuStatus(true,
                    `Deletion Lv.3 (cell(${i}, ${j})): cell(${i}, ${j})=${n}`,
                    4, true, sudoku
                );
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_block_Lv3 = (sudoku) => {
    for(const block_i of [1,2,3]){
        for(const block_j of [1,2,3]){
            for(let n=1; n<=9; n++){
                if(sudoku.countCandidateInBlock(block_i, block_j, n)==1){
                    const [i, j] = sudoku.getN_ListInBlock(block_i, block_j, n)[0];
                    if(sudoku.getNumber_blockBased(block_i, block_j, i, j)==0){
                        // deletion
                        sudoku.setNumber_blockBased(block_i, block_j, i, j, n);
                        return new SudokuStatus(true,
                            `Deletion Lv.3 (block (${block_i}, ${block_j})): cell(${(block_i-1)*3+i}, ${(block_j-1)*3+j})=${n}`,
                            4, true, sudoku
                        );
                    }
                }
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_row_Lv3 = (sudoku) => {
    for(let n=1; n<=9; n++){
        for(let i=1; i<=9; i++){
            if(sudoku.countCandidateInRow(i, n)==1){
                const j = sudoku.getN_ListInRow(i, n)[0];
                if(sudoku.getNumber(i, j)==0){
                    // deletion
                    sudoku.setNumber(i, j, n);
                    return new SudokuStatus(true,
                        `Deletion Lv.3 (row ${i}): cell(${i}, ${j})=${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};


const _solve_deletion_column_Lv3 = (sudoku) => {
    for(let n=1; n<=9; n++){
        for(let j=1; j<=9; j++){
            if(sudoku.countCandidateInColumn(j, n)==1){
                const i = sudoku.getN_ListInColumn(j, n)[0];
                if(sudoku.getNumber(i, j)==0){
                    // deletion
                    sudoku.setNumber(i, j, n);
                    return new SudokuStatus(true,
                        `Deletion Lv.3 (column ${j}): cell(${i}, ${j})=${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};



/////////////////////////////////////////////////


const __limit_block_line = (sudoku)=>{
    for(let n=1; n<=9; n++){
        for(let block_i=1; block_i<=3; block_i++){
            for(let block_j=1; block_j<=3; block_j++){
            
                const pos = sudoku.getN_ListInBlock(block_i, block_j, n);
                let count = pos.length;

                if(count!=2 && count!=3){
                    continue;
                }
                // count=2 or count=3 from here.

                if(pos[0][0] == pos[1][0]){
                    if(count==3 && pos[0][0]!=pos[2][0]){
                        continue;
                    }

                    const row = (block_i-1)*3 + pos[0][0];
                    const i = pos[0][0];

                    if(sudoku.countCandidateInRow(row, n)>count){
                        for(let u=1; u<=9; u++){
                            sudoku.deleteCandidate(row, u, n);
                        }
                        for(let u=0; u<count; u++){
                            sudoku.setCandidate_blockBased(block_i, block_j, pos[u][0], pos[u][1], n);
                        }
                        return new SudokuStatus(true, 
                            `Limitation : block(${block_i}, ${block_j}) -> row ${row} n: ${n}`,
                            4, true, sudoku
                        );
                    }
                }

                if(pos[0][1] == pos[1][1]){
                    if(count==3 && pos[0][1]!=pos[2][1]){
                        continue;
                    }

                    const column = (block_j-1)*3 + pos[0][1];
                    const j = pos[0][1];

                    if(sudoku.countCandidateInColumn(column, n)>count){
                        for(let u=1; u<=9; u++){
                            sudoku.deleteCandidate(u, column, n);
                        }
                        for(let u=0; u<count; u++){
                            sudoku.setCandidate_blockBased(block_i, block_j, pos[u][0], pos[u][1], n);
                        }
                        return new SudokuStatus(true, 
                            `Limitation : block(${block_i}, ${block_j}) -> column ${column} n: ${n}`,
                            4, true, sudoku
                        );
                    }
                }
            }
        }
    }
    return new SudokuStatus(false);
};



const __limit_row_block = (sudoku)=>{
    for(let n=1; n<=9; n++){
        for(let i=1; i<=9; i++){
            const num_n_cand_row = sudoku.countCandidateInRow(i, n);
            if(num_n_cand_row!=2 && num_n_cand_row!=3){
                continue;
            }
            // num_n_cand_row=2 or num_n_cand_row=3 from here.
            
            const pos = sudoku.getN_ListInRow(i, n);
            const pos_block = pos.map(x=>Math.floor((x-1)/3)+1);

            if(pos_block.every(e=>e===pos_block[0])){
                // pos が全て同じブロックの場合
                const block_i = Math.floor((i-1)/3)+1;
                const block_j = pos_block[0];
                const num_n_cand_block = sudoku.countCandidateInBlock(block_i, block_j, n);

                if(num_n_cand_block > num_n_cand_row){
                    // 消去可能な候補がある場合
                    for(let u of [1,2,3]){
                        for(let v of [1,2,3]){
                            sudoku.deleteCandidate_blockBased(block_i, block_j, u, v, n);
                        }
                    }
                    for(let j of pos){
                        sudoku.setCandidate(i, j, n)
                    }
                    return new SudokuStatus(true, 
                        `Limitation : row(${i}) -> block(${block_i}, ${block_j})  n: ${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};



const __limit_column_block = (sudoku)=>{
    for(let n=1; n<=9; n++){
        for(let j=1; j<=9; j++){
            const num_n_cand_column = sudoku.countCandidateInColumn(j, n);
            if(num_n_cand_column!=2 && num_n_cand_column!=3){
                continue;
            }
            // num_n_cand_column=2 or num_n_cand_column=3 from here.
            
            const pos = sudoku.getN_ListInColumn(j, n);
            const pos_block = pos.map(x=>Math.floor((x-1)/3)+1);

            if(pos_block.every(e=>e===pos_block[0])){
                // pos が全て同じブロックの場合
                const block_i = pos_block[0];
                const block_j = Math.floor((j-1)/3)+1;
                const num_n_cand_block = sudoku.countCandidateInBlock(block_i, block_j, n);

                if(num_n_cand_block > num_n_cand_column){
                    // 消去可能な候補がある場合
                    for(let u of [1,2,3]){
                        for(let v of [1,2,3]){
                            sudoku.deleteCandidate_blockBased(block_i, block_j, u, v, n);
                        }
                    }
                    for(let i of pos){
                        sudoku.setCandidate(i, j, n)
                    }
                    return new SudokuStatus(true, 
                        `Limitation : column(${j}) -> block(${block_i}, ${block_j})  n: ${n}`,
                        4, true, sudoku
                    );
                }
            }
        }
    }
    return new SudokuStatus(false);
};

////////////////////////////////////////////////////

// 2国同盟 ver1
const _limit_row_ver1 = (sudoku, num_countries=2)=>{

    for(let i=1; i<=9; i++){
        const n_lists = [];

        for(let j=1; j<=9; j++){
            const n_list = sudoku.getN_ListInCell(i, j);
            n_lists.push(n_list);
        }
        
        const result = _limit_helper_func_ver1(n_lists, num_countries);

        if(result.index.length > 0){
            // 2国同盟の成立
            const index = result.index;
            const candidates = result.candidates;
            
            let message = `2国同盟 ver1 (row ${i}): `;
            for(let e of index){
                message += `cell(${i},${e}) `
            }
            message += ` = {${candidates}}`;
            message += `\n`;
            LOOP_I:
            for(let j=1; j<=9; j++){
                for(let e of index){
                    if(e==j){
                        continue LOOP_I;
                    }
                }
                for(let n of candidates){
                    sudoku.deleteCandidate(i, j, n);
                }
            }

            return new SudokuStatus(true, message,
                4, true, sudoku);
        }
    
    }
    
    
    return new SudokuStatus(false);
};


// 2国同盟 ver1
const _limit_column_ver1 = (sudoku, num_countries=2)=>{

    for(let j=1; j<=9; j++){
        const n_lists = [];

        for(let i=1; i<=9; i++){
            const n_list = sudoku.getN_ListInCell(i, j);
            n_lists.push(n_list);
        }
        
        const result = _limit_helper_func_ver1(n_lists, num_countries);

        if(result.index.length > 0){
            // 2国同盟の成立
            const index = result.index;
            const candidates = result.candidates;
            
            let message = `2国同盟 ver1 (column ${j}): `;
            for(let e of index){
                message += `cell(${e},${j}) `
            }
            message += ` = {${candidates}}`;
            message += `\n`;
            LOOP_I:
            for(let i=1; i<=9; i++){
                for(let e of index){
                    if(e==i){
                        continue LOOP_I;
                    }
                }
                for(let n of candidates){
                    sudoku.deleteCandidate(i, j, n);
                }
            }

            return new SudokuStatus(true, message,
                4, true, sudoku);
        }
    
    }
    
    
    return new SudokuStatus(false);
};


// 2国同盟 ver1
const _limit_block_ver1 = (sudoku, num_countries=2)=>{

    for(const block_i of [1,2,3]){
        for(const block_j of [1,2,3]){
            const n_lists = [];

            for(let i of [1,2,3]){
                for(let j of [1,2,3]){
                    const n_list = sudoku.getN_ListInCell((block_i-1)*3+i, (block_j-1)*3+j);
                    n_lists.push(n_list);
                }
            }
            
            const result = _limit_helper_func_ver1(n_lists, num_countries);

            if(result.index.length > 0){
                // 2国同盟の成立
                const index = [];
                for(let e of result.index){
                    const i = Math.floor((e-1)/3) + 1;
                    const j = (e-1)%3 + 1;
                    index.push([i, j]);
                }
                const candidates = result.candidates;
                
                let message = `2国同盟 ver1 (block(${block_i},${block_j})): `;
                for(let e of index){
                    const i = e[0];
                    const j = e[1];
                    message += `cell(${(block_i-1)*3+i},${(block_j-1)*3+j}) `
                }
                message += ` = {${candidates}}`;
                message += `\n`;
                for(let i of [1,2,3]){
                    LOOP_J:
                    for(let j of [1,2,3]){
                        for(let e of index){
                            if(e[0]==i && e[1]==j){
                                continue LOOP_J;
                            }
                        }
                        for(let n of candidates){
                            sudoku.deleteCandidate_blockBased(block_i, block_j, i, j, n);
                        }
                    }
                }

                return new SudokuStatus(true, message,
                    4, true, sudoku);
            }
        }
    }
    
    
    return new SudokuStatus(false);
};


// 2国同盟 ver1
// arg: list of n_list
// example of n_lists: [[2,4], [8], [2,4], [9], [6,7], [3], [1,2,4,6],[1,6,7],[5]]
const _limit_helper_func_ver1 = (n_lists, num_countries=2)=>{
    const list = [];
    const index = [];
    const same_index = [];
    const same_count = [];

    for(let x=0; x<9; x++){
        if(n_lists[x].length == num_countries){
            list.push(n_lists[x]);
            index.push(x+1);
            same_count.push(0);
            same_index.push([]);
        }
    }

    for(let x=0; x<list.length; x++){
        for(let y=0; y<list.length; y++){
            if(isSameArray(list[x], list[y]) == true){
                same_count[x] ++ ;
                same_index[x].push(index[y]);
            }
        }
    }
    
    for(let x=0; x<list.length; x++){
        if(same_count[x]==num_countries){
            // 2国同盟の候補を発見
            // 2国同盟の候補の index : index[x]
            // 2国同盟の候補の数字： list[x]

            // 候補が消去可能なセルがあるかを確認する
            
            const i = index[x];
            const n_list = list[x];

            for(const n of n_list){
                let count = 0;
                for(let y=0; y<9; y++){
                    if(n_lists[y].indexOf(n)>-1){
                        count++;
                    }
                    if(count>num_countries){
                        // 2国同盟で、候補が消去可能なセルがある。
                        return {index: same_index[x], candidates: n_list};
                    }
                }
            }
        }
    }

    return {index: [], candidates: []};
};

const isSameArray = (arr1, arr2)=>{
    for(let i=0; i<arr1.length; i++){
        if(arr1[i]!=arr2[i]){
            return false;
        }
    }
    return true;
};

const test_list = [[2,4], [8], [2,4], [9], [6,7], [3], [1,2,4,6],[1,6,7],[5]]



////////////////////////////////////////////////////////////////////


// 2国同盟 ver2
const _limit_block_ver2 = (sudoku, num_countries=2)=>{

    for(const block_i of [1,2,3]){
        for(const block_j of [1,2,3]){
            const n_lists = [];

            for(let n=1; n<=9; n++){
                const n_list = [];
                let count = 1;
                for(let i of [1,2,3]){
                    for(let j of [1,2,3]){
                        if(sudoku.getCandidate_blockBased(block_i, block_j, i, j, n)==true){
                            n_list.push(count);
                        }
                        count ++;
                    }
                }
                n_lists.push(n_list);
            }
            
            const result = _limit_helper_func_ver1(n_lists, num_countries);

            if(result.index.length > 0){
                // 2国同盟の成立
                const index = [];
                for(let e of result.candidates){
                    const i = Math.floor((e-1)/3) + 1;
                    const j = (e-1)%3 + 1;
                    index.push([i, j]);
                }
                const candidates = result.index;

                let message = `2国同盟 ver2 (block(${block_i},${block_j})): `;
                for(let e of index){
                    const i = e[0];
                    const j = e[1];
                    message += `cell(${(block_i-1)*3+i},${(block_j-1)*3+j}) `
                }
                message += ` = {${candidates}}`;
                message += `\n`;
                for(let [i, j] of index){
                    for(let n=1; n<=9; n++){
                        if(candidates.indexOf(n)>-1){
                            continue;
                        }
                        sudoku.deleteCandidate_blockBased(block_i, block_j, i, j, n);
                    }
                }
                return new SudokuStatus(true, message,
                    4, true, sudoku);
            }
        }
    }
    
    
    return new SudokuStatus(false);
};


// 2国同盟 ver2
const _limit_row_ver2 = (sudoku, num_countries=2)=>{

    for(let i=1; i<=9; i++){
        const n_lists = [];

        for(let n=1; n<=9; n++){
            const n_list = [];
            for(let j=1; j<=9; j++){
                if(sudoku.getCandidate(i, j, n)==true){
                    n_list.push(j);
                }
            }
            n_lists.push(n_list);
        }
        
        const result = _limit_helper_func_ver1(n_lists, num_countries);

        if(result.index.length > 0){
            // 2国同盟の成立
            const index = result.candidates;
            const candidates = result.index;

            let message = `2国同盟 ver2 (column ${i}): `;
            for(let j of index){
                message += `cell(${i},${j}) `
            }
            message += ` = {${candidates}}`;
            message += `\n`;
            for(let j of index){
                for(let n=1; n<=9; n++){
                    if(candidates.indexOf(n)>-1){
                        continue;
                    }
                    sudoku.deleteCandidate(i, j, n);
                }
            }
            return new SudokuStatus(true, message,
                4, true, sudoku);
        }
    }
    
    
    return new SudokuStatus(false);
};


// 2国同盟 ver2
const _limit_column_ver2 = (sudoku, num_countries=2)=>{

    for(let j=1; j<=9; j++){
        const n_lists = [];

        for(let n=1; n<=9; n++){
            const n_list = [];
            for(let i=1; i<=9; i++){
                if(sudoku.getCandidate(i, j, n)==true){
                    n_list.push(i);
                }
            }
            n_lists.push(n_list);
        }
        
        const result = _limit_helper_func_ver1(n_lists, num_countries);

        if(result.index.length > 0){
            // 2国同盟の成立
            const index = result.candidates;
            const candidates = result.index;

            let message = `2国同盟 ver2 (row ${j}): `;
            for(let i of index){
                message += `cell(${i},${j}) `
            }
            message += ` = {${candidates}}`;
            message += `\n`;
            for(let i of index){
                for(let n=1; n<=9; n++){
                    if(candidates.indexOf(n)>-1){
                        continue;
                    }
                    sudoku.deleteCandidate(i, j, n);
                }
            }
            return new SudokuStatus(true, message,
                4, true, sudoku);
        }
    }
    
    
    return new SudokuStatus(false);
};