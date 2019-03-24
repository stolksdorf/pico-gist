const test = require('pico-check');
const config = require('./config');

const PicoGist = require('../pico-gist.js');
const Gist = PicoGist(config.get('gist_token'));

const testGistId = config.get('test_gist_id');

const sampleGist = {
	"id": "aa5a315d61ae9438b18d",
	"files": {
		"hello_world.rb": {
			"filename": "hello_world.rb",
			"truncated": false,
			"content": "class HelloWorld\n   def initialize(name)\n      @name = name.capitalize\n   end\n   def sayHi\n      puts \"Hello !\"\n   end\nend\n\nhello = HelloWorld.new(\"World\")\nhello.sayHi"
		},
		"hello_world.py": {
			"filename": "hello_world.py",
			"truncated": false,
			"content": "class HelloWorld:\n\n    def __init__(self, name):\n        self.name = name.capitalize()\n       \n    def sayHi(self):\n        print \"Hello \" + self.name + \"!\"\n\nhello = HelloWorld(\"world\")\nhello.sayHi()"
		},
		"hello_world_ruby.txt": {
			"filename": "hello_world_ruby.txt",
			"truncated": false,
			"content": "Run `ruby hello_world.rb` to print Hello World"
		},
		"hello_world_python.txt": {
			"filename": "hello_world_python.txt",
			"truncated": false,
			"content": "Run `python hello_world.py` to print Hello World"
		}
	},
	"public": true,
	"created_at": "2010-04-14T02:15:15Z",
	"updated_at": "2011-06-20T11:34:15Z",
	"description": "Hello World Examples",
	"truncated": false,
};



test.group('mergeOptions', (test)=>{



});


test.group('gist2Object', (test)=>{



});


test.group('object2Files', (test)=>{



});






module.exports = test;