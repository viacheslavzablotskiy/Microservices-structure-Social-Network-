import {defineConfig} from 'tsdown'

export default defineConfig({
    entry: 'src/entry.ts',
    format: ['cjs', 'esm'],
    dts: true
})