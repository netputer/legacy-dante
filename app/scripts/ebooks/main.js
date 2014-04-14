define([
	'angular',
	'ebooks/controllers/ebooks'
], function(
	angular,
	ebooksController
) {
	'use strict';

	angular.module('wdEbooks', ['wdCommon'])
		.controller('wdEbooksController', ebooksController);
});