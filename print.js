

// 
const print = (message, level=4)=>{
    let bg_color;
    switch(level){
        case 1: bg_color='rgb(255, 0, 255)'; break;
        case 2: bg_color='rgb(220, 100, 225)'; break;
        case 3: bg_color='rgb(255, 255, 0)'; break;
        case 4: bg_color='rgb(255, 255, 225)'; break;

        default: bg_color='rgb(255, 255, 255)'; break;
    }
    const div = document.createElement('div');
    div.innerText = message;
    div.style.background = bg_color;
    document.getElementById('steps').appendChild(div);
};