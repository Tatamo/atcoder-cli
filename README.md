# atcoder-cli
[AtCoder](https://atcoder.jp/) command line tools
- get contest information
- create a project directory for contests
  - auto provisioning with custom templates
- linkage with [online-judge-tools](https://github.com/kmyk/online-judge-tools)
    - submit your code without specified URL
    - auto downloading of sample inputs/outputs

[解説記事(日本語)](http://tatamo.81.la/blog/2018/12/07/atcoder-cli/)

## Requirements
node.js  
[online-judge-tools](https://github.com/kmyk/online-judge-tools) (optional, but recommended)

## Install
```sh
$ npm install -g atcoder-cli
```

## Usage
```sh
$ acc login # login your atcoder account
$ acc session # check login status
$ # your login session will be saved to a local file, but your password won't be saved
$ # to delete the session file, use `acc logout`
$ acc new abc001 # "abc001/" directory will be created
$ cd abc001/
$ acc contest # show the contest information
$ acc tasks # show task list
$ acc add
$ cd a/
$ vim main.cpp # write your solution
$ acc submit main.cpp # to use submit function, you have to install online-judge-tools
```

To get detailed information, use
```sh
$ acc [COMMAND] -h
```

## Config
```sh
$ acc config -h
$ acc config # show all global options
$ acc config <key> <value> # set option
$ cd `acc config-dir`
$ cat config.json # global config file
```
## Provisioning Templates
With using custom templates, you can automatically prepare your template program code or build environment.

When you create new task directories, atcoder-cli can do:
- place the scaffold program file
- copy static files
- exec shell command

show available templates:
```sh
$ acc templates
```

use the template:
```sh
$ acc new|add --template <your-template-name>
```

Or you can set default template:
```sh
$ acc config default-template <your-template-name>
```

### Create a new template
```sh
$ cd `acc config-dir`
$ mkdir <your-template-name>
$ cd <your-template-name>
$ vim template.json # write your template settings
```

### Options in template.json
```json
{
  "task": {
    "program": ["main.cpp", ["foo.cpp", "{TaskID}.cpp"]],
    "submit": "main.cpp",
    "static": ["foo", ["bar","bar_{TaskLabel}"]],
    "testdir": "tests_{TaskID}",
    "cmd": "echo Hi!"
  },
  "contest": {
    "static": [["gitignore", ".gitignore"]],
    "cmd": "echo Ho!"
  }
}
```

#### `"task"` (required)
executed for each tasks.

##### `"program"` (required)
```ts
"program": (string | [string, string])[]
```

Your main program(s).
Place main.cpp in the same directory of template.json, and write
```
  "program": ["main.cpp"]
```
then the program file will be copied to the task directory.

You can rename the file with format strings:
```
  "program": [["main.cpp", "{TaskId}.cpp"]] 
```
The file name of the program file will be "A.cpp" if the task is problem A.

To get detailed information about format strings, use `acc format -h`.

##### `"submit"` (required)
```ts
  "submit": string
```

The file name to submit.
It enables to omit the filename argument to submit file, so you can run `acc submit` instead of `acc submit <filename>`.

Format strings are supported.

##### `"static"` (optional)
```ts
"static": (string | [string, string])[]
```

Static assets.
The difference between `"program"` and `"static"` is:
  - `"program"` files won't be overwrited when using `acc add --force`.
  - `"static"` files will be overwrited when using `acc add --force`.

##### `"testdir"` (optional)
```ts
  "testdir": string
```

The name of the directory that sample cases will be downloaded.
Without this, the directory name will be the value of `acc config default-test-dirname-format`.

Format strings are supported.

##### `"cmd"` (optional)
```ts
  "cmd": string
```
After copying files and downloading sample cases, the specified command will be executed.

The working directory is the task directory.

Parameters are given as enviromental variables:  
`$TEMPLATE_DIR`, `$TASK_DIR`, `$TASK_ID`, `$TASK_INDEX`, `$CONTEST_DIR` and `$CONTEST_ID`

#### `contest` (optional)
executed only once when `acc new` command runs.

##### `"static"` (optional)
Same as `tasks.static`.

##### `"cmd"` (optional)
Same as `tasks.cmd`, but `$TASK_*` variables do not exist.
