let canvas = document.getElementById('paper');
//console.log(canvas);
let ctx = canvas.getContext('2d');
let thicknessSelector = document.getElementById('thickness');
let colorSelector = document.getElementById('color');
let selectedMode = "font";

let savedCanvas = document.getElementById('savedpaper');
let savedCtx = savedCanvas.getContext('2d');

cursor = {x: 0, y: 0};
start = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
});

////////// not finish
function makeRecord(type, record){ 
    this.type = type;
    this.record = record;
}

var points = []; 
//////////

brush = {
    start: function(){
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        console.log(cursor);
        canvas.addEventListener('mousemove', this.move);
        points = [];
        points.push({x: cursor.x, y: cursor.y});
    },
    move: function(){
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
        points.push({x: cursor.x, y: cursor.y});
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
        savedCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.rect(start.x, start.y, cursor.x - start.x, cursor.y - start.y);
        ctx.stroke();
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

};

createCircle = {
    start: function(){
        savedCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        const nowx = cursor.x;
        const nowy = cursor.y;
        const x = (nowx + start.x) / 2;
        const y = (nowy + start.y) / 2;
        const r = Math.min(Math.abs(nowx - x), Math.abs(nowy - y));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

// change to triangle
createTriangle = {
    start: function(){
        savedCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        const nowx = cursor.x;
        const nowy = cursor.y;
        const x = (nowx + start.x) / 2;
        const y = (nowy + start.y) / 2;
        const r = Math.min(Math.abs(nowx - x), Math.abs(nowy - y));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

var hasInput = 0;
font = {
    start: function(){
        if(hasInput) return;
        ctx.globalCompositeOperation = "source-over";
        const x = cursor.x;
        const y = cursor.y;

        let inputVal = "";
        let inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.style.position = 'absolute';
        inputField.style.left = x + 'px';
        inputField.style.top  = y + 'px';
        inputField.onkeydown = (e) => {
            const key = e.key;
            console.log(key);
            if(key === 'Enter'){
                inputVal = inputField.value;
                document.body.removeChild(inputField);
                const font_family = document.getElementById('font-family').value;
                const font_size = document.getElementById('font-size').value;
                ctx.font = `${font_size}px ${font_family}`;
                const color = getColor();
                ctx.fillStyle = color;
                ctx.fillText(inputVal, x, y);
                hasInput = 0;
            }
        } 
        document.body.appendChild(inputField);
        setTimeout(() => inputField.focus(), 0);
        // inputField.focus();
        hasInput = 1;

    },
    end: function(){
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
        case 'triangle':
            createTriangle.start();
            break;
        case 'font':
            font.start();
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
        case 'triangle':
            createTriangle.end();
            break;
        case 'font':
            font.end();
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

resetAll = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}