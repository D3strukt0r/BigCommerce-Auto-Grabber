class Debug {
    public static showConsole(): boolean {
        // eslint-disable-next-line camelcase, no-undef
        return GM_config.get('Debug') as boolean;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static log(msg: any) {
        if (Debug.showConsole()) {
            console.log(msg);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static debug(msg: any) {
        if (Debug.showConsole()) {
            console.debug(msg);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static error(msg: any) {
        if (Debug.showConsole()) {
            console.error(msg);
        }
    }
}

export default Debug;
