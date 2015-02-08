// **todos.js** is the biggest file that contains most of logic. In bigger projects is better to split up your application to a few JS files. ``Todos`` class extends ``MK.Array`` class which means "collection".
"use strict";
this.Todos = Class({
	'extends': MK.Array,
	Model: Todo,
	// [itemRenderer](http://finom.github.io/matreshka/docs/Matreshka.Array.html#itemRenderer) method renders element for each added item. At this case it retrieves HTML template for todo item from element that has ``id="todo_item_template"`` (look at HTML code)
	itemRenderer: function() {
		return $( '#todo_item_template' ).html();
	},
	constructor: function() {
		var self = this
			// Matreshka initialization by [initMK](http://finom.github.io/matreshka/docs/Matreshka.Array.html#initMK) method.
			.initMK()
			// ``"leftLength"`` is dependent from ``"length"`` and ``"completedLength"`` properties as their difference. It listens any cnanges on these properties.
			.addDependency( 'leftLength', 'length completedLength', function( length, completedLength ) {
				return length - completedLength;
			})
			// ``"bindings"`` method creates bindings between instance properties and DOM elements. ``"events"`` as you might guess adds event listeners to the instance. I don't say that these method names mean somethig special, I just moved grouped actions to methods that I liked to call ``"bindings"`` and ``"events"``. After calling them we're parsing locally stored todos and passing obtained array to [createFrom](http://finom.github.io/matreshka/docs/Matreshka.Array.html#createFrom) method which pushes converted array items to the instance.
			.bindings()
			.events()
			.createFrom( JSON.parse( localStorage[ 'todos-matreshka' ] || '[]' ) )
			// After we created todos array retrieved from ``localStorage`` we're adding event lister on change of ``"JSON"`` property which stores stringified representation of our todo list. Look at [procrastinate](http://finom.github.io/matreshka/docs/Matreshka.html#procrastinate) method. It disallows to call function many times per time period. We need this optimiation because ``localStorage`` stores data on hard drive which works much slower then RAM.
			.on( 'change:JSON', MK.procrastinate( function( evt ) {
				localStorage[ 'todos-matreshka' ] = evt.value;
			}) )
		;
		
		// We're using [director](https://github.com/flatiron/director) router as TodoMVC specification says. When ``location.hash`` changes the value assigns to ``"route"`` property.
		Router({
			':state': function( state ) {
				self.route = state;
			},
			'': function() {
				self.route = '';
			}
		}).init();
	},
	// # Bindings
	bindings: function() {
		return this
			// We're binding main element which has "todoapp" ID. This means association between instance and element. After that we're binding another elements (main, footer etc).
			.bindElement( this, '#todoapp' )
			.bindElement({
				main: '#main',
				footer: '#footer',
				newTodo: '#new-todo',
				container: '#todo-list',
				allCompleted: '#toggle-all',
				clearCompleted: '#clear-completed'
			})
			// The next [bindElement](http://finom.github.io/matreshka/docs/Matreshka.html#bindElement-1) use makes elements visibility to be dependent on properties values (if value passes non-strict comparison to ``true`` then elements will be shown but if value passes non-strict comparison to ``false`` then elements will be hidden). [$bound](http://finom.github.io/matreshka/docs/Matreshka.html#$bound) method returns elements that bound to given property or space delimited properties.
			// ```js
			// //returns '#clear-completed' element
			// this.$bound( 'clearCompleted' );
			// //returns both '#main' and '#footer' elements
			// this.$bound( 'main footer' ); ```
			.bindElement({
				completedLength: this.$bound( 'clearCompleted' ),
				length: this.$bound( 'main footer' )
			}, MK.binders.display() )
			// The next 2 bindings change inner html depending on properties value.
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
			// This binding controls which state link ("All", "Active", "Completed") will be bolder. I bind ``#filters`` element to the ``"route"`` property but manipulate with links. Just look at the code.
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
	// # Events
	events: function() {
		return this
			// If ``Enter`` key is pressed on element that bound to ``"newTodo"`` and if trimmed value of this property is not empty string, we're adding new todo item using [push](http://finom.github.io/matreshka/docs/Matreshka.Array.html#push) method
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
			// Code above shows that ``"allCompleted"`` property is associated with ``#toggle-all`` element. When it's value is changed we're setting same ``"completed"`` peoperty value for all items we have. ``"silent"`` flag says that ``"change:completed"`` event has not to be fired.
			.on( 'change:allCompleted', function( evt ) {
				this.forEach( function( todo ) {
					todo.set( 'completed', evt.value, { silent: true });
				});
				
				this.completedLength = evt.value ? this.length : 0;
			})
			// Click on ``'#clear-completed'`` element removes all completed items using [pull](http://finom.github.io/matreshka/docs/Matreshka.Array.html#pull) method.
			.on( 'click::clearCompleted', function() {
				this.forEach( function( todo ) {
					if( todo.completed ) {
						this.pull( this.indexOf( todo ) );
					}
				}, this );
			})
			// If some element fires ``"readytodie"`` event then we remove it using [pull](http://finom.github.io/matreshka/docs/Matreshka.Array.html#pull) method. This method accepts index of element that has to be removed from collection.
			.on( '@readytodie', function( todo ) {
				this.pull( this.indexOf( todo ) );
			})
			// This event handler is attached on two events. The first is ``"modify"`` event which is firing when ``MK.Array`` collection changes (some element(s) is added or removed). The second is ``"@change:completed"`` event. "@" symbol means that we're listening ``"change:completed"`` for each todo item. So event handler executes when some todos are added or removed and when ``"completed"`` property is changed on some todo item. The code inside event handler explains itself: ``"allCompleted"`` becames ``true`` if every item is completed becames and becames ``false`` when some item is not completed. ``"completedLength"`` contains the length of completed items.
			.on( 'modify @change:completed', function() {
				this.set( 'allCompleted', this.every( function( todo ) {
					return todo.completed;
				}), { silent: true } );
				
				this.set( 'completedLength', this.filter( function( todo ) {
					return todo.completed;
				}).length );
			})
			// If items added or removed or if ``"completed"`` is changed on some item or if user clicked on element that bound to ``"allCompleted"`` property  we're preparing JSON to be stored in ``localStorage``
			.on( 'modify @change:completed change:allCompleted', function() {
				this.JSON = JSON.stringify( this );
			})
			// Next strings control which todo items are visible depends on ``location.hash``. This part could be written few ways. I've choose [addDependency](http://finom.github.io/matreshka/docs/Matreshka.html#addDependency) way for it. What is going on there? We're listening ``"add"`` event. Fired event passes ``"added"`` property to the event (``evt``) argument which contain an array of added items. We're iterating new added todos and adding dependency over them. ``"visible"`` value depends on ``todos.route`` property and on self's ``"completed"`` property as third argument describes. 
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