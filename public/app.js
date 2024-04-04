let canvas = document.getElementById('paper');
let ctx = canvas.getContext('2d');
let thicknessSelector = document.getElementById('thickness');
let colorSelector = document.getElementById('color');
let selectedMode = "brush";
let shapeFill = 0;

let savedCanvas = document.getElementById('savedpaper');
let savedCtx = savedCanvas.getContext('2d');


//canvas.width = window.width;
//canvas.height = window.height;
//savedCanvas.width = window.width;
//savedCanvas.height = window.height;

cursor = {x: 0, y: 0};
start = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

////////// not finish
function makeRecord(type, points, color, width, font_style, text, fill){ 
    this.type = type;
    this.points = points;
    this.color = color;
    this.width = width;
    this.font_style = font_style;
    this.text = text;
    this.fill = fill;
}

checkUndoRedo = () => {
    const undoButton = document.getElementById('undo');
    if(record.now < 0) undoButton.setAttribute('disabled', 'disabled');
    else undoButton.removeAttribute('disabled', 'disabled');
    const redoButton = document.getElementById('redo');
    if(record.now == record.records.length - 1) redoButton.setAttribute('disabled', 'disabled');
    else redoButton.removeAttribute('disabled', 'disabled');
};

var record = {
    records: [],
    now: -1, 
    reset: function(){
        this.now = -1;
        this.records = [];
        checkUndoRedo();
    }, 
    addRecord: function(rec){
        console.log(rec);
        this.now++;
        if(this.now != this.records.length){
            this.records = this.records.slice(0, this.now);
        }
        this.records.push(rec);
        checkUndoRedo();
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
        const fill = rec.fill;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let x = 0;
        let y = 0;
        switch(type){
            case 'brush':
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(element => {
                    ctx.lineTo(element.x, element.y);
                });
                ctx.stroke();
                break;
            case 'erase':
                ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(element => {
                    ctx.lineTo(element.x, element.y);
                });
                ctx.stroke();
                break;
            case 'eraseArea':
                ctx.clearRect(points.x, points.y, points.width, points.height);
                break;
            case 'rect':
                x = points.x;
                y = points.y;
                const width = points.width;
                const height = points.height;
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                if(fill === 1) ctx.fill();
                else ctx.stroke();
                break;
            case 'circle':
                x = points.x;
                y = points.y;
                const r = points.r;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, 2 * Math.PI);
                if(fill === 1) ctx.fill();
                else ctx.stroke();
                break;
            case 'tri':
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(element => {
                    ctx.lineTo(element.x, element.y);
                });
                if(fill === 1) ctx.fill();
                else ctx.stroke();
                break;
            case 'font':
                ctx.font = `${font_size}px ${font_family}`;
                ctx.fillStyle = color;
                ctx.fillText(text, points.x, points.y);
                break;
            case 'rotR':
                rotateRight();
                break;
            case 'rotL':
                rotateLeft();
                break;
            case 'flip':
                flip();
                break;
            case 'img':
                ctx.drawImage(color, 0, 0);
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
        checkUndoRedo();
    },
    redo: function(){
        if(this.now == this.records.length - 1)
            return;
        this.addBack(this.records[this.now + 1]);
        this.now++;
        checkUndoRedo();
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
        let tmpRecord = new makeRecord('brush', points, ctx.strokeStyle, ctx.lineWidth, null, null, shapeFill);
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
        let tmpRecord = new makeRecord('erase', points, ctx.strokeStyle, ctx.lineWidth, null, shapeFill);
        record.addRecord(tmpRecord);
    }
};

eraseArea = {
    start: function(){
        ctx.save();
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        start.x = cursor.x;
        start.y = cursor.y;
        console.log(start);
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = '1';
        ctx.setLineDash([3, 3]);
        ctx.rect(start.x, start.y, cursor.x - start.x, cursor.y - start.y);
        ctx.stroke();
        points = {x: start.x, y: start.y, width: cursor.x - start.x, height: cursor.y - start.y}; // (start), (width, height)
    },
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(start.x, start.y, cursor.x - start.x, cursor.y - start.y);

        let tmpRecord = new makeRecord('eraseArea', points, ctx.strokeStyle, ctx.lineWidth, null, shapeFill);
        record.addRecord(tmpRecord);

        ctx.restore();
    }
}

createRect = {
    start: function(){
        savedCtx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        start.x = cursor.x;
        start.y = cursor.y;
        canvas.addEventListener('mousemove', this.move);
    }, 
    move: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.rect(start.x, start.y, cursor.x - start.x, cursor.y - start.y);
        if(shapeFill === 1) ctx.fill();
        else ctx.stroke();
        points = {x: start.x, y: start.y, width: cursor.x - start.x, height: cursor.y - start.y}; // (start), (width, height)
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);

        console.log('hi');
        const fill = shapeFill;
        let tmpRecord = new makeRecord('rect', points, ctx.strokeStyle, ctx.lineWidth, null, null, fill);
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
        if(shapeFill === 1) ctx.fill();
        else ctx.stroke();
        points = {x: x, y: y, r: r};
    }, 
    end: function(){
        canvas.removeEventListener('mousemove', this.move);
        savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(savedCanvas, 0, 0, canvas.width, canvas.height);
        savedCtx.clearRect(0, 0, canvas.width, canvas.height);

        const fill = shapeFill;
        let tmpRecord = new makeRecord('circle', points, ctx.strokeStyle, ctx.lineWidth, null, null, fill);
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
//        ctx.lineTo(start.x, downy); // make start and end point together
        if(shapeFill === 1) ctx.fill();
        else ctx.stroke();

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

        const fill = shapeFill;
        let tmpRecord = new makeRecord('tri', points, ctx.strokeStyle, ctx.lineWidth, null, null, fill);
        record.addRecord(tmpRecord);
    }
};

paint = {
    start: function(){


    }, 
    end: function(){

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
        inputField.style.left = document.getElementById('paper').getBoundingClientRect().left + x + 'px';
        inputField.style.top  = document.getElementById('paper').getBoundingClientRect().top + y + 'px';
        inputField.onkeydown = (e) => {
            const key = e.key;
            if(key === 'Enter'){
                inputVal = inputField.value;
                document.body.removeChild(inputField);
                const font_family = document.getElementById('font-family').value;
                const font_size = document.getElementById('font-size').value;
                ctx.font = `${font_size}px ${font_family}`;
                const color = getColor();
                ctx.fillText(inputVal, x, y);
                points = {x: x, y: y};
                const fill = shapeFill;
                let tmpRecord = new makeRecord('font', points, color, ctx.lineWidth, ctx.font, inputVal, fill);
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
    ctx.fillStyle = color;
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = thicknessSelector.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    console.log(color, ctx.lineWidth);

    switch(selectedMode){
        case 'brush':
            brush.start();
            break;
        case 'erase':
            erase.start();
            break;
        case 'eraseArea':
            eraseArea.start();
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
        case 'eraseArea':
            eraseArea.end();
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
changeCursor = () => {
    switch(selectedMode){ // cursor icon
        case 'brush':
            document.getElementById('paper').style.cursor = "url('img/brush.png') 0 27, auto";
            break;
        case 'erase':
            document.getElementById('erase_choose').src = "img/eraser2.png";
            document.getElementById('paper').style.cursor = "url('img/eraser.png'), auto";
            break;
        case 'eraseArea':
            document.getElementById('erase_choose').src = "img/eraseArea2.png";
            document.getElementById('paper').style.cursor = "url('img/eraseArea.png'), auto";
            break;
        case 'rect':
            document.getElementById('paper').style.cursor = shapeFill ? "url('img/rectangle_fill.png'), auto" : "url('img/rectangle.png'), auto";
            break;
        case 'circle':
            document.getElementById('paper').style.cursor = shapeFill ? "url('img/circle_fill.png'), auto" : "url('img/circle.png'), auto";
            break;
        case 'tri':
            document.getElementById('paper').style.cursor = shapeFill ? "url('img/triangle_fill.png'), auto" : "url('img/triangle.png'), auto";
            break;
        case 'font':
            document.getElementById('paper').style.cursor = "url('img/font.png'), auto";
            break;

        default:
            console.log('selectedMode error');
    }
    console.log(selectedMode);
}
selectMode = (mode) => {
    selectedMode = mode;
    if(mode === 'erase_choose'){
        const src = document.getElementById('erase_choose').src;
        if(src.includes("img/eraser2.png"))
            selectedMode = 'erase';
        else
            selectedMode = 'eraseArea';
    }
    changeCursor();
    console.log(selectedMode);
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
            ctx.drawImage(img, 0, 0);
            // selectMode(selectedMode);
            let tmpRecord = new makeRecord('img', {x: 0, y: 0}, img, null, null, null, null);
            record.addRecord(tmpRecord);
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

rotateRight = (e) => {
    ctx.save();
    console.log('rotR');
    
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate(Math.PI / 180 * 90);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(savedCanvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    if(e === 'add'){
        const rec = new makeRecord('rotR', null, null, null, null, null);
        record.addRecord(rec);
    }
}
rotateLeft = (e) => {
    ctx.save();
    console.log('rotL');
    
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate(3 * Math.PI / 180 * 90);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(savedCanvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if(e === 'add'){
        const rec = new makeRecord('rotL', null, null, null, null, null);
        record.addRecord(rec);
    }
}

flip = (e) => {
    ctx.save();
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    savedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(-1, 1);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(savedCanvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    savedCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    if(e === 'add'){
        const rec = new makeRecord('flip', null, null, null, null, null);
        record.addRecord(rec);
    }
}

fillChange = () => {
    shapeFill = 1 - shapeFill;
    document.getElementById('rect').src = shapeFill ? 'img/rectangle_fill2.png' : 'img/rectangle2.png';
    document.getElementById('circle').src = shapeFill ? 'img/circle_fill2.png' : 'img/circle2.png';
    document.getElementById('tri').src = shapeFill ? 'img/triangle_fill2.png' : 'img/triangle2.png';
    document.getElementById('fillSelector').src = shapeFill ? 'img/circle_fill2.png' : 'img/circle2.png';
    changeCursor();
}