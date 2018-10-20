type Conf = import("conf");

/**
 * 常に単一のConfインスタンスを返す関数
 */
const getConfig: () => Promise<Conf> = (() => {
	// confはsingletonとして扱う
	let conf: Conf | null = null;
	return async () => {
		if (conf !== null) return conf;
		const Conf = (await import("conf")).default;
		return conf = new Conf();
	}
})();

export default getConfig;
