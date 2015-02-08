// **todos.js** - самый большой файл в этом проекте, который содержит большую часть логики. В проектах большего объема я советую разделать приложения на еще более мелкие составляющие. 
// Класс ``Todos`` наследует ``MK.Array``, представляя из себя "коллекцию"
"use strict";
this.Todos = Class({
	'extends': MK.Array,
	Model: Todo,
	// Определяя метод [itemRenderer](http://finom.github.io/matreshka/docs/Matreshka.Array.html#itemRenderer) вы создаете рендерер для каждого добавленного элемента массива. В данном случае, шаблон содержится в элементе с id=todo_item_template (см. HTML код).
	itemRenderer: function() {
		return $( '#todo_item_template' ).html();
	},
	constructor: function() {
		var self = this
			// Инициализируем Матрешку с помощью метода [initMK](http://finom.github.io/matreshka/docs/Matreshka.Array.html#initMK).
			.initMK()
			// Добавляем зависимость свойства ``"leftLength"`` от свойств ``"length"`` и ``"completedLength"``, как их разность. Приложение "слушает" изменения в этих свойствах, вычисляя ``"leftLength"`` при каждом изменении.
			.addDependency( 'leftLength', 'length completedLength', function( length, completedLength ) {
				return length - completedLength;
			})
			// Метод ``"bindings"`` добавляет привязки между свойствами экземпляра класса и DOM элементами. Метод ``"events"``, как можно догадаться, добавляет обработчики событий. Эти имена методов не являются специальными, я просто сгруппировал разные действия и поместил их в методы, которые захотел назвать ``"bindings"`` и ``"events"``. После их вызова, вынимаем данные из локального хранилища и создаем из него элементы todo с помощью метода [createFrom](http://finom.github.io/matreshka/docs/Matreshka.Array.html#createFrom).
			.bindings()
			.events()
			.createFrom( JSON.parse( localStorage[ 'todos-matreshka' ] || '[]' ) )
			// После того, как мы создали список дел из JSON, хранящегося в ``localStorage``, добавляем обработчик события на изменение свойства ``"JSON"``, которое хранит представление списка todo в виде JSON строки. Обратите внимение на используемый метод [procrastinate](http://finom.github.io/matreshka/docs/Matreshka.html#procrastinate). Он превращает функцию, переданную ему в качестве аргумента, в "вызываемую только один раз за промежуток времени". То есть, если событие срабатывает много раз за несколько миллисекунд (непример, при добавлении todo в цикле), то обработчик вызовется только однажды. Нам нужна эта оптимизация потому что ``localStorage`` хранит данные на жестком диске, который работает очень медленно по сравнению с оперативной памятью.
			.on( 'change:JSON', MK.procrastinate( function( evt ) {
				localStorage[ 'todos-matreshka' ] = evt.value;
			}) )
		;
		
		// Мы используем библиотеку для роутинга [director](https://github.com/flatiron/director), как того требует спецификация TodoMVC. Когда ``location.hash`` меняется, его значение присваивается свойству ``"route"``.
		Router({
			':state': function( state ) {
				self.route = state;
			},
			'': function() {
				self.route = '';
			}
		}).init();
	},
	// # Привязки
	bindings: function() {
		return this
			// Привязываем (ассоциируем) "главный" элемент, который имеет id="todoapp" к экземпляру класса. После этого присязываем несколько других элементов (main, footer и т. д.).
			.bindElement( this, '#todoapp' )
			.bindElement({
				main: '#main',
				footer: '#footer',
				newTodo: '#new-todo',
				container: '#todo-list',
				allCompleted: '#toggle-all',
				clearCompleted: '#clear-completed'
			})
			// Следующий вызов [bindElement](http://finom.github.io/matreshka/docs/Matreshka.html#bindElement-1) делает видимость элементов зависимым от значений соответствующих свойств (если значение проходит не-строгую проверку на равенство ``true``, элемент будет показан, иначе - спрятан). Метод [$bound](http://finom.github.io/matreshka/docs/Matreshka.html#$bound) возвращает элемент(ы), который привязан к соответствующему свойству или свойствам, разделенным пробелом.
			// ```js
			// //возвращает элемент '#clear-completed'
			// this.$bound( 'clearCompleted' );
			// //возвращает оба элемента: '#main' и '#footer'
			// this.$bound( 'main footer' ); ```
			.bindElement({
				completedLength: this.$bound( 'clearCompleted' ),
				length: this.$bound( 'main footer' )
			}, MK.binders.display() )
			// Следующие две привязки меняют html привязанных элементов в зависимость от значения соответствующего свойства.
			.bindElement( 'completedLength', this.$bound( 'clearCompleted' ), {
				setValue: function( v ) {
					$( this ).html( 'Clear completed (' + v + ')' );
				}
			})
			.bindElement( 'leftLength', '#todo-count', {
				setValue: function( v ) {
					$( this ).html( '<strong>' + v + '</strong> item' + ( v !== 1 ? 's' : '' ) + ' left' );
				}
			})
			// Эта привязка контролирует, какая именно ссылка ("All", "Active", "Completed") будет выделена жирным шрифтом. Я решил связать элемент ``#filters`` со свойством ``"route"``, но в привязчике манипулировать ссылками внутри этого элемента. Просто взгляните на код.
			.bindElement( 'route', '#filters', {
				setValue: function( v ) {
					$( this ).find( 'a' ).each( function() {
						var $this = $( this );
						$this.toggleClass( 'selected', $this.attr( 'href' ) === '#/' + v );
					});
				}
			})
		;
	},
	// # События
	events: function() {
		return this
			// Если в инпуте, привязанном к свойству ``"newTodo"`` нажата клавиша  ``Enter`` и если очищенное от пробелов значение этого свойства не является пустой строкой, добавляем новый пункт todo, используя метод [push](http://finom.github.io/matreshka/docs/Matreshka.Array.html#push).
			.on( 'keyup::newTodo', function( evt ) {
				var newTodo;
				if( evt.which === ENTER_KEY ) {
					if( newTodo = this.newTodo.trim() ) {
						this.push({
							title: newTodo
						});
					}
					
					this.newTodo = '';
				}
			})
			// Код выше (см. привязки) показывает, что свойство ``"allCompleted"`` ассоциировано с элементом ``#toggle-all``. Когда меняется его значение, мы присваиваем свойствам ``"completed"`` для всех todo то же самое значение. Флаг ``"silent"`` говорит о том, что событие ``"change:completed"`` не должно быть вызвано.
			.on( 'change:allCompleted', function( evt ) {
				this.forEach( function( todo ) {
					todo.set( 'completed', evt.value, { silent: true });
				});
				
				this.completedLength = evt.value ? this.length : 0;
			})
			// Клик мышью по элементу ``'#clear-completed'`` удаляет все выволненные пункты, используя метод [pull](http://finom.github.io/matreshka/docs/Matreshka.Array.html#pull).
			.on( 'click::clearCompleted', function() {
				this.forEach( function( todo ) {
					if( todo.completed ) {
						this.pull( this.indexOf( todo ) );
					}
				}, this );
			})
			// Если какой-нибудь элемент вызвал событие ``"readytodie"``, мы его удаляем, используя метод [pull](http://finom.github.io/matreshka/docs/Matreshka.Array.html#pull), который принимает индекс удаляемсого элемента в качестве аргумента.
			.on( '@readytodie', function( todo ) {
				this.pull( this.indexOf( todo ) );
			})
			// Следующий обработчик вызывается по двум событиям. Первое событие - ``"modify"``, которое срабатывает, когда ``MK.Array`` меняется (когда элементы добавляются или удаляются). Второе - ``"@change:completed"``. Символ "@" указывает на то, что мы слушаем событие ``"change:completed"`` для каждого пункта todo. Получается, обработчик срабатывает, когда пункт добавлен или удален и когда у одного из пунктов меняется свойство ``"completed"`` (``"title"`` нас не интересует). Код обработчика говорит сам за себя: ``"allCompleted"`` становится равным ``true``, если каждый пункт выполнен и наоборот - ``false``, когда какой-либо из пунктов не выполнен. Затем вычисляется значение свойства ``"completedLength"``, которое содержит количество выполненных пунктов.
			.on( 'modify @change:completed', function() {
				this.set( 'allCompleted', this.every( function( todo ) {
					return todo.completed;
				}), { silent: true } );
				
				this.set( 'completedLength', this.filter( function( todo ) {
					return todo.completed;
				}).length );
			})
			// Если пункты добавлены или удалены или если свойство ``"completed"`` помеялось у какого-нибудь пункта или если изменилось значение свойства ``"allCompleted"``, готовим представление нашего списка todo для того, чтоб затем поместить его в локальное хранилище (``localStorage``).
			.on( 'modify @change:completed change:allCompleted', function() {
				this.JSON = JSON.stringify( this );
			})
			// Следующие строки контролируют, как видимость пунктов списка дел контролируется ``location.hash`` (или свойства ``"route"``). Эта часть может быть реализована несколькими способами, я выбрал способ добавления привязок с помощью метода  [addDependency](http://finom.github.io/matreshka/docs/Matreshka.html#addDependency). Что здесь происходит? Мы слушаем событие ``"add"``, срабатывающее, когда новые пункты добавляются в список. Обработчик события получает объект (``evt``) в качестве аргумента, который содержит свойство ``"added"``, котроое является массивом добавленных пунктов. Мы перебираем добавленные элементв и добавляем зависимости свойства  ``"visible"`` от ``todos.route`` и от собственного свойства ``"completed"``.
			.on( 'add', function( evt ) {
				evt.added.forEach( function( todo ) {
					todo.addDependency( 'visible', [
						todo, 'completed',
						this, 'route'
					], function( completed, route ) {
						return !route || route === 'completed' && completed || route === 'active' && !completed;
					});
				}, this );
			})
		;
	},
});