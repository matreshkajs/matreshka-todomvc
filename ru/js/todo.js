// **todo.js** содержит класс ``Todo``, который используется, как модель (``Model``) для главного класса (``Todos``). Класс ``Todo`` наследуется от класса [MK.Object](http://finom.github.io/matreshka/docs/Matreshka.Object.html).
"use strict";
this.Todo = Class({
	'extends': MK.Object,
	constructor: function( data ) {
		this
			// Инициализируем Матрешку с помощью метода [initMK](http://finom.github.io/matreshka/docs/Matreshka.Object.html#initMK).
			.initMK()
			// Присваиваем значения по умолчанию и добавляем ключи ``"title"`` and ``"completed"`` в список ключей, отвечающих за данные (см. [jset](http://finom.github.io/matreshka/docs/Matreshka.Object.html#jset-1)).
			// Свойство ``"title"`` по умолчанию - пустая строка.
			// Свойство ``"completed"`` по умолчанию - ``false``.
			.jset({
				title: '',
				completed: false
			})
			// Теперь присваиваем свойствам данные, которые конструктор получил в качестве аргумента, перезаписывая значения по умолчанию (например,  ``{ title: 'Do it!' }``). 
			.set( data )
			// Свойство ``"visible"`` отвечает за видимость элемента списка дел на странице.
			.set( 'visible', true )
			// Ждем событие ``"render"``, используя метод [on](http://finom.github.io/matreshka/docs/Matreshka.Array.html#on). Событие срабатывает, когда отрисовывается элемент, соответствующий экземпляру класса.
			.on( 'render', function( evt ) {
				this
					// Событие ``"render"`` передаёт в обработчик аргумент (объект события), который содержит отрисованный элемент.
					// Мы присязываем (ассоциируем) этот элемент к экземпляру класса, делая его "главным" для этого экземпляра, используя метод [bindElement](http://finom.github.io/matreshka/docs/Matreshka.html#bindElement-1). Почему мы должны это делать вручную? Потому что один экземпляр (модель) может быть элементом нескольких разных массивов.
					.bindElement( this, evt.element )
					// Привязка элементов, которые не требуют указания привязчика (binder). Здесь используются стандартные привязчики ([defaultBinders](http://finom.github.io/matreshka/docs/Matreshka.html#defaultBinders)), если возможно.
					// * Свойство ``"completed"`` привязывается к чекбоксу с классом ``toggle``
					// * Свойство ``"edit"`` привязывается к полю (input type=text) с классом ``edit``
					// * Свойство ``"destroy"`` привязывается к элементу с классом ``destroy``, который не имеет стандартного привязчика. Это значит, что элемент просто ассоциируется со свойством, не синхронизируясь с его значением.
					.bindElement({
						completed: this.$( '.toggle' ),
						edit: this.$( '.edit' ),
						destroy: this.$( '.destroy' )
					})
					// Эти привязки используют третий аргумент в качестве привязчика.
					// * Видимость главного элемента будет зависеть от значения свойства ``"visible"`
					// * Наличие класса ``"completed"`` у главного элемента будет зависеть от значения свойства ``"completed"``
					// * Наличие класса ``"editing"`` у главного элемента будет зависеть от значения свойства ``"editing"``
					// * Привязываем элемент ``label``, чей  ``innerHTML`` будет синхронизироваться со значением свойства ``"title"``
					.bindElement( 'visible', this.$bound(), MK.binders.display() )
					.bindElement( 'completed', this.$bound(), MK.binders.className( 'completed' ) )
					.bindElement( 'editing', this.$bound(), MK.binders.className( 'editing' ) )
					.bindElement( 'title', this.$( 'label' ), MK.binders.innerHTML() )
					// Добавляем обработчик события двойного щелчка мышью (``"dblclick"``) для элемента, привязанного к свойству ``"title"`` (тег ``label``).
					// Когда срабатывает обработчик, мы меняем "режим" экземпляра на редактирование, присваивая свойству ``"editing"`` значение ``true``. Это действие добавляет класс ``"edit"`` главному элементу (см. привязки выше).
					// Затем мы присваиваем текущее значение свойства ``"title"`` свойству ``"edit"``.
					// После этого устанавливаем фокус на поле, привязанное к свойству ``"edit"``.
					.on( 'dblclick::title', function() {
						this.editing = true;
						this.edit = this.title;
						this.$bound( 'edit' ).focus();
					})
					// Добавляем обработчик события ``"keyup"`` элементу, привязанному к свойству ``"edit"``.
					// Если нажата клавиша ``Esc``, возвращаемся из режима редактирования в обычный режим.
					// Если нажата класиша ``Enter``, удаляем лишние пробелы у значения свойства ``"edit"`` и присваиваем его свойству ``"title"``. Затем, возвращаемся из режима редактирования в обычный режим. Если значение - пустая строка, вызываем событие ``readytodie``, которое слушается классом ``Todos``.
					.on( 'keyup::edit', function( evt ) {
						var editValue;
						if( evt.which === ESC_KEY ) {
							this.editing = false;
						} else if( evt.which === ENTER_KEY ) {
							if( editValue = this.edit.trim() ) {
								this.title = editValue;
								this.editing = false;
							} else {
								this.trigger( 'readytodie', this );
							}
						}
					})
					// Если кликнуть по элементу, отвечающему за удаление пункта, вызываем событие ``readytodie``, которое слушается классом ``Todos``.
					.on( 'click::destroy', function() {
						this.trigger( 'readytodie', this );
					})
				;
			});
		;
	}
});