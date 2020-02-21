export async function importFsExtra(): Promise<typeof import("fs-extra")> {
	return await import("fs-extra");
}
