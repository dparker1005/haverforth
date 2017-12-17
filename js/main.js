// See the following on using objects as key/value dictionaries
// https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
var basic_words = {	".":pop, 
					".s":printStack, 
					"+":add, 
					"-":subtract,
					"*":multiply,
					"/":divide,
					"int/":int_divide,
					"floor":floor,
					"%":mod,
					"drop":drop,
					"nip":nip,
					"dup":dup,
					"swap":swap,
					"over":over,
					"tuck":tuck,
					"clear":clearStack,
					"reset":resetStack
					};
var user_words = {}


/** 
 * An object version of the stack
 * Used following resources to create object:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 * Thomas's answer from https://stackoverflow.com/questions/37502163/getter-setter-maximum-call-stack-size-exceeded-error
 */
class Stack {

	constructor() {	
		this._stack_arr = [];
		this._stack_length = 0;	
	}
	
	get stack_arr() {
		return this._stack_arr;
	}
	
	get stack_length() {
		return this._stack_length;
	}

	empty() {
		this._stack_length = 0;
		
		//clears stack_arr
		this._stack_arr.length = 0;
	}
	
	pop() {
		this._stack_length--;
		return this._stack_arr.pop();
	}
	
	push(to_push) {
		this._stack_length++;
		this._stack_arr.push(to_push)
	}
}

class ObservableStack extends Stack {
	
	constructor() {
		super();
		this._observers = [];
	}
	
	//takes a function observer
	registerObserver(observer) {
		this._observers.push(observer);
	}
	
	fire() {
		var thisObj = this;
		var scope = thisObj || window;
        this._observers.forEach(function(item) {
            item.call(scope, thisObj);
        });
	}
	
	empty() {
		this._stack_length = 0;
		
		//clears stack_arr
		this._stack_arr.length = 0;
		this.fire();
	}
	
	pop() {
		this._stack_length--;
		var toReturn = this._stack_arr.pop();
		this.fire();
		return toReturn;
	}
	
	push(to_push) {
		this._stack_length++;
		this._stack_arr.push(to_push)
		this.fire();
	}
	
}

/** 
 * Empty stack, reset terminal
 * @param {Stack} stack - The stack to empty
 * @param {Terminal} terminal - The `terminal` object to clear
 */
function resetStack(stack, terminal) {
    terminal.clear();
    emptyStack(stack);
    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");
};

/** 
 * Empty and update the stack
 * @param {Stack} stack - The stack to empty
 */
function emptyStack(stack) {
    stack.empty();
    //renderStack(stack);
};

/**
 * Print a string out to the terminal, and update its scroll to the
 * bottom of the screen. You should call this so the screen is
 * properly scrolled.
 * @param {Terminal} terminal - The `terminal` object to write to
 * @param {string}   msg      - The message to print to the terminal
 */
function print(terminal, msg) {
    terminal.print(msg);
    $("#terminal").scrollTop($('#terminal')[0].scrollHeight + 40);
}


/** 
 * Sync up the HTML with the stack in memory
 * @param {Stack} The stack to render
 */
/*
function renderStack(stack) {
    $("#thestack").empty();
    stack.stack_arr.slice().reverse().forEach(function(element) {
        $("#thestack").append("<tr><td>" + element + "</td></tr>");
    });
};
*/

/** 
 * Sync up the HTML with the user-created words
 * Using code by mmv1219 from 
 * 		https://stackoverflow.com/questions/8936652/dynamically-create-buttons-with-jquery
 * @param {Terminal} terminal   - The `terminal` object to write to
 * @param {Stack} stack - The stack that words will run on
 */
function renderUserWords(terminal, stack) {
	var tbl = $("#user-defined-funcs");
    tbl.empty();
    for (var word in user_words) {
    	var btn = document.createElement('button');
        var txt = document.createTextNode(word);

        btn.appendChild(txt);
        btn.setAttribute('type', 'button');
        btn.setAttribute('id', 'user_func_' + word);
        tbl.append('<tr><td><button class="btn btn-info" id="user_func_'+
        			word+
        			'">'+word+'</a></td><td>'+
        			user_words[word]+
        			'</td><td><button class="btn btn-default" id="user_func_'+
        			word+
        			'_edit">Edit</a></td><td><button class="btn btn-danger" id="user_func_'+
        			word+
        			'_delete">Delete</a></td></tr>');
        userWordButtonHandler(word, terminal, stack);
    }
    tbl.append('<tr><td><button class="btn btn-info" id="new_user_func">Create New Word</td><td></td><td></td><td></td></tr>');
    $("#new_user_func").click(function() {
		var word_name = window.prompt("Enter word name: ","myWord");
		if(word_name === null) {
			return;
		}
		word_name = word_name.replace(/\s+/g, ''); //https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
		var legal_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if(legal_chars.indexOf(word_name.charAt(0)) < 0 | basic_words.hasOwnProperty(word_name)) {
			window.alert("Invalid word name.");
			return;
		}
		var word_def = window.prompt("Enter definition for "+word_name+":","ex. 2 + ...");
		if(word_def === null) {
			return;
		}
		user_words[word_name] = word_def;
		renderUserWords(terminal, stack);
		print(terminal, "Created word \'"+word_name+"\'.");
    });
};


/** 
 * Adds functionality to user word buttons.
 * Debugging help from https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/JavaScript
 *		Which linked to https://github.com/mdn/learning-area/blob/master/tools-testing/cross-browser-testing/javascript/good-for-loop.html
 * @param {string} word - The word for which a button is being created
 * @param {Terminal} terminal   - The `terminal` object to write to
 * @param {Stack} stack - The stack that words will run on
 */
function userWordButtonHandler(word, terminal, stack) {
    $("#user_func_"+word).click(function() {
        print(terminal, "Running word \'"+word+"\' from button.");
        process(stack, word, terminal);
    });
    
    $("#user_func_"+word+"_edit").click(function() {
        var word_def = window.prompt("Enter definition for "+word+":",user_words[word]);
		if(word_def === null) {
			return;
		}
		user_words[word] = word_def;
		renderUserWords(terminal, stack);
		print(terminal, "Updated word \'"+word+"\'.");
    });
    
    $("#user_func_"+word+"_delete").click(function() {
        print(terminal, "Deleting word \'"+word+"\'.");
        delete user_words[word];
        renderUserWords(terminal, stack);
    });
}

/** 
 * Process a user input, update the stack accordingly, write a
 * response out to some terminal.
 * @param {Stack} stack - The stack to work on
 * @param {string} input - The string the user typed
 * @param {Terminal} terminal - The terminal object
 */
var process_creating_user_word = false;
var process_user_word_name = "";
var process_user_word_contents = "";
function process(stack, input, terminal) {
	var arr_input = input.trim().split(/ +/);
	arr_input.forEach(function(i){
		if (process_creating_user_word) {
		// user building new word
			if (process_user_word_name === ""){
				// user naming new word
				var legal_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
				if (!(legal_chars.indexOf(i.charAt(0)) < 0 | basic_words.hasOwnProperty(i))) {
					// legal name
					process_user_word_name = i;
				}
				else {
					// illegal name
					throwError("Invalid word name.", stack, terminal);
					process_creating_user_word = false;
				}
			} else if (i == ";"){
				// user ending new word
				user_words[process_user_word_name] = process_user_word_contents;
				process_creating_user_word = false;
				renderUserWords(terminal, stack);
			} else if (i === ":"){
				// user attempting to declare new word within word
				throwError("Cannot define function within function.", stack, terminal);
				process_creating_user_word = false;
			} else {
				// user adding inputs to word
				process_user_word_contents += " " + i;
			}
		} else if (!(isNaN(Number(i)))) {
			print(terminal,"pushing " + Number(i));
			stack.push(Number(i));
		} else if (i === ":") {
			process_creating_user_word = true;
			process_user_word_name = "";
			process_user_word_contents = [];
		} else if (basic_words.hasOwnProperty(i)) {
			basic_words[i](stack, terminal);
		}
		else if (user_words.hasOwnProperty(i)) {
			process(stack, user_words[i], terminal);
		}  else {
			throwError("Unrecognized input.", stack, terminal);
		}
		//renderStack(stack);
    });
};

function runRepl(terminal, stack) {
    terminal.input("Type a forth command:", function(line) {
        print(terminal, "User typed in: " + line);
        process(stack, line, terminal);
        runRepl(terminal, stack);
    });
};

// Whenever the page is finished loading, call this function. 
// See: https://learn.jquery.com/using-jquery-core/document-ready/
$(document).ready(function() {
    var terminal = new Terminal();
    terminal.setHeight("400px");
    terminal.blinkingCursor(true);
    
    // Find the "terminal" object and change it to add the HTML that
    // represents the terminal to the end of it.
    $("#terminal").append(terminal.html);

    var stack = new ObservableStack();
    
    var renderStack = function renderStack(stack) {
    	$("#thestack").empty();
    	stack.stack_arr.slice().reverse().forEach(function(element) {
        	$("#thestack").append("<tr><td>" + element + "</td></tr>");
    	});
	};
    stack.registerObserver(renderStack);
    
    renderUserWords(terminal, stack);
    
    var resetButton = $("#reset"); // resetButton now references 
                                   // the HTML button with ID "reset"
    resetButton.click(function() {resetStack(stack, terminal);})

    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");
    runRepl(terminal, stack);
});

/** 
 * Throws an error message, blinks text red and resets stack
 * @param {string} message - The error message to throw
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object
 */
function throwError(message, stack, terminal){
	print(terminal, message)
	print(terminal, "Resetting stack.");
	emptyStack(stack);
	terminal.setTextColor('#FF0000');
	setTimeout(function(){
    	terminal.setTextColor('#FFFFFF');
    	setTimeout(function(){
    		terminal.setTextColor('#FF0000');
    		setTimeout(function(){
    			terminal.setTextColor('#FFFFFF');
    			setTimeout(function(){
    				terminal.setTextColor('#FF0000');
    				setTimeout(function(){
    					terminal.setTextColor('#FFFFFF');
					}, 100);
				}, 100);
			}, 100);
		}, 100);
	}, 100);
	
}


/** 
 * Prints the whole stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function printStack(stack, terminal){
	print(terminal, " <" + stack.stack_length + "> " + stack.stack_arr.slice().join(" "));
}

/** 
 * Pops and prints top element of stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function pop(stack, terminal){
	if(stack.stack_length < 1){
		throwError("Not enough elements for pop operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    print(terminal, first);
}

/** 
 * Adds the top two elements of the stack together
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function add(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for add operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(first+second);
}

/** 
 * Subtracts the top two elements of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function subtract(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for subtract operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second-first);
}

/** 
 * Multiplies the top two elements of the stack together
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function multiply(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for multiply operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second*first);
}

/** 
 * Divides the top two elements of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function divide(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for divide operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second/first);
}

function int_divide(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for divide operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(Math.floor(second/first));
}

/** 
 * Rounds down the top element of the stack to an integer
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function floor(stack, terminal){
	if(stack.stack_length < 1){
		throwError("Not enough elements for floor operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    stack.push(Math.floor(first));
}

/** 
 * Gets the remainder of the top two elements of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function mod(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for mod operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second%first);
}

/** 
 * Drops the top element of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function drop(stack, terminal){
	if(stack.stack_length < 1){
		throwError("Not enough elements for drop operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
}

/** 
 * Drops the second element of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function nip(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for nip operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(first);
}

/** 
 * Swaps the top two elements of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function swap(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for swap operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(first);
    stack.push(second);
}

/** 
 * Duplicates the top element of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function dup(stack, terminal){
	if(stack.stack_length < 1){
		throwError("Not enough elements for dup operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    stack.push(first);
    stack.push(first);
}

/** 
 * Copies the top element over the second element
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function over(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for over operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(second);
    stack.push(first);
    stack.push(second);
}

/** 
 * Copies the second element to the top of the stack
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function tuck(stack, terminal){
	if(stack.stack_length < 2){
		throwError("Not enough elements for tuck operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(first);
    stack.push(second);
    stack.push(first);
}

/** 
 * Clears the console
 * @param {Stack} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function clearStack(stack, terminal){
	terminal.clear();
}
