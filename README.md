# atcoder-cli
[AtCoder](https://beta.atcoder.jp/) command line tools
- get contest information
- create a project directory for contests
  - auto provisioning with custom templates
- linkage with [online-judge-tools](https://github.com/kmyk/online-judge-tools)
    - submit your code without specified URL
    - auto downloading of sample inputs/outputs

## Requirements
node.js  
[online-judge-tools](https://github.com/kmyk/online-judge-tools) (optional, but recommended)

## Install (NOT PUBLISHED YET)
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
