const $ = id => document.getElementById(id);
let selectedFile = null;
let outputBlob = null;
let outputName = 'rekos-optimized.mp4';
let sandboxReady = false;
let pendingJob = null;

const frame = document.createElement('iframe');
frame.src = chrome.runtime.getURL('sandbox/ffmpeg.html');
frame.style.display = 'none';
document.documentElement.appendChild(frame);

function formatMB(bytes){return (bytes/1024/1024).toFixed(2)+' MB'}
function setProgress(p,status,log){$('bar').style.width=Math.max(0,Math.min(100,p))+'%';$('percent').textContent=Math.round(p)+'%';$('status').textContent=status;$('log').textContent=log||''}

window.addEventListener('message', e => {
  if(e.source !== frame.contentWindow) return;
  const d=e.data||{};
  if(d.type==='ready'){sandboxReady=true; if(pendingJob){frame.contentWindow.postMessage(pendingJob,'*');pendingJob=null}}
  if(d.type==='progress'){setProgress(d.progress,d.status,d.log)}
  if(d.type==='done'){
    outputBlob=new Blob([d.buffer],{type:'video/mp4'});
    outputName=d.name||'rekos-optimized.mp4';
    setProgress(100,'Done',`Output: ${formatMB(outputBlob.size)}`);
    $('download').classList.remove('hidden');
    $('notice').textContent=outputBlob.size <= d.maxBytes ? 'Ready: file is within your selected size limit.' : 'Warning: output is above the limit; try Size priority.';
  }
  if(d.type==='error'){setProgress(0,'Error',d.message);$('notice').textContent='Processing failed. Try a shorter/smaller source video.'}
});

$('fileInput').addEventListener('change', e=>selectFile(e.target.files[0]));
const dz=$('dropZone');
dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='#fff'});
dz.addEventListener('dragleave',()=>dz.style.borderColor='');
dz.addEventListener('drop',e=>{e.preventDefault();dz.style.borderColor='';selectFile(e.dataTransfer.files[0])});
function selectFile(file){
  if(!file || !file.type.startsWith('video/')) return;
  selectedFile=file; outputBlob=null; $('download').classList.add('hidden'); $('details').classList.remove('hidden');
  $('inputName').textContent=file.name; $('inputSize').textContent=formatMB(file.size); $('optimize').disabled=false;
}

$('optimize').addEventListener('click', async()=>{
  if(!selectedFile)return;
  const maxMb=Math.min(150,Math.max(10,Number($('maxMb').value)||150));
  $('progressPanel').classList.remove('hidden');$('download').classList.add('hidden');setProgress(1,'Preparing','Loading local video encoder…');
  const buffer=await selectedFile.arrayBuffer();
  const quality=$('quality').value;
  const job={type:'transcode',buffer,name:selectedFile.name,maxMb,quality};
  if(sandboxReady) frame.contentWindow.postMessage(job,'*'); else pendingJob=job;
});

$('download').addEventListener('click',()=>{
  if(!outputBlob)return;
  const url=URL.createObjectURL(outputBlob);
  const a=document.createElement('a');a.href=url;a.download=outputName;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
});
