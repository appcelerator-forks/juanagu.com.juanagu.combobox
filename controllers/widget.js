/**
 * @author jagu
 * @
 */
/** ------------------------
 Custom JS function
 ------------------------**/
if (!_.isFunction(Array.getIndexBy)) {
	/**
	 *
	 * @param {Object} name
	 * @param {Object} value
	 */
	Array.prototype.getIndexBy = function(name, value) {
		for (var i = 0; i < this.length; i++) {
			if (this[i][name] == value) {
				return i;
			}
		}
		return -1;
	};
}
/** ------------------------
 Constants
 ------------------------**/
var TIMEOUT_SET_SELECTED_ROW = 500;
/** ------------------------
 Fields
 ------------------------**/
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var options = [];
var selected = -1;
if (OS_IOS) {
	var propertiesPicker = null;
	var toolbarController = null;
	var parentWindow = null;
}
/** ------------------------
 Constants
 ------------------------**/
var LOG_TAG = "com.juanagu.combobox";
/** ------------------------
 Methods
 ------------------------**/
/**
 * apply properties to controller
 * @param {Object} properties
 */
var applyProperties = function(properties) {
	if (_.isObject(properties)) {

		if (_.has(properties, 'selected')) {
			selected = properties.selected;
		}

		if (_.has(properties, 'options')) {
			options = properties.options;

			if (_.has(properties, 'selectedByID')) {
				setSelectedByID(properties.selectedByID);
			}
			_.defer(configurePicker);
		}

		//properties to android
		if (OS_ANDROID && _.has(properties, 'android')) {
			_.extend($.picker, properties.android);
		}

		//properties to ios
		if (OS_IOS && _.has(properties, 'ios')) {
			if (_.has(properties.ios, 'label')) {
				_.extend($.picker, properties.ios.label);
			}

			if (_.has(properties.ios, 'picker')) {
				propertiesPicker = properties.ios.picker;
			}

			if (_.has(properties.ios, 'parentWindow')) {
				parentWindow = properties.ios.parentWindow;
			}
			_.extend($.touch, _.omit(properties.ios, 'label', 'picker', 'parentWindow'));
		}
	}
};

/**
 * http://www.tidev.io/2014/09/18/cleaning-up-alloy-controllers/
 */
var cleanup = function() {
	// let Alloy clean up listeners to global collections for data-binding
	// always call it since it'll just be empty if there are none
	$.destroy();
	// remove all event listeners on the controller
	$.off();
};

/**
 * apply listeners to controller
 */
var applyListeners = function() {
	if (OS_IOS) {
		$.touch.addEventListener('click', onClickPickeriOS);
	}
	if (OS_ANDROID) {
		$.picker.addEventListener('change', onChangePicker);
	}
};

/**
 * initialize controller
 */
var init = function() {
	applyProperties(args);
	applyListeners();
	args = null;
};

/**
 * configure picker
 */
var configurePicker = function() {
	if (OS_ANDROID) {
		var column = Titanium.UI.createPickerColumn();
		if (_.isArray(options)) {
			for (var i = 0,
			    j = options.length; i < j; i++) {
				var option = options[i];
				column.addRow(Titanium.UI.createPickerRow(option));
			};
		}

		$.picker.setColumns([column]);
		$.picker.selectionIndicator = true;
		if (selected != -1) {
			setTimeout(function() {
				$.picker.setSelectedRow(0, selected, false);
			}, TIMEOUT_SET_SELECTED_ROW);
		}
	} else if (OS_IOS) {
		createToolbar();
		if (selected != -1) {
			setLabel(options[selected].title);
		}
	}
};

if (OS_IOS) {

	/**
	 * set label
	 * @param {String} text
	 */
	var setLabel = function(text) {
		$.picker.text = text;
	};

	/**
	 * create toolbar to ios
	 */
	var createToolbar = function() {
		//create buttons
		if (!_.isNull(parentWindow)) {
			toolbarController = Widget.createController('toolbar', {
				options : options,
				selected : selected
			});
			toolbarController.on('success', onSuccessToolbar);
			parentWindow.add(toolbarController.getView());

			//gc
			tr = null;
			dropButton = null;
		}
	};

	/**
	 * on success toolbar selected
	 * @param {Object} e
	 */
	var onSuccessToolbar = function(e) {
		onChangePicker(e);
		setLabel(options[selected].title);
	};
}

/**
 * format data to picker when data is a collection
 * @param {AlloyCollection} dataToFormat
 * @param {String} idKey
 * @param {String} titleKey
 *
 */
var formatDataToPicker = function(dataToFormat, idKey, titleKey) {

	try {
		var result = [];
		dataToFormat.map(function(model) {
			result.push({
				id : model.get(idKey || 'id'),
				title : model.get(titleKey || 'title')
			});
		});
		return result;
	} catch(e) {
		Ti.API.error(LOG_TAG, e);
	}
	//gc
	types = null;
	return null;
};

/**
 * set selected properties find index by id in options
 * @param {Integer} id
 */
var setSelectedByID = function(id) {
	if (_.isArray(options)) {
		var indexOf = options.getIndexBy('id', id);
		if (indexOf != -1) {
			selected = indexOf;
		}
	}
};

/** ------------------------
 Listeners
 ------------------------**/
/**
 *
 */

/**
 * when window is opened
 */
var onOpen = function(e) {
	_.defer(init);
};

/**
 * when window is closed
 * @param {Object} e
 */
var onClose = function(e) {
	cleanup();
};

/**
 * Fired when user click on touch
 * @param {Object} e
 */
var onClickPickeriOS = function(e) {
	//fired click
	$.trigger('click', e);
	toolbarController.show();
};

/**
 * on change picker
 * @param {Object} e
 */
var onChangePicker = function(e) {
	$.trigger('change', e);
	selected = e.rowIndex;
};

/** ------------------------
 public
 ------------------------**/
exports.applyProperties = applyProperties;
exports.onOpen = onOpen;
exports.onClose = onClose;
exports.cleanup = cleanup;
exports.formatDataToPicker = formatDataToPicker;
exports.setSelectedByID = setSelectedByID;
