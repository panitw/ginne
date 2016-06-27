class DataUtil {

    static sort(mode) {
        return (a, b) => {
            if (mode === 'd') {
                return b.d.getTime() - a.d.getTime();
            } else {
                return a.d.getTime() - b.d.getTime();
            }
        };
    }

}

module.exports = DataUtil;