let canvas = document.getElementById('paper');
console.log(canvas);
let ctx = canvas.getContext('2d');


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

cursor = {x: 0, y: 0};
canvas.addEventListener('mousemove', (e) => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
});


let brush = () => {
    canvas.addEventListener('mousedown', () => {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);

        canvas.addEventListener('mousemove', Painting);
        console.log(cursor);
    });

    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', Painting);
    });

    Painting = () => {
        ctx.lineTo(cursor.x, cursor.y);
        ctx.stroke();
    };
}

////////
mode = 1;
if(mode === 1){
    brush();
}else{
    console.log("hi");
}