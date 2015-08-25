// Add useful methods to Float32Array from Array

Float32Array.prototype.indexof = function(value) {
    return Array.prototype.indexOf.call(this, value);
};

Float32Array.prototype.slice = function(start, count) {
    return Array.prototype.slice.call(this, start, count);
};

Float32Array.prototype.max = function() {
    return Math.max.apply(null, this);
};