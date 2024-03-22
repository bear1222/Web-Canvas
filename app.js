let canvas = document.getElementById('paper');
//console.log(canvas);
let ctx = canvas.getContext('2d');
let thicknessSelector = document.getElementById('thickness');
let colorSelector = document.getElementById('color');
let selectedMode = "brush";


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

cursor = {x: 0, y: 0};
start = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
});

brush = {
    start: function(){
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        console.log(cursor);
        canvas.addEventListener('mousemove', this.move);
    },
    move: function(){
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
    },
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
    }
};

erase = {
    start: function(){
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
    }
};

createRect = {
    start: function(){
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);

    }, 
    move: function(){
        // add preview
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        ctx.rect(start.x, start.y, cursor.x - start.x , cursor.y - start.y);
        console.log(start, cursor);
        ctx.stroke();
    }

};

createCircle = {
    start: function(){
        ctx.globalCompositeOperation = "source-over";
        ctx.moveTo(cursor.x, cursor.y);
        ctx.beginPath();
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);

    }, 
    move: function(){
        // add preview
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        const nowx = cursor.x;
        const nowy = cursor.y;
        const x = (nowx + start.x) / 2;
        const y = (nowy + start.y) / 2;
        // const r = min(nowx - x, nowy - y);
        const r = Math.abs(nowx - x);
        console.log(x, y, r);
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        console.log(start, cursor);
        ctx.stroke();
    }
};

canvas.addEventListener('mousedown', () => {
    const color = getColor();
    ctx.strokeStyle = color;
    ctx.lineWidth = thicknessSelector.value;
    console.log(color, ctx.lineWidth);

    switch(selectedMode){
        case 'brush':
            brush.start();
            break;
        case 'erase':
            erase.start();
            break;
        case 'rect':
            createRect.start();
            break;
        case 'circle':
            createCircle.start();
            break;

        default:
            console.log('selectedMode error');
    }
});
canvas.addEventListener('mouseup', () => {
    switch(selectedMode){
        case 'brush':
            brush.end();
            break;
        case 'erase':
            erase.end();
            break;
        case 'rect':
            createRect.end();
            break;
        case 'circle':
            createCircle.end();
            break;

        default:
            console.log('selectedMode error');
    }
});

////////
selectMode = (mode) => {
    console.log(mode);
    selectedMode = mode;
};


    // switch(selectedMode){
    //     case 'brush':
    //         break;
    //     case 'erase':
    //         break;
    //     case 'rect':
    //         break;

    //     default:
    //         console.log('selectedMode error');
    // }