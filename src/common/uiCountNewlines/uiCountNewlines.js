/**
* uiCountNewlines Module
*
* Description
*/
var uiCountNewlines = angular.module('uiCountNewlines', []);

uiCountNewlines.factory('uiCountNewlines', function () {
	return function(text) {
		return text.length;
	};
});