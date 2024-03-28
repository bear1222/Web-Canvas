function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let canvas_right = document.getElementById('palette-right');
let ctx_right = canvas_right.getContext('2d', { willReadFrequently: true });
let canvas_main = document.getElementById('palette-main');
let ctx_main = canvas_main.getContext('2d', { willReadFrequently: true });
let graV_right = ctx_right.createLinearGradient(0, 0, 0, canvas_right.height);
var colorstop = [
    {position: 0,    rgb: '#FF0000'}, 
    {position: 0.24, rgb: '#FF00FF'}, 
    {position: 0.33, rgb: '#0000FF'}, 
    {position: 0.52, rgb: '#00FFFF'}, 
    {position: 0.66, rgb: '#00FF00'}, 
    {position: 0.78, rgb: '#FFFF00'}, 
    {position: 1,    rgb: '#FF0000'}, 
];
colorstop.forEach((e) =>{
    graV_right.addColorStop(e.position, e.rgb);
});
// ctx_right.fillStyle = 'green';

let picker_right = {x: 0, y: 0.33 * 300, color: '#00F'};
let picker_main = {x: 10, y: 290};
draw = () => {
    ctx_right.fillStyle = graV_right;
    ctx_right.fillRect(0, 0, canvas_right.width, canvas_right.height);
    ctx_right.beginPath();
    ctx_right.strokeStyle = 'white';
    ctx_right.lineWidth = '4';
    ctx_right.arc(8, picker_right.y, 7, 0, 2 * Math.PI);
    // ctx_right.rect(picker_right.x, picker_right.y, 50, 10);
    ctx_right.stroke();

    show_palette_main(picker_right.color);
    ctx_main.beginPath();
    ctx_main.strokeStyle = 'white';
    ctx_main.lineWidth = '4';
    ctx_main.arc(picker_main.x, picker_main.y, 7, 0, 2 * Math.PI);
    ctx_main.stroke()
    ctx_main.closePath();

}

show_palette_main = (des_color) => {
    let graH = ctx_main.createLinearGradient(0, 0, canvas_main.width, 0);
    graH.addColorStop(0, '#FFF');
    graH.addColorStop(1, des_color);
    ctx_main.fillStyle = graH;
    ctx_main.fillRect(0, 0, canvas_main.width, canvas_main.height);

    let graV = ctx_main.createLinearGradient(0, 0, 0, canvas_main.height);
    graV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    graV.addColorStop(1, '#000');
    ctx_main.fillStyle = graV;
    ctx_main.fillRect(0, 0, canvas_main.width, canvas_main.height);

}
// show_palette_main('#00F');

move_right = (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    picker_right.y = y;
    const ratio = y / canvas_right.height;
    let color = {r: 0, g: 0, b: 0};

    for(let i = 1; i < colorstop.length; i++){
        if(colorstop[i].position >= ratio){
            let all = colorstop[i].position - colorstop[i - 1].position;
            let dif = ratio - colorstop[i - 1].position;
            let colratio = dif / all;
            // console.log(hexToRgb(colorstop[i - 1].color));
            const color_right = ctx_right.getImageData(x, y, 1, 1)['data'];
            color.r = color_right[0];
            color.g = color_right[1];
            color.b = color_right[2];
            break;
        }
    }
    const col = rgbToHex(color.r, color.g, color.b);
    picker_right.color = col;
};
canvas_right.addEventListener('click', (e) => {
    move_right(e);
});

canvas_main.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    picker_main.x = x;
    picker_main.y = y;

    ctx_main.beginPath();
    ctx_main.arc(x, y, 5, 0, 2 * Math.PI);
    ctx_main.stroke()
    ctx_main.closePath();
});

setInterval(() => draw(), 1);

function getColor(){
    const x = picker_main.x;
    const y = picker_main.y;
    const pixel = ctx_main.getImageData(x, y, 1, 1)['data'];
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
}