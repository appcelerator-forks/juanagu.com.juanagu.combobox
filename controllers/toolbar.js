// Arguments passed into this controller can be accessed via the `$.args` object directly or:
/** ------------------------
 Fields
 ------------------------**/
var args = $.args;
var options = [];
var selected = null;
/** ------------------------
 Methods
 ------------------------**/
/**
 * apply properties to controller
 * @param {Object} properties
 */
var applyProperties = function(properties) {
	if (_.isObject(properties)) {
		if (_.has(properties, 'options')) {
			options = properties.options;
		}
		if (_.has(properties, 'picker')) {
			_.extend($.picker, properties.picker);
		}
		if (_.has(properties, 'selected')) {
			selected = properties.selected;
		}
		_.extend($.tlb_options, _.omit(properties, 'options', 'picker', 'selected'));
	}
};

var applyListeners = function() {
	$.btn_cancel.addEventListener('click', onCancel);
	$.btn_accept.addEventListener('click', onAccept);
	$.picker.addEventListener('change', onChange);
};

var init = function() {
	applyProperties(args);
	//gc
	args = null;
	applyListeners();
	setDataSet();
};

var onAccept = function(e) {
	$.trigger('success', _.extend({
		row : {
			id : options[selected].id
		},
		rowIndex : selected
	}, e));
	hide();
};

var onCancel = function(e) {
	$.trigger('cancel', e);
	hide();
};

var onChange = function(e) {
	selected = e.rowIndex;
};

var setDataSet = function() {
	if (_.isArray(options)) {
		$.picker.add(options);
		if (!_.isNull(selected)) {
			$.picker.setSelectedRow(0, selected, false);
		}
	}
};

var show = function() {
	$.toolbar.visible = true;
	$.toolbar.bottom = 0;
};

var hide = function() {
	$.toolbar.visible = false;
	$.toolbar.bottom = -300;
};

init();
//Public
exports.applyProperties = applyProperties;
exports.show = show;
exports.hide = hide;
