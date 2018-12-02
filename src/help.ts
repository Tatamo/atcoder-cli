export const task_choices = `Supported arguments for --choice:
  inquire  inquire the tasks to add
  all      select all tasks
  none     select no tasks
  rest     select all tasks not added yet
           (without --force option, same with "all")
  next     select the top task that is not added yet`;

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

export const provisioning_templates = `See also:
https://github.com/Tatamo/atcoder-cli#provisioning-templates`;
