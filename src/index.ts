let eventStart:number|null;
let powerOn:boolean = false;

let lcd:HTMLCanvasElement;
let up:HTMLButtonElement;
let down:HTMLButtonElement;
let left:HTMLButtonElement;
let right:HTMLButtonElement;
let a:HTMLButtonElement;
let b:HTMLButtonElement;
let start:HTMLButtonElement;
let select:HTMLButtonElement;
let power:HTMLSpanElement;

let padEvent:string|null;
let padElement:HTMLButtonElement|null;
let buttonEvent:string|null;
let buttonElement:HTMLButtonElement|null;

const width:number = 160;
const height:number = 144;
const padEvents:Array<string> = [];
const buttonEvents:Array<string> = [];
const img:HTMLImageElement = new Image(width, height);
const request:XMLHttpRequest = new XMLHttpRequest();
request.responseType = "blob";

function getFrame(url: string): Promise<Blob> {
  return new Promise((resolve:any, reject:any) => {
    request.onload = (e) => {
      resolve(request.response);
    };
    request.onerror = reject;
    request.open("GET", url);
    request.send();
  });
};

/**
 * tick - Every call will fetch a frame from the server. 
 * Includes any key pad or button events.
 */ 
async function tick(ts:DOMHighResTimeStamp): Promise<void> {
  const ctx = lcd.getContext('2d');
  try {
    let url:string = `/x/png`;
    const query:Array<string> = []
    query.push(String(Math.floor(Math.random() * 1000)));
    if (padEvent) {
      query.push(padEvent);
      padEvent = null;
    }
    if (buttonEvent) {
      query.push(buttonEvent);
      buttonEvent = null;
    }
    if (query.length > 0) {
      url += `?${query.join('&')}`
    }
    
    const frame = await getFrame(url); 
    img.src = URL.createObjectURL(frame);
    img.onload = (event) => {
      const target:HTMLImageElement = <HTMLImageElement>event.target;
       URL.revokeObjectURL(target.src);
       if (ctx) {
         ctx.drawImage(target, 0, 0, width, height);
       }
       resetState();
    }
    if (!powerOn) {
      power.classList.add("active");
      powerOn = true;
    }
  } catch (error) {
    console.error(error);
    if (powerOn) {
      power.classList.remove("active");
      powerOn = false;
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.font = '10px sans-serif';
        ctx.fillText('error! try reloading the page', 10, height/2, width);
      }
    }
    return
  };
  
  window.requestAnimationFrame(tick);
};

function resetState() {
  if (eventStart) {
    const now = performance.now();
    console.log(`event latency: ${now-eventStart}`);
    eventStart = null;
  }
  if (padElement) {
    padElement.classList.remove('active');
    padElement = null;
  }
  if (buttonElement) {
    buttonElement.classList.remove('active');
    buttonElement = null;
  }
}

document.addEventListener('DOMContentLoaded', (_event) => {
  lcd = <HTMLCanvasElement>document.getElementById('lcd');
  lcd.width = width;
  lcd.height = height;
  
  up = <HTMLButtonElement>document.getElementById('up');
  down = <HTMLButtonElement>document.getElementById('down');
  left = <HTMLButtonElement>document.getElementById('left');
  right = <HTMLButtonElement>document.getElementById('right');
  a = <HTMLButtonElement>document.getElementById('a');
  b = <HTMLButtonElement>document.getElementById('b');
  select = <HTMLButtonElement>document.getElementById('select');
  start = <HTMLButtonElement>document.getElementById('start');
  power = <HTMLSpanElement>document.getElementById('power');
  
  document.addEventListener('keydown', (_event) => {
    eventStart = performance.now();
    
    switch (_event.key) {
      case 'ArrowUp':
        padElement = up;
        padEvent = 'u';
        break;
      case 'ArrowDown':
        padElement = down
        padEvent = 'd';
        break;
      case 'ArrowLeft':
        padElement = left;
        padEvent = 'l';
        break;
      case 'ArrowRight':
        padElement = right;
        padEvent = 'r';
        break;
      case 'x':
        buttonElement = b;
        buttonEvent = 'b';
        break;
      case 'z':
        buttonElement = a;
        buttonEvent = 'a';
        break;
      case 'Enter':
        buttonElement = start;
        buttonEvent = 'e';
        break;
      case 'Backspace':
        buttonElement = select;
        buttonEvent = 's';
        break;
      default:
        break;
    }
    
    if (padElement) {
      padElement.classList.add('active');
    }
    if (buttonElement) {
      buttonElement.classList.add('active');
    }
  });
  
  window.requestAnimationFrame(tick);
});