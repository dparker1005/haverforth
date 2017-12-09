// See the following on using objects as key/value dictionaries
// https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
var words = {};

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
function process(stack, input, terminal) {
    // The user typed a number
    if (!(isNaN(Number(input)))) {
        print(terminal,"pushing " + Number(input));
        stack.push(Number(input));
    } else if (input === ".s") {
        print(terminal, " <" + stack.length + "> " + stack.slice().join(" "));
    } else if (input === "+") {
        add(stack, terminal);
    } else {
        throwError("Unrecognized input.", stack, terminal);
    }
    renderStack(stack);
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

function add(stack, terminal){
	console.log("adding");
	if(stack.length < 2){
		throwError("Not enough elements for add operation.", stack, terminal);
		return;
	}
	var first = stack.pop();
    var second = stack.pop();
    stack.push(first+second);
}
