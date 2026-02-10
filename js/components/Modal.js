export default {
    props: ['title', 'maxWidth', 'showClose'],
    emits: ['close'],
    template: `
        <teleport to="body">
            <div class="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm">
                <!-- Mask -->
                <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')"></div>
                
                <!-- Content -->
                <div class="bg-white w-full rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in relative z-10 m-4 max-h-[90vh]"
                     :class="maxWidth || 'max-w-4xl'">
                    
                    <!-- Header -->
                    <div v-if="title" class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                        <h3 class="text-lg font-bold text-gray-800">
                            {{ title }}
                        </h3>
                        <div class="flex items-center gap-2">
                            <slot name="header-actions"></slot>
                            <button v-if="showClose !== false" @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4 transition">&times;</button>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-hidden flex flex-col relative">
                        <slot></slot>
                    </div>

                    <!-- Footer -->
                    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </teleport>
    `
};