'use strict';

/* Controllers */

var morseControllers = angular.module('morseControllers', []);

function MorseNode(ac, rate) {
    // ac is an audio context.
    this._oscillator = ac.createOscillator();
    this._gain = ac.createGain();

    this._gain.gain.value = 0;
    this._oscillator.frequency.value = 750;

    this._oscillator.connect(this._gain);

    if(rate == undefined)
        rate = 20;
    this._dot = 1.2 / rate; // formula from Wikipedia.

    this._oscillator.start(0);
}

MorseNode.prototype.connect = function(target) {
    return this._gain.connect(target);
}

MorseNode.prototype.MORSE = {
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--..",

    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "0": "-----"
};

MorseNode.prototype.playChar = function(t, c) {
    for(var i = 0; i < c.length; i++) {
        switch(c[i]) {
        case '.':
            this._gain.gain.setValueAtTime(1.0, t);
            t += this._dot;
            this._gain.gain.setValueAtTime(0.0, t);
            break;
        case '-':
            this._gain.gain.setValueAtTime(1.0, t);
            t += 3 * this._dot;
            this._gain.gain.setValueAtTime(0.0, t);
            break;
        }
        t += this._dot;
    }
    return t;
}

MorseNode.prototype.playString = function(t, w) {
    w = w.toUpperCase();
    for(var i = 0; i < w.length; i++) {
        if(w[i] == ' ') {
            t += 3 * this._dot; // 3 dots from before, three here, and
                                // 1 from the ending letter before.
        }
        else if(this.MORSE[w[i]] != undefined) {
            t = this.playChar(t, this.MORSE[w[i]]);
            t += 2 * this._dot;
        }
    }
    return t;
}

morseControllers.controller('TrainCtrl', ['$scope',
  function($scope){
    $scope.level = 0;
    $scope.alphabet = ' kmrsuaptlowi.njef0yv,g5/q9zh38b?427c1d6x'.split('');
    $scope.gen = null;


    $scope.settings = {
        'display_delay': 2,
        'pitch': 700,
        'wpm_actual': 25,
        'wpm_effective': 25,
    }
    $scope.setLevel = function(level){
      $scope.level = level
      $scope.level_alphabet = $scope.alphabet.slice(0, $scope.level + 2);
    };

    // Morse connector.
    var ac = new (window.AudioContext || window.webkitAudioContext)();
    var morse = new MorseNode(ac);
    morse._oscillator.frequency.value = $scope.pitch;
    morse.connect(ac.destination);

    //
    $scope.tapeActual = []
    $scope.running = false;

    $scope.toggleState = function(){
        $scope.running = !$scope.running;

        if($scope.running){
            // TODO: math
            $scope.gen = setInterval($scope.logger, $scope.settings['wpm_actual'] * 10);
        }else{
            clearInterval($scope.gen)
        }
    }

    $scope.logger = function(){
        var letter = $scope.level_alphabet[
            Math.floor(Math.random() * $scope.level_alphabet.length)];

        $scope.$apply(function(){
            $scope.tapeActual.push(letter)
            console.log($scope.tapeActual)
            morse.playString(ac.currentTime, letter);
        })
    }

    $scope.setLevel(1);

    $scope.$watch('settings.wpm_actual', function() {
        if($scope.running){
            $scope.toggleState()
            $scope.toggleState()
        }
    });

  }]);
