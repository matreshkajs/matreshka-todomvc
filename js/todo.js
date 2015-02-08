// **todo.js** contains ``Todo`` class that will be used as ``Model`` for main ``Todos`` class. ``Todo`` class extends [MK.Object](http://finom.github.io/matreshka/docs/Matreshka.Object.html) class.
"use strict";
this.Todo = Class({
	'extends': MK.Object,
	constructor: function( data ) {
		this
			// Matreshka initialization by [initMK](http://finom.github.io/matreshka/docs/Matreshka.Object.html#initMK) method.
			.initMK()
			// Setting default data and adding ``"title"`` and ``"completed"`` keys to data keys list (look at [jset](http://finom.github.io/matreshka/docs/Matreshka.Object.html#jset-1) method).
			// ``"title"`` property is empty string by default.
			// ``"completed"`` property is false by default.
			.jset({
				title: '',
				completed: false
			})
			// Setting data that constructor is received (eg ``{ title: 'Do it!' }``). 
			.set( data )
			// ``"visible"`` property says is this todo item visible.
			.set( 'visible', true )
			// Waiting for ``"render"`` event using [on](http://finom.github.io/matreshka/docs/Matreshka.Array.html#on) method.
			.on( 'render', function( evt ) {
				this
					// ``"render"`` event passes event object to the event handler and contains element that has been rendered.
					// We're binding this element to the instance as "main" element of this instance using [bindElement](http://finom.github.io/matreshka/docs/Matreshka.html#bindElement-1) method. Why do we need to do this manually? Because an instance (model) could be an item of few collections.
					.bindElement( this, evt.element )
					// Bindings with no binder argument (uses [defaultBinders](http://finom.github.io/matreshka/docs/Matreshka.html#defaultBinders) if it's posible).
					// * ``"completed"`` property is bound with ``.toggle`` checkbox
					// * ``"edit"`` property is bound with ``.edit`` input
					// * ``"destroy"`` property is bound with ``.destroy`` element which is unknown for Matreshka (no default binder). It means that element is just associated with property without synchronizing with it.
					.bindElement({
						completed: this.$( '.toggle' ),
						edit: this.$( '.edit' ),
						destroy: this.$( '.destroy' )
					})
					// Bindings with cpecified binders (third argument)
					// * Binding of main element whose visibility will be toggled via ``"visible"`` property
					// * Binding of main element whose ``"completed"`` class name will be toggled via ``"completed"`` property
					// * Binding of main element whose ``"editing"`` class name will be toggled via ``"editing"`` property
					// * Binding of (``label`` tag) element whose ``innerHTML`` will be same as ``"title"`` property
					.bindElement( 'visible', this.$bound(), MK.binders.display() )
					.bindElement( 'completed', this.$bound(), MK.binders.className( 'completed' ) )
					.bindElement( 'editing', this.$bound(), MK.binders.className( 'editing' ) )
					.bindElement( 'title', this.$( 'label' ), MK.binders.innerHTML() )
					// Attaching ``"dblclick"`` event handler to the element that bound to ``"title"`` property (``label`` tag)
					// When user produces double-click then we're moving todo item to edit mode by setting ``"editing"`` property to ``true``. This action adds ``"edit"`` class on todo item.
					// Then we assign current ``"title"`` property value to ``"edit"`` property which sets ``"edit"`` input value as well.
					// Then making ``"edit"`` input be focused.
					.on( 'dblclick::title', function() {
						this.editing = true;
						this.edit = this.title;
						this.$bound( 'edit' ).focus();
					})
					// Attaching ``"keyup"`` event handler to element that bound to ``"edit"`` property.
					// If ``Escape`` key is pressed then we're moving back to the regular mode.
					// If ``Enter`` key is pressed then then we're assigning trimmed ``"edit"`` property value to the ``"title"`` property and moving back to regular mode. If trimmed value is empty then we trigger ``"readytodie"`` event which is listened in ``Todos`` class.
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
					// If destroy button is clicked then we trigger ``"readytodie"`` event which is listened in ``Todos`` class.
					.on( 'click::destroy', function() {
						this.trigger( 'readytodie', this );
					})
				;
			});
		;
	}
});