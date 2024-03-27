function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let canvas_right = document.getElementById('palette-right');
let ctx_right = canvas_right.getContext('2d', { willReadFrequently: true });
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
ctx_right.fillStyle = graV_right;
ctx_right.fillRect(0, 0, canvas_right.width, canvas_right.height);

let canvas_main = document.getElementById('palette-main');
let ctx_main = canvas_main.getContext('2d', { willReadFrequently: true });

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
show_palette_main('#00F');

canvas_right.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

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

            // color.r = Math.floor(interpolate(hexToRgb(colorstop[i - 1].rgb).r, hexToRgb(colorstop[i].rgb).r, colratio));
            // color.g = Math.floor(interpolate(hexToRgb(colorstop[i - 1].rgb).g, hexToRgb(colorstop[i].rgb).g, colratio));
            // color.b = Math.floor(interpolate(hexToRgb(colorstop[i - 1].rgb).b, hexToRgb(colorstop[i].rgb).b, colratio));
            break;
        }
    }
    const col = rgbToHex(color.r, color.g, color.b);
    selectredColor = col;
    show_palette_main(col);
});

let selectredColor = '#000';
canvas_main.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    pixel = ctx_main.getImageData(x, y, 1, 1)['data'];

    let color = rgbToHex(pixel[0], pixel[1], pixel[2]);
    selectredColor = color;
});

function getColor(){
    return selectredColor;
}