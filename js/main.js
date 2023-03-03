
const video = document.getElementById('video');
let gente = '';
let labeledFaceDescriptors;
let faceMatcher;
let refresh;
let canvas;
let recorder;
let stm;
let detenido = false;
let timeout;
const ul = document.getElementById('ul');
const ulgente = document.getElementById('ulgente');

async function startVideo()
{        
    console.log('start');
    labeledFaceDescriptors = await loadLabeledImages();
    console.log('loaded images');
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);

    navigator.getUserMedia = (navigator.getUserMedia || 
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || 
        navigator.msGetUserMedia);
    navigator.getUserMedia(
        {video: true, audio: true },
        stream => {video.srcObject = stream; stm = stream},
        err => console.log(err)
    )   
    
    const loadercontainer = document.getElementById('loadercontainer');
    loadercontainer.classList.toggle('hidden');
    const generalcontainer = document.getElementById('generalcontainer');
    generalcontainer.classList.toggle('hidden');
    generalcontainer.classList.toggle('general_container');    
}


Promise.all(
    [
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
    ]
).then(startVideo);

video.addEventListener('play', () => {

    const divgente = document.getElementById('gente');
    const videocontainer = document.getElementById('videocontainer');

    canvas = faceapi.createCanvasFromMedia(video);
    //document.body.append(canvas);
    videocontainer.append(canvas);
    const displaySize = { width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);
    refresh = setInterval( async () => {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptors();        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        if(!detenido)
        {
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: result.label
                });
                drawBox.draw(canvas);
                if(result.label != 'unknown')
                {
                    if(gente == '')
                    {
                        gente = result.label;
                        var a = document.createElement('a');
                        var li = document.createElement('li');                    
                        a.textContent = result.label;
                        a.onclick = function() {eliminarpersona(result.label)};                    
                        li.id = result.label;
                        li.appendChild(a);    
                        ulgente.appendChild(li);
                        const divcontinuar = document.getElementById('continuar');
                        divcontinuar.classList.toggle('continuar');
                        divcontinuar.classList.toggle('hidden');                                        
                    }
                    else if (! gente.includes(result.label))
                    {
                        gente = gente + '|' + result.label;
                        var a = document.createElement('a');
                        var li = document.createElement('li');                    
                        a.textContent = result.label;
                        a.onclick = function() {eliminarpersona(result.label)};                    
                        li.id = result.label;
                        li.appendChild(a);    
                        ulgente.appendChild(li);
                    }
                }            
            });
        }        
    }, 500);
});

function loadLabeledImages(){
    const labels = ['Oscar','Susana','Andrea','Andres','Valeria','Sofia','Nicolas','Aixa']
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for (let i = 1; i <= 2; i++) {
                //const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/juaneg/images/main/${label}/${i}.jpeg`);
                const img = await faceapi.fetchImage(`./images/${label}/${i}.jpeg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if(detections != undefined)
                    descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    )
}

function reiniciarbusqueda(){
    gente = '';
    for (i = 0; i <= ulgente.children.length; i++)
    {
        let child = ulgente.children[i];
        ulgente.removeChild(child);
    }    
}

function random_color(valor){
    let ar_digit=['2','3','4','5','6','7','8','9'];
    let color='';
    let i=0;
    if (valor == 'Sorpresa')
    {
        color = '3498db'
    }else {
        
        while(i<6){
            let pos=Math.round(Math.random()*(ar_digit.length-1));
            color=color+''+ar_digit[pos];
            i++;
        }
    }
    
    return '#'+color;
}

function detenervideo(){
    detenido = true;
    clearInterval(refresh);     
}

function comenzarjuego() {
    detenido = true;
    clearInterval(refresh);  
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);       
    startRecording();
    const divruleta = document.getElementById('ruleta');
    divruleta.classList.toggle('hidden');
    divruleta.classList.toggle('ruleta');
    const divcontinuar = document.getElementById('continuar');
    divcontinuar.classList.toggle('continuar'); 
    divcontinuar.classList.toggle('hidden'); 
    const divgente = document.getElementById('gente');
    divgente.classList.toggle('gente');     
    divgente.classList.toggle('hidden');     
    const divleyenda = document.getElementById('leyenda');
    divleyenda.classList.toggle('leyenda');     
    divleyenda.classList.toggle('hidden');

    const array_premios =
    [        
        'Sorpresa'
        ,'$20.000'
        ,'Sorpresa'
        ,'$5.000'
        ,'Sorpresa'        
        ,'$1.000'        
        ,'Sorpresa'
        ,'$10.000'        
    ];

    let canvasruleta=document.getElementById("idcanvas");
    let context=canvasruleta.getContext("2d");
    let center=canvasruleta.width/2;

    context.beginPath();
    context.moveTo(center,center);
    context.arc(center,center,center,0, 2*Math.PI);
    context.lineTo(center,center);
    context.fillStyle ='#33333333';
    context.fill();

    context.beginPath();
    context.moveTo(center,center);
    context.arc(center,center,center-10,0, 2*Math.PI);
    context.lineTo(center,center);
    context.fillStyle ='black';
    context.fill();

    for (var i = 0; i < array_premios.length; i++) {
        context.beginPath();
        context.moveTo(center,center);
        context.arc(center,center,center-20,i*2*Math.PI/array_premios.length, (i+1)*2*Math.PI/array_premios.length);
        context.lineTo(center,center);
        context.fillStyle =random_color(array_premios[i]);
        context.fill();

        context.save();
        context.translate(center, center);
        context.rotate(3*2*Math.PI/(5*array_premios.length)+i*2*Math.PI/array_premios.length);
        context.translate(-center, -center);
        context.font = "15px Franklin Gothic Medium";
        context.textAlign = "right";
        context.fillStyle = "white";
        context.fillText(array_premios[i], canvasruleta.width-40, center);
        context.restore();
    }    
}

function startRecording() {
    let options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: "video/webm",
      };
    recorder = new MediaRecorder(stm, options);
    recorder.start();
}

function stopRecording() {
    var a = document.createElement('a');
    recorder.ondataavailable = e => {            
        a.download = ['video_', (new Date() + '').slice(4, 28), '.webm'].join('');
        a.href = URL.createObjectURL(e.data);
        a.textContent = 'Descargar Video';
        a.onclick = function(){mostrarfoto()};
        a.classList.toggle('button');
        a.id = 'btndescarga';
        let descarga = document.getElementById("descarga");
        descarga.appendChild(a);
        a.click();
    };
    recorder.stop();   
    stm.getTracks().forEach(function(track) { track.stop(); });
    document.getElementById("finalizar").classList.toggle('button');
    document.getElementById("finalizar").classList.toggle('hidden');    
}

function eliminarpersona(name)
{
    let li = ulgente.children[name];
    ulgente.removeChild(li);
}

let pos_ini=0;
let clic=0;
let movement;
function startgame()
{
    
    timeout = window.setTimeout(stopgame, 3000);
    let canvasruleta = document.getElementById("idcanvas");
    movement = setInterval(function(){
        pos_ini+=10;
        canvasruleta.style.transform='rotate('+pos_ini+'deg)';
    },10);   
    document.getElementById("btnsortear").disabled = true;      
    document.getElementById("btnsortear").classList.toggle('disabled');        
}

function stopgame()
{
    document.getElementById("btnsortear").classList.toggle('button');
    document.getElementById("btnsortear").classList.toggle('hidden');
    document.getElementById("btnrevelar").classList.toggle('hidden');
    document.getElementById("btnrevelar").classList.toggle('button');
    clearInterval(movement);
    let canvasruleta = document.getElementById("idcanvas");
    canvasruleta.style.transform='rotate(60deg)';
}

function reveal()
{
    let reveal = document.getElementById("reveal");
    let revealcontent = document.getElementById("revealcontent");    
    let generalcontainer = document.getElementById("generalcontainer");    
    let content = '';
    const people = gente.split("|");
    for (var i = 0; i <= people.length -1; i++)
    {
        switch (people[i]) {
            case 'Andrea':
                content += '<p>' + people[i] + ': ¡Vas a ser abuela! </p>';
                break;
            case 'Andres':
                content += '<p>' + people[i] + ': ¡Vas a ser abuelo! </p>';
                break;
            case 'Aixa':
                content += '<p>' + people[i] + ': ¡Vas a ser tia! </p>';
                break;
            case 'Susana':
                content += '<p>' + people[i] + ': ¡Vas a ser abuela! </p>';
                break;            
            case 'Oscar':
                content += '<p>' + people[i] + ': ¡Vas a ser abuelo! </p>';
                break;
            case 'Valeria':
                content += '<p>' + people[i] + ': ¡Vas a ser tia! </p>';
                break;
            case 'Sofia':
                content += '<p>' + people[i] + ': ¡Vas a ser tia! </p>';
                break;
            case 'Nicolas':
                content += '<p>' + people[i] + ': ¡Vas a ser tio! </p>';
                break;
        }                    
    }
    revealcontent.innerHTML = content;

    let image = document.createElement('img');
    let title = document.createElement('p');
    title.textContent = 'Esta es mi primer selfie!';
    title.id = 'title';
    image.src = './images/oli.jpeg';
    image.id = 'selfie';
    image.classList.toggle('selfie');
    revealcontent.appendChild(title);
    revealcontent.appendChild(image);
    timeout = window.setTimeout(mostrarfotoreal, 3000);

    //reveal.appendChild(p);
    reveal.classList.toggle('hidden');
    reveal.classList.toggle('reveal');
    generalcontainer.classList.toggle('general_container');
    generalcontainer.classList.toggle('hidden');
    setupCanvas();
    updateConfetti();
    confettiLoop();
}

function mostrarfoto() {
    let button = document.getElementById('btndescarga');    
    button.classList.toggle('button');
    button.classList.toggle('hidden');
    /*let revealcontent = document.getElementById("revealcontent");  
    let image = document.createElement('img');
    let title = document.createElement('p');
    title.textContent = 'Esta es mi primer selfie!';
    title.id = 'title';
    image.src = '../images/oli.jpeg';
    image.id = 'selfie';
    image.classList.toggle('selfie');
    revealcontent.appendChild(title);
    revealcontent.appendChild(image);
    timeout = window.setTimeout(mostrarfotoreal, 2000);      */
}

function mostrarfotoreal(){
    let image = document.getElementById("selfie");      
    let title = document.getElementById("title");      
    title.textContent = 'jajajaj mentira, esta si es!'
    image.src = './images/selfie.jpg';        
}