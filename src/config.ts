import Conf from "conf";

/**
 * 常に単一のConfインスタンスを返す関数
 */
const getConfig: () => Conf = (() => {
	// confはsingletonとして扱う
	let conf: Conf | null = null;
	return () => {
		if (conf !== null) return conf;
		return conf = new Conf();
	}
})();

export default getConfig;
