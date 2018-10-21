export interface Contest {
	id: string;
	title: string;
	url: string;
}

export interface Task {
	id: string;
	label: string;
	title: string;
	url: string;
}

export interface ContestProject {
	contest: Contest;
	tasks: Array<Task>;
}
