let canvas = document.getElementById('paper');
//console.log(canvas);
let ctx = canvas.getContext('2d');
let thicknessSelector = document.getElementById('thickness');
let colorSelector = document.getElementById('color');
let selectedMode = "brush";

let savedCanvas = document.getElementById('savedpaper');
let savedCtx = savedCanvas.getContext('2d');

cursor = {x: 0, y: 0};
start = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
});

////////// not finish
function makeRecord(type, points, color, width, font_style, text){ 
    this.type = type;
    this.points = points;
    this.color = color;
    this.width = width;
    this.font_style = font_style;
    this.text = text;
}

var record = {
    records: [],
    now: -1, 
    reset: function(){
        this.now = -1;
        this.records = [];
    }, 
    addRecord: function(rec){
        this.now++;
        if(this.now != this.records.length){
            this.records = this.records.slice(0, this.now);
        }
        this.records.push(rec);
    },
    addBack: function(rec){
        console.log('addBack', rec);
        const type = rec.type;
        const points = rec.points;
        const color = rec.color;
        const width = rec.width;
        const font_size = rec.font_size;
        const font_family = rec.font_family;
        const text = rec.text;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        let x = 0;
        let y = 0;
        switch(type){
            case 'brush':
            case 'tri':
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(element => {
                    ctx.lineTo(element.x, element.y);
                });
                ctx.stroke();
                break;
            case 'erase':
                ctx.globalCompositeOperation = "destination-out";
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(element => {
                    ctx.lineTo(element.x, element.y);
                });
                ctx.stroke();
                break;
            case 'rect':
                x = points.x;
                y = points.y;
                const width = points.width;
                const height = points.height;
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.stroke();
                break;
            case 'circle':
                x = points.x;
                y = points.y;
                const r = points.r;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case 'font':
                ctx.font = `${font_size}px ${font_family}`;
                ctx.fillStyle = color;
                ctx.fillText(text, points.x, points.y);
                break;

            default:
                console.log('addBack type error');
        }
    },
    undo: function(){
        if(this.now < 0) // illegal
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < this.now; i++){
            this.addBack(this.records[i]);
        }
        this.now--;
    },
    redo: function(){
        if(this.now == this.records.length - 1){ // start here
            return;
        }
        this.addBack(this.records[this.now + 1]);
        this.now++;
    }
};

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
        let tmpRecord = new makeRecord('brush', points, ctx.strokeStyle, ctx.lineWidth, null, null);
        record.addRecord(tmpRecord);
    }
};

erase = {
    start: function(){
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
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
        let tmpRecord = new makeRecord('erase', points, ctx.strokeStyle, ctx.lineWidth, null, null);
        record.addRecord(tmpRecord);
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
        points = {x: start.x, y: start.y, width: cursor.x - start.x, height: cursor.y - start.y}; // (start), (width, height)
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);

        let tmpRecord = new makeRecord('rect', points, ctx.strokeStyle, ctx.lineWidth, null, null);
        record.addRecord(tmpRecord);
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
        points = {x: x, y: y, r: r};
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);

        let tmpRecord = new makeRecord('circle', points, ctx.strokeStyle, ctx.lineWidth, null, null);
        record.addRecord(tmpRecord);
    }
};

// change to triangle
createTriangle = {
    start: function(){
        savedCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        start.x = cursor.x;
        start.y = cursor.y;
        console.log("start:", start);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        const nowx = cursor.x;
        const nowy = cursor.y;
        const midx = (nowx + start.x) / 2;
        const upy = Math.min(nowy, start.y);
        const downy = Math.max(nowy, start.y);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(cursor.x, downy);
        ctx.lineTo(start.x, downy);
        ctx.lineTo(midx, upy);
        ctx.lineTo(cursor.x, downy);
        ctx.lineTo(start.x, downy); // make start and end point together
        ctx.stroke();

        points = [];
        points.push({x: cursor.x, y: downy});
        points.push({x: start.x, y: downy});
        points.push({x: midx, y: upy});
        points.push({x: cursor.x, y: downy});
        points.push({x: start.x, y: downy});
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);
        let tmpRecord = new makeRecord('tri', points, ctx.strokeStyle, ctx.lineWidth, null, null);
        record.addRecord(tmpRecord);
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
            if(key === 'Enter'){
                inputVal = inputField.value;
                document.body.removeChild(inputField);
                const font_family = document.getElementById('font-family').value;
                const font_size = document.getElementById('font-size').value;
                ctx.font = `${font_size}px ${font_family}`;
                const color = getColor();
                ctx.fillStyle = color;
                ctx.fillText(inputVal, x, y);
                points = {x: x, y: y};
                let tmpRecord = new makeRecord('font', points, color, ctx.lineWidth, ctx.font, inputVal);
                record.addRecord(tmpRecord);
                hasInput = 0;
            }
            if(key === 'Escape'){
                document.body.removeChild(inputField);
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
        case 'tri':
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
        case 'tri':
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
    switch(selectedMode){
        case 'brush':
            document.getElementById('paper').style.cursor = "url('img/brush.png'), auto";
            break;
        case 'erase':
            document.getElementById('paper').style.cursor = "url('img/eraser.png'), auto";
            break;
        case 'rect':
            document.getElementById('paper').style.cursor = "url('img/rectangle.png'), auto";
            break;
        case 'circle':
            document.getElementById('paper').style.cursor = "url('img/circle.png'), auto";
            break;
        case 'tri':
            document.getElementById('paper').style.cursor = "url('img/triangle.png'), auto";
            break;
        case 'font':
            document.getElementById('paper').style.cursor = "url('img/font.png'), auto";
            break;

        default:
            console.log('selectedMode error');
    }
};

resetAll = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    record.reset();
}

download = () => { // maybe can add custom file name
    let tmpLink = document.createElement('a');
    tmpLink.download = 'picture.png';
    tmpLink.href = canvas.toDataURL('image/png');
    tmpLink.click();
}

upload = () => {
    const uploadImg = document.getElementById('uploadImg').files[0];
    if(uploadImg == null) return;
    console.log(uploadImg);
    let reader = new FileReader();
    reader.onload = () => {
        let img = new Image();
        img.onload = () => {
            // canvas.width 
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            selectMode(selectedMode);
        }
        img.src = reader.result;
    }
    reader.readAsDataURL(uploadImg);
}

Undo = () => {
    record.undo();
}
Redo = () => {
    record.redo();
}