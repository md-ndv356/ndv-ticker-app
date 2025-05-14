// initialize Background Music
var backMsc = [];

// initialize Web Audio API
const audioAPI = {
  init: function(){
    audioAPI.context = new AudioContext();
    audioAPI.gainNode = audioAPI.context.createGain();
    audioAPI.gainNode.gain.value = 0.1;
    audioAPI.oscillatorNode = undefined;
    audioAPI.gainNode.connect(audioAPI.context.destination);
  },
  fun: {
    setOscillator: function(){
      audioAPI.oscillatorNode = audioAPI.context.createOscillator();
      audioAPI.oscillatorNode.connect(audioAPI.gainNode);
      audioAPI.oscillatorNode.frequency.value = 1000; // 987.767 - 1318.510
      audioAPI.oscillatorNode.type = "square";
      audioAPI.oscillatorNode.addEventListener("ended", function(){
        let freq = audioAPI.oscillatorNode.frequency.value;
        audioAPI.oscillatorNode.disconnect(audioAPI.gainNode);
        audioAPI.fun.setOscillator();
        audioAPI.oscillatorNode.frequency.value = freq;
      });
      audioAPI.oscillatorNode.starting = false;
    },
    startOscillator: function(){
      audioAPI.oscillatorNode.starting = true;
      audioAPI.oscillatorNode.start();
    },
    stopOscillator: function(time = 0){
      audioAPI.oscillatorNode.starting = false;
      audioAPI.oscillatorNode.stop(audioAPI.context.currentTime + time);
    },
    freqB5: function(){audioAPI.oscillatorNode.frequency.value = 987.767;},
    freqE6: function(){audioAPI.oscillatorNode.frequency.value = 1318.51;},
    freqTS: function(){audioAPI.oscillatorNode.frequency.value = 1000;}
  }
};