/**
 * Created by rubchick on 19.08.15.
 * guitar_tuner.js
 */

(function () {
    GuitarTuner = function () {};

    GuitarTuner.prototype = {

        getUserMediaFunction: function () {
            return navigator.getUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.msGetUserMedia;
        },

        getUserMedia: function (constraint, success, error) {
            return this.getUserMediaFunction().call(navigator, constraint, success, error);
        },

        createAudioContext: function () {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            return new AudioContext();
        },

        html5Supported: function () {
            return !!this.getUserMediaFunction();
        }
    };
})();

GuitarTuner = new GuitarTuner();

// Each guitar string step from La 440 Hz
var STEP = [-5, -10, -14, -19, -24, -29];
var NOTE_LATIN = ["E", "B", "G", "D", "A", "E"];

var getGuitarString = function (info) {
    // get closest note
    var diff = STEP.map(function (e) {
        return Math.abs(e - info.step);
    });

    var string = diff.indexOf(Math.min.apply(null, diff));

    // get delta
    var delta = STEP[string] - info.step;
    if (Math.abs(delta) - info.stepError < 0) {
        delta = 0;
    }

    return { string: string + 1, note: NOTE_LATIN[string], delta: delta };
};

// Guitar tuner view drawer
var TunerDrawer = function () {
};

TunerDrawer.prototype = {
    // process tuner drawing
    notify: function (info) {

        var stringInfo = getGuitarString(info);

        window.tuner.value = - (stringInfo.delta / 5.0)*10;
        window.tuner.note = stringInfo.note;
        window.tuner.changePosition();
    }
};

GuitarTuner.TunerDrawer = TunerDrawer;