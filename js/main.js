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
					};
var user_words = {}

/** 
 * Empty and update the stack
 * @param {Array[number]} stack - The stack to empty
 */
function emptyStack(stack) {
    stack.length = 0;
    renderStack(stack);
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
 * @param {Array[Number]} The stack to render
 */
function renderStack(stack) {
    $("#thestack").empty();
    stack.slice().reverse().forEach(function(element) {
        $("#thestack").append("<tr><td>" + element + "</td></tr>");
    });
};

/** 
 * Process a user input, update the stack accordingly, write a
 * response out to some terminal.
 * @param {Array[Number]} stack - The stack to work on
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
				if (legal_chars.indexOf(i.charAt(0)) > -1 || !basic_words.hasOwnProperty(i)) {
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
		renderStack(stack);
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

    var stack = [];
    
    var resetButton = $("#reset"); // resetButton now references 
                                   // the HTML button with ID "reset"
    resetButton.click(function() {emptyStack(stack);})

    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");
    runRepl(terminal, stack);
});

/** 
 * Throws an error message, blinks text red and resets stack
 * @param {string} message - The error message to throw
 * @param {Array[Number]} stack - The stack to work on
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
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function printStack(stack, terminal){
	print(terminal, " <" + stack.length + "> " + stack.slice().join(" "));
}

/** 
 * Pops and prints top element of stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function pop(stack, terminal){
	if(stack.length < 1){
		throwError("Not enough elements for pop operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    print(terminal, first);
}

/** 
 * Adds the top two elements of the stack together
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function add(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for add operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(first+second);
}

/** 
 * Subtracts the top two elements of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function subtract(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for subtract operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second-first);
}

/** 
 * Multiplies the top two elements of the stack together
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function multiply(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for multiply operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second*first);
}

/** 
 * Divides the top two elements of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function divide(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for divide operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second/first);
}

function int_divide(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for divide operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(Math.floor(second/first));
}

/** 
 * Rounds down the top element of the stack to an integer
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function floor(stack, terminal){
	if(stack.length < 1){
		throwError("Not enough elements for floor operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    stack.push(Math.floor(first));
}

/** 
 * Gets the remainder of the top two elements of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function mod(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for mod operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(second%first);
}

/** 
 * Drops the top element of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function drop(stack, terminal){
	if(stack.length < 1){
		throwError("Not enough elements for drop operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
}

/** 
 * Drops the second element of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function nip(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for nip operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(first);
}

/** 
 * Swaps the top two elements of the stack
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function swap(stack, terminal){
	if(stack.length < 2){
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
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function dup(stack, terminal){
	if(stack.length < 1){
		throwError("Not enough elements for dup operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    stack.push(first);
    stack.push(first);
}

/** 
 * Copies the top element over the second element
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function over(stack, terminal){
	if(stack.length < 2){
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
 * @param {Array[Number]} stack - The stack to work on
 * @param {Terminal} terminal - The terminal object in case of error
 */
function tuck(stack, terminal){
	if(stack.length < 2){
		throwError("Not enough elements for tuck operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
	var second = stack.pop();
    stack.push(first);
    stack.push(second);
    stack.push(first);
}
