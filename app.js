/*
This script is an extension to the one written
by Mateusz Rybczonec on his CSS Tricks Blog

Blog Link: https://bit.ly/3nH3AhO

OG Pen Link : https://bit.ly/3fi7xXj
*/

const FULL_DASH_ARRAY = 283;
const RESET_DASH_ARRAY = `-57 ${FULL_DASH_ARRAY}`;

//All buttons
let startBtn = document.querySelector(".start");
let stopBtn = document.querySelector(".stop");
let resetBtn = document.querySelector(".reset");

//DOM elements
let timer = document.querySelector("#base-timer-path-remaining");
let timeLabel = document.getElementById("base-timer-label");

//Time related vars
var TIME_LIMIT = 300; //in seconds
var timePassed = -1;
var timeLeft = TIME_LIMIT;
var timerInterval = null;
var app = null;

(function initialize(){
    app = new window.Webex.Application();
    app.onReady().then(() => 
    {
        log('onReady()', {message:'app is ready'});

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const countdowntime = urlParams.get('countdowntime');
        if (typeof countdowntime === 'undefined' || countdowntime === null) 
        {
            launchHostSetup();
        }
        else
        {
            launchAttendee(countdowntime);
        }

        app.listen().then(function () {
            log("Listen().then() ok");
            app.on("application:shareStateChanged", function (isShared) {
                log("Event application:shareStateChanged isShared=" + isShared);
                if (isShared) 
                {
                    showHostRunning();
                    startTimer();
                } 
                else
                {
                    showHostSetup();
                }
            });
        }).catch(function (reason) {
            log("listen: fail reason=" + reason);
        });
    });
        
})();

function log(type, data) {
    var ul = document.getElementById("console");
    var li = document.createElement("li");
    var payload = document.createTextNode(`${type}: ${JSON.stringify(data)}`);
    li.appendChild(payload)
    ul.prepend(li);
}

function launchHostSetup()
{
    console.log("launch host side");
    showHostSetup();
    document.getElementById("time1").checked = true;
    document.getElementById("countdownMins").textContent = '05';    
    setShareUrl();
}

function showHostSetup()
{
    document.getElementById("countdownRunner").hidden = true;
    document.getElementById("countdownControl").style.display = "none";
    document.getElementById("countdownValue").hidden = false;
    document.getElementById("countdownSettings").hidden = false;
    document.getElementById("countdownRunnerLabel").hidden = true;
}

function showHostRunning()
{
    document.getElementById("countdownValue").hidden = true;
    document.getElementById("countdownRunner").hidden = false;
    document.getElementById("countdownControl").style.display = "none";
    document.getElementById("countdownSettings").hidden = true;
    document.getElementById("countdownRunnerLabel").hidden = true;
}

function launchAttendee(countdowntime)
{
    console.log("launch attendee side");
    TIME_LIMIT = countdowntime
    document.getElementById("countdownRunner").hidden = false;
    document.getElementById("countdownControl").style.display = "none";
    document.getElementById("countdownValue").hidden = true;
    document.getElementById("countdownSettings").hidden = true;
    document.getElementById("countdownRunnerLabel").hidden = false;
    startTimer();
}

function set1Min()
{
    TIME_LIMIT = 60
    document.getElementById("countdownMins").textContent = '01';
    timeLabel.innerHTML = formatTime(TIME_LIMIT);
    setShareUrl();
}

function set5Min()
{
    TIME_LIMIT = 300
    document.getElementById("countdownMins").textContent = '05';
    timeLabel.innerHTML = formatTime(TIME_LIMIT);
    setShareUrl();
}

function set10Min()
{
    TIME_LIMIT = 600
    document.getElementById("countdownMins").textContent = '10';
    timeLabel.innerHTML = formatTime(TIME_LIMIT);
    setShareUrl();
}

function set15Min()
{
    TIME_LIMIT = 900
    document.getElementById("countdownMins").textContent = '15';
    timeLabel.innerHTML = formatTime(TIME_LIMIT);
    setShareUrl();
}

function reset() {
    launchHostSetup();
    app.clearShareUrl()
        .then(function (res) {
            log("Promise clearShareUrl success");
        })
        .catch(function (reason) {
            log("clearShareUrl: fail reason=" + reason);
    });
    clearInterval(timerInterval);
    resetVars();
    startBtn.innerHTML = "Launch";
    timer.setAttribute("stroke-dasharray", RESET_DASH_ARRAY);
}

function start(withReset = false) {
    setDisabled(startBtn);
    setHidden(resetBtn);
    onClickSetShareUrl(function(){
        showHostRunning();
        //setDisabled(startBtn);
        removeDisabled(stopBtn);
        if (withReset) {
            resetVars();
        }
        startTimer();
    });
}

function stop() {
    setDisabled(stopBtn);
    removeDisabled(startBtn);
    startBtn.innerHTML = "Continue";
    clearInterval(timerInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        timeLabel.innerHTML = formatTime(timeLeft);
        setCircleDasharray();

        if (timeLeft === 0) 
        {
            timeIsUp();
        }
    }, 1000);
}

window.addEventListener("load", () => {
  timeLabel.innerHTML = formatTime(TIME_LIMIT);
  setDisabled(stopBtn);
});

//---------------------------------------------
//HELPER METHODS
//---------------------------------------------

function setHidden(button, isHide = true) {
    //button.hidden = isHide;
}

function setDisabled(button) {
  //button.setAttribute("disabled", "disabled");
}

function removeDisabled(button) {
  //button.removeAttribute("disabled");
}

function repeatPlayAudio(counter) {    
    var bipAudioPlayer = document.getElementById("bipAudio")

    const customPlay = function() {      
        bipAudioPlayer.play();
      counter--;
      
      if (counter === 0) {
        bipAudioPlayer.removeEventListener('ended', customPlay);
      }
    };
    
    bipAudioPlayer.addEventListener('ended', customPlay);
    
    bipAudioPlayer.currentTime = 0;
    bipAudioPlayer.loop = false;    
    customPlay();
}

function timeIsUp() {
    repeatPlayAudio(3);
    removeDisabled(stopBtn);
    removeDisabled(resetBtn);
    clearInterval(timerInterval);
    setHidden(resetBtn, false);

    //reset();
    /*let confirmReset = confirm("Time is UP! Wanna restart?");
    if (confirmReset) {
        reset();
        startTimer();
    } else {
        reset();
    }*/
}

function resetVars() {
    set5Min();
    document.getElementById("time1").checked = true;
    removeDisabled(startBtn);
    setDisabled(stopBtn);
    timePassed = -1;
    timeLeft = TIME_LIMIT;
    console.log(timePassed, timeLeft);
    timeLabel.innerHTML = formatTime(TIME_LIMIT);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  timer.setAttribute("stroke-dasharray", circleDasharray);
}

function onClickSetShareUrl(callback) {
    if (app === null)
    {
        callback();
        return;
    }
    setShareUrl(callback);
  }

  function setShareUrl() 
  {
    var internalUrl = "https://comingzero.github.io/meetingcountdown?countdowntime=" + TIME_LIMIT;
    var externalUrl = internalUrl;
    var title = "Countdown Timer";
    var opt = {};

    app.setShareUrl(internalUrl, externalUrl, title, opt)
      .then(function (res) {
        log("Promise setShareUrl success", JSON.stringify(res));
      })
      .catch(function (reason) {
        log("setShareUrl: fail reason=" + reason);
      });
  }