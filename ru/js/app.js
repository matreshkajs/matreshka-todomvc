// Этор документация к реализации [TodoMVC](https://todomvc.com), используя фреймворк [Matreshka.js](http://finom.github.io/matreshka/). Живая версия находится  [на этой странице](http://finom.github.io/matreshka/todo/ru/).
"use strict"; 
// Как и требует спецификация TodoMVC, присваиваем соответствующим переменным коды клавиш. После этого ждем загрузки DOM дерева.
var ENTER_KEY = 13;
var ESC_KEY = 27;

$( function() {
	// Создаем кастомный привязчик ([binder](http://finom.github.io/matreshka/docs/global.html#binder)), который будет синхронизировать значение свойства с тем, будет ли виден элемент на странице или нет (используя  метод [jQuery.fn.toggle](http://api.jquery.com/toggle/)).
	// ```js
	// this.bindElement( 'x', element, MK.binders.display() );
	// this.x = false; // элемент не видим (display:none)
	// this.x = true; // элемент видим```
	MK.binders.display = function() {
		return {
			setValue: function( v ) {
				$( this ).toggle( !!v );
			}
		};
	};
	// Инициализируем приложение.
	window.app = new Todos();
	// См. [todos.js](todos.html) and [todo.js](todo.html)
	//
	// [English version](http://finom.github.io/matreshka/todo/docs/app.html)
});
