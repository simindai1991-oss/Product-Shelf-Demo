export default {
    props: ['show', 'title', 'msg', 'icon'],
    template: `
        <transition name="toast">
            <div v-if="show" class="fixed top-6 right-6 bg-gray-900 text-white px-6 py-4 rounded shadow-xl z-[100] flex items-center gap-3">
                <span class="text-xl">{{ icon }}</span>
                <div>
                    <div class="font-bold text-sm">{{ title }}</div>
                    <div class="text-xs text-gray-400">{{ msg }}</div>
                </div>
            </div>
        </transition>
    `
};