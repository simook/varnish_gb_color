let request:XMLHttpRequest
let lcd:HTMLImageElement
const padEvents:Array<string> = [];
const buttonEvents:Array<string> = [];

function getFrame(url: string): Promise<Blob> {
  return new Promise((resolve:any, reject:any) => {
    request = new XMLHttpRequest();
    request.responseType = "blob";
    request.onload = (e) => {
      resolve(request.response);
    };
    request.onerror = reject;
    request.open("GET", url);
    request.send();
  });
};

/**
 * tick - Every call "tick" will fetch a frame from the server. 
 */ 
async function tick(ts:DOMHighResTimeStamp): Promise<void> {
  try {
    let url:string = '/x';
    const query:Array<string> = []
    
    if (padEvents.length > 0) {
      query.push(`pad=${padEvents.shift()}`)
    }
    
    if (buttonEvents.length > 0) {
      query.push(`buttons=${buttonEvents.shift()}`)
    }
    
    if (query.length > 0) {
      url += `?${query.join('&')}`
    }
    
    const frame = await getFrame(url); 
    lcd.src = URL.createObjectURL(frame);
  } catch (error) {
    console.error(error);
    alert("Encountered an error");
    return
  };
  window.requestAnimationFrame(tick);
};

document.addEventListener('DOMContentLoaded', (_event) => {
  lcd = <HTMLImageElement>document.getElementById('lcd');
  window.requestAnimationFrame(tick);
});

document.addEventListener('keydown', (_event) => {
  switch (_event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      padEvents.push(_event.key.replace('Arrow','').toLowerCase());
      break;
    case 'z':
      buttonEvents.push('a');
      break;
    case 'x':
      buttonEvents.push('b');
      break;
  }
});
