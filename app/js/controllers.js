'use strict';

/* Controllers */

var morseControllers = angular.module('morseControllers', []);

function MorseNode(ac, pitch, rate) {
    // ac is an audio context.
    this._oscillator = ac.createOscillator();
    this._gain = ac.createGain();

    this._gain.gain.value = 0;
    this._oscillator.frequency.value = 750;

    this._oscillator.connect(this._gain);

    if(rate == undefined)
        rate = 20;
    this.setRate(rate)

    this._oscillator.start(0);
}

MorseNode.prototype.setRate = function(rate) {
    this._dot = 1.2 / rate; // formula from Wikipedia.
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

morseControllers.controller('TrainCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage){
    $scope.alphabet = '_kmrsuaptlowi.njef0yv,g5/q9zh38b?427c1d6x'.split('');
    $scope.gen = null;
    $scope.$storage = $localStorage.$default({
        'display_delay': 2,
        'pitch': 700,
        'wpm_actual': 25,
        'level_size': 150,
        'level': 1,
        'maxAchieved': 1,
    });

    $scope.setLevel = function(level){
        // Store our new level
        $scope.$storage.level = level
        // If we've not been to this level yet, upgrade us.
        if($scope.$storage.level > $scope.$storage.maxAchieved){
            $scope.$storage.maxAchieved = $scope.$storage.level;
        }
        // Update the levle alphabet
        $scope.level_alphabet = $scope.alphabet.slice(0, $scope.$storage.level + 2);
        $scope.tapeActual = []
        $scope.levelComplete = false;
        // Reset the text area
        $scope.text = "";
    };
    $scope.levelComplete = false;
    $scope.canAdvance = false;
    $scope.text = "";

    // Morse connector.
    $scope.ac = new (window.AudioContext || window.webkitAudioContext)();
    $scope.morse = new MorseNode($scope.ac, $scope.$storage.pitch, 20);
    $scope.morse.connect($scope.ac.destination);

    //
    $scope.tapeActual = []
    $scope.running = false;
    $scope.lastWasSpace = true;

    $scope.advanceLevel = function(){
        // If they can advance, or if they've backtracked to a previous level...
        if($scope.canAdvance || $scope.$storage.level < $scope.$storage.maxAchieved){
            // Then allow them to go to the next level
            $scope.setLevel($scope.$storage.level + 1)

            if($scope.$storage.level == $scope.$storage.maxAchieved){
                $scope.canAdvance = false;
            }
        }
    }

    $scope.fallbackLevel = function(){
        $scope.setLevel($scope.$storage.level - 1)
    }

    $scope.toggleState = function(){
        $scope.running = !$scope.running;

        if($scope.levelComplete){
            console.log($scope.text)
            var d = new Levenshtein($scope.tapeActual.join("").replace('_', ' '), $scope.text)
            if(($scope.$storage.level_size - d / (0.0 + $scope.$storage.level_size)) > 0.90){
                // Passed the level
                $scope.canAdvance = true;
            }
        }

        if($scope.running){
            var rate = (1000 * 90) / (7 * $scope.$storage.wpm_actual)
            $scope.gen = setInterval($scope.logger, rate);
        }else{
            clearInterval($scope.gen)
        }
    }

    $scope._genLetter = function(){
        return $scope.level_alphabet[Math.floor(Math.random() * $scope.level_alphabet.length)];
    }

    $scope.logger = function(){
        if(($scope.tapeActual.length + 2) > $scope.$storage.level_size){
            // Mark as complete
            $scope.levelComplete = true;
            // level complete, so stop it.
            $scope.toggleState()
        }

        var letter = $scope._genLetter();
        // Don't have duplicate spaces, and don't start with a space.
        if($scope.lastWasSpace) {
            var cont = true;
            while(cont){
                var l = $scope._genLetter();
                // If we last had a space, don't allow another.
                if(l != "_"){
                    letter = l;
                    $scope.lastWasSpace = false;
                    cont = false;
                }
            }
        }
        if(letter == "_"){
            $scope.lastWasSpace = true;
        }

        $scope.$apply(function(){
            $scope.tapeActual.push(letter)
            $scope.morse.playString($scope.ac.currentTime, letter);
        })
    }

    $scope.setLevel($scope.$storage.level);

    $scope.$watch('$storage.wpm_actual', function() {
        if($scope.running){
            $scope.toggleState()
            $scope.toggleState()
        }
    });

    $scope.$watch('$storage.pitch', function() {
        // Update pitch
        $scope.morse._oscillator.frequency.value = $scope.$storage.pitch
    });

  }]);
