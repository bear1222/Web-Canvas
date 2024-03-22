let canvas = document.getElementById('paper');
//console.log(canvas);
let ctx = canvas.getContext('2d');
let thicknessSelector = document.getElementById('thickness');
let colorSelector = document.getElementById('color');
let selectedMode = "brush";


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

cursor = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
});


brush = () => {
    ctx.globalCompositeOperation = "source-over";
    canvas.addEventListener('mousedown', () => {
        ctx.lineWidth = thicknessSelector.value;
        const color = getColor();
        ctx.strokeStyle = color;
        console.log(color, ctx.lineWidth);
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);

        canvas.addEventListener('mousemove', Painting);
    });

    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', Painting);
    });

    Painting = () => {
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
    };
}

erase = () => {
    ctx.globalCompositeOperation = "destination-out";
    canvas.addEventListener('mousedown', () => {
        ctx.lineWidth = thicknessSelector.value;
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);

        canvas.addEventListener('mousemove', Erasing);
    });

    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', Erasing);
    });

    Erasing = () => {
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
    };
}

////////
$(document).ready(() =>{
    brush();
});
selectMode = (mode) => {
    console.log(mode);
    selectedMode = mode;
    if(selectedMode === "brush"){
        brush();
    }else if(selectedMode === "erase"){
        erase();
    }
};
