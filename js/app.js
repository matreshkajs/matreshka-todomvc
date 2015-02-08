// This is documentation for [TodoMVC](https://todomvc.com) implimentation using [Matreshka.js](http://finom.github.io/matreshka/) framework. Check the [live version](http://finom.github.io/matreshka/todo/).
"use strict";
// Key code variables definition as TodoMVC cpecification says then waiting for DOM ready event.
var ENTER_KEY = 13;
var ESC_KEY = 27;

$( function() {
	// We're creating custom [binder](http://finom.github.io/matreshka/docs/global.html#binder) that will switch bound element visibility depending on property value using [jQuery.fn.toggle](http://api.jquery.com/toggle/) method.
	// ```js
	// this.bindElement( 'x', element, MK.binders.display() );
	// this.x = false; // element is hidden
	// this.x = true; // element is shown```
	MK.binders.display = function() {
		return {
			setValue: function( v ) {
				$( this ).toggle( !!v );
			}
		};
	};
	// Initializing application.
	window.app = new Todos();
	// Look at [todos.js](todos.html) and [todo.js](todo.html)
	// 
	// [На русском](http://finom.github.io/matreshka/todo/ru/docs/app.html)
});
