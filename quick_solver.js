


class QuickSudoku {
    constructor(depth=0){
        //this.numbers = new Array(81).fill(0);
        this.numbers = new Uint16Array(81).fill(0);

        // __hasContradiction
        // -1:  not checked
        // 1:   this sudoku contains contradiction
        // 0:   contradiction not found
        this.__hasContradiction = -1;

        // __isSolved
        // -1:  not checked
        // 1:   this sudoku is solved completely
        // 0:   not solved yet
        this.__isSolved = -1;

        this.no_unique_solution = false;
        this.no_solution = false;


        this.candidates = new Uint16Array(81).fill(0b111111111);
        this.candidates_row = new Uint16Array(81).fill(0b111111111);
        this.candidates_column = new Uint16Array(81).fill(0b111111111);
        this.candidates_block = new Uint16Array(81).fill(0b111111111);

        if(depth==0){
            this.shadow = new QuickSudoku(1);
        }
    }

    //  getNumber
    //  Input:
    //      1 <= i, j <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      None
    getNumber(i, j){
        return this.numbers[(i-1)*9 + (j-1)];
    }

    //  getNumber_blockBased
    //  Input:
    //      1 <= i, j, i_block, j_block <= 3
    //  Results:
    //      None
    //  Side Effects:
    //      None
    getNumber_blockBased(i_block, j_block, i, j){
        return this.getNumber((i_block-1)*3+i, (j_block-1)*3+j);
    }

    //  setNumber
    //  Input:
    //      1 <= i, j, n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.numbers, this.candidates
    setNumber(i, j, n, depth=0){
        this.numbers[(i-1)*9 + (j-1)] = n;

        // i 行と j 列 の候補を削除
        for(let k=1; k<=9; k++){
            this.deleteCandidate(i, k, n);
            this.deleteCandidate(k, j, n);
        }

        // cell(i, j) のブロック内の候補を削除
        const i_block = Math.floor((i-1)/3) + 1;
        const j_block = Math.floor((j-1)/3) + 1;
        for(let u=1; u<=3; u++){
            for(let v=1; v<=3; v++){
                this.deleteCandidate_blockBased(i_block, j_block, u, v, n);
            }
        }

        // cell(i, j) の候補を削除
        for(let n=1; n<=9; n++){
            this.deleteCandidate(i, j, n);
        }

        // 最後に cell(i, j) に n の候補を台に優
        this.setCandidate(i, j, n);

        if(depth==0){
            this.shadow.setNumber(i, j, n, 1);
        }
        
    }

    //  setNumber_blockBased
    //  Input:
    //      1 <= i, j, i_block, j_block <= 3
    //      1 <= n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.numbers, this.candidates
    setNumber_blockBased(i_block, j_block, i, j, n){
        this.setNumber((i_block-1)*3+i, (j_block-1)*3+j, n);
    }


    //  deleteCandidate
    //  Input:
    //      1 <= i, j, n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.candidates
    deleteCandidate(i, j, n){
        const I = i-1;
        const J = j-1;
        const N = n-1;

        const n_bit_mask = 0b111111111 ^ (1<<N);
        this.candidates[I*9 + J] &= n_bit_mask;

        const i_bit_mask = 0b111111111 ^ (1<<I);
        const j_bit_mask = 0b111111111 ^ (1<<J);
        this.candidates_row[N*9 + I] &= j_bit_mask;
        this.candidates_column[N*9 + J] &= i_bit_mask;

        const block_I = Math.floor(I/3);
        const block_J = Math.floor(J/3);
        const U = I%3;
        const V = J%3;
        const block_bit_mask = 0b111111111 ^ (1<<((U*3) + V));
        this.candidates_block[N*9 + (block_I*3+block_J)] &= block_bit_mask;
    }


    //  deleteCandidate_blockBased
    //  Input:
    //      1 <= i, j, i_block, j_block <= 3
    //      1 <= n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.candidates
    deleteCandidate_blockBased(i_block, j_block, i, j, n){
        this.deleteCandidate((i_block-1)*3+i, (j_block-1)*3+j, n);
    }

    //  setCandidate
    //  Input:
    //      1 <= i, j, n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.candidates
    setCandidate(i, j, n){
        const I = i-1;
        const J = j-1;
        const N = n-1;

        const n_bit = 1<<N;
        this.candidates[I*9 + J] |= n_bit;

        const i_bit = 1<<I;
        const j_bit = 1<<J;
        this.candidates_row[N*9 + I] |= j_bit;
        this.candidates_column[N*9 + J] |= i_bit;

        const block_I = Math.floor(I/3);
        const block_J = Math.floor(J/3);
        const U = I%3;
        const V = J%3;
        const block_bit = 1 << ((U*3) + V);
        this.candidates_block[N*9 + (block_I*3+block_J)] |= block_bit;
    }

    //  setCandidate_blockBased
    //  Input:
    //      1 <= i, j, i_block, j_block <= 3
    //      1 <= n <= 9
    //  Results:
    //      None
    //  Side Effects:
    //      change this.candidates
    setCandidate_blockBased(i_block, j_block, i, j, n){
        this.setCandidate((i_block-1)*3+i, (j_block-1)*3+j, n);
    }

    //  getCandidate
    //  Input:
    //      1 <= i, j, n <= 9
    //  Results:
    //      true if n can be fit in cell(i, j)
    //      otherwise false
    //  Side Effects:
    //      None:
    getCandidate(i, j, n){
        const n_bit = 1<<(n-1);
        if((this.candidates[(i-1)*9 + (j-1)] & n_bit) > 0){
            return true;
        }else{
            return false;
        }
    }

    //  getCandidate_blockBased
    //  Input:
    //      1 <= i, j, i_block, j_block <= 3
    //      1 <= n <= 9
    //  Results:
    //      true if n can be fit in cell(i_block, j_block, i, j)
    //      otherwise false
    //  Side Effects:
    //      None:
    getCandidate_blockBased(i_block, j_block, i, j, n){
        return this.getCandidate((i_block-1)*3+i, (j_block-1)*3+j, n);
    }

    //  getCandidateInArray
    //  Input:
    //      1 <= i, j <= 9
    //  Results:
    //      candidates of cell(i,j) in array form.
    //      Example: [2, 4, 9]
    //  Side Effects:
    //      None:
    getCandidateInArray(i, j){
        const result = [];
        for(let n=1; n<=9; n++){
            if(this.getCandidate(i, j, n)==true){
                result.push(n);
            }
        }
        return result;
    }

    //  clone
    //  Input:
    //      None
    //  Results:
    //      Clone of this instance
    //  Side Effects:
    //      None:
    clone(depth=0){
        const sudoku = new QuickSudoku();
        sudoku.numbers = new Array(...this.numbers);

        sudoku.candidates = new Array(...this.candidates);
        sudoku.candidates_row = new Array(...this.candidates_row);
        sudoku.candidates_column = new Array(...this.candidates_column);
        sudoku.candidates_block = new Array(...this.candidates_block);

        if(depth==0){
            sudoku.shadow = this.shadow.clone(1);
        }
        
        this.__hasContradiction = -1;
        this.__isSolved = -1;
        this.no_unique_solution = false;
        this.no_solution = false;

        return sudoku;
    }

    //  isSolved
    //  Input:
    //      None
    //  Results:
    //      ture if this sudoku is solved
    //      otherwise false
    //  Side Effects:
    //      None:
    isSolved(){
        if(this.__isSolved>-1){
            // 既にこの関数は実行されているので、その実行結果を返す
            switch(this.__isSolved){
                case 0: return false;
                case 1: return true;
                default: throw "We should not reach here!";
            }
        }
        
        for(let i=0; i<81; i++){
            if(this.numbers[i]==0){
                this.__isSolved = 0;
                return false;
            }
        }
        this.__isSolved = 1;
        return true;
    }


    //  countCandidateInCell
    //  Input:
    //      1 <= i,j <= 9
    //  Results:
    //      number of candidates in cell(i, j)
    //  Side Effects:
    //      None:
    /*countCandidateInCell(i, j){
        let count = 0;
        for(let n=1; n<=9; n++){
            count += this.getCandidate(i, j, n);
        }
        return count;
    }*/


    //  countCandidateInCell
    //  Input:
    //      1 <= i,j <= 9
    //  Results:
    //      number of candidates in cell(i, j)
    //  Side Effects:
    //      None:
    countCandidateInCell(i, j){
        let result = this.candidates[(i-1)*9 + (j-1)];
        result = (result & 0b0101010101) + ((result>>1) & 0b0101010101);
        result = (result & 0b1100110011) + ((result>>2) & 0b1100110011);
        result = (result & 0b1100001111) + ((result>>4) & 0b1100001111);
        result = (result & 0b0011111111) + ((result>>8) & 0b0011111111);
        return result;
    }


    //  countCandidateInRow
    //  Input:
    //      1 <= i,n <= 9
    //  Results:
    //      number of candidates in row i
    //  Side Effects:
    //      None:
    /*countCandidateInRow(i, n){
        let count = 0;
        for(let j=1; j<=9; j++){
            count += this.getCandidate(i, j, n);
        }
        return count;
    }*/


    //  __countCandidateInRow
    //  Input:
    //      1 <= i,n <= 9
    //  Results:
    //      number of candidates in row i
    //  Side Effects:
    //      None:
    countCandidateInRow(i, n){
        let result = this.candidates_row[(n-1)*9+(i-1)];
        result = (result & 0b0101010101) + ((result>>1) & 0b0101010101);
        result = (result & 0b1100110011) + ((result>>2) & 0b1100110011);
        result = (result & 0b1100001111) + ((result>>4) & 0b1100001111);
        result = (result & 0b0011111111) + ((result>>8) & 0b0011111111);
        return result;
    }


    //  countCandidateInColumn
    //  Input:
    //      1 <= j,n <= 9
    //  Results:
    //      number of candidates in column i
    //  Side Effects:
    //      None:
    /*countCandidateInColumn(j, n){
        let count = 0;
        for(let i=1; i<=9; i++){
            count += this.getCandidate(i, j, n);
        }
        return count;
    }*/


    //  countCandidateInColumn
    //  Input:
    //      1 <= j,n <= 9
    //  Results:
    //      number of candidates in column i
    //  Side Effects:
    //      None:
    countCandidateInColumn(j, n){
        let result = this.candidates_column[(n-1)*9+(j-1)];
        result = (result & 0b0101010101) + ((result>>1) & 0b0101010101);
        result = (result & 0b1100110011) + ((result>>2) & 0b1100110011);
        result = (result & 0b1100001111) + ((result>>4) & 0b1100001111);
        result = (result & 0b0011111111) + ((result>>8) & 0b0011111111);
        return result;
    }


    //  countCandidateInBlock
    //  Input:
    //      1 <= n <= 9
    //      1 <= i_block, j_block <= 3
    //  Results:
    //      number of candidates in block(i_block, j_block)
    //  Side Effects:
    //      None:
    countCandidateInBlock(block_i, block_j, n){
        let result = this.candidates_block[(n-1)*9 + (block_i-1)*3 + (block_j-1)];
        result = (result & 0b0101010101) + ((result>>1) & 0b0101010101);
        result = (result & 0b1100110011) + ((result>>2) & 0b1100110011);
        result = (result & 0b1100001111) + ((result>>4) & 0b1100001111);
        result = (result & 0b0011111111) + ((result>>8) & 0b0011111111);
        return result;
    }


    //  countNumbersInRow
    //  Input:
    //      1 <= i,n <= 9
    //  Results:
    //      number of candidates in row i
    //  Side Effects:
    //      None:
    countNumbersInRow(i){
        let count = 0;
        for(let j=1; j<=9; j++){
            if(this.getNumber(i, j)>0){
                count ++;
            }
        }
        return count;
    }


    //  countNumbersInColumn
    //  Input:
    //      1 <= j,n <= 9
    //  Results:
    //      number of candidates in column i
    //  Side Effects:
    //      None:
    countNumbersInColumn(j){
        let count = 0;
        for(let i=1; i<=9; i++){
            if(this.getNumber(i, j)>0){
                count ++;
            }
        }
        return count;
    }


    //  countNumbersInBlock
    //  Input:
    //      1 <= n <= 9
    //      1 <= i_block, j_block <= 3
    //  Results:
    //      number of candidates in block(i_block, j_block)
    //  Side Effects:
    //      None:
    countNumbersInBlock(i_block, j_block){
        let count = 0;
        for(let i=1; i<=3; i++){
            for(let j=1; j<=3; j++){
                if(this.getNumber_blockBased(i_block, j_block, i, j)>0){
                    count ++;
                }
            }
        }
        return count;
    }

    // N_List とは
    // 例えば1行目が次の状態のとき
    // 650 103 409
    // getN_ListInRow(1, 2) = [3, 5]
    // getN_ListInRow(1, 6) = [1]
    // 即ちi行目でnが入る可能性のある列。
    
    //  getN_ListInRow
    //  Input:
    //      1 <= i,n <= 9
    //  Results:
    //      index in which n can be fit
    //  Side Effects:
    //      None:
    getN_ListInRow(i, n){
        let n_list = [];
        for(let j=1; j<=9; j++){
            if(this.getCandidate(i, j, n)==true){
                n_list.push(j);
            }
        }
        return n_list;
    }

    
    //  getN_ListInColumn
    //  Input:
    //      1 <= j, n <= 9
    //  Results:
    //      index in which n can be fit
    //  Side Effects:
    //      None:
    getN_ListInColumn(j, n){
        let n_list = [];
        for(let i=1; i<=9; i++){
            if(this.getCandidate(i, j, n)==true){
                n_list.push(i);
            }
        }
        return n_list;
    }

    
    //  getN_ListInCell
    //  Input:
    //      1 <= i, j <= 9
    //  Results:
    //      index in which n can be fit
    //  Side Effects:
    //      None:
    getN_ListInCell(i, j){
        let n_list = [];
        for(let n=1; n<=9; n++){
            if(this.getCandidate(i, j, n)==true){
                n_list.push(n);
            }
        }
        return n_list;
    }

    
    //  getN_ListInBlock
    //  Input:
    //      1 <= i_block, j_block <= 3
    //  Results:
    //      index in which n can be fit
    //  Side Effects:
    //      None:
    getN_ListInBlock(i_block, j_block, n){
        let n_list = [];
        for(let i=1; i<=3; i++){
            for(let j=1; j<=3; j++){
                if(this.getCandidate_blockBased(i_block, j_block, i, j, n)==true){
                    n_list.push([i, j]);
                }
            }
        }
        return n_list;
    }

    //  hasContradiction
    //  Input:
    //      None
    //  Results:
    //      ture if this sudoku is solved
    //      otherwise false
    //  Side Effects:
    //      None:
    hasContradiction(print_debug_log=true){
        // check contradiction in cell
        const i0 = this.candidates.indexOf(0);
        if(i0 > -1){
            const i = Math.floor(i0/9) + 1;
            const j = i0%9 + 1;
            return new SudokuStatus(true, 
                `Contradiction (cell(${i}, ${j})): No numbers fit in this cell.`, 
                2, print_debug_log
            );
        }
        
        // check contradiction in row
        const i1 = this.candidates_row.indexOf(0);
        if(i1 > -1){
            const n = Math.floor(i1/9) + 1;
            const i = i1%9 + 1;
            return new SudokuStatus(true, 
                `Contradiction (row ${i}): ${n} cannot be fit in this row.`,
                2, print_debug_log
            );
        }
        
        // check contradiction in column
        const i2 = this.candidates_column.indexOf(0);
        if(i2 > -1){
            const n = Math.floor(i2/9) + 1;
            const j = i2%9 + 1;
            return new SudokuStatus(true, 
                `Contradiction (row ${j}): ${n} cannot be fit in this row.`,
                2, print_debug_log
            );
        }
        
        // check contradiction in block
        const i3 = this.candidates_block.indexOf(0);
        if(i3 > -1){
            const n = Math.floor(i3/9) + 1;
            const temp = i3%9;
            const block_i = Math.floor(temp/3) + 1;
            const block_j = temp%3 + 1;
            return new SudokuStatus(true, 
                `Contradiction (block(${block_i}, ${block_j})): ${n} cannot be fit in this block.`, 
                2, print_debug_log
            );
        }
        
        // no contradiction found
        this.__hasContradiction = 0;
        return new SudokuStatus(false);
    }

    //  simpleDeletion
    //  Input:
    //      None
    //  Results:
    //      None
    //  Side Effects:
    //      conduct deletion method (not immutable)
    simpleDeletion(){
        // row
        for(let i=1; i<=9; i++){
            for(let n=1; n<=9; n++){
                const n_list = this.getN_ListInRow(i, n);
                if(n_list.length==1 && this.getNumber(i, n_list[0])==0){
                    this.setNumber(i, n_list[0], n);
                    return new SudokuStatus(true);
                }
            }
        }

        // column
        for(let j=1; j<=9; j++){
            for(let n=1; n<=9; n++){
                const n_list = this.getN_ListInColumn(j, n);
                if(n_list.length==1 && this.getNumber(n_list[0], j)==0){
                    this.setNumber(n_list[0], j, n);
                    return new SudokuStatus(true);
                }
            }
        }

        // cell
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j)>0) continue;
                const n_list = this.getN_ListInCell(i, j);
                if(n_list.length==1){
                    this.setNumber(i, j, n_list[0]);
                    return new SudokuStatus(true);
                }
            }
        }

        // block
        for(let i_block=1; i_block<=3; i_block++){
            for(let j_block=1; j_block<=3; j_block++){
                for(let n=1; n<=9; n++){
                    const n_list = this.getN_ListInCell(i_block, j_block);
                    if(n_list.length==1 && this.getNumber_blockBased(i_block, j_block, n_list[0][0], n_list[0][1])==0){
                        this.setNumber_blockBased(n_list[0][0], n_list[0][1], i, j);
                        return new SudokuStatus(true);
                    }
                }
            }
        }
        
        return new SudokuStatus(false);
    }


    //  test
    //  Input:
    //      None
    //  Results:
    //      Sudoku instance
    //  Side Effects:
    //      None:
    test(){

        const __quickSolver = (sudoku) =>{
            while(sudoku.simpleDeletion().status){}
            for(let i=1; i<=9; i++){
                for(let j=1; j<=9; j++){
                    if(sudoku.getNumber(i, j)==0){
                        if(sudoku.hasContradiction(false).status==true){
                            return sudoku;
                        }
                        const candidates = sudoku.getCandidateInArray(i, j);
                        if(candidates.length==0){
                            sudoku.__hasContradiction = 1;
                            return sudoku;
                        }
                        let count_contradiction = 0;
                        let count_solved = 0;
                        let n_copy;
                        let solved_sudoku;
                        for(const candidate of candidates){
                            // 試しに代入して解く
                            const sudoku_clone = sudoku.clone();
                            sudoku_clone.setNumber(i, j, candidate);
                            const result = __quickSolver(sudoku_clone);
            
                            if(result.no_unique_solution==true){
                                return result;
                            }

                            if(result.isSolved()==true){
                                return result;
                            }

                            if(result.hasContradiction(false).status==true){
                                sudoku.deleteCandidate(i, j, candidate)
                                count_contradiction ++;
                                continue;
                            }
                        }

                        if(count_solved==1){
                            sudoku.setNumber(i, j, n_copy);
                            continue;
                        }
            
                        if(count_contradiction==candidates.length){
                            sudoku.no_solution = true;
                            sudoku.__hasContradiction = 1;
                            return sudoku;
                        }
                    }
                }
            }
            
            return sudoku;
        };
        
        return __quickSolver(this.clone());
    }


    //  resetCandidate
    //  Input:
    //      None
    //  Results:
    //      None
    //  Side Effects:
    //      All elements of this.candidates will be set to 511
    //      and re-culculate this.candidates
    resetCandidate(){
        this.candidates.fill(0b111111111);
        this.candidates_row.fill(0b111111111);
        this.candidates_column.fill(0b111111111);
        this.candidates_block.fill(0b111111111);

        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j) > 0){
                    this.setNumber(i, j, this.getNumber(i, j));
                }
            }
        }
    }


    //  reset
    //  Input:
    //      None
    //  Results:
    //      None
    //  Side Effects:
    //      All elements of this.candidates will be set to 511
    //      and re-culculate this.candidates
    resetCandidate(){
        this.candidates.fill(0b111111111);
        this.candidates_row.fill(0b111111111);
        this.candidates_column.fill(0b111111111);
        this.candidates_block.fill(0b111111111);

        this.shadow.candidates.fill(0b111111111);
        this.shadow.candidates_row.fill(0b111111111);
        this.shadow.candidates_column.fill(0b111111111);
        this.shadow.candidates_block.fill(0b111111111);

        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j) > 0){
                    this.setNumber(i, j, this.getNumber(i, j));
                }
            }
        }
    }

    //  exportSudokuAsText
    //  Input:
    //      None
    //  Results:
    //      String of length 81
    //  Side Effects:
    //      None
    exportSudokuAsText(){
        let result = "";
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                result += this.getNumber(i, j);
            }
        }
        return result;
    }


    //  importSudokuFromText
    //  Input:
    //      String of 81 length
    //  Results:
    //      None
    //  Side Effects:
    //      this.numbers, this.candidates will be changed as per argment :
    importSudokuFromText(string){
        const arr = string.split("").map(x=>{return parseInt(x)});
        if(arr.length != 81){
            console.error(arr);
            throw `Argment length must be 81. Actual value: ${arr.length}`;
        }

        this.resetCandidate();

        let index = 0;
        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(arr[index]>=1 && arr[index]<=9){
                    this.setNumber(i, j, arr[index]);
                }
                index++;
            }
        }
    }


    //  createCandidateArray
    //  Input:
    //      1 <= n <= 9
    //  Results:
    //      10x10 array
    //  Side Effects:
    //      none
    createCandidateArray(n){
        
        const result = [];
        for(let i=0; i<10; i++){
            const subarray = new Array(10);
            subarray.fill(1);
            result.push(subarray);
        }

        for(let i=1; i<=9; i++){
            for(let j=1; j<=9; j++){
                if(this.getNumber(i, j)==n){
                    // delete column, row
                    for(let k=1; k<=9; k++){
                        result[i][k] = 0;
                        result[k][j] = 0;
                    }

                    // delete block
                    const block_i_offset = Math.floor((i-1)/3)*3;
                    const block_j_offset = Math.floor((j-1)/3)*3;
                    for(let u=1; u<=3; u++){
                        for(let v=1; v<=3; v++){
                            result[block_i_offset+u][block_j_offset+v] = 0;
                        }
                    }
                }

                if(this.getNumber(i, j)>0){
                    result[i][j] = 0;
                }
            }
        }

        return result;
    }


    switchMode(){
        let temp;

        temp = this.candidates;
        this.candidates = this.__candidates;
        this.__candidates = temp;

        temp = this.candidates_row;
        this.candidates_row = this.__candidates_row;
        this.__candidates_row = temp;

        temp = this.candidates_column;
        this.candidates_column = this.__candidates_column;
        this.__candidates_column = temp;

        temp = this.candidates_block;
        this.candidates_block = this.__candidates_block;
        this.__candidates_block = temp;
    }
}



let count_steps = 0;
const sudoku_dummy = new QuickSudoku();

class SudokuStatus {
    constructor(status=false, message="", severity=4, logging=true, sudoku=sudoku_dummy){
        this.status = status;
        this.message = message;
        this.severity = severity;
        

        if(logging === false){
            return;
        }

        if(status===false  || message===""){
            return;
        }
        
        this.sudoku = sudoku.clone();
        sudoku_procedure.push(this)

        //print(message, severity)
        count_steps++;

        return;
    }
};