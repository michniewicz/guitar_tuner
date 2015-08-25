/**
 * Created by rubchick on 20.08.15.
 * tuner_ui.js
 */
var TunerUI = function (prefs) {
    var self = this;
    this.value = 0; // default value
    this.note = 'E'; // default note
    this.properties = {
        maxVal: 20, // Max value of the meter
        minVal: -20, // Min value of the meter
        divFact: 10, // Division value of the meter
        initDeg: 90, // reading begins angle
        maxDeg: 90, // total angle of the meter reading
        edgeRadius: 150, // radius of the meter circle
        tunerArrowH: 4, // tuner arrow height
        tunerArrowW: 95, // tuner arrow width
        tunerArrowL: 13, // tuner arrow left position
        indicatorRadius: 125, // radius of indicators position
        indicatorNumRadius: 90, // radius of numbers position
        levelPositionTxtWH: 80, // current value of string tone
        nobW: 16, // indicator nob width
        nobH: 2, // indicator nob height
        numW: 22, // indicator number width
        numH: 16, // indicator number height
        midNobW: 10, // mid nob width
        midNobH: 3, // mid nob height
        noOfSmallDiv: 2 // divs between the main div
    };
    if (typeof prefs === 'object') {
        for (var prop in prefs) {
            this.properties[prop] = prefs[prop];
        }
    }
    var toneToDegree,
        noOfDev = this.properties.maxVal / this.properties.divFact,
        divDeg = this.properties.maxDeg / noOfDev,
        arrowWH = this.properties.edgeRadius * 2,
        tunerArrowTop = this.properties.edgeRadius - this.properties.tunerArrowH / 2,
        tunerArrowAngle = this.properties.initDeg,
        levelPositionTxtTL = this.properties.edgeRadius - this.properties.levelPositionTxtWH / 2,
        tempDiv = '',
        indicatorLinesPosLeft, indicatorLinesPosTop, indicatorNumPosLeft, indicatorNumPosTop;

    this.setupCss = function () {
        var tempStyleVar = [
            '<style>',
                '#' + this.parentElemId + ' .tunerBlock{',
                'width  :' + arrowWH + 'px;',
                'height :' + arrowWH + 'px;',
            '}',
                '#' + this.parentElemId + ' .tunerArrow{',
                'height            :' + this.properties.tunerArrowH + 'px;',
                'top               :' + tunerArrowTop + 'px;',
                'transform         :rotate(' + tunerArrowAngle + 'deg);',
                '-webkit-transform :rotate(' + tunerArrowAngle + 'deg);',
                '-moz-transform    :rotate(' + tunerArrowAngle + 'deg);',
                '-o-transform      :rotate(' + tunerArrowAngle + 'deg);',
            '}',
                '#' + this.parentElemId + ' .levelPosition{',
                'width  :' + this.properties.levelPositionTxtWH + 'px;',
                'height :' + this.properties.levelPositionTxtWH + 'px;',
                'top  :' + levelPositionTxtTL + 'px;',
                'left :' + levelPositionTxtTL + 'px;',
            '}',
                '#' + this.parentElemId + ' .tunerArrow div{',
                'width  :' + this.properties.tunerArrowW + 'px;',
                'left :' + this.properties.tunerArrowL + 'px;',
            '}',
                '#' + this.parentElemId + ' .nob{',
                'width  :' + this.properties.nobW + 'px;',
                'height :' + this.properties.nobH + 'px;',
            '}',
                '#' + this.parentElemId + ' .num{',
                'width  :' + this.properties.numW + 'px;',
                'height :' + this.properties.numH + 'px;',
            '}',
                '#' + this.parentElemId + ' .midNob{',
                'width  :' + this.properties.midNobW + 'px;',
                'height :' + this.properties.midNobH + 'px;',
            '}',
            '</style>'
        ].join('');
        this.parentElem.append(tempStyleVar);
    };
    this.createHtmlElements = function () {
        this.parentElemId = 'tunerWrapper';

        var tunerMeterElt = $('#tunerMeter');

        tunerMeterElt.wrap('<div id="' + this.parentElemId + '" class="span6">');
        $('#tunerWrapper').css({float: 'none', margin: '0 auto', width: '300px'});
        this.parentElem = tunerMeterElt.parent();
        this.setupCss();
        this.createIndicators();
    };
    this.createIndicators = function () {
        for (var i = this.properties.minVal / this.properties.divFact; i <= noOfDev; i++) {
            var curDig = this.properties.initDeg + i * divDeg;
            var curIndVal = i * this.properties.divFact;

            var indicatorLinesPosY = this.properties.indicatorRadius * Math.cos(0.01746 * curDig);
            var indicatorLinesPosX = this.properties.indicatorRadius * Math.sin(0.01746 * curDig);
            var indicatorNumPosY = this.properties.indicatorNumRadius * Math.cos(0.01746 * curDig);
            var indicatorNumPosX = this.properties.indicatorNumRadius * Math.sin(0.01746 * curDig);

            var tempDegInd = null;

            if (i % this.properties.noOfSmallDiv == 0) {
                indicatorLinesPosLeft = (this.properties.edgeRadius - indicatorLinesPosX ) - 2;
                indicatorLinesPosTop = (this.properties.edgeRadius - indicatorLinesPosY) - 10;

                tempDegInd =
                    'transform         :rotate(' + curDig + 'deg);' +
                    '-webkit-transform :rotate(' + curDig + 'deg);' +
                    '-o-transform      :rotate(' + curDig + 'deg);' +
                    '-moz-transform    :rotate(' + curDig + 'deg);';
                tempDiv += '<div class="nob" style="left:' + indicatorLinesPosTop + 'px;top:' + indicatorLinesPosLeft + 'px;' + tempDegInd + '"></div>';
                indicatorNumPosLeft = (this.properties.edgeRadius - indicatorNumPosX) - (this.properties.numW / 2);
                indicatorNumPosTop = (this.properties.edgeRadius - indicatorNumPosY) - (this.properties.numH / 2);
                tempDiv += '<div class="num" style="left:' + indicatorNumPosTop + 'px;top:' + indicatorNumPosLeft + 'px;">' + curIndVal + '</div>';
            } else {
                indicatorLinesPosLeft = (this.properties.edgeRadius - indicatorLinesPosX ) - (this.properties.midNobH / 2);
                indicatorLinesPosTop = (this.properties.edgeRadius - indicatorLinesPosY) - (this.properties.midNobW / 2);
                tempDegInd =
                    'transform         :rotate(' + curDig + 'deg);' +
                    '-webkit-transform :rotate(' + curDig + 'deg);' +
                    '-o-transform      :rotate(' + curDig + 'deg);' +
                    '-moz-transform    :rotate(' + curDig + 'deg);';
                tempDiv += '<div class="nob midNob" style="left:' + indicatorLinesPosTop + 'px;top:' + indicatorLinesPosLeft + 'px;' + tempDegInd + '"></div>';
                tempDiv += '<div class="num"></div>';
            }
        }

        var tunerArrow = '<div class="tunerArrow"><div id="tunerArrowLine"></div></div><div class="levelPosition"></div>';

        this.parentElem.append('<div class="tunerBlock">');
        this.parentElem.find(".tunerBlock").append(tunerArrow + tempDiv);
    };

    this.changePosition = function () {
        var value = this.value;
        if (value > self.properties.maxVal) {
            value = self.properties.maxVal;
        }
        if (isNaN(value) || value < self.properties.minVal) {
            value = 0;
        }
        toneToDegree = (self.properties.maxDeg / self.properties.maxVal) * value + self.properties.initDeg;

        self.parentElem.find(".tunerArrow").css({
            "transform": 'rotate(' + toneToDegree + 'deg)',
            "-webkit-transform": 'rotate(' + toneToDegree + 'deg)',
            "-moz-transform": 'rotate(' + toneToDegree + 'deg)',
            "-o-transform": 'rotate(' + toneToDegree + 'deg)'
        });
        self.parentElem.find(".levelPosition").html(this.note);

        if (value > -0.5 && value < 0.5) {
            document.getElementById("tunerArrowLine").style.background = "green";
        } else {
            document.getElementById("tunerArrowLine").style.background = "black";
        }
    };
    this.createHtmlElements();
};