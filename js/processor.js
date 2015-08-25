/**
 * Created by rubchick on 19.08.15.
 * processor.js
 */

(function () {

    var NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    var DEFAULT_FREQUENCY = 440.0;

    // blackman algorithm
    var blackmanWindow = function (size) {
        var window = new Float32Array(size);
        for (var i = 0; i < window.length; i++) {
            window[i] = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (window.length - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (window.length - 1));
        }

        return window;
    };

    // step is the between La 440Hz (A4)
    var getStep = function (frequency) {
        return 12 * Math.log(frequency / DEFAULT_FREQUENCY) / Math.LN2;
    };

    // Get octave from the step
    var getOctave = function (step) {
        return ((step - 2) / Math.abs(step - 2)) * Math.floor(Math.abs(step - 2) / 12) + 4;
    };

    // get note from the step
    var getNote = function (step) {
        var idx = Math.round(step) % NOTES.length;
        if (idx < 0)
            return NOTES[12 + idx];
        else
            return NOTES[idx];
    };

    var Processor = function (controller) {
        // max frequency to analyse
        this.highFrequency = 350.0;
        // precision of computation
        this.precision = 4 * 16384;

        // processor controller
        this.controller = controller;

        // create audio context
        this.audioContext = GuitarTuner.createAudioContext();
        this.inputStream = new Float32Array(this.precision);
        this.fft = new FFT(this.precision, this.audioContext.sampleRate);
        this.scriptNode = this.audioContext.createScriptProcessor(Math.min(this.precision, 16384), 1, 1);

        // listen to audio input
        var self = this;
        this.scriptNode.onaudioprocess = function (audioProcessingEvent) {
            var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

            if (self.getAverageVolume(inputData) < 0.000001) {
                // skip mic noise etc....
                return;
            }

            self.update(inputData);
        };

        this.scriptNode.connect(this.audioContext.destination);

        // reset input
        this.input = null;

        // init window for sound analyse
        this.window = blackmanWindow(this.precision);

    };

    Processor.prototype = {
        // onReady is the ready callback
        init: function (onReady, onError) {
            var self = this;

            //init audio context
            if (!GuitarTuner.html5Supported()) {
                onError();
                return;
            }

            GuitarTuner.getUserMedia({audio: true}, function (stream) {

                self.input = self.audioContext.createMediaStreamSource(stream);
                self.input.connect(self.scriptNode);
                //ready
                onReady();

            }, function (e) {
                onError(e);
            });
        },

        // update fft with current values
        update: function (inputData) {
            // buffer turn
            this.inputStream.set(this.inputStream.subarray(this.precision));
            this.inputStream.set(inputData, this.inputStream.length - inputData.length);

            // apply window
            for (var i = 0; i < inputData.length; i++) {
                this.inputStream[i] *= this.window[i];
            }

            // forward fft
            this.fft.forward(this.inputStream);

            // compensate micro response
            for (var i = 0; i < this.fft.spectrum.length; i++) {
                this.fft.spectrum[i] *= this.microResponse(i);
            }

            // update view
            this.controller.notify(this.getInfo());
        },

        // return error
        getError: function () {
            return this.audioContext.sampleRate / this.precision;
        },

        // Return FFT of input signal
        getData: function () {
            return this.fft.spectrum;
        },

        // Return error of measurement in step
        getStepError: function (frequency) {
            return getStep(frequency + this.getError()) - getStep(frequency);
        },

        getInfo: function () {
            // frequencies by FFT
            // Apply lowpass filter directly on fft
            var frequencies = this.getData().subarray(0, this.highFrequency / this.getError());

            // Max frequency
            var frequency = (frequencies.indexof(frequencies.max()) * this.getError());

            // no sound
            if (frequency == 0) {
                frequency = DEFAULT_FREQUENCY;
            }

            var step = getStep(frequency);
            return {frequency: frequency, step: step, error: this.getError(frequency), stepError: this.getStepError(frequency), note: getNote(step), octave: getOctave(step)};
        },

        // microphone response is not linear
        // for low frequency there are an attenuation
        // that need to be compensate.
        microResponse: function (i) {
            if (i * this.getError() < this.microphoneResponseFrequency) {
                return -1 * 0.06 * this.getError() * i + 13;
            }
            else {
                return 1.0;
            }
        },

        getAverageVolume: function (array) {
            var values = 0;
            var average;

            var length = array.length;

            // get all the frequency amplitudes
            for (var i = 0; i < length; i++) {
                values += array[i];
            }

            average = values / length;
            return average;
        }
    };

    GuitarTuner.Processor = Processor;
})();