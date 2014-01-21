/**
* utils Module
*
* Description
*/
var utils = angular.module('utils', []);

utils.factory('stringCount', function () {
	return function(text, stringToFind) {
		return text.split(stringToFind).length -1;
	};
});