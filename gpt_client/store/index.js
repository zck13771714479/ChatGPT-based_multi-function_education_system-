export const state = () => ({
    hash: (process.client && localStorage.getItem('hash')) || '',
    filename: (process.client && localStorage.getItem('filename')) || ''
})

export const mutations = {
    SET_HASH(state, hash) {
        state.hash = hash
    },
    SET_FILE_NAME(state, filename) {
        state.filename = filename

    }
}
export const actions = {
    setHash({ commit }, hash) {
        commit('SET_HASH', hash)
        if (process.client) {
            localStorage.setItem('hash', hash); // 在客户端保存 hash 到 localStorage
        }
    },
    setFilename({ commit }, filename) {
        commit('SET_FILE_NAME', filename)
        if (process.client) {
            localStorage.setItem('filename', filename); // 在客户端保存 hash 到 localStorage
        }
    }
}
