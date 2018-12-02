export const task_choices = `Supported arguments for --choice:
  inquire  inquire the tasks to add
  all      select all tasks
  none     select no tasks
  rest     select all tasks not added yet
           (without --force option, same with "all")
  next     select the top task that is not added yet`;

export const cmd_env_variables = `Environment variables available in --cmd option:
  $CONTEST_DIR  the path of the contest directory
  $CONTEST_ID   the contest id`;

export const format_strings = `Supported format strings:
  {TaskLabel}     task label (e.g. A, B, C, D, ...)
  {tasklabel}     task label, lower case   
  {TASKLABEL}     task label, upper case
  {TaskID}        task id (shown as task URL path, e.g. arc100_a)
  {TASKID}        task id, upper case
  {TaskTitle}     task title
  {index0}        0-based task index
  {index1}        1-based task index
  {alphabet}      task index as alphabet: a, b, c, ..., z, aa, ab, ...
  {ALPHABET}      task index as alphabet: A, B, C, ..., Z, AA, AB, ...
  {ContestID}     contest id (shown as contest URL path, e.g. arc100)
  {CONTESTID}     contest id, upper case
  {TailNumberOfContestID}  if contest id is arc100, 100 is the tail number. (this format string may be empty, some contests such as abs)
  {ContestTitle}  contest title`;

export const global_config = `Global config options list:
  oj-path                         install path of online-judge-tools (auto detected)
  default-contest-dirname-format  default name of contest directory (created by \`acc new\` command)
  default-task-dirname-format     default name of task directory (created by \`acc new|add\` command)
  default-test-dirname-format     default name of sample cases directory
  default-task-choice             default --choice option for \`acc new|add\` command (see also: \`acc new|add -h\`)
  default-template                default template (see also: \`acc templates -h\`)`;

export const provisioning_templates = `See also:
https://github.com/Tatamo/atcoder-cli#provisioning-templates`;

export const online_judge_tools = `Functions of online-judge-tools linkage:
  downloading sample cases  \`acc new|add\` command
  submit code               \`acc submit\` command`;

export const default_help = `to get detailed information, use \`acc <command> -h\``;
