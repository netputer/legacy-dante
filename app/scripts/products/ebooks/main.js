define([
	'angular',
	'products/ebooks/controllers/ebooks'
], function(
	angular,
	ebooksController
) {
	'use strict';

	angular.module('wdEbooks', ['wdCommon'])
		.controller('wdEbooksController', ebooksController);
});